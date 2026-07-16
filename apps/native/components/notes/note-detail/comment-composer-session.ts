import type { TextSelection } from "@/lib/types/text-input";

import type { MentionTrigger } from "./types";
import { clampCursor, findMentionTrigger } from "./utils";

export type CommentReplyTarget = {
	authorName: string;
	id: string;
};

export type CommentComposerDraft = {
	content: string;
	replyTarget: CommentReplyTarget | null;
};

export type CommentComposerSessionState = {
	emojiPanelHeight: number;
	isEmojiInputLocked: boolean;
	isEmojiKeyboardOpen: boolean;
	isOpen: boolean;
	isSubmitting: boolean;
	isSwitchingToSystemKeyboard: boolean;
	isSystemKeyboardVisible: boolean;
	mentionTrigger: MentionTrigger | null;
	replyTarget: CommentReplyTarget | null;
	selection: TextSelection;
	text: string;
};

export type CommentComposerSessionEvent =
	| { type: "closeEmoji" }
	| { type: "inputFocused" }
	| { height: number; type: "keyboardShown" }
	| { type: "keyboardHidden" }
	| { replyTarget?: CommentReplyTarget | null; type: "open" }
	| { type: "openMention" }
	| { text: string; type: "insertText" }
	| { handle: string; type: "insertMention" }
	| { selection: TextSelection; type: "selectionChanged" }
	| { type: "submissionStarted" }
	| { draft: CommentComposerDraft; type: "submissionFailed" }
	| { type: "submissionSucceeded" }
	| { type: "toggleEmoji" }
	| { text: string; type: "textChanged" };

export function createCommentComposerSessionState(): CommentComposerSessionState {
	return {
		emojiPanelHeight: 304,
		isEmojiInputLocked: false,
		isEmojiKeyboardOpen: false,
		isOpen: false,
		isSubmitting: false,
		isSwitchingToSystemKeyboard: false,
		isSystemKeyboardVisible: false,
		mentionTrigger: null,
		replyTarget: null,
		selection: { end: 0, start: 0 },
		text: "",
	};
}

function closeSession(state: CommentComposerSessionState) {
	return {
		...state,
		isEmojiInputLocked: false,
		isEmojiKeyboardOpen: false,
		isOpen: false,
		isSwitchingToSystemKeyboard: false,
		mentionTrigger: null,
		replyTarget: null,
	};
}

function replaceSelection(state: CommentComposerSessionState, text: string) {
	if (!text) return state;
	const start = clampCursor(
		Math.min(state.selection.start, state.selection.end),
		state.text.length,
	);
	const end = clampCursor(
		Math.max(state.selection.start, state.selection.end),
		state.text.length,
	);
	const nextText = `${state.text.slice(0, start)}${text}${state.text.slice(end)}`;
	const cursor = start + text.length;

	return {
		...state,
		mentionTrigger: findMentionTrigger(nextText, cursor),
		selection: { end: cursor, start: cursor },
		text: nextText,
	};
}

export function transitionCommentComposerSession(
	state: CommentComposerSessionState,
	event: CommentComposerSessionEvent,
): CommentComposerSessionState {
	switch (event.type) {
		case "open":
			if (state.isSubmitting) return state;
			return {
				...state,
				isOpen: true,
				replyTarget:
					event.replyTarget === undefined
						? state.replyTarget
						: event.replyTarget,
			};
		case "closeEmoji":
			return {
				...state,
				isEmojiInputLocked: false,
				isEmojiKeyboardOpen: false,
				isSwitchingToSystemKeyboard: false,
			};
		case "keyboardShown": {
			const nextState = {
				...state,
				emojiPanelHeight:
					event.height > 0
						? Math.max(260, Math.round(event.height))
						: state.emojiPanelHeight,
				isSystemKeyboardVisible: true,
			};
			return state.isSwitchingToSystemKeyboard
				? {
						...nextState,
						isEmojiInputLocked: false,
						isEmojiKeyboardOpen: false,
						isSwitchingToSystemKeyboard: false,
					}
				: nextState;
		}
		case "keyboardHidden": {
			const nextState = {
				...state,
				isSwitchingToSystemKeyboard: false,
				isSystemKeyboardVisible: false,
			};
			return state.isEmojiKeyboardOpen || !state.isOpen
				? nextState
				: closeSession(nextState);
		}
		case "inputFocused":
			if (state.isEmojiInputLocked) return state;
			if (state.isSwitchingToSystemKeyboard) {
				return { ...state, isSystemKeyboardVisible: true };
			}
			return {
				...state,
				isEmojiKeyboardOpen: false,
				isSystemKeyboardVisible: true,
			};
		case "textChanged": {
			const cursor = clampCursor(
				state.selection.start + event.text.length - state.text.length,
				event.text.length,
			);
			return {
				...state,
				mentionTrigger: findMentionTrigger(event.text, cursor),
				selection: { end: cursor, start: cursor },
				text: event.text,
			};
		}
		case "selectionChanged": {
			const selection = {
				end: clampCursor(event.selection.end, state.text.length),
				start: clampCursor(event.selection.start, state.text.length),
			};
			return {
				...state,
				mentionTrigger:
					selection.start === selection.end
						? findMentionTrigger(state.text, selection.start)
						: null,
				selection,
			};
		}
		case "insertText":
			return replaceSelection(state, event.text);
		case "insertMention": {
			const handle = event.handle.trim().replace(/^@/, "");
			if (!handle) return state;
			const start = state.mentionTrigger?.start ?? state.selection.start;
			const end = state.mentionTrigger?.end ?? state.selection.end;
			const token = `@${handle} `;
			const text = `${state.text.slice(0, start)}${token}${state.text
				.slice(end)
				.replace(/^\s+/, "")}`;
			const cursor = start + token.length;
			return {
				...state,
				mentionTrigger: null,
				selection: { end: cursor, start: cursor },
				text,
			};
		}
		case "openMention": {
			const cursor = state.selection.start;
			const previous = cursor > 0 ? state.text[cursor - 1] : "";
			return replaceSelection(
				{
					...state,
					isEmojiInputLocked: false,
					isEmojiKeyboardOpen: false,
					isSwitchingToSystemKeyboard: false,
				},
				`${previous && !/\s/.test(previous) ? " " : ""}@`,
			);
		}
		case "toggleEmoji":
			return state.isEmojiKeyboardOpen
				? {
						...state,
						isEmojiInputLocked: false,
						isSwitchingToSystemKeyboard: true,
					}
				: {
						...state,
						isEmojiInputLocked: true,
						isEmojiKeyboardOpen: true,
						isSwitchingToSystemKeyboard: false,
					};
		case "submissionStarted":
			return { ...closeSession(state), isSubmitting: true };
		case "submissionFailed": {
			const cursor = event.draft.content.length;
			return {
				...state,
				isOpen: true,
				isSubmitting: false,
				mentionTrigger: null,
				replyTarget: event.draft.replyTarget,
				selection: { end: cursor, start: cursor },
				text: event.draft.content,
			};
		}
		case "submissionSucceeded":
			return {
				...createCommentComposerSessionState(),
				emojiPanelHeight: state.emojiPanelHeight,
			};
	}
}
