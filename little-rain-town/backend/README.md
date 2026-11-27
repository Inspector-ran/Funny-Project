# 毛毛雨小镇共享存档

共享版沿用 GitHub Pages 的网页。Supabase 保存居民、见面记录和小镇时间。访客可以浏览小镇，参与者用邀请码认领自己的小人。

## 配置

1. 在 Supabase 项目的 SQL Editor 运行 [setup.sql](setup.sql)。
2. 在项目的 Connect 面板复制 Project URL 和 Publishable key，分别填入 [shared-config.js](../shared-config.js) 的 `projectUrl` 和 `publishableKey`。这两个值供网页使用。数据库密码、secret key 和邀请码保存在仓库外。
3. 将游戏目录中的六个网页文件发布到 GitHub Pages 分支的根目录。发布后，用两个独立浏览器会话检查居民列表和小镇动态能否同步。

## 签发试玩邀请码

在 Supabase SQL Editor 运行以下语句。把数字换成参与人数，把结果中的邀请码分别私发给参与者，每人一条。

```sql
select invite_code from rain_town.issue_invites(10);
```

数据库为每个邀请码保留一个小人名额。持码者可以继续编辑同一个小人，换设备时输入原码即可。居民昵称、外观、口头禅和互动记录在游戏里公开显示。

共享模式使用独立的服务器存档，从三名默认居民开始。先前保存在浏览器的单人存档仍可供单人模式读取。
