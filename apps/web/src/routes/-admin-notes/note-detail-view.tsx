import { Button, Card, Chip } from "@heroui/react";
import type {
	AdminContentNoteDetail,
	AdminUserReference,
} from "@youni/api/contracts/shared";
import { NoteStatusBadge } from "@/components/admin-status";
import { AppAvatar } from "@/components/app-avatar";

import { toNoteStatus } from "./types";

export function NoteDetailView({
	note,
	onBack,
	onOpenTopic,
	onOpenUser,
}: {
	note: AdminContentNoteDetail;
	onBack: () => void;
	onOpenTopic: (topicId: string) => void;
	onOpenUser: (userId: string) => void;
}) {
	return (
		<div className="grid gap-4">
			<div>
				<Button size="sm" variant="tertiary" onPress={onBack}>
					返回图文
				</Button>
			</div>

			<Card>
				<Card.Content className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
					<div className="grid gap-4">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div className="min-w-0">
								<h2 className="font-semibold text-2xl">{note.title}</h2>
								<p className="mt-2 text-muted text-sm">{note.content}</p>
							</div>
							<NoteStatusBadge status={toNoteStatus(note.status)} />
						</div>

						<div className="flex flex-wrap gap-2">
							{note.topicDetails?.map((topic) => (
								<Button
									key={topic.id}
									size="sm"
									variant="secondary"
									onPress={() => onOpenTopic(topic.id)}
								>
									#{topic.name}
								</Button>
							))}
							{note.locationName ? (
								<Chip color="default" size="sm" variant="soft">
									{note.locationName}
								</Chip>
							) : null}
						</div>

						{note.cover ? (
							<img
								src={note.cover}
								alt=""
								className="max-h-[420px] w-full rounded-lg object-cover ring-1 ring-border"
							/>
						) : null}

						{note.images.length > 0 ? (
							<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
								{note.images.map((image) => (
									<img
										key={image}
										src={image}
										alt=""
										className="aspect-[4/3] w-full rounded-lg object-cover ring-1 ring-border"
									/>
								))}
							</div>
						) : null}
					</div>

					<div className="grid content-start gap-3">
						<Card className="bg-surface-secondary">
							<Card.Content className="grid gap-3 p-4">
								<button
									type="button"
									className="flex items-center gap-3 text-left"
									onClick={() => onOpenUser(note.userId)}
								>
									<AppAvatar
										alt={note.authorName}
										className="size-10"
										fallback={note.authorName.slice(0, 1)}
										src={note.authorImage}
									/>
									<div className="min-w-0">
										<div className="truncate font-medium">
											{note.authorName}
										</div>
										<div className="truncate text-muted text-xs">
											{note.authorEmail}
										</div>
										{note.authorHandle ? (
											<div className="truncate text-muted text-xs">
												@{note.authorHandle}
											</div>
										) : null}
									</div>
								</button>
							</Card.Content>
						</Card>

						<div className="grid grid-cols-3 gap-2">
							<StatBox label="点赞" value={note.likedCount} />
							<StatBox label="收藏" value={note.collectedCount} />
							<StatBox label="评论" value={note.commentCount} />
						</div>

						<Card className="bg-surface-secondary">
							<Card.Content className="grid gap-2 p-4 text-muted text-sm">
								<div>创建：{new Date(note.createdAt).toLocaleString()}</div>
								<div>更新：{formatDate(note.updatedAt)}</div>
								<div>发布：{formatDate(note.publishedAt)}</div>
								<div>
									评论 {note.advancedOptions?.allowComment ? "开启" : "关闭"} ·
									分享 {note.advancedOptions?.allowShare ? "开启" : "关闭"}
								</div>
								{note.rejectionReason ? (
									<div className="text-danger">
										拒绝原因：{note.rejectionReason}
									</div>
								) : null}
							</Card.Content>
						</Card>
					</div>
				</Card.Content>
			</Card>

			<div className="grid gap-4 lg:grid-cols-2">
				<UserActionList
					title="最近点赞"
					emptyText="暂无点赞"
					users={note.likedUsers}
					onOpenUser={onOpenUser}
				/>
				<UserActionList
					title="最近收藏"
					emptyText="暂无收藏"
					users={note.collectedUsers}
					onOpenUser={onOpenUser}
				/>
			</div>

			<Card>
				<Card.Header>
					<Card.Title>评论</Card.Title>
				</Card.Header>
				<Card.Content className="grid gap-3 p-4">
					{note.comments.length > 0 ? (
						note.comments.map((comment) => (
							<div
								key={comment.id}
								className="grid gap-2 rounded-lg bg-surface-secondary p-3"
							>
								<button
									type="button"
									className="flex items-center gap-3 text-left"
									onClick={() => onOpenUser(comment.authorId)}
								>
									<AppAvatar
										alt={comment.authorName}
										className="size-8"
										fallback={comment.authorName.slice(0, 1)}
										src={comment.authorImage}
									/>
									<div className="min-w-0">
										<div className="truncate font-medium text-sm">
											{comment.authorName}
										</div>
										<div className="truncate text-muted text-xs">
											{new Date(comment.createdAt).toLocaleString()}
										</div>
									</div>
								</button>
								<p className="text-sm">{comment.content}</p>
							</div>
						))
					) : (
						<p className="text-muted text-sm">暂无评论</p>
					)}
				</Card.Content>
			</Card>
		</div>
	);
}

function StatBox({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg bg-surface-secondary p-3">
			<div className="text-muted text-xs">{label}</div>
			<div className="mt-1 font-semibold text-xl tabular-nums">{value}</div>
		</div>
	);
}

function UserActionList({
	emptyText,
	onOpenUser,
	title,
	users,
}: {
	emptyText: string;
	onOpenUser: (userId: string) => void;
	title: string;
	users: AdminUserReference[];
}) {
	return (
		<Card>
			<Card.Header>
				<Card.Title>{title}</Card.Title>
			</Card.Header>
			<Card.Content className="grid gap-2 p-4">
				{users.length > 0 ? (
					users.map((user) => (
						<button
							key={`${user.userId}-${new Date(user.createdAt).getTime()}`}
							type="button"
							className="flex items-center gap-3 rounded-lg p-2 text-left hover:bg-surface-secondary"
							onClick={() => onOpenUser(user.userId)}
						>
							<AppAvatar
								alt={user.name}
								className="size-8"
								fallback={user.name.slice(0, 1)}
								src={user.image}
							/>
							<div className="min-w-0">
								<div className="truncate font-medium text-sm">{user.name}</div>
								<div className="truncate text-muted text-xs">{user.email}</div>
							</div>
						</button>
					))
				) : (
					<p className="text-muted text-sm">{emptyText}</p>
				)}
			</Card.Content>
		</Card>
	);
}

function formatDate(value?: Date | string | null) {
	return value ? new Date(value).toLocaleString() : "暂无";
}
