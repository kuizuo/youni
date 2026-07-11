export type InlineTrigger = {
	end: number;
	query: string;
	start: number;
	type: "mention" | "topic";
};

export type NoteVisibility = "followers" | "private" | "public";
export type PublishSubmitMode = "draft" | "publish";

export type AdvancedOptions = {
	allowComment: boolean;
	allowShare: boolean;
};
