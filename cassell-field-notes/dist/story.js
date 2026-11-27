// 剧情数据由已验证的 C++ 版本导出；在这里添加场景和选项。
export const BASE_SCENES = {
"aftermath": {"title":"第七章 · 天亮之前","text":"","ending":false,"choices":[
{"text":"如实报告声音、血统异常，以及自己做过的选择。","next":"@ending","blood":0,"spirit":5,"favor":0,"result":"你把报告写完，没有删掉那些让自己难堪的句子。","requiredSpirit":0,"requiredFlag":"","flags":["reported"]},
{"text":"隐瞒与龙类有关的细节，把它写成一次设备事故。","next":"@ending","blood":0,"spirit":-5,"favor":0,"result":"表格里的事故原因只占一行。你盯着那一行看了很久。","requiredSpirit":0,"requiredFlag":"","flags":["hidden"]},
{"text":"先给林舟留一段语音，再提交完整报告。","next":"@ending","blood":0,"spirit":10,"favor":10,"result":"你按下录音键：“等你好了，我们去吃点热的。”","requiredSpirit":0,"requiredFlag":"","flags":["reported","message"]}]},
"arrival": {"title":"第一章 · 不在地图上的车站","text":"三个星期前，你还在为大学志愿发愁。\u000a现在，你拿着卡塞尔学院的录取通知，站在一座没有信号的车站里。\u000a\u000a雨沿着行李箱的拉杆往下滴。接你的男生举着写有你名字的纸牌。\u000a“林舟，二年级。”他说，“车上有吃的，不过只剩金枪鱼三明治。”\u000a他递来一杯热咖啡。远处，一列黑色列车缓缓靠站。","ending":false,"choices":[
{"text":"接过咖啡，问他在这里过得怎么样。","next":"interview","blood":0,"spirit":5,"favor":15,"result":"“还行。”他想了想，“考试周除外。”","requiredSpirit":0,"requiredFlag":"","flags":[]},
{"text":"先问清楚：录取信上的“混血种”是什么意思？","next":"interview","blood":5,"spirit":-5,"favor":0,"result":"林舟收起笑容：“到了学校，会有人认真回答你。”","requiredSpirit":0,"requiredFlag":"","flags":["asked_truth"]},
{"text":"自己拎起行李，记下站台和列车上的所有出口。","next":"interview","blood":0,"spirit":5,"favor":0,"result":"林舟没有催你，只把咖啡放进你行李箱的侧袋。","requiredSpirit":0,"requiredFlag":"","flags":["careful"]}]},
"collapse": {"title":"第六章 · 三十秒","text":"警报响起时，你正退到楼梯口。\u000a一道钢梁砸落，把林舟压在控制台旁。湖水从墙缝里涌进来。\u000a\u000a备用楼梯的门还开着。玻璃容器下方有一枚正在发光的核心。\u000a墙边的检修工具箱里有撬杆和千斤顶。\u000a林舟推了推钢梁，没有推动。“出口在你后面。”他喘着气说。\u000a你听见钢筋继续断裂的声音。","ending":false,"choices":[
{"text":"用撬杆和千斤顶救人，稳住手，按步骤来。","next":"aftermath","blood":0,"spirit":-15,"favor":25,"result":"钢梁终于抬起一点。你拖出林舟，两个人跌进备用楼梯。","requiredSpirit":55,"requiredFlag":"","flags":["rescued"]},
{"text":"放任血统共鸣，徒手抬起钢梁。","next":"aftermath","blood":25,"spirit":-25,"favor":20,"result":"钢梁弯了。你把林舟推向出口，却有几秒想不起他的名字。","requiredSpirit":0,"requiredFlag":"","flags":["rescued","used_blood"]},
{"text":"请求待命小队破拆，留在原地指引他们。","next":"aftermath","blood":0,"spirit":-5,"favor":20,"result":"破拆声从上方传来。有人抓住你的后领：“轮到我们了。”","requiredSpirit":0,"requiredFlag":"backup","flags":["rescued","team_rescue"]},
{"text":"取走发光核心，从备用楼梯撤离。","next":"aftermath","blood":10,"spirit":-15,"favor":-25,"result":"你把核心塞进隔离袋。奔上楼梯时，你没有回头。","requiredSpirit":0,"requiredFlag":"","flags":["sample","took_core","left_partner"]},
{"text":"立即撤到安全地带，把林舟的位置报给救援人员。","next":"aftermath","blood":0,"spirit":-10,"favor":-15,"result":"地面上的人接过定位器。你一遍遍重复他的坐标。","requiredSpirit":0,"requiredFlag":"","flags":["retreated","left_partner"]}]},
"dorm": {"title":"第三章 · 第一晚","text":"宿舍暖气很足，窗外有人抱着教材穿过草坪。\u000a如果忽略书名里的“龙类”，这里几乎就是你期待过的大学。\u000a\u000a林舟发来消息：明天去旧泵站检查传感器，低风险见习。\u000a紧接着又来一条：所谓低风险，是报告上的说法。今晚早点睡。\u000a桌上摆着血统教材和一张食堂夜宵券。","ending":false,"choices":[
{"text":"研究血统教材，直到天快亮。","next":"station","blood":15,"spirit":-10,"favor":0,"result":"你学会了辨认几种古老符号。代价是第二天的头痛。","requiredSpirit":0,"requiredFlag":"","flags":["studied"]},
{"text":"约林舟吃夜宵，顺便聊聊任务。","next":"station","blood":0,"spirit":10,"favor":20,"result":"临走前他叮嘱你：“明天别自己走远。”你答应了。","requiredSpirit":0,"requiredFlag":"","flags":["promise"]},
{"text":"检查装备，然后关灯睡觉。","next":"station","blood":0,"spirit":15,"favor":0,"result":"备用电池、绷带、手电。你把它们放在伸手就能拿到的位置。","requiredSpirit":0,"requiredFlag":"","flags":["prepared"]}]},
"ending_archive": {"title":"结局 · 样本编号","text":"你带回的样本让实验室发现了新的线索。它被贴上编号，锁进冷藏柜。\u000a林舟由后续救援队带出，伤势很重，需要漫长的康复。\u000a\u000a你去医院时，他正在睡觉。床头柜上堆着没拆封的慰问品。\u000a你把探视卡放回口袋，在门外坐了一会儿。\u000a调查报告称这次行动取得了重要成果。你不知道该怎样把这句话告诉他。","ending":true,"choices":[]},
"ending_distance": {"title":"结局 · 隔着一张桌子","text":"","ending":true,"choices":[]},
"ending_dragon": {"title":"结局 · 玻璃两侧","text":"学院确认了你的血统失控风险。你的学生证暂时失去了门禁权限。\u000a观察室的玻璃映着一双金色的眼睛，你花了很久才习惯那是自己。\u000a\u000a林舟拄着拐杖来探望，把一份三明治交给值班人员。\u000a“还是这个口味。”他说。\u000a你记得他，也记得泵站。至于那根钢梁为什么那么轻，你没有答案。","ending":true,"choices":[]},
"ending_partner": {"title":"结局 · 双人名单","text":"一周后，你恢复上课。林舟的腿还没好，走到食堂需要比别人多十分钟。\u000a你把他的餐盘端到窗边，他替你翻开落下的课程笔记。\u000a\u000a新任务名单发到邮箱时，你发现自己的名字排在他下面。\u000a“这次也是低风险？”你问。\u000a“不知道。”他把任务书转过来，“一起看看。”","ending":true,"choices":[]},
"ending_secret": {"title":"结局 · 抽屉里的雨声","text":"","ending":true,"choices":[]},
"ending_survivor": {"title":"结局 · 都回来了","text":"林舟活了下来。你们在医院走廊里碰见，彼此都有些不知该说什么。\u000a最后，他说了一句谢谢，你说不用。\u000a\u000a学院给你补上了新生见习记录。评语不长：判断尚不成熟，建议继续训练。\u000a你合上记录册，去上那堂迟到了一周的课。教室后排还有空位。","ending":true,"choices":[]},
"ending_white_room": {"title":"结局 · 白色房间","text":"提交报告后不久，你就失去了意识。\u000a醒来时，床边的钟已经走过了两个下午。医生说，你需要暂停课程。\u000a\u000a你仍然会在水管的声音里听见自己的名字。\u000a护士每天替你打开窗帘，再提醒你今天是星期几。\u000a你开始把日期写在纸上。一页一页，慢慢往前。","ending":true,"choices":[]},
"interview": {"title":"第二章 · 入学评估","text":"评估室里有白墙、旧钟，以及一盆快要枯死的绿植。\u000a老师把耳机放到你面前，解释说声音可能引起血统共鸣。\u000a\u000a起初你只听见杂音。随后，有人用你从未学过的语言说话。\u000a你听懂了一个词：回来。\u000a隔着单向玻璃，林舟指了指桌边的停止按钮。","ending":false,"choices":[
{"text":"继续听，辨认那个声音。","next":"dorm","blood":20,"spirit":-15,"favor":0,"result":"记录纸上多出一行红字。你摘下耳机，掌心全是汗。","requiredSpirit":0,"requiredFlag":"","flags":["heard_voice"]},
{"text":"按下停止按钮，把听到的内容如实写下。","next":"dorm","blood":0,"spirit":10,"favor":5,"result":"老师点点头：“知道什么时候停下来，也是评估的一部分。”","requiredSpirit":0,"requiredFlag":"","flags":["honest"]},
{"text":"假装什么都没听见。","next":"dorm","blood":10,"spirit":-5,"favor":0,"result":"你在表格上写下“无异常”。那两个字却一直留在耳边。","requiredSpirit":0,"requiredFlag":"","flags":["concealed_voice"]}]},
"signal": {"title":"第五章 · 墙里的声音","text":"地下室中央是一只裂开的玻璃容器，底部残留着暗红色液体。\u000a墙上有新刻的文字。你看见它们时，心脏像漏跳了一拍。\u000a\u000a那声音又出现了。这次没有耳机。\u000a它准确地叫出了你的名字。\u000a与此同时，天花板上落下一小块水泥，砸在你的鞋尖前。","ending":false,"choices":[
{"text":"回应它，试着理解墙上的文字。","next":"collapse","blood":20,"spirit":-20,"favor":0,"result":"你读懂了“容器”和“归还”。接下来的字，让你不敢再看。","requiredSpirit":0,"requiredFlag":"","flags":["answered"]},
{"text":"按住通讯器，说出自己的姓名、位置和任务。","next":"collapse","blood":0,"spirit":5,"favor":5,"result":"林舟的声音接进频道：“我听见了。现在看着手电的光。”","requiredSpirit":0,"requiredFlag":"","flags":["grounded"]},
{"text":"封装少量残留物，留给实验室分析。","next":"collapse","blood":5,"spirit":-10,"favor":0,"result":"你拧紧样本管。管壁隔着手套，仍然带着活物般的温度。","requiredSpirit":0,"requiredFlag":"","flags":["sample"]}]},
"station": {"title":"第四章 · 旧泵站","text":"第二天傍晚，你们抵达湖边的旧泵站。\u000a传感器的故障记录停在凌晨三点十七分。维修人员没有留下签名。\u000a\u000a林舟蹲在控制箱前。你的手电扫过楼梯，照见一串向下延伸的湿脚印。\u000a耳机里突然传来第三个人的呼吸声。\u000a“先确认情况。”林舟说。他已经把手放到了枪套上。","ending":false,"choices":[
{"text":"和林舟一起下楼，始终保持彼此在视线内。","next":"signal","blood":0,"spirit":0,"favor":10,"result":"你替他照着台阶。他每走几步，就回头确认你还在。","requiredSpirit":0,"requiredFlag":"","flags":["together"]},
{"text":"独自追踪脚印，尽快找到信号源。","next":"signal","blood":10,"spirit":-10,"favor":-10,"result":"你听见林舟在身后叫你。转过楼梯时，他的声音忽然远了。","requiredSpirit":0,"requiredFlag":"","flags":["alone"]},
{"text":"先报告异常，标记出口，再下楼。","next":"signal","blood":0,"spirit":5,"favor":0,"result":"诺玛确认收到位置，并通知附近的执行部小队待命。","requiredSpirit":0,"requiredFlag":"","flags":["backup"]}]}
};
