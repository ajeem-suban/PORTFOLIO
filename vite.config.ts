import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * Inlines the built stylesheet into index.html as a <style> block.
 *
 * The site ships a single ~28 KB (≈7 KB gzipped) CSS file. As an external
 * <link rel="stylesheet"> it is render-blocking AND costs an extra network
 * round-trip before first paint — expensive on Slow 4G (150 ms RTT). Inlining
 * removes that round-trip; the CSS is parsed as part of the HTML response
 * itself. Trade-off: the CSS is no longer cached separately from the HTML
 * (the HTML is revalidated per visit), which is negligible at this size.
 * Build-only: `vite dev` is untouched.
 */
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    enforce: 'post',
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
            delete bundle[key]
            return `<style>${css}</style>`
          },
        )
      },
    },
  }
}

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), inlineCss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
