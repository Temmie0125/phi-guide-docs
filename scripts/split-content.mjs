// 一次性迁移脚本：将 kdocs_content.md 按板块切分为 VitePress 页面
// 前置：scripts/download-images.mjs 已完成，image-map.json 存在
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const raw = readFileSync('kdocs_content.md', 'utf8')
  .replaceAll('\u200b', '')
  .replaceAll('\uFEFF', '')

const imageMap = JSON.parse(readFileSync('image-map.json', 'utf8'))
const KS = 'https://coop-export.ks3-cn-beijing.ksyun.com/office_exporter/420014470250/'

// ---------- 全局文本变换 ----------
let text = raw
  // 控分计算器附件（手动下载，不在 image-map 内）须先于通用外链改写处理
  .replace(
    /\[Phigros_Score_Calculator v1\.3\.7\.html\]\([^)]+\)/,
    '[Phigros_Score_Calculator v1.3.7.html](/files/Phigros_Score_Calculator_v1.3.7.html)',
  )
  .replaceAll(KS, '::KS::')

const localMap = {}
for (const [url, local] of Object.entries(imageMap)) {
  const short = url.slice(KS.length)
  localMap['::KS::' + short.slice(0, short.indexOf('?')) + '?'] = local
}
text = text.replace(/::KS::[A-Z0-9]+\?[^\s)]*/g, m => {
  const local = localMap[m.slice(0, m.indexOf('?') + 1)]
  if (!local) throw new Error('unmapped url: ' + m)
  return local
})
if (text.includes('::KS::') || text.includes('coop-export')) throw new Error('residual external asset links')

// 数学公式：Kdocs 导出的多层大括号会触发 Vue 模板插值，且并非合法 LaTeX
text = text.replace(
  '$rks={{\\left ({\\frac{100\\times Acc-55}{45}}\\right )}^{2}}\\times level$',
  '$rks = \\left( \\frac{100 \\times Acc - 55}{45} \\right)^{2} \\times level$',
)
if (text.includes('{{')) throw new Error('residual {{ found — Vue interpolation risk')

// 站内交叉引用
const xrefs = [
  ['详见“课题模式”', '详见[课题模式](/basic/course)'],
  ['详见“设置系统-账号与统计-头像”部分', '详见[设置系统-账号与统计-头像](/basic/settings)部分'],
  ['详见“设置系统-其他-音频问题疑难解答”', '详见[设置系统-其他-音频问题疑难解答](/basic/settings)'],
  ['详见“设置系统”', '详见[设置系统](/basic/settings)'],
  ['详见“Ranking Score(RKS)”部分', '详见[Ranking Score(RKS)](/basic/rks)部分'],
  ['详见“结算-评级”部分', '详见[结算-评级](/basic/settlement)部分'],
  ['详见“结算-分数和准确率”部分', '详见[结算-分数和准确率](/basic/settlement)部分'],
  ['这些内容详见“解锁”部分', '这些内容详见[解锁教程](/unlock/)部分'],
  ["Rrhar'il的解锁详见第七章", "Rrhar'il 的解锁详见[第七章](/unlock/chapter7)"],
  ['参考“关于多指”章节', '参考[关于多指](/faq/advanced)章节'],
]
for (const [from, to] of xrefs) text = text.replaceAll(from, to)
// 标题里的装饰星号去掉
text = text.replace(/^#### ⭐头像$/m, '#### 头像')

// ---------- 结构切分 ----------
const lines = text.split('\n')
const headings = []
lines.forEach((l, i) => {
  const m = /^(#{1,6}) (.+)$/.exec(l)
  if (m) headings.push({ i, level: m[1].length, text: m[2].trim().replace(/^[⭐*]+/, '') })
})
const find = (t, from = 0) => {
  const h = headings.find(h => h.i >= from && h.text === t)
  if (!h) throw new Error('heading not found: ' + t)
  return h
}
const findStart = (prefix, from = 0) => {
  const h = headings.find(h => h.i >= from && h.text.startsWith(prefix))
  if (!h) throw new Error('heading not found: ' + prefix)
  return h
}
const between = (a, b) => lines.slice(a + 1, b).join('\n')

const H = {
  basic: find('游戏基础'),
  unlock: find('主线解锁/AT解锁教程'),
  terms: find('音游名词（术语）解释'),
  alias: find('曲目别名'),
  faq: find('常见问题Q&A'),
  refs: find('参考文献'),
}

// 标题降级：### → ##（正文不再包含 h1，页面标题由 frontmatter 提供）
const demote = (body, n = 1) =>
  body.replace(/^(#{2,6}) /gm, (_, h) => '#'.repeat(Math.max(2, h.length - n)) + ' ')
const tidy = s =>
  s.replace(/\n{3,}/g, '\n\n')
    .replace(/([^\n])\n(#{2,6} )/g, '$1\n\n$2')
    .replace(/(!\[[^\]]*\]\([^)]+\))\n(?!\n)/g, '$1\n\n')
    .replace(/^\n+/, '')
    .replace(/\s+$/, '')

const pages = []
function emit(file, title, body, { demote: d = 0 } = {}) {
  const b = tidy(d ? demote(body, d) : body)
  pages.push({ file, content: `---\ntitle: ${title}\n---\n\n${b}\n` })
}

// 小节切片；includeHeading 为 true 时保留该小节的 ## 标题（用于一页合并多小节）
const slice = (t, nextT, endLine, { includeHeading = false } = {}) => {
  const h = find(t)
  const end = nextT ? find(nextT).i : endLine
  return (includeHeading ? `## ${h.text}\n\n` : '') + between(h.i, end)
}

// ---------- 游戏基础 ----------
const bEnd = H.unlock.i
emit('basic/index.md', '游戏基础', [
  '本部分介绍 Phigros 的核心玩法、判定机制、游戏界面、谱面难度、结算规则、设置系统、Ranking Score（RKS）与课题模式等基础知识。',
  '建议新玩家按顺序阅读；想查找特定内容可以使用右上角搜索或左侧目录。',
  '',
  '| 章节 | 内容 |',
  '| --- | --- |',
  '| [玩法](/basic/gameplay) | 音符（Tap/Hold/Drag/Flick）、判定线与噪域机制 |',
  '| [判定](/basic/judgement) | 垂直判定、四种判定区间与帧内延迟 |',
  '| [界面](/basic/ui) | 主页面、选曲界面、结算界面与收藏品界面 |',
  '| [谱面与曲目](/basic/chart) | 谱面难度、等级和定数、章节和曲目解锁规则 |',
  '| [结算](/basic/settlement) | 连击、分数和准确率的计算方式与评级 |',
  '| [设置系统](/basic/settings) | 游玩设置、账号与统计、音频疑难解答 |',
  '| [Ranking Score](/basic/rks) | rks 的计算方式与 b30 查询 |',
  '| [课题模式](/basic/course) | 严判三连玩的综合评价机制 |',
  '| [其他系统](/basic/others) | Data、Tips 与重演 |',
  '',
  '## 参考资料',
  '',
  '- [Phigros - 萌娘百科](https://mzh.moegirl.org.cn/Phigros)',
  '- [关于Phigros判定 - 哔哩哔哩](https://b23.tv/GTPTTqz)',
].join('\n'))

emit('basic/gameplay.md', '玩法', slice('玩法', '判定', bEnd), { demote: 1 })
emit('basic/judgement.md', '判定', slice('判定', '界面', bEnd), { demote: 1 })
emit('basic/ui.md', '界面', slice('界面', '谱面难度', bEnd), { demote: 1 })
emit('basic/chart.md', '谱面与曲目', [
  slice('谱面难度', '等级和定数', bEnd, { includeHeading: true }),
  slice('等级和定数', '章节和曲目', bEnd, { includeHeading: true }),
  slice('章节和曲目', '谱面', bEnd, { includeHeading: true }),
  slice('谱面', '结算', bEnd, { includeHeading: true }),
].join('\n\n'))
emit('basic/settlement.md', '结算', slice('结算', '设置系统', bEnd), { demote: 1 })
emit('basic/settings.md', '设置系统', slice('设置系统', 'Ranking Score(RKS)', bEnd), { demote: 1 })
emit('basic/rks.md', 'Ranking Score（RKS）', slice('Ranking Score(RKS)', '课题模式', bEnd), { demote: 1 })
emit('basic/course.md', '课题模式', slice('课题模式', '其他系统', bEnd))
emit('basic/others.md', '其他系统', slice('其他系统', null, bEnd).replace(/^### 收藏\n+/m, ''), { demote: 1 })

// 结算页内嵌控分计算器（纯前端页面，可直接 iframe）
{
  const f = pages.find(p => p.file === 'basic/settlement.md')
  f.content = f.content.replace(
    /(\[Phigros_Score_Calculator v1\.3\.7\.html\]\([^)]+\)[ \t]*\n[^\n]*\n)/,
    `$1
<iframe
  src="/files/Phigros_Score_Calculator_v1.3.7.html"
  style="width: 100%; height: 760px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: #fff"
  loading="lazy"
  title="Phigros 控分计算器"
></iframe>

*计算器已内嵌于上方，也可[在新窗口打开](/files/Phigros_Score_Calculator_v1.3.7.html)。
`,
  )
}

// ---------- 解锁教程 ----------
const uEnd = H.terms.i
const CH5 = '主线第五章隐藏曲-Spasmodic和Leave All Behind'
const CH6 = '主线第六章和隐藏曲Igallta'
const CH7 = "主线第七章和隐藏曲Rrhar'il"
const CH8 = '主线第八章解锁流程'
const CH91 = '主线第九章解锁流程(1)'
const CH92 = '主线第九章解锁流程(2)'
const SS2 = '支线Side Story 2 弭刻日 解锁方法'
const SS3 = '支线Side Story 3 盗乐行 解锁方法'
const SS4 = '支线Side Story 4 无相乡 解锁方法'
const LANOTA = 'Lanota精选集双AT解锁流程'
const JIANG = '姜米條精选集-Shadow AT解锁方法'
const TAKUMI = 'TAKUMI³精选集 - Cuvism³ AT解锁方法'
const SATELLITE = '外传章节 极星卫（かめりあ）- S.A.T.E.L.L.I.T.E. AT解锁方法'
const RANDOM = '单曲Random差分谱面解锁方法'

emit('unlock/index.md', '解锁教程', [
  between(H.unlock.i, findStart('主线第五章隐藏曲', H.unlock.i).i),
  '',
  '## 各章节导航',
  '',
  '- [主线第五章隐藏曲：Spasmodic 和 Leave All Behind](/unlock/chapter5)',
  '- [主线第六章隐藏曲：Igallta](/unlock/chapter6)',
  '- [主线第七章隐藏曲：Rrhar\'il](/unlock/chapter7)',
  '- [主线第八章解锁流程](/unlock/chapter8)',
  '- [主线第九章解锁流程（1）](/unlock/chapter9-1)',
  '- [主线第九章解锁流程（2）](/unlock/chapter9-2)',
  '- [支线章节解锁（Side Story 2/3/4）](/unlock/side-stories)',
  '- [精选集与外传章节 AT 解锁](/unlock/collections)',
  '- [单曲 Random 差分谱面解锁](/unlock/random)',
].join('\n'))

emit('unlock/chapter5.md', '主线第五章隐藏曲：Spasmodic 和 Leave All Behind', slice(CH5, CH6, uEnd), { demote: 1 })
emit('unlock/chapter6.md', '主线第六章隐藏曲：Igallta', slice(CH6, CH7, uEnd), { demote: 1 })
emit('unlock/chapter7.md', "主线第七章隐藏曲：Rrhar'il", slice(CH7, CH8, uEnd), { demote: 1 })
emit('unlock/chapter8.md', '主线第八章解锁流程', slice(CH8, CH91, uEnd), { demote: 1 })
emit('unlock/chapter9-1.md', '主线第九章解锁流程（1）', slice(CH91, CH92, uEnd), { demote: 1 })
emit('unlock/chapter9-2.md', '主线第九章解锁流程（2）', slice(CH92, SS2, uEnd), { demote: 1 })
emit('unlock/side-stories.md', '支线章节解锁（Side Story 2/3/4）', [
  slice(SS2, SS3, uEnd, { includeHeading: true }),
  slice(SS3, SS4, uEnd, { includeHeading: true }),
  slice(SS4, LANOTA, uEnd, { includeHeading: true }),
].join('\n\n'))
emit('unlock/collections.md', '精选集与外传章节 AT 解锁', [
  slice(LANOTA, JIANG, uEnd, { includeHeading: true }),
  slice(JIANG, TAKUMI, uEnd, { includeHeading: true }),
  slice(TAKUMI, SATELLITE, uEnd, { includeHeading: true }),
  slice(SATELLITE, RANDOM, uEnd, { includeHeading: true }),
].join('\n\n'))
emit('unlock/random.md', '单曲 Random 差分谱面解锁', slice(RANDOM, null, uEnd), { demote: 1 })

// 第九章（2）开头的未闭合 ** 块 → 提示容器，并补充噪域机制指引
{
  const f = pages.find(p => p.file === 'unlock/chapter9-2.md')
  f.content = f.content.replace(
    /^\*\*注意：自此开始的谱面将会出现全新的“噪域”机制：[ \t]*\n(.+)[ \t]*\n(.+)$/m,
    (_m, l1, l2) =>
      `> [!WARNING]
> 自此开始的谱面将会出现全新的“噪域”机制，详细说明见[游戏基础 › 玩法 › 噪域](/basic/gameplay#噪域)。
> ${l1.replace(/[ \t]+$/, '')}
> ${l2.replace(/[ \t]+$/, '')}`,
  )
  if (f.content.includes('**注意：自此')) throw new Error('chapter9-2 warning block not fixed')
}

// ---------- 术语解释 ----------
emit('terms/index.md', '音游名词（术语）解释', between(H.terms.i, H.alias.i))

// ---------- 常见问题 ----------
const faqBody = between(H.faq.i, H.refs.i)
const faqSplit = faqBody.indexOf('## 关于多指？')
if (faqSplit < 0) throw new Error('faq split point not found')
emit('faq/index.md', '常见问题 Q&A', tidy(faqBody.slice(0, faqSplit)) + '\n\n相关解锁流程：[主线第六章隐藏曲 Igallta](/unlock/chapter6)。')
emit('faq/advanced.md', '多指练习与进阶指南', faqBody.slice(faqSplit))

// ---------- 写盘 ----------
for (const p of pages) {
  const path = join('docs', p.file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, p.content, 'utf8')
  console.log(`wrote ${path} (${p.content.length} chars)`)
}
console.log(`total: ${pages.length} pages`)
