import { z } from "zod";

const name = z.string().trim().min(1).max(120);
const optionalDate = z.iso.date().nullable().optional();

export const createCategorySchema = z.object({ name });
export const updateCategorySchema = createCategorySchema;

export const createPromptSchema = z.object({
  name,
  text: z.string().trim().min(1).max(20_000),
});
export const updatePromptSchema = createPromptSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required.",
);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(20_000).default(""),
  categoryId: z.uuid(),
  dueDate: optionalDate,
  prompt: z.string().max(20_000).nullable().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(240),
    description: z.string().trim().max(20_000),
    categoryId: z.uuid(),
    dueDate: optionalDate,
    prompt: z.string().max(20_000).nullable(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");
