import { expect, Page } from '@playwright/test';

export async function assertTooltip(
  page: Page,
  buttonName: string
) {
  if (page.isClosed()) return;

  const btn = page.getByRole('button', { name: buttonName });
  const group = btn.locator('..');
  await group.hover();

  const tooltip = page.locator(
    'div.pointer-events-none:has-text("' + buttonName + '")'
  );

  await expect(tooltip).toBeVisible();
  
  if(!page.isClosed())
  {
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCSS('opacity', '0');
  }

}