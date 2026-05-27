import { test, expect } from '@playwright/test'

test.describe('US-01: Landing Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has "Køb nu" button with correct test id', async ({ page }) => {
    const btn = page.getByTestId('buy-now-btn')
    await expect(btn).toBeVisible()
  })

  test('"Køb nu" button navigates to /batches/batch-001', async ({ page }) => {
    await page.getByTestId('buy-now-btn').click()
    await expect(page).toHaveURL('/batches/batch-001')
  })

  test('has "Vis mig mere" button with correct test id', async ({ page }) => {
    const btn = page.getByTestId('show-more-btn')
    await expect(btn).toBeVisible()
  })

  test('"Vis mig mere" button navigates to /batches', async ({ page }) => {
    await page.getByTestId('show-more-btn').click()
    await expect(page).toHaveURL('/batches')
  })
})
