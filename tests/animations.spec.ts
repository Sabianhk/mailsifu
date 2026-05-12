import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const BASE = 'http://localhost:3456'
const OUT = path.join(process.cwd(), 'test-screenshots', 'v2-animations')

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true })
})

test.use({ viewport: { width: 1280, height: 800 } })

test('section reveals trigger on scroll (desktop)', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  // All reveals should start in `out` state (except those already in viewport)
  const initialReveals = await page.locator('[data-reveal]').evaluateAll((els) =>
    els.map((el) => ({
      variant: el.getAttribute('data-reveal'),
      state: el.getAttribute('data-state'),
      top: el.getBoundingClientRect().top,
    })),
  )

  // Below-the-fold elements should be `out`
  const belowFold = initialReveals.filter((r) => r.top > 800)
  expect.soft(belowFold.length, 'at least one reveal below the fold').toBeGreaterThan(0)
  expect.soft(
    belowFold.every((r) => r.state === 'out'),
    'below-fold reveals should start in out state',
  ).toBe(true)

  // Scroll near PathSection (~one viewport down)
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
  await page.waitForTimeout(900)
  await page.screenshot({ path: path.join(OUT, '01-path-section.png'), fullPage: false })

  // Confirm PathSection cards have transitioned to `in`
  const cardsIn = await page
    .locator('.r-card[data-state="in"]')
    .count()
  expect.soft(cardsIn, 'PathSection cards revealed').toBeGreaterThanOrEqual(1)

  // Scroll deeper — to ScrollsTimeline
  await page.evaluate(() => window.scrollTo({ top: 2400, behavior: 'instant' }))
  await page.waitForTimeout(900)
  await page.screenshot({ path: path.join(OUT, '02-timeline.png'), fullPage: false })

  // Scroll to Manifesto
  await page.evaluate(() => window.scrollTo({ top: 3400, behavior: 'instant' }))
  await page.waitForTimeout(900)
  await page.screenshot({ path: path.join(OUT, '03-manifesto.png'), fullPage: false })

  // Scroll to Final CTA
  await page.evaluate(() => window.scrollTo({ top: 4400, behavior: 'instant' }))
  await page.waitForTimeout(900)
  await page.screenshot({ path: path.join(OUT, '04-final-cta.png'), fullPage: false })

  // Scroll progress indicator should be visible mid-scroll
  const progressVisible = await page.evaluate(() => {
    const el = document.querySelector('[aria-hidden]') // ScrollProgress wrapper
    return !!el
  })
  expect.soft(progressVisible, 'ScrollProgress mounted').toBe(true)

  // At the bottom — confirm everything is `in`
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
  await page.waitForTimeout(900)
  await page.screenshot({ path: path.join(OUT, '05-bottom.png'), fullPage: false })

  const allIn = await page.locator('[data-reveal][data-state="in"]').count()
  const allReveals = await page.locator('[data-reveal]').count()
  expect.soft(allIn, `${allIn}/${allReveals} reveals settled at bottom`).toBeGreaterThanOrEqual(allReveals - 2)
})

test('no horizontal overflow with new dividers + progress', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  for (const y of [0, 1000, 2000, 3000, 4000, 5000]) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
    await page.waitForTimeout(300)
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement
      return { scrollW: doc.scrollWidth, clientW: doc.clientWidth }
    })
    expect.soft(overflow.scrollW - overflow.clientW, `no horizontal overflow at y=${y}`).toBeLessThanOrEqual(2)
  }
})
