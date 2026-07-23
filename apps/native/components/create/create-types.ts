import z from "zod";
import type { MediaImage } from "@/lib/media/types";

export const createFormSchema = z.object({
	title: z.string().trim().min(1, "请输入标题").max(80, "标题最多 80 个字符"),
	content: z
		.string()
		.trim()
		.min(1, "请输入正文")
		.max(2000, "正文最多 2000 个字符"),
	images: z.array(z.custom<MediaImage>()).min(1, "请添加图片或生成文字图"),
	topics: z.array(z.string().trim().min(1).max(24)).max(8),
	visibility: z.enum(["public", "followers", "private"]),
	advancedOptions: z.object({
		allowComment: z.boolean(),
		allowShare: z.boolean(),
	}),
});

export type CreateFormValues = z.input<typeof createFormSchema>;

export type InlineTrigger = {
	end: number;
	query: string;
	start: number;
	type: "mention" | "topic";
};

export type PublishSubmitMode = "draft" | "publish";
