import { Button, Card } from "@heroui/react";
import type { AdminTopicListItem } from "@youni/api/contracts/admin";
import type { AdminHydratedContentNote as AdminNoteListItem } from "@youni/api/contracts/shared";

import { NoteTable } from "../-admin-notes/note-table";

export function TopicDetailView({
	isFetching,
	notes,
	onBack,
	onOpenNote,
	onOpenUser,
	topic,
}: {
	isFetching: boolean;
	notes: AdminNoteListItem[];
	onBack: () => void;
	onOpenNote: (item: AdminNoteListItem) => void;
	onOpenUser: (userId: string) => void;
	topic: AdminTopicListItem;
}) {
	return (
		<div className="grid gap-4">
			<div>
				<Button size="sm" variant="tertiary" onPress={onBack}>
					返回话题
				</Button>
			</div>

			<Card>
				<Card.Content className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_320px]">
					<div className="min-w-0">
						<h2 className="font-semibold text-2xl">#{topic.name}</h2>
						<p className="mt-2 text-muted text-sm">
							查看该话题下的全部图文内容。
						</p>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<StatBox label="图文" value={topic.noteCount} />
						<StatBox
							label="创建"
							value={new Date(topic.createdAt).toLocaleDateString()}
						/>
					</div>
				</Card.Content>
			</Card>

			<NoteTable
				isFetching={isFetching}
				notes={notes}
				onOpenNote={onOpenNote}
				onOpenUser={onOpenUser}
			/>
		</div>
	);
}

function StatBox({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-lg bg-surface-secondary p-3">
			<div className="text-muted text-xs">{label}</div>
			<div className="mt-1 font-semibold text-lg tabular-nums">{value}</div>
		</div>
	);
}
