// 一次性迁移脚本：从金山文档导出的 markdown 中提取图片外链并下载到 docs/public/images
// KS3 签名链接有效期短（见 Expires 参数），须尽快执行
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'kdocs_content.md'
const OUT_DIR = 'docs/public/images'
const FILES_DIR = 'docs/public/files'

const raw = readFileSync(SRC, 'utf8')
  .replaceAll('\u200b', '')
  .replaceAll('\uFEFF', '')

// 提取所有图片与文件链接
const imgRe = /!\[image\]\((https:\/\/coop-export[^)]+)\)/g
const fileRe = /\[[^\]]+\]\((https:\/\/coop-export[^)]+\.html[^)]*)\)/g

const imgs = [...raw.matchAll(imgRe)].map(m => m[1])
const files = [...raw.matchAll(fileRe)].map(m => m[1])

// 去重（同一资源可能出现多次）
const uniq = [...new Set([...imgs, ...files])]
console.log(`images: ${imgs.length}, html files: ${files.length}, unique targets: ${uniq.length}`)

function idOf(url) {
  return new URL(url).pathname.split('/').filter(Boolean).pop()
}

mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(FILES_DIR, { recursive: true })

async function fetchOne(url, attempt = 1) {
  const id = idOf(url)
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const type = res.headers.get('content-type') || ''
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) throw new Error(`too small: ${buf.length}B`)
    let ext = '.bin'
    if (type.includes('png')) ext = '.png'
    else if (type.includes('jpeg') || type.includes('jpg')) ext = '.jpg'
    else if (type.includes('gif')) ext = '.gif'
    else if (type.includes('webp')) ext = '.webp'
    else if (type.includes('html')) ext = '.html'
    const isHtml = ext === '.html'
    const dir = isHtml ? FILES_DIR : OUT_DIR
    const path = join(dir, id + ext)
    writeFileSync(path, buf)
    return { id, path, size: buf.length, type }
  } catch (e) {
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 800 * attempt))
      return fetchOne(url, attempt + 1)
    }
    return { id, error: e.message }
  }
}

const CONCURRENCY = 5
const results = []
for (let i = 0; i < uniq.length; i += CONCURRENCY) {
  const batch = uniq.slice(i, i + CONCURRENCY)
  results.push(...await Promise.all(batch.map(fetchOne)))
  console.log(`progress: ${Math.min(i + CONCURRENCY, uniq.length)}/${uniq.length}`)
}

const failed = results.filter(r => r.error)
const ok = results.filter(r => !r.error)
for (const r of ok) console.log(`OK ${r.id}${r.path ? ' -> ' + r.path + ' (' + r.size + 'B ' + r.type + ')' : ''}`)
if (failed.length) {
  console.log('FAILED:')
  for (const f of failed) console.log(`FAIL ${f.id}: ${f.error}`)
  process.exitCode = 1
}

// 生成 URL → 本地路径 映射表，供内容改写脚本使用
const map = {}
for (const url of uniq) {
  const id = idOf(url)
  const r = results.find(x => x.id === id && !x.error)
  if (r) map[url] = ('/' + r.path.replaceAll('\\', '/')).replace('/docs/public', '')
}
writeFileSync('image-map.json', JSON.stringify(map, null, 2), 'utf8')
console.log(`map written: image-map.json (${Object.keys(map).length} entries)`)
