# 我的个人档案网站

从 SODA 个人网站提炼的轻量起步模板。保留暖纸面、橙色点缀、杂志排版，以及「经历 → 思考 → 方法 → 作品」四个档案房间。内容、图片和联系方式由站长自行提供。

## 运行

需要 Node.js 20.9 以上。首次运行：

```bash
npm install
npm run dev
```

打开终端显示的本地地址。端口冲突时使用 `npm run dev -- --port 3002`。代码无数据库、登录、付费 API、分析追踪或环境变量需求。

## 个性化

编辑根目录 `site.config.json`：

- `name` / `nameEn` / `initials`：中英文姓名与导航标记。
- `tagline` / `intro` / `about` / `roles`：定位、自我介绍、标签；文案均为 `{ "zh": "中文", "en": "English" }`。
- `defaultLang`：默认语言，`zh` 或 `en`。只准备一种语言时可在两栏填相同真实内容，不编造另一语言的经历。
- `accent`：六位十六进制强调色。更改后检查浅色与深色对比度。
- `portrait`：自己的本地头像，例如 `/images/portrait.jpg`，文件放到 `public/images/portrait.jpg`。留空显示抽象轨道；不依赖在线图库。
- `email` / `socials`：公开联系方式，留空则不生成对应链接。社交链接用 `{ "label": "GitHub", "url": "https://github.com/your-account" }`。
- `rooms`：四个房间可以改标题与字母；`id` 保持不变。`enabled: false` 会隐藏入口，相关路由返回 404，并从文章列表与 sitemap 中排除。**此开关用于内容组织，不构成私密数据保护；请从源代码和构建输入中移除私密材料。**
- `chapters`：真实的成长章节，可为空。
- `projects`：作品定位、受众、可见成果、状态、链接和图片；`url` 留空代表无公开演示，不生成假链接。
- `articles`：`room` 取 `orbit` 或 `digest`，`slug` 唯一，正文由小节和段落组成。React 按文本渲染，不执行 HTML。

没有内容时设为空数组，页面会显示留白状态。示例资料全部标有「示例」，正式使用时替换或删除，再设置 `demo: false`。

## 验证

```bash
npm run lint
npm run build
npm run typecheck
npm run start
```

`predev` / `prebuild` 自动检查配置、链接协议、文章标识和本地图片是否存在。桌面 1440px 与手机 390px 分别检查中英文、明暗主题、文章筛选、弹窗的滚动/全屏/Esc/焦点返回，以及主题跨页与刷新。正文应自然换行，不通过裁切或隐藏横向滚动来遮住错误。

## 正式发布

先完成内容审阅和本地检查。部署到你选择的平台前，再确认账户、资费与域名。仓库代码可以单独部署到支持 Next.js 的平台；此模板不会自动开通服务、购买域名或发布。

1. 删除示例内容，设置 `demo: false`。
2. 填自己的 HTTPS 域名到 `siteUrl`，例如 `https://my-domain.com`，不要填参考网站的域名。
3. 得到正式发布授权后，设置 `publish: true`，再次构建。此时自动生成 robots、sitemap、页面 canonical 与分享图；Preview 保持 `publish: false`。
4. 部署后检查 `/robots.txt`、`/sitemap.xml`、`/opengraph-image`、HTTPS、404 和手机核心路径。配置适合你的可用性与错误监控；实际接入统计、表单或 Cookie 时同步处理隐私告知。

默认 `publish: false` 禁止搜索引擎索引，不保证页面私密；敏感资料不得放进公开构建。语言切换是阅读偏好，元数据使用默认语言；这不是带独立语言 URL 和 hreflang 的多语言 SEO 系统。

依赖沿用来源站的 Next.js / React 技术栈（Next.js 为 MIT，React 为 MIT）；版本在包文件与锁文件中记录。升级由站长维护，先查看官方安全公告并重新构建。生成器本身只用 Node 内置模块。

## 使用说明

这份起步代码供任何人参考、修改，用于搭建自己的个人网站。SODA 原站的照片、文章、二维码、账号、项目素材与音乐不随本仓库提供。使用自己的素材并确认使用权；第三方依赖遵循各自许可证。
