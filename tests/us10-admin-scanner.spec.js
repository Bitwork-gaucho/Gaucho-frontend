import { test, expect } from '@playwright/test'

async function loginAsAdmin(page) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill('admin@test.com')
  await page.getByTestId('send-code-btn').click()
  await page.getByTestId('code-input').fill('123456', { timeout: 5000 })
  await page.getByTestId('verify-btn').click()
  await page.waitForTimeout(1200)
}

test.describe('US-10: Admin Barcode Scanner', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('non-admin cannot access /admin/scanner', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@test.com')
    await page.getByTestId('send-code-btn').click()
    await page.getByTestId('code-input').fill('123456', { timeout: 5000 })
    await page.getByTestId('verify-btn').click()
    await page.waitForTimeout(1200)
    await page.goto('/admin/scanner')
    await expect(page).toHaveURL('/login')
  })

  test('admin can access scanner page', async ({ page }) => {
    await page.goto('/admin/scanner')
    await expect(page.getByTestId('scanner-page')).toBeVisible({ timeout: 5000 })
  })

  test('scanner page has barcode input', async ({ page }) => {
    await page.goto('/admin/scanner')
    await expect(page.getByTestId('barcode-input')).toBeVisible({ timeout: 5000 })
  })

  test('scanner page has scan button', async ({ page }) => {
    await page.goto('/admin/scanner')
    await expect(page.getByTestId('scan-btn')).toBeVisible({ timeout: 5000 })
  })

  test('scanning an order ID shows success message', async ({ page }) => {
    await page.goto('/admin/scanner')
    await page.getByTestId('barcode-input').fill('ord-test-001')
    await page.getByTestId('scan-btn').click()
    await expect(page.getByTestId('scan-success')).toBeVisible({ timeout: 5000 })
  })

  test('success message contains order ID', async ({ page }) => {
    await page.goto('/admin/scanner')
    await page.getByTestId('barcode-input').fill('ord-test-001')
    await page.getByTestId('scan-btn').click()
    await expect(page.getByTestId('scan-success')).toContainText('ord-test-001', { timeout: 5000 })
  })

  test('success message shows confirmation text', async ({ page }) => {
    await page.goto('/admin/scanner')
    await page.getByTestId('barcode-input').fill('ord-test-001')
    await page.getByTestId('scan-btn').click()
    await expect(page.getByTestId('scan-success')).toContainText('Levering bekræftet', { timeout: 5000 })
  })

  test('admin batch list has scanner nav link', async ({ page }) => {
    await page.goto('/admin/batches')
    await expect(page.getByTestId('admin-batch-list')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('scanner-nav-link')).toBeVisible({ timeout: 5000 })
  })

  test('scanner nav link navigates to scanner page', async ({ page }) => {
    await page.goto('/admin/batches')
    await page.getByTestId('scanner-nav-link').click()
    await expect(page.getByTestId('scanner-page')).toBeVisible({ timeout: 5000 })
  })
})
