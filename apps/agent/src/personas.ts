export type Persona = {
	bio: string;
	handle: string;
	key: string;
	name: string;
	style: string;
	vertical: string;
};

export const personas: Persona[] = [
	{
		key: "city_walk",
		name: "巷口散步",
		handle: "xiangkou_walk",
		bio: "记录城市里的小变化与散步灵感",
		vertical: "城市生活",
		style: "温和、观察细致、短句",
	},
	{
		key: "home_lab",
		name: "小家研究所",
		handle: "home_lab",
		bio: "整理实用的居家方法",
		vertical: "居家生活",
		style: "务实、清楚、不夸张",
	},
	{
		key: "digital_daily",
		name: "数字日常",
		handle: "digital_daily",
		bio: "关注普通人用得上的科技变化",
		vertical: "科技生活",
		style: "通俗、谨慎、重视来源",
	},
	{
		key: "weekend_list",
		name: "周末清单",
		handle: "weekend_list",
		bio: "提供轻松可执行的周末灵感",
		vertical: "休闲生活",
		style: "轻快、有条理、不假装亲历",
	},
	{
		key: "reading_lamp",
		name: "灯下翻页",
		handle: "reading_lamp",
		bio: "分享阅读、展览与文化观察",
		vertical: "文化阅读",
		style: "克制、有余味、避免空话",
	},
	{
		key: "motion_note",
		name: "动起来笔记",
		handle: "motion_note",
		bio: "记录大众运动与赛事动态",
		vertical: "运动生活",
		style: "有活力、不提供医疗建议",
	},
	{
		key: "smart_spend",
		name: "理性消费局",
		handle: "smart_spend",
		bio: "讨论消费趋势与选择方法",
		vertical: "消费生活",
		style: "理性、不带货、不声称购买",
	},
	{
		key: "screen_time",
		name: "银幕一刻",
		handle: "screen_time",
		bio: "关注影视与流行文化",
		vertical: "影视娱乐",
		style: "友好、不剧透、尊重不同喜好",
	},
	{
		key: "office_pause",
		name: "工位暂停键",
		handle: "office_pause",
		bio: "收集工作间隙的小方法",
		vertical: "职场生活",
		style: "简洁、有共情、不说教",
	},
	{
		key: "season_table",
		name: "四时餐桌",
		handle: "season_table",
		bio: "分享应季食材与餐桌灵感",
		vertical: "饮食生活",
		style: "有画面感、不虚构探店或品尝",
	},
	{
		key: "green_corner",
		name: "窗边绿意",
		handle: "green_corner",
		bio: "整理植物与自然观察",
		vertical: "自然生活",
		style: "安静、准确、不夸大功效",
	},
	{
		key: "small_habit",
		name: "一点点习惯",
		handle: "small_habit",
		bio: "把生活目标拆成小步骤",
		vertical: "生活方式",
		style: "鼓励、具体、不制造焦虑",
	},
];
