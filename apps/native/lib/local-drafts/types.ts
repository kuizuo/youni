import type { NoteVisibility } from "@youni/api/contracts/shared";

export type LocalDraftAdvancedOptions = {
	allowComment: boolean;
	allowShare: boolean;
};

export type LocalDraftImageInput = {
	data: Uint8Array;
	fileName: string;
	height?: number;
	id: string;
	mimeType: string;
	width?: number;
};

export type LocalDraftImage = LocalDraftImageInput & {
	position: number;
};

export type LocalDraft = {
	advancedOptions: LocalDraftAdvancedOptions;
	content: string;
	createdAt: number;
	id: string;
	images: LocalDraftImage[];
	title: string;
	topics: string[];
	updatedAt: number;
	userId: string;
	visibility: NoteVisibility;
};

export type LocalDraftSummary = Omit<LocalDraft, "images"> & {
	coverAspectRatio: number | null;
	coverData: Uint8Array | null;
	coverMimeType: string | null;
	imageCount: number;
};

export type SaveLocalDraftInput = {
	advancedOptions: LocalDraftAdvancedOptions;
	content: string;
	coverAspectRatio?: number;
	coverData?: Uint8Array;
	coverMimeType?: string;
	id?: string;
	images: LocalDraftImageInput[];
	title: string;
	topics: string[];
	userId: string;
	visibility: NoteVisibility;
};
