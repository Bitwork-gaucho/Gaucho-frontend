import { test, expect } from '@playwright/test'

test.describe('US-03: Batch Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/batches/batch-001')
  })

  test('renders batch detail container', async ({ page }) => {
    await expect(page.getByTestId('batch-detail')).toBeVisible()
  })

  test('shows meat type description', async ({ page }) => {
    await expect(page.getByTestId('batch-detail')).toContainText('Ribeye')
  })

  test('shows progress bar', async ({ page }) => {
    await expect(page.getByTestId('progress-bar')).toBeVisible()
  })

  test('shows batch status', async ({ page }) => {
    await expect(page.getByTestId('batch-status')).toBeVisible()
  })

  test('shows quantity selector', async ({ page }) => {
    await expect(page.getByTestId('quantity-selector')).toBeVisible()
  })

  test('has preset quantity buttons', async ({ page }) => {
    await expect(page.getByTestId('quantity-btn-1')).toBeVisible()
    await expect(page.getByTestId('quantity-btn-2')).toBeVisible()
    await expect(page.getByTestId('quantity-btn-5')).toBeVisible()
    await expect(page.getByTestId('quantity-btn-10')).toBeVisible()
  })

  test('selecting quantity shows order total', async ({ page }) => {
    await page.getByTestId('quantity-btn-2').click()
    await expect(page.getByTestId('order-total')).toBeVisible()
    // 2 kg * 149 kr = 298 kr
    await expect(page.getByTestId('order-total')).toContainText('298')
  })

  test('has share button', async ({ page }) => {
    await expect(page.getByTestId('share-btn')).toBeVisible()
  })

  test('has login section', async ({ page }) => {
    await expect(page.getByTestId('login-section')).toBeVisible()
  })
})
