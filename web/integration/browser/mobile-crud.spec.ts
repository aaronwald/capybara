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
  const categoriesDialog = page.getByRole("dialog", { name: "Categories" });
  await categoriesDialog.getByPlaceholder("New category").fill(category);
  await categoriesDialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(categoriesDialog.getByText(category, { exact: true })).toBeVisible();
  await categoriesDialog.getByRole("button", { name: "Close" }).click();

  await page.locator(".mobile-nav").getByRole("button", { name: "New", exact: true }).click();
  const newTaskDialog = page.getByRole("dialog", { name: "New task" });
  await newTaskDialog.getByLabel("Title", { exact: true }).fill(title);
  await newTaskDialog.locator("select").first().selectOption({ label: category });
  await newTaskDialog.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(page.getByText(title)).toBeVisible();

  await page.getByRole("button", { name: `Edit ${title}` }).click();
  const editTaskDialog = page.getByRole("dialog", { name: "Edit task" });
  await editTaskDialog.getByLabel("Title", { exact: true }).fill(edited);
  await editTaskDialog.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText(edited)).toBeVisible();

  await page.getByRole("button", { name: `Delete ${edited}` }).click();
  await expect(page.getByText(edited)).not.toBeVisible();

  await page.getByRole("button", { name: "Categories", exact: true }).click();
  await categoriesDialog.getByRole("button", { name: `Rename ${category}` }).click();
  const rename = `${category} renamed`;
  await categoriesDialog.locator(".category-rename input").fill(rename);
  await categoriesDialog.getByRole("button", { name: `Save ${category}` }).click();
  await expect(categoriesDialog.getByText(rename, { exact: true })).toBeVisible();
  await categoriesDialog.getByRole("button", { name: `Delete ${rename}` }).click();
  await expect(categoriesDialog.getByText(rename, { exact: true })).not.toBeVisible();
});
