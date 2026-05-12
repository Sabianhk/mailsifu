import { test, expect, devices } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const BASE = 'http://localhost:3456'
const OUT = path.join(process.cwd(), 'test-screenshots', 'v2-responsive')

const VIEWPORTS = [
  { name: 'mobile-iphone13', viewport: { width: 390, height: 844 }, isMobile: true },
  { name: 'mobile-pixel5',   viewport: { width: 393, height: 851 }, isMobile: true },
  { name: 'mobile-small-380', viewport: { width: 380, height: 760 }, isMobile: true },
  { name: 'tablet-ipad',     viewport: { width: 820, height: 1180 }, isMobile: false },
  { name: 'tablet-ipad-pro', viewport: { width: 1024, height: 1366 }, isMobile: false },
  { name: 'desktop-1280',    viewport: { width: 1280, height: 800 }, isMobile: false },
  { name: 'desktop-1440',    viewport: { width: 1440, height: 900 }, isMobile: false },
]

const PAGES = [
  { slug: 'landing', url: `${BASE}/` },
  { slug: 'signin',  url: `${BASE}/auth/signin` },
]

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true })
})

for (const vp of VIEWPORTS) {
  test.describe(vp.name, () => {
    test.use({ viewport: vp.viewport, hasTouch: vp.isMobile, isMobile: vp.isMobile })

    for (const p of PAGES) {
      test(`${p.slug} @ ${vp.name}`, async ({ page }) => {
        await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30_000 })
        // wait for fonts / first paint to settle
        await page.waitForTimeout(800)
        await expect(page).toHaveTitle(/MailSifu/i)
        await page.screenshot({
          path: path.join(OUT, `${p.slug}__${vp.name}.png`),
          fullPage: true,
        })
        // Detect horizontal overflow
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement
          return {
            scrollW: doc.scrollWidth,
            clientW: doc.clientWidth,
            overflowing: doc.scrollWidth - doc.clientWidth > 2,
          }
        })
        expect.soft(overflow.overflowing, `Horizontal overflow at ${vp.name}: scrollW=${overflow.scrollW} clientW=${overflow.clientW}`).toBeFalsy()
      })
    }
  })
}
