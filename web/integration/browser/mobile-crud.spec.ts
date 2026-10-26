import { expect, test } from "@playwright/test";

test("mobile category and task CRUD", async ({ page }) => {
  const suffix = Date.now().toString();
  const category = `Mobile ${suffix}`;
  const title = `Task ${suffix}`;
  const edited = `${title} edited`;

  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Today's focus" })).toBeVisible();

  await page.getByRole("button", { name: "Categories", exact: true }).click();
  await page.getByPlaceholder("New category").fill(category);
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText(category)).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "New" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Category").selectOption({ label: category });
  await page.getByRole("button", { name: "Create task" }).click();
  await expect(page.getByText(title)).toBeVisible();

  await page.getByRole("button", { name: `Edit ${title}` }).click();
  await page.getByLabel("Title").fill(edited);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(edited)).toBeVisible();

  await page.getByRole("button", { name: `Delete ${edited}` }).click();
  await expect(page.getByText(edited)).not.toBeVisible();

  await page.getByRole("button", { name: "Categories", exact: true }).click();
  await page.getByRole("button", { name: `Rename ${category}` }).click();
  const rename = `${category} renamed`;
  await page.locator(".category-rename input").fill(rename);
  await page.getByRole("button", { name: `Save ${category}` }).click();
  await expect(page.getByText(rename)).toBeVisible();
  await page.getByRole("button", { name: `Delete ${rename}` }).click();
  await expect(page.getByText(rename)).not.toBeVisible();
});
