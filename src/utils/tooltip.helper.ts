import { Page } from '@playwright/test';

export async function assertTooltip(page: Page, buttonName: string) {
  if (page.isClosed()) return;

  const btn = page.getByRole('button', { name: buttonName });
  const group = btn.locator('..');
  await group.hover();

  const tooltip = page.locator('div.pointer-events-none:has-text("' + buttonName + '")');
  await tooltip.waitFor({ state: 'visible', timeout: 5000 });

  if (!page.isClosed()) {
    await page.mouse.move(0, 0);
    const tooltipHandle = await tooltip.elementHandle();
    if (tooltipHandle) {
      await page.waitForFunction(
        (el) => el.ownerDocument?.defaultView?.getComputedStyle(el).opacity === '0',
        tooltipHandle
      );
    }
  }
}
