import { ZodError, type ZodType } from "zod";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const requestUrl = new URL(request.url);
  const forwardedProto = firstForwardedValue(request.headers.get("x-forwarded-proto"));
  const forwardedHost = firstForwardedValue(request.headers.get("x-forwarded-host"));
  const protocol = forwardedProto ?? requestUrl.protocol.replace(":", "");
  const host = forwardedHost ?? request.headers.get("host") ?? requestUrl.host;
  const expectedOrigin = `${protocol}://${host}`;

  if (origin !== expectedOrigin) {
    throw new ApiError(403, "invalid_origin", "The request origin is not allowed.");
  }
}

function firstForwardedValue(value: string | null): string | null {
  return value?.split(",", 1)[0]?.trim() || null;
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "invalid_json", "The request body must be valid JSON.");
  }
  return schema.parse(body);
}

export function jsonError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "validation_error",
          message: "The request data is invalid.",
          fields: error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  console.error("Unhandled API error", error);
  return Response.json(
    { error: { code: "internal_error", message: "The server could not complete the request." } },
    { status: 500 },
  );
}
