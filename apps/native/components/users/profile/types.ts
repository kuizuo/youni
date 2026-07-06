import type { NoteCard } from "@/components/note-card";
import type { createTwoColumnFeed } from "@/lib/utils/two-column-feed";

export type UserFeedNote = Parameters<typeof NoteCard>[0]["note"];
export type UserFeedItem = ReturnType<
	typeof createTwoColumnFeed<UserFeedNote>
>[number];

export type UserProfileData = {
	bio: null | string;
	email: string;
	followerCount: number;
	followingCount: number;
	handle: null | string;
	image: null | string;
	isFollowing?: boolean;
	likedCount: number;
	name: string;
};
