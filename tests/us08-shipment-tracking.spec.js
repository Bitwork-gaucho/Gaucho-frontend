import { test, expect } from '@playwright/test'

test.describe('US-08: Shipment Tracking View', () => {
  test('shipment tracking not visible for WAITING_TO_FILL batch', async ({ page }) => {
    await page.goto('/batches/batch-001')
    await expect(page.getByTestId('batch-detail')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('shipment-tracking')).not.toBeVisible()
  })

  test('shipment tracking visible for IN_TRANSIT batch', async ({ page }) => {
    await page.goto('/batches/batch-transit')
    await expect(page.getByTestId('batch-detail')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('shipment-tracking')).toBeVisible({ timeout: 5000 })
  })

  test('shipment map SVG is shown for IN_TRANSIT batch', async ({ page }) => {
    await page.goto('/batches/batch-transit')
    await expect(page.getByTestId('batch-detail')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('shipment-map')).toBeVisible({ timeout: 5000 })
  })

  test('shipment ETA is shown', async ({ page }) => {
    await page.goto('/batches/batch-transit')
    await expect(page.getByTestId('batch-detail')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('shipment-eta')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('shipment-eta')).toContainText('2026-07-15')
  })

  test('shipment status text is shown', async ({ page }) => {
    await page.goto('/batches/batch-transit')
    await expect(page.getByTestId('batch-detail')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('shipment-status-text')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('shipment-status-text')).toContainText('På vej fra Buenos Aires')
  })

  test('route indicator shows Buenos Aires to Copenhagen', async ({ page }) => {
    await page.goto('/batches/batch-transit')
    await expect(page.getByTestId('batch-detail')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('shipment-tracking')).toContainText('Buenos Aires', { timeout: 5000 })
    await expect(page.getByTestId('shipment-tracking')).toContainText('København')
  })
})
