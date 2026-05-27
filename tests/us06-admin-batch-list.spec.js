import { test, expect } from '@playwright/test'

async function loginAsAdmin(page) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill('admin@test.com')
  await page.getByTestId('send-code-btn').click()
  await page.getByTestId('code-input').fill('123456', { timeout: 5000 })
  await page.getByTestId('verify-btn').click()
  await page.waitForTimeout(1200)
}

test.describe('US-06: Admin Batch List', () => {
  test('non-admin accessing /admin/batches is redirected to /login', async ({ page }) => {
    await page.goto('/admin/batches')
    await expect(page).toHaveURL('/login')
  })

  test('admin can access /admin/batches', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/batches')
    await expect(page.getByTestId('admin-batch-list')).toBeVisible({ timeout: 5000 })
  })

  test('admin batch list shows batches', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/batches')
    await expect(page.getByTestId('batch-card').first()).toBeVisible({ timeout: 5000 })
  })

  test('admin batch list has create new batch button', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/batches')
    await expect(page.getByTestId('create-batch-btn')).toBeVisible({ timeout: 5000 })
  })
})
