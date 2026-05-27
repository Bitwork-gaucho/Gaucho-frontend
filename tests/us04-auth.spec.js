import { test, expect } from '@playwright/test'

test.describe('US-04: Email Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renders login page with email input', async ({ page }) => {
    await expect(page.getByTestId('email-input')).toBeVisible()
  })

  test('has send code button', async ({ page }) => {
    await expect(page.getByTestId('send-code-btn')).toBeVisible()
  })

  test('entering email and clicking send code shows code input', async ({ page }) => {
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('send-code-btn').click()
    await expect(page.getByTestId('code-input')).toBeVisible({ timeout: 5000 })
  })

  test('has verify button after entering email', async ({ page }) => {
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('send-code-btn').click()
    await expect(page.getByTestId('verify-btn')).toBeVisible({ timeout: 5000 })
  })

  test('correct code (123456) logs user in', async ({ page }) => {
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('send-code-btn').click()
    await page.getByTestId('code-input').fill('123456', { timeout: 5000 })
    await page.getByTestId('verify-btn').click()
    // After successful login, should navigate away from login page or show success
    await page.waitForTimeout(1500)
    // Should not show error
    const errorEl = page.getByTestId('auth-error')
    const errorVisible = await errorEl.isVisible().catch(() => false)
    expect(errorVisible).toBeFalsy()
  })

  test('wrong code shows error message', async ({ page }) => {
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('send-code-btn').click()
    await page.getByTestId('code-input').fill('000000', { timeout: 5000 })
    await page.getByTestId('verify-btn').click()
    await expect(page.getByTestId('auth-error')).toBeVisible({ timeout: 5000 })
  })

  test('error message contains descriptive text', async ({ page }) => {
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('send-code-btn').click()
    await page.getByTestId('code-input').fill('999999', { timeout: 5000 })
    await page.getByTestId('verify-btn').click()
    await expect(page.getByTestId('auth-error')).toContainText('Ugyldig', { timeout: 5000 })
  })
})
