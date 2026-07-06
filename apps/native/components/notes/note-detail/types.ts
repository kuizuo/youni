import type { RefObject } from "react";
import type { TextInput } from "react-native";

export type CommentSort = "hot" | "latest";

export type NoteComment = {
	authorImage: null | string;
	authorName: string;
	canDelete: boolean;
	content: string;
	createdAt: Date | string;
	id: string;
	liked: boolean;
	likedCount: number;
	noteId: string;
	parentId: null | string;
	replies: NoteComment[];
	replyCount: number;
	userId: string;
};

export type InlineToken =
	| { key: string; text: string; type: "text" }
	| { key: string; text: string; type: "mention"; value: string }
	| { key: string; text: string; type: "topic"; value: string };

export type TextSelection = {
	end: number;
	start: number;
};

export type MentionTrigger = {
	end: number;
	query: string;
	start: number;
};

export type MentionUser = {
	handle: null | string;
	id: string;
	image: null | string;
	name: string;
};

export type CommentInputRef = RefObject<TextInput | null>;
