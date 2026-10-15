# phi-guide-docs

Phigros 入门指南文档站，基于 [VitePress](https://vitepress.dev/) 构建。

内容迁移自金山文档《Phigros入门指南/常见问题》的四个板块：**游戏基础**、**解锁教程**（主线解锁/AT解锁教程）、**术语解释**（音游名词解释）、**常见问题 Q&A**。

## 本地开发

```bash
npm install
npm run docs:dev      # 开发服务器
npm run docs:build    # 构建到 docs/.vitepress/dist
npm run docs:preview  # 本地预览构建产物
```

## 部署

`npm run docs:build` 产物为纯静态文件（`docs/.vitepress/dist`），任意静态托管均可直接发布：

- **阿里云 ESA（规划）**：域名备案通过后，将 ESA 站点源站指向静态资源（ESA 边缘节点 / 对象存储 / 源站均可），绑定自定义域名即可。构建产物无需 Node 运行时。
- 部署在域名根路径时无需任何改动；若挂在子路径下，需在 `docs/.vitepress/config.mts` 设置 `base`，并同步修改 `docs/basic/settlement.md` 内嵌计算器 iframe 的 `src`（`/files/...`）。

## 结构

```
docs/
├── .vitepress/config.mts   # 站点配置（导航/侧边栏/搜索）
├── index.md                # 首页
├── basic/                  # 游戏基础（9 页）
├── unlock/                 # 解锁教程（10 页）
├── terms/                  # 术语解释（1 页）
├── faq/                    # 常见问题（2 页）
└── public/
    ├── images/             # 全部文档图片（本地化，无外链依赖）
    └── files/              # 控分计算器等静态附件
scripts/                    # 一次性迁移脚本（抓图/切分），与站点构建无关
```

## 备注

- 站点地图（sitemap）待域名确定后在 `config.mts` 中补充 `sitemap.hostname`。
- 结算页内嵌的控分计算器为纯前端页面，依赖 Tailwind/FontAwesome 公共 CDN。
