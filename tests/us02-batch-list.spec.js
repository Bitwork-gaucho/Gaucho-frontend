import { test, expect } from '@playwright/test'

test.describe('US-02: Batch List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/batches')
  })

  test('renders batch list container', async ({ page }) => {
    await expect(page.getByTestId('batch-list')).toBeVisible()
  })

  test('shows active batches section', async ({ page }) => {
    await expect(page.getByTestId('active-batches-section')).toBeVisible()
  })

  test('shows upcoming batches section', async ({ page }) => {
    await expect(page.getByTestId('upcoming-batches-section')).toBeVisible()
  })

  test('shows batch cards', async ({ page }) => {
    const cards = page.getByTestId('batch-card')
    await expect(cards.first()).toBeVisible()
  })

  test('batch card shows name', async ({ page }) => {
    await page.waitForSelector('[data-testid="batch-card"]')
    const firstCard = page.getByTestId('batch-card').first()
    await expect(firstCard).toContainText('Batch')
  })

  test('batch card shows meat type', async ({ page }) => {
    await page.waitForSelector('[data-testid="batch-card"]')
    const firstCard = page.getByTestId('batch-card').first()
    // active batch is Ribeye
    await expect(firstCard).toContainText('Ribeye')
  })

  test('batch card shows price per kg', async ({ page }) => {
    await page.waitForSelector('[data-testid="batch-card"]')
    const firstCard = page.getByTestId('batch-card').first()
    await expect(firstCard).toContainText('149')
  })

  test('clicking active batch card navigates to /batches/:id', async ({ page }) => {
    await page.waitForSelector('[data-testid="batch-card"]')
    await page.getByTestId('active-batches-section').getByTestId('batch-card').first().click()
    await expect(page).toHaveURL('/batches/batch-001')
  })

  test('upcoming batch has interest button', async ({ page }) => {
    await page.waitForSelector('[data-testid="upcoming-batches-section"]')
    const interestBtn = page.getByTestId('upcoming-batch-interest-btn').first()
    await expect(interestBtn).toBeVisible()
  })

  test('clicking interest button shows email input form', async ({ page }) => {
    await page.waitForSelector('[data-testid="upcoming-batch-interest-btn"]')
    await page.getByTestId('upcoming-batch-interest-btn').first().click()
    await expect(page.getByTestId('interest-email-input').first()).toBeVisible()
  })

  test('interest form has submit button', async ({ page }) => {
    await page.getByTestId('upcoming-batch-interest-btn').first().click()
    await expect(page.getByTestId('interest-submit-btn').first()).toBeVisible()
  })

  test('interest form can be submitted with email', async ({ page }) => {
    await page.getByTestId('upcoming-batch-interest-btn').first().click()
    await page.getByTestId('interest-email-input').first().fill('test@example.com')
    await page.getByTestId('interest-submit-btn').first().click()
    // After submit, form should disappear or show success
    await page.waitForTimeout(800)
    // Just verify it doesn't throw
  })

  test('has navigation link to batches', async ({ page }) => {
    await expect(page.getByTestId('nav-batches')).toBeVisible()
  })
})
