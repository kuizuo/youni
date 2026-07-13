import type { RefObject } from "react";
import type { TextInput } from "react-native";

export type InlineToken =
	| { key: string; text: string; type: "text" }
	| { key: string; text: string; type: "mention"; value: string }
	| { key: string; text: string; type: "topic"; value: string };

export type MentionTrigger = {
	end: number;
	query: string;
	start: number;
};

export type CommentInputRef = RefObject<TextInput | null>;
