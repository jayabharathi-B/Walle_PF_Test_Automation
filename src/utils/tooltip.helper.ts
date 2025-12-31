import { expect, Page } from '@playwright/test';
export async function assertTooltip(page: Page, buttonName: string) {
  if (page.isClosed()) return;

  const btn = page.getByRole('button', { name: buttonName });

  // Always re-hover the real target
  await btn.hover();

  const tooltip = page.locator('div.pointer-events-none', {
    hasText: buttonName,
  });

  // Wait for tooltip to EXIST (not just be visible)
  await expect(tooltip).toHaveCount(1, { timeout: 3000 });

  // Optional: ensure it is visible once it exists
  await expect(tooltip).toBeVisible();

  // Move mouse away to clean up (no assertion here)
  await page.mouse.move(0, 0);
}
// ----------------------------------------------------
// Verify navigation bar links
// ----------------------------------------------------