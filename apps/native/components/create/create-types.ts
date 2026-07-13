export type InlineTrigger = {
	end: number;
	query: string;
	start: number;
	type: "mention" | "topic";
};

export type PublishSubmitMode = "draft" | "publish";
