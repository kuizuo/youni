import { describe, expect, test } from "@jest/globals";
import {
	createCommentComposerSessionState,
	transitionCommentComposerSession,
} from "../comment-composer-session";

describe("comment composer session", () => {
	test("keeps editing, keyboard switching, replies, and failure recovery together", () => {
		let state = createCommentComposerSessionState();
		const replyTarget = { authorName: "林一一", id: "comment-1" };
		const apply = (
			event: Parameters<typeof transitionCommentComposerSession>[1],
		) => {
			state = transitionCommentComposerSession(state, event);
		};

		apply({ replyTarget, type: "open" });
		apply({ text: "hi @li", type: "textChanged" });
		apply({ handle: "lin_daily", type: "insertMention" });
		expect(state.text).toBe("hi @lin_daily ");

		apply({ type: "toggleEmoji" });
		apply({ type: "keyboardHidden" });
		expect(state.isEmojiKeyboardOpen).toBe(true);
		expect(state.isOpen).toBe(true);

		apply({ type: "toggleEmoji" });
		apply({ height: 336, type: "keyboardShown" });
		expect(state.isEmojiKeyboardOpen).toBe(false);
		expect(state.isSystemKeyboardVisible).toBe(true);

		const draft = { content: state.text.trim(), replyTarget };
		apply({ type: "submissionStarted" });
		apply({ draft, type: "submissionFailed" });
		expect(state).toMatchObject({
			isOpen: true,
			isSubmitting: false,
			replyTarget,
			text: "hi @lin_daily",
		});
		expect(state.selection).toEqual({ end: 13, start: 13 });

		apply({ type: "submissionStarted" });
		apply({ type: "submissionSucceeded" });
		expect(state).toMatchObject({
			isOpen: false,
			isSubmitting: false,
			replyTarget: null,
			text: "",
		});
	});
});
