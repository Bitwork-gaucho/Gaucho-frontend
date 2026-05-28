import { test, expect } from '@playwright/test'

async function loginAs(page, email) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill(email)
  await page.getByTestId('send-code-btn').click()
  await page.getByTestId('code-input').fill('123456', { timeout: 5000 })
  await page.getByTestId('verify-btn').click()
  await page.waitForTimeout(1200)
}

test.describe('US-07: Payment & Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'test@example.com')
    await page.goto('/batches/batch-001')
    // Wait for batch to load
    await expect(page.getByTestId('batch-detail')).toBeVisible({ timeout: 5000 })
  })

  test('proceed-to-checkout button not visible before quantity selected', async ({ page }) => {
    await expect(page.getByTestId('proceed-to-checkout-btn')).not.toBeVisible()
  })

  test('proceed-to-checkout button visible after quantity selected', async ({ page }) => {
    await page.getByTestId('quantity-btn-5').click()
    await expect(page.getByTestId('proceed-to-checkout-btn')).toBeVisible({ timeout: 3000 })
  })

  test('proceed-to-checkout button has correct text', async ({ page }) => {
    await page.getByTestId('quantity-btn-3').click()
    const btn = page.getByTestId('proceed-to-checkout-btn')
    await expect(btn).toBeVisible({ timeout: 3000 })
    await expect(btn).toContainText('Gå til betaling')
  })

  test('clicking checkout shows checkout summary', async ({ page }) => {
    await page.getByTestId('quantity-btn-5').click()
    await page.getByTestId('proceed-to-checkout-btn').click()
    await expect(page.getByTestId('checkout-summary')).toBeVisible({ timeout: 3000 })
  })

  test('checkout summary shows correct total', async ({ page }) => {
    await page.getByTestId('quantity-btn-5').click()
    await page.getByTestId('proceed-to-checkout-btn').click()
    await expect(page.getByTestId('checkout-total')).toBeVisible({ timeout: 3000 })
    // 5 kg * 149 kr/kg = 745 kr
    await expect(page.getByTestId('checkout-total')).toContainText('745')
  })

  test('checkout summary has pay button', async ({ page }) => {
    await page.getByTestId('quantity-btn-5').click()
    await page.getByTestId('proceed-to-checkout-btn').click()
    await expect(page.getByTestId('pay-btn')).toBeVisible({ timeout: 3000 })
  })

  test('pay button shows order confirmation on success', async ({ page }) => {
    await page.getByTestId('quantity-btn-5').click()
    await page.getByTestId('proceed-to-checkout-btn').click()
    await page.getByTestId('pay-btn').click()
    await expect(page.getByTestId('order-confirmation')).toBeVisible({ timeout: 5000 })
  })

  test('order confirmation shows correct heading', async ({ page }) => {
    await page.getByTestId('quantity-btn-5').click()
    await page.getByTestId('proceed-to-checkout-btn').click()
    await page.getByTestId('pay-btn').click()
    await expect(page.getByTestId('order-confirmation')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('order-confirmation')).toContainText('Tak for din bestilling!')
  })

  test('order confirmation shows barcode', async ({ page }) => {
    await page.getByTestId('quantity-btn-5').click()
    await page.getByTestId('proceed-to-checkout-btn').click()
    await page.getByTestId('pay-btn').click()
    await expect(page.getByTestId('order-barcode')).toBeVisible({ timeout: 5000 })
  })

  test('order confirmation shows share link', async ({ page }) => {
    await page.getByTestId('quantity-btn-5').click()
    await page.getByTestId('proceed-to-checkout-btn').click()
    await page.getByTestId('pay-btn').click()
    await expect(page.getByTestId('order-share-link')).toBeVisible({ timeout: 5000 })
  })

  test('order confirmation shows Del med venner text', async ({ page }) => {
    await page.getByTestId('quantity-btn-5').click()
    await page.getByTestId('proceed-to-checkout-btn').click()
    await page.getByTestId('pay-btn').click()
    await expect(page.getByTestId('order-share-link')).toContainText('Del med venner', { timeout: 5000 })
  })
})
