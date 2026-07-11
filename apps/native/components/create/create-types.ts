import type { NoteImageUploadAsset } from "@/lib/note-image-upload";

export type InlineTrigger = {
	end: number;
	query: string;
	start: number;
	type: "mention" | "topic";
};

export type NoteVisibility = "followers" | "private" | "public";
export type PublishSubmitMode = "draft" | "publish";

export type ComposerImage = {
	asset?: NoteImageUploadAsset;
	fileName?: null | string;
	fileSize?: null | number;
	height?: number;
	id: string;
	isEdited?: boolean;
	mimeType?: null | string;
	originalUri?: string;
	remoteUrl?: string;
	uri: string;
	width?: number;
};

export type AdvancedOptions = {
	allowComment: boolean;
	allowShare: boolean;
};

export type ComposerSnapshot = {
	advancedOptions: AdvancedOptions;
	content: string;
	draftId?: string;
	images: ComposerImage[];
	title: string;
	topics: string[];
	visibility: NoteVisibility;
};
