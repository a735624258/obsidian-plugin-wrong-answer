# 错题卡片

![version](https://img.shields.io/badge/version-1.0.0-blue)
![platform](https://img.shields.io/badge/Obsidian-%E2%89%A5%200.15.0-7c3aed)

> 在 Obsidian 笔记里贴一段 `wrong-card` 代码块，题目截图和答案截图就变成一张点一下能翻转的错题卡片。
>
> **English** — Turn a `wrong-card` code block in an Obsidian note into a click-to-flip card: question screenshot on the front, answer screenshot on the back, one line of explanation in a side panel.

| | |
|---|---|
| 当前版本 | 1.0.0 |
| 许可 | 未声明（仓库暂无 LICENSE） |
| 平台 | Obsidian ≥ `0.15.0`，桌面端与移动端（`isDesktopOnly: false`） |
| 支持范围 | 只做「两张图 + 一行解析」的本地卡片；不连网、不写数据、无设置项 |

---

## 1、为什么要做

- 错题素材几乎都是截图，而截图散在附件文件夹里，复习就是一张张点开看图。
- 通用闪卡插件要手打题目和答案文本，截图塞不进去，敲字的时间比刷题还长。
- 错题本常被单独放进另一个 App，刷题笔记和错题分家，复习要两头跑。
- 真正需要的只有三件事：**正面看图、点一下看答案、旁边留一句当时为什么错**。

## 2、它做什么

1. **写卡片** —— 用 `wrong-card` 代码块声明 `front` / `back` / `note` 三个字段
2. **翻答案** —— 点击卡片翻转，正面题目、背面答案，`rotateY` 翻转动画 0.4 秒
3. **同步解析** —— 右侧一栏跟卡片同时切换，翻到背面才显示 `note` 那句解析
4. **认两种图片写法** —— `![[图片名.png]]` 走全库查找，vault 内相对路径直接定位
5. **离线渲染** —— 图片读本地二进制转 base64 内联，不发网络请求、不依赖图床
6. **快插模板** —— 命令面板与左侧功能区图标都能一键插入空白卡片

## 3、怎么用

1. 把题目和答案截图放进 vault（建议统一放 `attachments/`）
2. 在笔记里插入卡片模板：命令面板搜「插入错题卡片」，或点左侧功能区的铅笔图标
3. 填好三个字段（`note` 只读一行），切到阅读视图
4. 点击卡片任意位置翻到背面，再点一次翻回题目

例子：

````markdown
```wrong-card
front: attachments/错题-001-题目.png
back: attachments/错题-001-答案.png
note: 错在漏看了「不包括」，四个选项里只有 B 符合。
```
````

| 操作 | 入口 | 默认快捷键 |
|---|---|---|
| 插入卡片模板 | 命令面板「插入错题卡片」/ 左侧功能区铅笔图标 | 未绑定（可在 设置 → 快捷键 自行指定） |
| 翻到背面 / 翻回题目 | 阅读视图里点击卡片任意位置 | 鼠标点击 |

## 4、安装

本插件未上架社区市场、没有 npm 包也没有 Release 附件，只能手动放文件。三条路选一条：

1. **手动安装** —— 下载 `main.js`、`manifest.json`、`styles.css`，放进 `<你的库>/.obsidian/plugins/wrong-answer/`
2. **克隆安装** —— `git clone git@github.com:a735624258/obsidian-plugin-wrong-answer.git "<你的库>/.obsidian/plugins/wrong-answer"`
3. **改代码** —— 克隆到任意目录，改完把 `main.js` 覆盖进插件目录（仓库没有构建步骤，`main.js` 就是产物）

### 4.1 装完要重启

- 先在 设置 → 第三方插件 关闭「受限模式」，再点插件列表的刷新
- 列表里仍看不到，就重启一次 Obsidian，然后手动打开「错题卡片」
- 改了插件文件不生效，先确认插件目录里放的是不是新文件，再刷新或重启

### 4.2 卸载

- 关闭插件，删掉 `.obsidian/plugins/wrong-answer/` 整个目录即可
- 笔记里的卡片代码块和图片都留在原处，卸载不会丢数据

### 4.3 兼容性与已知坑

| 项目 | 状态 |
|---|---|
| 最低 Obsidian 版本 | `0.15.0`（取自 `manifest.json` 的 `minAppVersion`） |
| 声明平台 | 桌面端 + 移动端（`isDesktopOnly: false`） |
| 已验证的版本上限 | 仓库未声明 |
| 社区市场 / npm | 均未发布 |

1. `front` / `back` 必须是 vault 内的图片文件；填网络链接无效，卡片上会显示「请填写 front 路径」
2. `note` 只读一行，写在第二行的解析不会被渲染
3. 解析栏文字无法选中复制 —— 整行卡片设了 `user-select: none`
4. 图片以 base64 内联渲染，几 MB 的大图会让阅读视图明显变卡
5. 编辑状态下看到的是代码块源码，渲染结果只出现在阅读视图
6. 暂不支持音频、视频、PDF 卡片，欢迎 PR

## 5、它是怎么做到的

```
笔记中的 wrong-card 代码块
   ↓  registerMarkdownCodeBlockProcessor('wrong-card')
parseFields()       → 取出 front / back / note
   ↓
resolveImage()      → ![[图片名]] 用 metadataCache 全库查找
                      否则按 vault 相对路径 getFileByPath
   ↓  读取二进制 → base64 data URL（png / jpg / jpeg / gif / webp）
渲染两栏：左 = 3D 翻转卡片，右 = 解析栏
   ↓
整行点击 → 给容器切 .flipped → 左右同步翻转
```

1. **纯本地链路** —— 图片只从 vault 读二进制转 base64，全程不发网络请求，也不需要图床
2. **双寻址兜底** —— 先按 wiki 链接全库查，查不到再按相对路径精确定位，两种写法都照顾
3. **转义防注入** —— `note` 先过 `escapeHtml` 再进 DOM，解析里写标签只会显示成文字；图片 `src` 只接受本地文件生成的 data URL
4. **只改一个类名** —— JS 仅在容器上切 `.flipped`，翻转动画和解析栏显隐交给 CSS，逻辑与样式不互相纠缠
5. **零状态** —— 不写设置、不建索引、不落缓存；卡片在笔记里、图片在 vault 里，插件只负责渲染

## 6、开发

- **依赖** —— 无第三方依赖，只用 Obsidian 提供的 API（`require('obsidian')`）；仓库没有 `package.json`
- **构建** —— 无构建步骤，`main.js` 就是发布产物，改完覆盖到插件目录即可
- **测试** —— 仓库未附带自动化测试；手工回归建议覆盖：缺 `front`、缺 `back`、wiki 链接写法、相对路径写法、`note` 里写标签、非 png 扩展名

```
obsidian-plugin-wrong-answer/
├── manifest.json   插件元信息：id / 名称 / 版本 / 最低 Obsidian 版本 / 作者
├── main.js         全部逻辑：代码块处理器 + 命令 + 功能区图标
├── styles.css      翻转卡片与解析栏样式
└── README.md
```

---

## 更新日志

- **1.0.0** —— 首个版本：`wrong-card` 代码块、点击翻转卡片、解析栏、插入模板命令与功能区图标
- **1.0.0（文档）** —— README 按项目文档规范重写，历史记录拆进 `CHANGELOG.md`
- **1.0.0（元信息）** —— `manifest.json` 的 `author` 字段改为仓库账号名

完整历史见 **[CHANGELOG.md](CHANGELOG.md)**。

---

仓库暂未附带 LICENSE 文件，使用与分发前请自行确认授权方式。
