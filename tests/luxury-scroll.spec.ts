import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const BASE = 'http://localhost:3456'
const OUT = path.join(process.cwd(), 'test-screenshots', 'v2-luxury')

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true })
})

test.use({ viewport: { width: 1440, height: 900 } })

test('chapter indicator: hidden at top, morphs through sections', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  // Hidden at very top (we only show > 220px scroll)
  let indicator = page.locator('.chapter-indicator')
  await expect(indicator).toBeAttached()
  const opacityAtTop = await indicator.evaluate((el) => parseFloat(getComputedStyle(el).opacity))
  expect.soft(opacityAtTop, 'indicator hidden at top').toBeLessThan(0.5)

  // Scroll into PathSection — should show "The Way / 道"
  await page.evaluate(() => window.scrollTo(0, 1200))
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, '01-indicator-path.png'), clip: { x: 1200, y: 0, width: 240, height: 80 } })
  const pathLabel = await indicator.locator('.serif-it').textContent()
  expect.soft(pathLabel, 'indicator shows Path title').toMatch(/Way|Prologue/i)

  // Scroll to Timeline — should morph to "In a breath / 瞬"
  await page.evaluate(() => window.scrollTo(0, 2800))
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, '02-indicator-timeline.png'), clip: { x: 1200, y: 0, width: 240, height: 80 } })
  const tlLabel = await indicator.locator('.serif-it').textContent()
  expect.soft(tlLabel, 'indicator morphed for timeline').toBeTruthy()

  // Scroll near bottom — indicator should hide again
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(700)
  const opacityAtBottom = await indicator.evaluate((el) => parseFloat(getComputedStyle(el).opacity))
  expect.soft(opacityAtBottom, 'indicator hidden at bottom').toBeLessThan(0.5)
})

test('scroll-snap is enabled after first scroll, not before', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  // At rest, snap should not be active (avoids fighting initial scroll restoration)
  const before = await page.evaluate(() => document.documentElement.classList.contains('has-snap'))
  expect.soft(before, 'no snap before scroll').toBe(false)

  // Trigger a scroll
  await page.evaluate(() => window.scrollTo(0, 400))
  await page.waitForTimeout(400)
  const after = await page.evaluate(() => document.documentElement.classList.contains('has-snap'))
  expect.soft(after, 'snap engages after first scroll').toBe(true)

  // Sections should have scroll-snap-align: start
  const align = await page.locator('section.r-snap').first().evaluate((el) => getComputedStyle(el).scrollSnapAlign)
  expect.soft(align, 'r-snap sections aligned').toContain('start')
})

test('velocity blur reacts to fast scrolling', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  // Trigger a burst of fast scrolling via wheel events
  await page.evaluate(() => {
    let y = 0
    const id = setInterval(() => {
      y += 600
      window.scrollTo(0, y)
      if (y > 4000) clearInterval(id)
    }, 16)
  })
  // Sample blur a few times during the storm
  let maxBlur = 0
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(40)
    const blur = await page.evaluate(() => {
      const v = getComputedStyle(document.body).getPropertyValue('--scroll-blur').trim()
      return parseFloat(v) || 0
    })
    if (blur > maxBlur) maxBlur = blur
  }
  expect.soft(maxBlur, `peak velocity blur seen (${maxBlur}px)`).toBeGreaterThan(0.1)

  // After scrolling stops, blur should decay back to 0
  await page.waitForTimeout(1200)
  const restBlur = await page.evaluate(() => {
    const v = getComputedStyle(document.body).getPropertyValue('--scroll-blur').trim()
    return parseFloat(v) || 0
  })
  expect.soft(restBlur, 'blur decays to ~0 at rest').toBeLessThan(0.2)
})

test('hero parallax: mountains drift relative to scroll', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  // Capture transform of mountain group at scrollY=0 and scrollY=400
  const mountainSelector = '.r-hero svg g'
  const t0 = await page.locator(mountainSelector).first().evaluate((el) => (el as SVGElement).style.transform)
  await page.evaluate(() => window.scrollTo(0, 400))
  await page.waitForTimeout(400)
  const t1 = await page.locator(mountainSelector).first().evaluate((el) => (el as SVGElement).style.transform)

  expect.soft(t0, 'mountains transformed at top').toBeTruthy()
  expect.soft(t1, 'mountains transformed mid-scroll').toBeTruthy()
  expect.soft(t0 === t1, 'mountain transform changed with scroll').toBe(false)
})

test('magnetic buttons render with willChange transform', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  const btn = page.locator('a.btn-cinnabar').first()
  const will = await btn.evaluate((el) => (el as HTMLElement).style.willChange)
  expect.soft(will, 'magnetic button has willChange').toContain('transform')
})

test('chapter markers present on every major section', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  const chapters = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-chapter]')).map((el) => el.getAttribute('data-chapter')),
  )
  expect(chapters).toEqual(expect.arrayContaining(['hero', 'path', 'senders', 'timeline', 'manifesto', 'cta']))
})

test('no horizontal overflow at any scroll position', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  for (const y of [0, 800, 1600, 2400, 3200, 4000, 4800, 5600]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(300)
    const o = await page.evaluate(() => {
      const d = document.documentElement
      return d.scrollWidth - d.clientWidth
    })
    expect.soft(o, `no overflow at y=${y}`).toBeLessThanOrEqual(2)
  }
})

test('full-page screenshot at each major section', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const points = [
    { y: 0, name: 'hero' },
    { y: 900, name: 'path' },
    { y: 2400, name: 'timeline' },
    { y: 3400, name: 'manifesto' },
    { y: 4400, name: 'final-cta' },
  ]
  for (const p of points) {
    await page.evaluate((yy) => window.scrollTo(0, yy), p.y)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(OUT, `${p.name}.png`), fullPage: false })
  }
})
