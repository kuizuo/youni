import type { NoteCard } from "@/components/note-card";

export const TOPIC_SORTS = [
	{ key: "hot", label: "最热" },
	{ key: "latest", label: "最新" },
] as const;

export type TopicSort = (typeof TOPIC_SORTS)[number]["key"];
export type TopicNote = Parameters<typeof NoteCard>[0]["note"];
