import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

/**
 * Inlines the built stylesheet into every HTML page as a <style> block.
 *
 * The whole site shares one ~10 KB (≈3 KB gzipped) stylesheet. As an external
 * <link rel="stylesheet"> it is render-blocking AND costs an extra network
 * round-trip before first paint — expensive on Slow 4G (150 ms RTT). Inlining
 * removes that round-trip. Trade-off: the CSS is no longer cached separately
 * from each page, which is negligible at this size.
 * Build-only: `vite dev` is untouched. The emitted .css asset is deleted after
 * the build (closeBundle) so all three pages can read it first.
 */
function inlineCss(): Plugin {
  const inlined = new Set<string>()
  let outDir = 'dist'
  return {
    name: 'inline-css',
    enforce: 'post',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html
        return html.replace(
          /<link rel="stylesheet"[^>]*?href="([^"]+\.css)"[^>]*?>/g,
          (tag, href: string) => {
            const key = href.replace(/^\//, '')
            const asset = bundle[key]
            if (!asset || asset.type !== 'asset') return tag
            const css = String(asset.source)
            // a literal "</style" inside the CSS would terminate the block early
            if (/<\/style/i.test(css)) return tag
            inlined.add(key)
            return `<style>${css}</style>`
          },
        )
      },
    },
    closeBundle() {
      for (const key of inlined) fs.rmSync(path.join(outDir, key), { force: true })
      inlined.clear()
    },
  }
}

// Vite config — https://vitejs.dev/config/
// Multi-page site: three static HTML pages share src/styles.css and src/site.ts.
export default defineConfig({
  plugins: [inlineCss()],
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(root, 'index.html'),
        projects: path.resolve(root, 'projects.html'),
        certifications: path.resolve(root, 'certifications.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'),
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'),
  },
})
