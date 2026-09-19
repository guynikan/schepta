import { expect, test } from '@playwright/test';

test('generates one validated spec and proves both renderers', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('react-renderer')).toBeVisible();
  await expect(page.getByTestId('vue-renderer')).toBeVisible();
  await expect(page.getByTestId('trace-inspector')).toContainText('offline-fixture');

  const prompt = page.getByTestId('prompt-input');
  await prompt.fill('');
  await page.getByTestId('generate-button').click();
  await expect(page.getByTestId('prompt-validation')).toContainText('required');

  await prompt.fill('Create a friendly onboarding checkpoint');
  await page.getByTestId('generate-button').click();
  await expect(page.getByTestId('trace-inspector')).toContainText('Canonical');
  await expect(page.getByTestId('trace-inspector')).toContainText('offline-fixture');

  const reactInput = page.getByTestId('react-renderer').locator('input').first();
  await expect(reactInput).toBeVisible();
  await page.getByTestId('react-renderer').getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByTestId('react-renderer')).toContainText('This field is required');
  await reactInput.fill('Ada');
  await page.getByTestId('react-renderer').getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByTestId('action-success')).toContainText('Declarative submit accepted');
});
