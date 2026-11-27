# 卡塞尔见习录

非官方卡塞尔学院同人文字冒险。四项任务共 39 章、17 个结局。

[在线试玩（原上线版《雨夜入学》）](https://cassell-rain-night.deed.page/)

## 文件

- `dist/index.html`：页面结构。
- `dist/style.css`：手机和电脑布局。
- `dist/story.js`：原版剧情数据。
- `dist/campus-story.js`、`dist/pump-story.js`：校园调查和三条泵站路线。
- `dist/extended-story.js`：十五章的场景顺序、汇合点和扩写后的收尾剧情。
- `dist/south-mission.js`、`dist/snow-mission.js`：两个独立任务，各有八章、三种结局。
- `dist/free-day-mission.js`：以原著校园活动「自由一日」为背景的原创后续，八章、三种结局。
- `dist/companion-story.js`：林舟、沈栀、程野的共同往事、跨任务选项和番外。
- `dist/cafeteria-story.js`：泵站结束后与林舟的食堂对话，以及南楼第二章的回响。
- `dist/scene-art.js`、`dist/illustrations/`：章节场景与插画。39 个章节的 51 个场景各用一张，食堂另有一张。在线只加载当前场景图，离线单文件将插画嵌入。
- `dist/engine.js`：状态、选项条件、结局判断及 JSON 校验。
- `dist/app.js`：点击操作、本地存档、分享、导入导出。
- `dist/campus.svg`、`dist/crest.svg`、`dist/share-cover.png`：页面插画和分享封面。

网站不需要数据库，也不使用外部字体或图片服务。要在本机运行，请用静态服务器打开 `dist`。例如，安装了 Python 3 时，在本目录运行 `python -m http.server 8000 --directory dist`，然后打开 [本地地址](http://localhost:8000/)。

插画由内置 ImageGen 生成，`插画提示词.txt` 记录了每张图的提示词。

## 修改剧情

场景用 ID 连接。选项的 `next` 指向下一场景，`blood`、`spirit`、`favor` 为属性变化，`flags` 记录经历。每个任务的章节表中，同一行的场景属于同一章的不同路线。任务在 `engine.js` 的 `missions` 中注册，任务自己的结局函数决定最后抵达哪一页。

## 存档

使用 localStorage。每项任务各有一个自动进度和三个手动槽，结局档案按任务收集。清理浏览器数据前请导出 JSON。旧网页存档和 C++ 存档归入「旧泵站见习」，保留原有场景、属性及已记录的选择。

任务的通关状态来自当前浏览器的结局档案。「同伴通讯」根据已经完成的任务展开对应往事，完成旧泵站、南楼、观测站的任意结局即可读北门番外。

抵达任意泵站结局后可以去食堂。游戏优先用当前或存档中可恢复的泵站结局决定林舟的开场，只有结局档案时使用通用对话。你在食堂的回答单独存放在当前浏览器，重新选择后，南楼第二章会随之更新。

## 验证

Node.js 下运行 `node tests.mjs`，覆盖各任务的结局、完整路线、跨任务选项开关、旧存档迁移及存档往返。

链接提供分享标题、描述和封面。不同应用显示方式可能不同，微信真机环境未测试。

插画在正文后淡化显示，不截断文字，也不拦截点击。章节标题旁的「插图」开关保存在当前浏览器。
