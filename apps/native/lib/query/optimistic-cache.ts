import type { Query, QueryKey } from "@tanstack/react-query";

import type { ChatMessage } from "@/components/messages/chat/types";
import type { ConversationItem } from "@/components/messages/inbox/types";
import type {
	NotificationItem,
	NotificationKind,
} from "@/components/messages/notifications/types";
import type { NoteComment } from "@/components/notes/note-detail/types";
import { queryClient } from "@/lib/query/query-client";

type CacheSnapshot = Array<{
	data: unknown;
	queryKey: QueryKey;
}>;

type CachePredicate = (data: unknown, queryKey: QueryKey) => boolean;

type OptimisticNote = {
	advancedOptions?: {
		allowComment?: boolean;
	};
	author: {
		handle?: null | string;
		id: string;
		image?: null | string;
		isFollowing?: boolean;
		name: string;
	};
	collected?: boolean;
	collectedCount?: number;
	commentCount?: number;
	id: string;
	liked?: boolean;
	likedCount?: number;
	title?: string;
};

type OptimisticUser = {
	bio?: null | string;
	email?: string;
	followerCount?: number;
	followingCount?: number;
	handle?: null | string;
	id: string;
	image?: null | string;
	isFollowing?: boolean;
	name: string;
	noteCount?: number;
};

type ChatData = {
	hasBlockedPeer?: boolean;
	id: string;
	isBlockedByPeer?: boolean;
	messages: ChatMessage[];
	peer?: ConversationItem["peer"];
};

type ChatSettingsData = {
	hasBlockedPeer: boolean;
	id: string;
	isBlockedByPeer: boolean;
	isFollowing?: boolean;
	peer: ConversationItem["peer"];
};

type NotificationSummary = {
	categories?: Array<{ id: string; unreadCount: number }>;
	messageGroups?: Array<{ id: string; unreadCount: number }>;
	totalUnread?: number;
};

type QueryUpdater = (data: unknown, queryKey: QueryKey) => unknown;

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object";
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
	if (!isRecord(value) || Array.isArray(value) || value instanceof Date) {
		return false;
	}
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

function isOptimisticNote(value: unknown): value is OptimisticNote {
	if (!isRecord(value)) return false;
	const author = value.author;
	return (
		typeof value.id === "string" &&
		isRecord(author) &&
		typeof author.id === "string" &&
		("likedCount" in value ||
			"collectedCount" in value ||
			"commentCount" in value)
	);
}

function isNoteComment(value: unknown): value is NoteComment {
	return (
		isRecord(value) &&
		typeof value.id === "string" &&
		typeof value.noteId === "string" &&
		typeof value.content === "string" &&
		typeof value.authorName === "string" &&
		"likedCount" in value
	);
}

function isOptimisticUser(value: unknown): value is OptimisticUser {
	return (
		isRecord(value) &&
		typeof value.id === "string" &&
		typeof value.name === "string" &&
		("isFollowing" in value ||
			"followerCount" in value ||
			"followingCount" in value ||
			"noteCount" in value ||
			"email" in value ||
			"bio" in value)
	);
}

function isChatData(value: unknown): value is ChatData {
	return (
		isRecord(value) &&
		typeof value.id === "string" &&
		Array.isArray(value.messages)
	);
}

function isChatSettingsData(value: unknown): value is ChatSettingsData {
	return (
		isRecord(value) &&
		typeof value.id === "string" &&
		isRecord(value.peer) &&
		"hasBlockedPeer" in value &&
		"isBlockedByPeer" in value
	);
}

function isConversationItem(value: unknown): value is ConversationItem {
	return (
		isRecord(value) &&
		typeof value.id === "string" &&
		isRecord(value.peer) &&
		"lastMessage" in value &&
		"unreadCount" in value
	);
}

function isNotificationItem(value: unknown): value is NotificationItem {
	return (
		isRecord(value) &&
		typeof value.id === "string" &&
		typeof value.kind === "string" &&
		"isRead" in value &&
		"targetType" in value
	);
}

function isNotificationSummary(value: unknown): value is NotificationSummary {
	return (
		isRecord(value) &&
		("totalUnread" in value ||
			"messageGroups" in value ||
			"categories" in value)
	);
}

function getOperationPath(queryKey: QueryKey): string[] | null {
	const path = Array.isArray(queryKey) ? queryKey[0] : null;
	if (!Array.isArray(path)) return null;
	return path.filter((part): part is string => typeof part === "string");
}

function getOperationInput(queryKey: QueryKey): Record<string, unknown> | null {
	if (!Array.isArray(queryKey)) return null;
	const options = queryKey[1];
	if (!isRecord(options) || !isRecord(options.input)) return null;
	return options.input;
}

function isManualNoteCommentsKey(queryKey: QueryKey, noteId: string): boolean {
	return (
		Array.isArray(queryKey) &&
		queryKey[0] === "note" &&
		queryKey[1] === noteId &&
		queryKey[2] === "comments"
	);
}

function isCommentRepliesKey(queryKey: QueryKey, parentId: string): boolean {
	const path = getOperationPath(queryKey);
	const input = getOperationInput(queryKey);
	return path?.[0] === "commentReplies" && input?.parentId === parentId;
}

function isNotificationsListKey(
	queryKey: QueryKey,
	kind?: NotificationKind,
): boolean {
	return (
		Array.isArray(queryKey) &&
		queryKey[0] === "notifications" &&
		(kind ? queryKey[1] === kind : typeof queryKey[1] === "string")
	);
}

function transformTree<T>(
	value: T,
	visitor: (value: unknown) => unknown,
): { changed: boolean; value: T } {
	const nextValue = visitor(value);
	let changed = nextValue !== value;

	if (Array.isArray(nextValue)) {
		const nextItems = nextValue.map((item) => {
			const transformed = transformTree(item, visitor);
			if (transformed.changed) changed = true;
			return transformed.value;
		});
		return {
			changed,
			value: (changed ? nextItems : nextValue) as T,
		};
	}

	if (isPlainRecord(nextValue)) {
		let nextRecord = nextValue;
		for (const [key, child] of Object.entries(nextValue)) {
			const transformed = transformTree(child, visitor);
			if (!transformed.changed) continue;
			if (nextRecord === nextValue) {
				nextRecord = { ...nextValue };
			}
			nextRecord[key] = transformed.value;
			changed = true;
		}
		return {
			changed,
			value: nextRecord as T,
		};
	}

	return { changed, value: nextValue as T };
}

function containsMatching(
	value: unknown,
	matcher: (value: unknown) => boolean,
): boolean {
	if (matcher(value)) return true;
	if (Array.isArray(value)) {
		return value.some((item) => containsMatching(item, matcher));
	}
	if (isPlainRecord(value)) {
		return Object.values(value).some((item) => containsMatching(item, matcher));
	}
	return false;
}

function getQueries(predicate: CachePredicate): Query[] {
	return queryClient
		.getQueryCache()
		.findAll()
		.filter((query) => predicate(query.state.data, query.queryKey));
}

async function snapshotAndCancel(predicate: CachePredicate): Promise<{
	rollback: () => void;
	snapshot: CacheSnapshot;
}> {
	await queryClient.cancelQueries({
		predicate: (query) => predicate(query.state.data, query.queryKey),
	});
	const snapshot = getQueries(predicate)
		.filter((query) => query.state.data !== undefined)
		.map((query) => ({
			data: query.state.data,
			queryKey: query.queryKey,
		}));

	return {
		rollback: () => restoreSnapshot(snapshot),
		snapshot,
	};
}

function restoreSnapshot(snapshot: CacheSnapshot): void {
	for (const entry of snapshot) {
		queryClient.setQueryData(entry.queryKey, entry.data);
	}
}

function updateMatchingQueries(
	predicate: CachePredicate,
	updater: QueryUpdater,
): void {
	for (const query of getQueries(predicate)) {
		const nextData = updater(query.state.data, query.queryKey);
		if (nextData !== query.state.data) {
			queryClient.setQueryData(query.queryKey, nextData);
		}
	}
}

function notePredicate(noteId: string): CachePredicate {
	return (data, queryKey) =>
		isManualNoteCommentsKey(queryKey, noteId) ||
		containsMatching(
			data,
			(value) =>
				(isOptimisticNote(value) && value.id === noteId) ||
				(isNoteComment(value) && value.noteId === noteId) ||
				(isRecord(value) &&
					isOptimisticNote(value.note) &&
					value.note.id === noteId),
		);
}

function commentPredicate(commentId: string): CachePredicate {
	return (data, queryKey) =>
		isCommentRepliesKey(queryKey, commentId) ||
		containsMatching(
			data,
			(value) => isNoteComment(value) && value.id === commentId,
		);
}

function userPredicate(userId: string): CachePredicate {
	return (data) =>
		containsMatching(data, (value) => {
			if (isOptimisticNote(value) && value.author.id === userId) return true;
			if (isOptimisticUser(value) && value.id === userId) return true;
			return isChatSettingsData(value) && value.peer.id === userId;
		});
}

function conversationPredicate(conversationId: string): CachePredicate {
	return (data) =>
		containsMatching(data, (value) => {
			if (isChatData(value) && value.id === conversationId) return true;
			if (isChatSettingsData(value) && value.id === conversationId) return true;
			return isConversationItem(value) && value.id === conversationId;
		});
}

function notificationPredicate(
	kind?: NotificationKind,
	notificationId?: string,
): CachePredicate {
	return (data, queryKey) =>
		isNotificationsListKey(queryKey, kind) ||
		containsMatching(data, (value) => {
			if (isNotificationSummary(value)) return true;
			if (!isNotificationItem(value)) return false;
			if (notificationId && value.id !== notificationId) return false;
			return kind ? getNotificationKind(value.kind) === kind : true;
		});
}

function viewHistoryPredicate(data: unknown, queryKey: QueryKey): boolean {
	const path = getOperationPath(queryKey);
	return (
		path?.[0] === "viewHistory" ||
		(Array.isArray(data) &&
			data.some((item) => isRecord(item) && isOptimisticNote(item.note)))
	);
}

function findFirst<T>(
	value: unknown,
	matcher: (value: unknown) => value is T,
): T | null {
	if (matcher(value)) return value;
	if (Array.isArray(value)) {
		for (const item of value) {
			const match = findFirst(item, matcher);
			if (match) return match;
		}
	}
	if (isPlainRecord(value)) {
		for (const item of Object.values(value)) {
			const match = findFirst(item, matcher);
			if (match) return match;
		}
	}
	return null;
}

function getCachedNote(noteId: string): OptimisticNote | null {
	for (const query of queryClient.getQueryCache().findAll()) {
		const match = findFirst(
			query.state.data,
			(value): value is OptimisticNote =>
				isOptimisticNote(value) && value.id === noteId,
		);
		if (match) return match;
	}
	return null;
}

function getCachedComment(commentId: string): NoteComment | null {
	for (const query of queryClient.getQueryCache().findAll()) {
		const match = findFirst(
			query.state.data,
			(value): value is NoteComment =>
				isNoteComment(value) && value.id === commentId,
		);
		if (match) return match;
	}
	return null;
}

function getCachedFollowState(userId: string): {
	followerCount?: number;
	following: boolean;
} | null {
	for (const query of queryClient.getQueryCache().findAll()) {
		const match = findFirst(
			query.state.data,
			(value): value is ChatSettingsData | OptimisticNote | OptimisticUser => {
				if (isOptimisticNote(value) && value.author.id === userId) {
					return true;
				}
				if (isOptimisticUser(value) && value.id === userId) {
					return true;
				}
				return isChatSettingsData(value) && value.peer.id === userId;
			},
		);
		if (!match) continue;
		if (isOptimisticNote(match)) {
			return { following: Boolean(match.author.isFollowing) };
		}
		if (isChatSettingsData(match)) {
			return { following: Boolean(match.isFollowing) };
		}
		return {
			followerCount: match.followerCount,
			following: Boolean(match.isFollowing),
		};
	}
	return null;
}

function updateNote(
	noteId: string,
	updater: (note: OptimisticNote) => OptimisticNote,
): void {
	updateMatchingQueries(notePredicate(noteId), (data) => {
		const transformed = transformTree(data, (value) =>
			isOptimisticNote(value) && value.id === noteId ? updater(value) : value,
		);
		return transformed.changed ? transformed.value : data;
	});
}

function updateComment(
	commentId: string,
	updater: (comment: NoteComment) => NoteComment,
): void {
	updateMatchingQueries(commentPredicate(commentId), (data) => {
		const transformed = transformTree(data, (value) =>
			isNoteComment(value) && value.id === commentId ? updater(value) : value,
		);
		return transformed.changed ? transformed.value : data;
	});
}

function applyFollowState(
	userId: string,
	state: { followerCount?: number; following: boolean },
): void {
	updateMatchingQueries(userPredicate(userId), (data) => {
		const transformed = transformTree(data, (value) => {
			if (isOptimisticNote(value) && value.author.id === userId) {
				return {
					...value,
					author: { ...value.author, isFollowing: state.following },
				};
			}
			if (isOptimisticUser(value) && value.id === userId) {
				return {
					...value,
					isFollowing: state.following,
					...(typeof state.followerCount === "number"
						? { followerCount: state.followerCount }
						: {}),
				};
			}
			if (isChatSettingsData(value) && value.peer.id === userId) {
				return { ...value, isFollowing: state.following };
			}
			return value;
		});
		return transformed.changed ? transformed.value : data;
	});
}

function removeNoteFromMeFeed(
	noteId: string,
	tab: "collections" | "liked",
): void {
	updateMatchingQueries(
		(_data, queryKey) => {
			const path = getOperationPath(queryKey);
			const input = getOperationInput(queryKey);
			return path?.[0] === "meFeed" && input?.tab === tab;
		},
		(data) =>
			Array.isArray(data)
				? data.filter((item) => !(isRecord(item) && item.id === noteId))
				: data,
	);

	updateMatchingQueries(
		(data) => isRecord(data) && Array.isArray(data[tab]),
		(data) => {
			if (!isRecord(data) || !Array.isArray(data[tab])) return data;
			return {
				...data,
				[tab]: data[tab].filter(
					(item) => !(isRecord(item) && item.id === noteId),
				),
			};
		},
	);
}

function prependToFirstPage<T>(
	data: unknown,
	item: T,
	getId: (value: T) => string,
): unknown {
	if (
		!isRecord(data) ||
		!Array.isArray(data.pages) ||
		data.pages.length === 0
	) {
		return data;
	}
	const [firstPage, ...restPages] = data.pages;
	if (!isRecord(firstPage) || !Array.isArray(firstPage.items)) return data;
	if (
		firstPage.items.some((existing) => getId(existing as T) === getId(item))
	) {
		return data;
	}
	return {
		...data,
		pages: [{ ...firstPage, items: [item, ...firstPage.items] }, ...restPages],
	};
}

function replaceCommentId(
	data: unknown,
	tempId: string,
	nextComment: NoteComment,
): unknown {
	const transformed = transformTree(data, (value) =>
		isNoteComment(value) && value.id === tempId
			? { ...value, ...nextComment }
			: value,
	);
	return transformed.changed ? transformed.value : data;
}

function countCommentRemoval(comment: NoteComment): number {
	return 1 + Math.max(comment.replyCount, comment.replies.length);
}

function removeCommentFromTree(
	value: unknown,
	commentId: string,
): { removedCount: number; value: unknown } {
	if (Array.isArray(value)) {
		let removedCount = 0;
		let changed = false;
		const items: unknown[] = [];
		for (const item of value) {
			if (isNoteComment(item) && item.id === commentId) {
				removedCount += countCommentRemoval(item);
				changed = true;
				continue;
			}
			const result = removeCommentFromTree(item, commentId);
			removedCount += result.removedCount;
			if (result.value !== item) changed = true;
			items.push(result.value);
		}
		return { removedCount, value: changed ? items : value };
	}

	if (!isPlainRecord(value)) {
		return { removedCount: 0, value };
	}

	let removedCount = 0;
	let nextRecord = value;
	for (const [key, child] of Object.entries(value)) {
		const result = removeCommentFromTree(child, commentId);
		if (result.removedCount === 0 && result.value === child) continue;
		if (nextRecord === value) nextRecord = { ...value };
		nextRecord[key] = result.value;
		removedCount += result.removedCount;
	}

	if (removedCount > 0 && isNoteComment(nextRecord)) {
		nextRecord = {
			...nextRecord,
			replyCount: Math.max(0, nextRecord.replyCount - removedCount),
		};
	}

	return { removedCount, value: nextRecord };
}

function decrementNoteCommentCount(noteId: string, amount: number): void {
	if (amount <= 0) return;
	updateNote(noteId, (note) => ({
		...note,
		commentCount: Math.max(0, (note.commentCount ?? 0) - amount),
	}));
}

function incrementNoteCommentCount(noteId: string): void {
	updateNote(noteId, (note) => ({
		...note,
		commentCount: (note.commentCount ?? 0) + 1,
	}));
}

function notificationGroupIdFromType(type: string): null | NotificationKind {
	if (type === "like" || type === "collect") return "reactions";
	if (type === "follow") return "followers";
	if (type === "comment") return "comments";
	return null;
}

function getNotificationKind(type: string): null | NotificationKind {
	return notificationGroupIdFromType(type);
}

function notificationCategoryFromKind(kind: NotificationKind): string {
	return kind === "followers" ? "followers" : "activity";
}

function adjustNotificationSummary(
	summary: NotificationSummary,
	kind: NotificationKind,
	decrement: number,
	setGroupZero = false,
): NotificationSummary {
	const category = notificationCategoryFromKind(kind);
	return {
		...summary,
		totalUnread: Math.max(0, (summary.totalUnread ?? 0) - decrement),
		categories: summary.categories?.map((item) =>
			item.id === category
				? { ...item, unreadCount: Math.max(0, item.unreadCount - decrement) }
				: item,
		),
		messageGroups: summary.messageGroups?.map((item) =>
			item.id === kind
				? {
						...item,
						unreadCount: setGroupZero
							? 0
							: Math.max(0, item.unreadCount - decrement),
					}
				: item,
		),
	};
}

function getSummaryGroupUnread(kind: NotificationKind): number {
	for (const query of queryClient.getQueryCache().findAll()) {
		const summary = query.state.data;
		if (!isNotificationSummary(summary)) continue;
		const group = summary.messageGroups?.find((item) => item.id === kind);
		if (group) return group.unreadCount;
	}
	return 0;
}

export async function optimisticToggleNoteReaction({
	countField,
	noteId,
	stateField,
}: {
	countField: "collectedCount" | "likedCount";
	noteId: string;
	stateField: "collected" | "liked";
}) {
	const { rollback } = await snapshotAndCancel(notePredicate(noteId));
	const note = getCachedNote(noteId);
	const currentState = Boolean(note?.[stateField]);
	const nextState = !currentState;
	const currentCount =
		typeof note?.[countField] === "number" ? note[countField] : 0;
	const nextCount = Math.max(0, currentCount + (nextState ? 1 : -1));

	updateNote(noteId, (item) => ({
		...item,
		[countField]: nextCount,
		[stateField]: nextState,
	}));

	return { rollback };
}

export function applyNoteReactionResult({
	count,
	countField,
	noteId,
	state,
	stateField,
}: {
	count: number;
	countField: "collectedCount" | "likedCount";
	noteId: string;
	state: boolean;
	stateField: "collected" | "liked";
}) {
	updateNote(noteId, (item) => ({
		...item,
		[countField]: count,
		[stateField]: state,
	}));

	if (stateField === "liked" && !state) {
		removeNoteFromMeFeed(noteId, "liked");
	}
	if (stateField === "collected" && !state) {
		removeNoteFromMeFeed(noteId, "collections");
	}
}

export async function optimisticToggleFollow(userId: string) {
	const { rollback } = await snapshotAndCancel(userPredicate(userId));
	const current = getCachedFollowState(userId);
	const nextFollowing = !current?.following;
	const nextFollowerCount =
		typeof current?.followerCount === "number"
			? Math.max(0, current.followerCount + (nextFollowing ? 1 : -1))
			: undefined;

	applyFollowState(userId, {
		followerCount: nextFollowerCount,
		following: nextFollowing,
	});

	return { rollback };
}

export function applyFollowResult({
	followerCount,
	following,
	userId,
}: {
	followerCount: number;
	following: boolean;
	userId: string;
}) {
	applyFollowState(userId, { followerCount, following });
}

export async function optimisticToggleCommentLike(commentId: string) {
	const { rollback } = await snapshotAndCancel(commentPredicate(commentId));
	const comment = getCachedComment(commentId);
	const nextLiked = !comment?.liked;
	const nextLikedCount = Math.max(
		0,
		(comment?.likedCount ?? 0) + (nextLiked ? 1 : -1),
	);

	updateComment(commentId, (item) => ({
		...item,
		liked: nextLiked,
		likedCount: nextLikedCount,
	}));

	return { rollback };
}

export function applyCommentLikeResult({
	commentId,
	liked,
	likedCount,
}: {
	commentId: string;
	liked: boolean;
	likedCount: number;
}) {
	updateComment(commentId, (item) => ({ ...item, liked, likedCount }));
}

export async function optimisticAddComment({
	authorImage,
	authorName,
	content,
	noteId,
	parentId,
	userId,
}: {
	authorImage: null | string;
	authorName: string;
	content: string;
	noteId: string;
	parentId?: string;
	userId: string;
}) {
	const tempId = `optimistic-comment-${Date.now()}`;
	const optimisticComment: NoteComment = {
		authorImage,
		authorName,
		canDelete: true,
		content,
		createdAt: new Date(),
		id: tempId,
		liked: false,
		likedCount: 0,
		noteId,
		parentId: parentId ?? null,
		replies: [],
		replyCount: 0,
		userId,
	};
	const predicate: CachePredicate = (data, queryKey) =>
		notePredicate(noteId)(data, queryKey) ||
		(parentId ? commentPredicate(parentId)(data, queryKey) : false) ||
		(parentId ? isCommentRepliesKey(queryKey, parentId) : false);
	const { rollback } = await snapshotAndCancel(predicate);

	updateMatchingQueries(predicate, (data, queryKey) => {
		if (!parentId && isManualNoteCommentsKey(queryKey, noteId)) {
			return prependToFirstPage(data, optimisticComment, (item) => item.id);
		}
		if (parentId && isCommentRepliesKey(queryKey, parentId)) {
			if (!isRecord(data) || !Array.isArray(data.items)) return data;
			if (
				data.items.some(
					(item) => isRecord(item) && item.id === optimisticComment.id,
				)
			) {
				return data;
			}
			return { ...data, items: [optimisticComment, ...data.items] };
		}
		const transformed = transformTree(data, (value) => {
			if (!parentId && isRecord(value) && Array.isArray(value.comments)) {
				if (
					value.comments.some(
						(item) => isRecord(item) && item.id === optimisticComment.id,
					)
				) {
					return value;
				}
				return { ...value, comments: [optimisticComment, ...value.comments] };
			}
			if (parentId && isNoteComment(value) && value.id === parentId) {
				const hasReply = value.replies.some(
					(reply) => reply.id === optimisticComment.id,
				);
				return {
					...value,
					replies: hasReply
						? value.replies
						: [optimisticComment, ...value.replies],
					replyCount: value.replyCount + 1,
				};
			}
			return value;
		});
		return transformed.changed ? transformed.value : data;
	});
	incrementNoteCommentCount(noteId);

	return { optimisticComment, rollback, tempId };
}

export function applyCreatedComment({
	createdAt,
	commentId,
	tempComment,
	tempId,
}: {
	createdAt?: Date | string;
	commentId: string;
	tempComment: NoteComment;
	tempId: string;
}) {
	const nextComment = {
		...tempComment,
		createdAt: createdAt ?? tempComment.createdAt,
		id: commentId,
	};
	updateMatchingQueries(
		(data) =>
			containsMatching(
				data,
				(value) => isNoteComment(value) && value.id === tempId,
			),
		(data) => replaceCommentId(data, tempId, nextComment),
	);
}

export async function optimisticDeleteComment(commentId: string) {
	const target = getCachedComment(commentId);
	const noteId = target?.noteId;
	const predicate: CachePredicate = (data, queryKey) =>
		commentPredicate(commentId)(data, queryKey) ||
		(noteId ? notePredicate(noteId)(data, queryKey) : false);
	const { rollback } = await snapshotAndCancel(predicate);
	let removedCount = 0;

	updateMatchingQueries(predicate, (data) => {
		const result = removeCommentFromTree(data, commentId);
		removedCount = Math.max(removedCount, result.removedCount);
		return result.value;
	});
	if (noteId) {
		decrementNoteCommentCount(noteId, removedCount);
	}

	return { noteId, rollback };
}

export async function optimisticSendMessage({
	content,
	conversationId,
	senderId,
}: {
	content: string;
	conversationId: string;
	senderId: string;
}) {
	const tempId = `optimistic-message-${Date.now()}`;
	const createdAt = new Date();
	const message: ChatMessage = {
		content,
		createdAt,
		id: tempId,
		senderId,
	};
	const { rollback } = await snapshotAndCancel(
		conversationPredicate(conversationId),
	);

	updateMatchingQueries(conversationPredicate(conversationId), (data) => {
		const transformed = transformTree(data, (value) => {
			if (isChatData(value) && value.id === conversationId) {
				return {
					...value,
					messages: value.messages.some((item) => item.id === tempId)
						? value.messages
						: [...value.messages, message],
				};
			}
			return value;
		});
		if (transformed.changed) return transformed.value;
		if (Array.isArray(data) && data.every(isConversationItem)) {
			const updated = data.map((item) =>
				item.id === conversationId
					? {
							...item,
							lastMessage: message,
							unreadCount: 0,
							updatedAt: createdAt,
						}
					: item,
			);
			return updated.sort((left, right) =>
				left.id === conversationId ? -1 : right.id === conversationId ? 1 : 0,
			);
		}
		return data;
	});

	return { rollback, tempId };
}

export function applySentMessageResult({
	conversationId,
	message,
	tempId,
}: {
	conversationId: string;
	message: ChatMessage;
	tempId: string;
}) {
	updateMatchingQueries(conversationPredicate(conversationId), (data) => {
		const transformed = transformTree(data, (value) => {
			if (isChatData(value) && value.id === conversationId) {
				return {
					...value,
					messages: value.messages.map((item) =>
						item.id === tempId ? message : item,
					),
				};
			}
			if (isConversationItem(value) && value.id === conversationId) {
				return {
					...value,
					lastMessage: message,
					unreadCount: 0,
					updatedAt: message.createdAt,
				};
			}
			return value;
		});
		return transformed.changed ? transformed.value : data;
	});
}

export async function optimisticSetConversationBlocked({
	blocked,
	conversationId,
}: {
	blocked: boolean;
	conversationId: string;
}) {
	const { rollback } = await snapshotAndCancel(
		conversationPredicate(conversationId),
	);
	updateMatchingQueries(conversationPredicate(conversationId), (data) => {
		const transformed = transformTree(data, (value) => {
			if (
				(isChatData(value) || isChatSettingsData(value)) &&
				value.id === conversationId
			) {
				return { ...value, hasBlockedPeer: blocked };
			}
			return value;
		});
		return transformed.changed ? transformed.value : data;
	});
	return { rollback };
}

export function applyConversationBlockedResult({
	blocked,
	conversationId,
	isBlockedByPeer,
}: {
	blocked: boolean;
	conversationId: string;
	isBlockedByPeer: boolean;
}) {
	updateMatchingQueries(conversationPredicate(conversationId), (data) => {
		const transformed = transformTree(data, (value) => {
			if (
				(isChatData(value) || isChatSettingsData(value)) &&
				value.id === conversationId
			) {
				return { ...value, hasBlockedPeer: blocked, isBlockedByPeer };
			}
			return value;
		});
		return transformed.changed ? transformed.value : data;
	});
}

export async function optimisticClearConversation(conversationId: string) {
	const { rollback } = await snapshotAndCancel(
		conversationPredicate(conversationId),
	);
	updateMatchingQueries(conversationPredicate(conversationId), (data) => {
		const transformed = transformTree(data, (value) => {
			if (isChatData(value) && value.id === conversationId) {
				return { ...value, messages: [] };
			}
			if (isConversationItem(value) && value.id === conversationId) {
				return { ...value, lastMessage: null, unreadCount: 0 };
			}
			return value;
		});
		return transformed.changed ? transformed.value : data;
	});
	return { rollback };
}

export async function optimisticDeleteNotification(notificationId: string) {
	let deletedItem: NotificationItem | null = null;
	for (const query of queryClient.getQueryCache().findAll()) {
		const match = findFirst(
			query.state.data,
			(value): value is NotificationItem =>
				isNotificationItem(value) && value.id === notificationId,
		);
		if (match) {
			deletedItem = match;
			break;
		}
	}
	const kind = deletedItem ? getNotificationKind(deletedItem.kind) : null;
	const { rollback } = await snapshotAndCancel(
		notificationPredicate(kind ?? undefined, notificationId),
	);

	updateMatchingQueries(
		notificationPredicate(kind ?? undefined, notificationId),
		(data) => {
			if (
				isNotificationSummary(data) &&
				kind &&
				deletedItem &&
				!deletedItem.isRead
			) {
				return adjustNotificationSummary(data, kind, 1);
			}
			const result = removeNotificationFromTree(data, notificationId);
			return result.value;
		},
	);

	return { rollback };
}

function removeNotificationFromTree(
	value: unknown,
	notificationId: string,
): { value: unknown } {
	if (Array.isArray(value)) {
		const nextItems = value.filter(
			(item) => !(isNotificationItem(item) && item.id === notificationId),
		);
		if (nextItems.length !== value.length) return { value: nextItems };
		let changed = false;
		const transformedItems = value.map((item) => {
			const result = removeNotificationFromTree(item, notificationId);
			if (result.value !== item) changed = true;
			return result.value;
		});
		return { value: changed ? transformedItems : value };
	}
	if (!isPlainRecord(value)) return { value };
	let nextRecord = value;
	for (const [key, child] of Object.entries(value)) {
		const result = removeNotificationFromTree(child, notificationId);
		if (result.value === child) continue;
		if (nextRecord === value) nextRecord = { ...value };
		nextRecord[key] = result.value;
	}
	return { value: nextRecord };
}

export async function optimisticMarkNotificationRead(notificationId: string) {
	let targetKind: NotificationKind | null = null;
	let shouldDecrement = false;
	for (const query of queryClient.getQueryCache().findAll()) {
		const match = findFirst(
			query.state.data,
			(value): value is NotificationItem =>
				isNotificationItem(value) && value.id === notificationId,
		);
		if (!match) continue;
		targetKind = getNotificationKind(match.kind);
		shouldDecrement = !match.isRead;
		break;
	}
	const { rollback } = await snapshotAndCancel(
		notificationPredicate(targetKind ?? undefined, notificationId),
	);
	if (!targetKind) return { rollback };

	updateMatchingQueries(
		notificationPredicate(targetKind, notificationId),
		(data) => {
			if (isNotificationSummary(data) && shouldDecrement) {
				return adjustNotificationSummary(data, targetKind, 1);
			}
			const transformed = transformTree(data, (value) =>
				isNotificationItem(value) && value.id === notificationId
					? { ...value, isRead: true }
					: value,
			);
			return transformed.changed ? transformed.value : data;
		},
	);

	return { rollback };
}

export async function optimisticMarkNotificationKindRead(
	kind: NotificationKind,
) {
	const groupUnread = getSummaryGroupUnread(kind);
	const { rollback } = await snapshotAndCancel(notificationPredicate(kind));
	updateMatchingQueries(notificationPredicate(kind), (data) => {
		if (isNotificationSummary(data)) {
			return adjustNotificationSummary(data, kind, groupUnread, true);
		}
		const transformed = transformTree(data, (value) =>
			isNotificationItem(value) && getNotificationKind(value.kind) === kind
				? { ...value, isRead: true }
				: value,
		);
		return transformed.changed ? transformed.value : data;
	});
	return { rollback };
}

export async function optimisticDeleteHistoryItem(noteId: string) {
	const { rollback } = await snapshotAndCancel(viewHistoryPredicate);
	updateMatchingQueries(viewHistoryPredicate, (data) => {
		if (!Array.isArray(data)) return data;
		return data.filter(
			(item) =>
				!(
					isRecord(item) &&
					isOptimisticNote(item.note) &&
					item.note.id === noteId
				),
		);
	});
	return { rollback };
}

export async function optimisticClearHistory() {
	const { rollback } = await snapshotAndCancel(viewHistoryPredicate);
	updateMatchingQueries(viewHistoryPredicate, (data) =>
		Array.isArray(data) ? [] : data,
	);
	return { rollback };
}

export function invalidateNote(noteId: string) {
	return queryClient.invalidateQueries({
		predicate: (query) =>
			notePredicate(noteId)(query.state.data, query.queryKey),
	});
}

export function invalidateUser(userId: string) {
	return queryClient.invalidateQueries({
		predicate: (query) =>
			userPredicate(userId)(query.state.data, query.queryKey),
	});
}

export function invalidateComment(commentId: string) {
	return queryClient.invalidateQueries({
		predicate: (query) =>
			commentPredicate(commentId)(query.state.data, query.queryKey),
	});
}

export function invalidateConversation(conversationId: string) {
	return queryClient.invalidateQueries({
		predicate: (query) =>
			conversationPredicate(conversationId)(query.state.data, query.queryKey),
	});
}

export function invalidateNotifications(kind?: NotificationKind) {
	return queryClient.invalidateQueries({
		predicate: (query) =>
			notificationPredicate(kind)(query.state.data, query.queryKey),
	});
}

export function invalidateViewHistory() {
	return queryClient.invalidateQueries({
		predicate: (query) =>
			viewHistoryPredicate(query.state.data, query.queryKey),
	});
}
