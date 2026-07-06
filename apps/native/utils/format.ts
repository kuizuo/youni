export function formatCount(value: number) {
	if (value >= 10_000) {
		const formatted =
			value >= 100_000
				? String(Math.round(value / 10_000))
				: (value / 10_000).toFixed(1).replace(/\.0$/, "");
		return `${formatted}万`;
	}
	return String(value);
}

export function formatRelativeTime(
	value: Date | string | null | undefined,
	fallback = "",
) {
	if (!value) return fallback;

	const date = new Date(value);
	const diff = Date.now() - date.getTime();
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (Number.isNaN(date.getTime())) return fallback;
	if (diff < minute) return "刚刚";
	if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
	if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
	if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatTime(value: Date | string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return `${String(date.getHours()).padStart(2, "0")}:${String(
		date.getMinutes(),
	).padStart(2, "0")}`;
}
