import { test, expect } from '@playwright/test'

async function loginAsAdmin(page) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill('admin@test.com')
  await page.getByTestId('send-code-btn').click()
  await page.getByTestId('code-input').fill('123456', { timeout: 5000 })
  await page.getByTestId('verify-btn').click()
  await page.waitForTimeout(1200)
}

test.describe('US-09: Admin Batch Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('non-admin cannot access admin batch detail', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@test.com')
    await page.getByTestId('send-code-btn').click()
    await page.getByTestId('code-input').fill('123456', { timeout: 5000 })
    await page.getByTestId('verify-btn').click()
    await page.waitForTimeout(1200)
    await page.goto('/admin/batches/batch-001')
    await expect(page).toHaveURL('/login')
  })

  test('admin can access admin batch detail page', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('admin-batch-detail')).toBeVisible({ timeout: 5000 })
  })

  test('admin batch detail shows status management section', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('status-management')).toBeVisible({ timeout: 5000 })
  })

  test('status management has set-status-ordered button', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('set-status-ordered-btn')).toBeVisible({ timeout: 5000 })
  })

  test('status management has set-status-transit button', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('set-status-transit-btn')).toBeVisible({ timeout: 5000 })
  })

  test('admin batch detail shows shipment details form', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('shipment-details-form')).toBeVisible({ timeout: 5000 })
  })

  test('shipment form has supplier input', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('supplier-input')).toBeVisible({ timeout: 5000 })
  })

  test('shipment form has container input', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('container-input')).toBeVisible({ timeout: 5000 })
  })

  test('shipment form has save button', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('save-shipment-btn')).toBeVisible({ timeout: 5000 })
  })

  test('admin batch detail shows payment overview', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('payment-overview')).toBeVisible({ timeout: 5000 })
  })

  test('payment overview shows customer rows', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('customer-row').first()).toBeVisible({ timeout: 5000 })
  })

  test('customer rows have refund buttons', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('refund-btn').first()).toBeVisible({ timeout: 5000 })
  })

  test('payment overview has bulk refund button', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('bulk-refund-btn')).toBeVisible({ timeout: 5000 })
  })

  test('admin batch list has Administrer links', async ({ page }) => {
    await page.goto('/admin/batches')
    await expect(page.getByTestId('admin-batch-list')).toBeVisible({ timeout: 5000 })
    const adminLinks = page.getByText('Administrer')
    await expect(adminLinks.first()).toBeVisible({ timeout: 5000 })
  })

  test('Administrer link navigates to admin batch detail', async ({ page }) => {
    await page.goto('/admin/batches')
    await expect(page.getByTestId('admin-batch-list')).toBeVisible({ timeout: 5000 })
    await page.getByText('Administrer').first().click()
    await expect(page.getByTestId('admin-batch-detail')).toBeVisible({ timeout: 5000 })
  })

  test('admin batch detail shows batch info', async ({ page }) => {
    await page.goto('/admin/batches/batch-001')
    await expect(page.getByTestId('admin-batch-detail')).toContainText('batch-001', { timeout: 5000 })
  })
})
