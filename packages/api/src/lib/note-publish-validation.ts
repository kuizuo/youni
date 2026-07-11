export function getMissingPublishItems(input: {
	content: string;
	images: string[];
	title: string;
}) {
	return [
		input.images[0] ? null : "图片",
		input.title.trim() ? null : "标题",
		input.content.trim() ? null : "正文",
	].filter((item): item is string => Boolean(item));
}
