// Checks every external link used on the site and prints the HTTP status.
// Usage: npm run check-links   (needs Node 18+; no dependencies)
// Notes: LinkedIn answers bots with 999 and some sites reject HEAD requests,
// so a non-200 here is a hint to open the link by hand, not proof it is broken.
import fs from 'node:fs'

const files = ['index.html', 'projects.html', 'certifications.html', 'public/llms.txt']
const urls = new Set()
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8')
  for (const m of text.matchAll(/https?:\/\/[^\s"'<>)\]]+/g)) {
    const u = m[0].replace(/[.,;]+$/, '')
    if (u.includes('ajeem-suban.vercel.app') || u.includes('schema.org') || u.includes('w3.org')) continue
    urls.add(u)
  }
}

const ua = { 'user-agent': 'Mozilla/5.0 (link-check)' }
async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers: ua, signal: AbortSignal.timeout(20000) })
      if (res.status < 400 || method === 'GET') return res.status
    } catch (err) {
      if (method === 'GET') return 'ERR ' + (err.cause?.code || err.message)
    }
  }
}

let bad = 0
for (const url of [...urls].sort()) {
  const status = await check(url)
  const ok = typeof status === 'number' && status < 400
  if (!ok) bad++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${status}  ${url}`)
}
console.log(`\n${urls.size} links checked, ${bad} need a look.`)
