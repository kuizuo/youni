import {
	Check,
	CircleCheck,
	CircleInfo,
	CircleXmark,
	Clock,
	Magnifier,
	ShieldCheck,
	TriangleExclamation,
	Xmark,
} from "@gravity-ui/icons";
import {
	Button,
	Card,
	Chip,
	Drawer,
	Label,
	SearchField,
	Skeleton,
	TextArea,
	TextField,
} from "@heroui/react";
import type { ModerationQueueBucket } from "@youni/api/contracts/admin";
import type {
	AdminHydratedContentNote,
	ContentModerationReason,
	ContentModerationStatus,
	ContentNoteStatus,
} from "@youni/api/contracts/shared";
import { useEffect, useMemo, useState } from "react";

import { NoteStatusBadge } from "@/components/admin-status";

import { toNoteStatus } from "@/routes/-admin-notes/types";

type ReviewNote = AdminHydratedContentNote;

type QueueSummary = {
	all: number;
	attention: number;
	blocked: number;
	failed: number;
	passed: number;
};

const queueFilters: Array<{
	key: ModerationQueueBucket;
	label: string;
	summaryKey: keyof QueueSummary;
}> = [
	{ key: "attention", label: "待人工处理", summaryKey: "attention" },
	{ key: "failed", label: "运行失败", summaryKey: "failed" },
	{ key: "passed", label: "自动通过", summaryKey: "passed" },
	{ key: "blocked", label: "自动拦截", summaryKey: "blocked" },
	{ key: "all", label: "全部记录", summaryKey: "all" },
];

const moderationStatusLabel: Record<ContentModerationStatus, string> = {
	blocked: "自动拦截",
	failed: "运行失败",
	needs_review: "等待人工复核",
	not_started: "未运行",
	passed: "自动通过",
	pending: "等待自动审核",
	processing: "自动审核中",
};

const moderationReasonLabel: Record<ContentModerationReason, string> = {
	invalid_response: "自动审核没有给出完整结果",
	low_confidence: "未能自动确认，等待人工复核",
	policy_violation: "图片命中了内容风险规则",
	queue_unavailable: "任务未能进入自动审核队列",
	result_write_failed: "自动审核结果未能保存，已转人工处理",
	service_unavailable: "自动审核服务暂时不可用",
};

const moderationReasonDescription: Record<ContentModerationReason, string> = {
	invalid_response:
		"自动审核没有返回完整的判断，本次不能自动发布，请人工查看后决定。",
	low_confidence: "自动审核无法确认是否可以直接处理，请人工查看图片后决定。",
	policy_violation: "图片中发现了明确的风险内容，已自动拦截。",
	queue_unavailable: "这条内容未能进入自动审核，已保留在队列中，请人工处理。",
	result_write_failed: "自动审核已经完成，但结果没有保存成功，已转为人工处理。",
	service_unavailable:
		"自动审核本次没有正常完成，内容没有发布，请人工处理或稍后重试。",
};

const categoryLabel: Record<string, string> = {
	dense_text: "大量文字",
	drugs: "毒品",
	extremism: "极端内容",
	fraud: "诈骗",
	gambling: "赌博",
	graphic_violence: "血腥暴力",
	other: "其他风险",
	political: "政治与公共事件",
	privacy: "隐私信息",
	qr_or_contact: "二维码或联系方式",
	self_harm: "自伤",
	sexual: "色情裸露",
	weapons: "武器",
};

function moderationDetailScoreLabel(
	detail: ReviewNote["moderationDetails"][number],
) {
	const percentage = Math.round(detail.confidence * 100);
	if (detail.decision === "pass") return `安全判断 ${percentage}%`;
	if (detail.decision === "block") return `风险判断 ${percentage}%`;
	return "等待人工复核";
}

function emptyCategoryLabel(detail: ReviewNote["moderationDetails"][number]) {
	return detail.decision === "pass" ? "未发现风险" : "未识别到具体风险";
}

function moderationReasonText(note: ReviewNote) {
	if (!note.moderationReason) {
		return note.moderationStatus === "passed"
			? "图片未发现风险，已自动通过并发布"
			: "暂无额外说明";
	}

	if (note.moderationReason === "low_confidence") {
		const hasPossibleRisk = note.moderationDetails.some(
			(detail) => detail.categories.length > 0,
		);
		return hasPossibleRisk
			? "图片中发现了可能的风险内容，但不足以自动拦截，请人工查看后决定。"
			: "未发现明确风险，但自动审核无法确认是否可以直接发布，请人工查看图片后决定。";
	}

	return (
		moderationReasonDescription[note.moderationReason] ?? note.moderationReason
	);
}

export function ReviewQueue({
	bucket,
	contentErrorMessage,
	errorMessage,
	isContentLoading,
	isMutating,
	isSyncing,
	items,
	keyword,
	lastSyncedAt,
	onBucketChange,
	onKeywordChange,
	onPageChange,
	onRetry,
	onReview,
	page,
	successMessage,
	summary,
	syncErrorMessage,
	total,
}: {
	bucket: ModerationQueueBucket;
	contentErrorMessage: string | null;
	errorMessage: string | null;
	isContentLoading: boolean;
	isMutating: boolean;
	isSyncing: boolean;
	items: ReviewNote[];
	keyword: string;
	lastSyncedAt: number | null;
	onBucketChange: (bucket: ModerationQueueBucket) => void;
	onKeywordChange: (keyword: string) => void;
	onPageChange: (page: number) => void;
	onRetry: () => Promise<void>;
	onReview: (
		note: ReviewNote,
		status: Extract<ContentNoteStatus, "published" | "rejected">,
		reason?: string,
	) => Promise<void>;
	page: number;
	successMessage: string | null;
	summary: QueueSummary;
	syncErrorMessage: string | null;
	total: number;
}) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [detailNoteId, setDetailNoteId] = useState<string | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});
	const selectedNote = useMemo(
		() => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
		[items, selectedId],
	);
	const detailNote = useMemo(
		() => items.find((item) => item.id === detailNoteId) ?? null,
		[detailNoteId, items],
	);
	useEffect(() => {
		if (items.length === 0) {
			setSelectedId(null);
			return;
		}
		if (!selectedId || !items.some((item) => item.id === selectedId)) {
			setSelectedId(items[0]?.id ?? null);
		}
	}, [items, selectedId]);
	useEffect(() => {
		if (detailNoteId && !detailNote) {
			setIsDetailOpen(false);
			setDetailNoteId(null);
		}
	}, [detailNote, detailNoteId]);
	const pageCount = Math.max(Math.ceil(total / 20), 1);
	const rejectionReason = selectedNote
		? (reasonDrafts[selectedNote.id] ?? selectedNote.rejectionReason ?? "")
		: "";
	const openFullDetail = (note: ReviewNote) => {
		setDetailNoteId(note.id);
		setIsDetailOpen(true);
	};

	return (
		<div className="grid gap-4">
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
				{queueFilters.map((filter) => (
					<button
						key={filter.key}
						type="button"
						aria-pressed={bucket === filter.key}
						className={`rounded-2xl border p-4 text-left transition-colors ${
							bucket === filter.key
								? "border-accent bg-accent-soft"
								: "border-border bg-surface hover:bg-surface-secondary"
						}`}
						onClick={() => onBucketChange(filter.key)}
					>
						<div className="text-muted text-sm">{filter.label}</div>
						<div className="mt-2 font-semibold text-2xl tabular-nums">
							{summary[filter.summaryKey]}
						</div>
					</button>
				))}
			</div>

			<Card>
				<Card.Content className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
					<SearchField
						aria-label="搜索审核队列"
						className="w-full sm:w-[320px]"
						name="review-search"
						value={keyword}
						variant="secondary"
						onChange={onKeywordChange}
					>
						<SearchField.Group>
							<SearchField.SearchIcon>
								<Magnifier className="size-4" />
							</SearchField.SearchIcon>
							<SearchField.Input placeholder="搜索标题、正文或作者" />
							<SearchField.ClearButton />
						</SearchField.Group>
					</SearchField>
					<div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-muted text-sm">
						<span
							data-sync-updated-at={lastSyncedAt ?? ""}
							data-testid="moderation-sync-status"
							className="flex items-center gap-1.5"
						>
							<span
								className={`size-1.5 rounded-full ${
									isSyncing
										? "animate-pulse bg-accent motion-reduce:animate-none"
										: "bg-success"
								}`}
							/>
							{isSyncing ? "正在同步" : "自动同步"}
						</span>
						<span>{isContentLoading ? "正在查询…" : `共 ${total} 条`}</span>
					</div>
				</Card.Content>
			</Card>

			{errorMessage ? (
				<div className="rounded-2xl bg-danger-soft px-4 py-3 text-danger-soft-foreground text-sm">
					{errorMessage}
				</div>
			) : null}
			{successMessage ? (
				<div className="rounded-2xl bg-success-soft px-4 py-3 text-sm text-success-soft-foreground">
					{successMessage}
				</div>
			) : null}
			{syncErrorMessage ? (
				<div className="flex items-center gap-2 rounded-2xl bg-warning-soft px-4 py-3 text-sm text-warning-soft-foreground">
					<TriangleExclamation className="size-4 shrink-0" />
					{syncErrorMessage}
				</div>
			) : null}

			{isContentLoading ? (
				<ReviewQueueLoading />
			) : contentErrorMessage ? (
				<QueueLoadError message={contentErrorMessage} onRetry={onRetry} />
			) : items.length === 0 ? (
				<EmptyQueue bucket={bucket} />
			) : (
				<div className="grid min-h-[620px] gap-3 xl:grid-cols-[minmax(360px,0.85fr)_minmax(520px,1.4fr)]">
					<Card className="overflow-hidden">
						<Card.Header className="border-border border-b px-4 py-3">
							<Card.Title className="text-base">审核记录</Card.Title>
						</Card.Header>
						<Card.Content className="grid content-start gap-0 p-0">
							{items.map((note) => (
								<ReviewQueueItem
									key={note.id}
									isSelected={selectedNote?.id === note.id}
									note={note}
									onSelect={() => setSelectedId(note.id)}
								/>
							))}
						</Card.Content>
						<Card.Footer className="flex items-center justify-between border-border border-t px-4 py-3">
							<span className="text-muted text-sm tabular-nums">
								第 {page + 1} / {pageCount} 页
							</span>
							<div className="flex gap-2">
								<Button
									size="sm"
									variant="secondary"
									isDisabled={page === 0}
									onPress={() => onPageChange(Math.max(0, page - 1))}
								>
									上一页
								</Button>
								<Button
									size="sm"
									variant="secondary"
									isDisabled={page + 1 >= pageCount}
									onPress={() =>
										onPageChange(Math.min(pageCount - 1, page + 1))
									}
								>
									下一页
								</Button>
							</div>
						</Card.Footer>
					</Card>

					{selectedNote ? (
						<ReviewDetail
							isMutating={isMutating}
							note={selectedNote}
							rejectionReason={rejectionReason}
							onOpenFullDetail={() => openFullDetail(selectedNote)}
							onReasonChange={(value) =>
								setReasonDrafts((current) => ({
									...current,
									[selectedNote.id]: value,
								}))
							}
							onReview={onReview}
						/>
					) : null}
				</div>
			)}

			<ReviewNoteDetailDrawer
				isOpen={isDetailOpen}
				note={detailNote}
				onOpenChange={setIsDetailOpen}
			/>
		</div>
	);
}

function ReviewQueueItem({
	isSelected,
	note,
	onSelect,
}: {
	isSelected: boolean;
	note: ReviewNote;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			aria-current={isSelected ? "true" : undefined}
			className={`grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-border border-b p-4 text-left transition-colors last:border-b-0 ${
				isSelected ? "bg-accent-soft" : "hover:bg-surface-secondary"
			}`}
			onClick={onSelect}
		>
			{note.cover ? (
				<img
					alt=""
					className="aspect-square size-[72px] rounded-xl object-cover ring-1 ring-border"
					loading="lazy"
					src={note.cover}
				/>
			) : (
				<div className="flex aspect-square size-[72px] items-center justify-center rounded-xl bg-surface-secondary text-muted text-xs ring-1 ring-border">
					无封面
				</div>
			)}
			<div className="min-w-0">
				<div className="flex items-start justify-between gap-2">
					<h3 className="line-clamp-1 font-medium">{note.title}</h3>
					<ModerationStatusChip status={note.moderationStatus} />
				</div>
				<p className="mt-1 line-clamp-2 text-muted text-sm">{note.content}</p>
				<p className="mt-2 truncate text-muted text-xs">
					{note.authorName} · {new Date(note.createdAt).toLocaleString()}
				</p>
				{note.moderationReason ? (
					<p className="mt-1 line-clamp-1 text-warning text-xs">
						{moderationReasonLabel[note.moderationReason] ??
							note.moderationReason}
					</p>
				) : null}
			</div>
		</button>
	);
}

function ReviewDetail({
	isMutating,
	note,
	onOpenFullDetail,
	onReasonChange,
	onReview,
	rejectionReason,
}: {
	isMutating: boolean;
	note: ReviewNote;
	onOpenFullDetail: () => void;
	onReasonChange: (value: string) => void;
	onReview: (
		note: ReviewNote,
		status: Extract<ContentNoteStatus, "published" | "rejected">,
		reason?: string,
	) => Promise<void>;
	rejectionReason: string;
}) {
	const reason = rejectionReason.trim();

	return (
		<Card className="h-fit xl:sticky xl:top-4">
			<Card.Header className="flex-row items-start justify-between gap-3 border-border border-b px-5 py-4">
				<div className="min-w-0">
					<Card.Title className="line-clamp-1">{note.title}</Card.Title>
					<Card.Description className="mt-1">
						{note.authorName} · {note.authorEmail}
					</Card.Description>
				</div>
				<div className="flex shrink-0 flex-wrap justify-end gap-2">
					<ModerationStatusChip status={note.moderationStatus} />
					<NoteStatusBadge status={toNoteStatus(note.status)} />
				</div>
			</Card.Header>
			<Card.Content className="grid gap-5 p-5">
				<section className="grid gap-3">
					<div className="flex items-center justify-between gap-3">
						<h3 className="font-medium">图文内容</h3>
						<Button size="sm" variant="tertiary" onPress={onOpenFullDetail}>
							查看完整详情
						</Button>
					</div>
					<p className="whitespace-pre-wrap text-muted text-sm leading-6">
						{note.content}
					</p>
					{note.images.length > 0 ? (
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
							{note.images.map((image) => (
								<img
									key={image}
									alt="待审核图片"
									className="aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-border"
									loading="lazy"
									src={image}
								/>
							))}
						</div>
					) : null}
				</section>

				<section className="grid gap-3 rounded-2xl bg-surface-secondary p-4">
					<div className="flex items-center gap-2 font-medium">
						<ShieldCheck className="size-4 text-accent" />
						自动审核情况
					</div>
					<div className="grid gap-2 text-sm sm:grid-cols-2">
						<InfoRow
							label="当前结果"
							value={moderationStatusLabel[note.moderationStatus]}
						/>
						<InfoRow
							label="完成时间"
							value={
								note.moderatedAt
									? new Date(note.moderatedAt).toLocaleString()
									: "尚未完成"
							}
						/>
					</div>
					<div className="rounded-xl bg-background p-3 text-sm ring-1 ring-border">
						<div className="text-muted text-xs">原因</div>
						<div className="mt-1">{moderationReasonText(note)}</div>
					</div>
					{note.moderationDetails.length > 0 ? (
						<div className="grid gap-2">
							{note.moderationDetails.map((detail, index) => (
								<div
									key={detail.image}
									className="grid gap-2 rounded-xl bg-background p-3 ring-1 ring-border"
								>
									<div className="flex items-center justify-between gap-3 text-sm">
										<span>图片 {index + 1}</span>
										<span className="text-muted tabular-nums">
											{moderationDetailScoreLabel(detail)}
										</span>
									</div>
									<div className="flex flex-wrap gap-1.5">
										{detail.categories.length > 0 ? (
											detail.categories.map((category) => (
												<Chip
													key={category}
													color="warning"
													size="sm"
													variant="soft"
												>
													{categoryLabel[category] ?? category}
												</Chip>
											))
										) : (
											<Chip color="success" size="sm" variant="soft">
												{emptyCategoryLabel(detail)}
											</Chip>
										)}
									</div>
								</div>
							))}
						</div>
					) : null}
				</section>

				<section className="grid gap-3 border-border border-t pt-5">
					<div>
						<h3 className="font-medium">人工处理</h3>
						<p className="mt-1 text-muted text-sm">
							拒绝时必须填写明确理由，用户会在笔记状态中看到这段说明。
						</p>
					</div>
					<TextField className="flex flex-col gap-2" name="rejection-reason">
						<Label>拒绝理由</Label>
						<TextArea
							className="min-h-24 resize-y"
							fullWidth
							maxLength={200}
							placeholder="例如：图片中包含清晰的联系方式，请移除后重新发布"
							value={rejectionReason}
							onChange={(event) => onReasonChange(event.target.value)}
						/>
						<div className="text-right text-muted text-xs tabular-nums">
							{rejectionReason.length}/200
						</div>
					</TextField>
					<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
						<Button
							variant="danger"
							isDisabled={!reason || isMutating}
							isPending={isMutating}
							onPress={() => onReview(note, "rejected", reason)}
						>
							<Xmark className="size-4" />
							拒绝并记录理由
						</Button>
						<Button
							isDisabled={isMutating}
							isPending={isMutating}
							onPress={() => onReview(note, "published")}
						>
							<Check className="size-4" />
							人工通过
						</Button>
					</div>
				</section>
			</Card.Content>
		</Card>
	);
}

function ReviewNoteDetailDrawer({
	isOpen,
	note,
	onOpenChange,
}: {
	isOpen: boolean;
	note: ReviewNote | null;
	onOpenChange: (open: boolean) => void;
}) {
	const detailImages = note
		? note.images.length > 0
			? note.images
			: note.cover
				? [note.cover]
				: []
		: [];

	return (
		<Drawer>
			<Drawer.Backdrop
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				variant="blur"
			>
				{note ? (
					<Drawer.Content placement="right">
						<Drawer.Dialog
							aria-label={`图文详情：${note.title}`}
							className="w-full sm:max-w-2xl"
						>
							<Drawer.CloseTrigger />
							<Drawer.Header className="border-border border-b pr-14">
								<div className="min-w-0">
									<Drawer.Heading className="line-clamp-2">
										{note.title}
									</Drawer.Heading>
									<p className="mt-1 text-muted text-sm">
										{note.authorName} · {note.authorEmail}
									</p>
									<div className="mt-3 flex flex-wrap gap-2">
										<ModerationStatusChip status={note.moderationStatus} />
										<NoteStatusBadge status={toNoteStatus(note.status)} />
									</div>
								</div>
							</Drawer.Header>

							<Drawer.Body className="grid content-start gap-6 py-5">
								<section className="grid gap-3">
									<h3 className="font-medium">正文内容</h3>
									<p className="whitespace-pre-wrap text-sm leading-6">
										{note.content || "暂无正文"}
									</p>
									{note.topicDetails.length > 0 || note.locationName ? (
										<div className="flex flex-wrap gap-2">
											{note.topicDetails.map((topic) => (
												<Chip key={topic.id} size="sm" variant="soft">
													#{topic.name}
												</Chip>
											))}
											{note.locationName ? (
												<Chip color="default" size="sm" variant="soft">
													{note.locationName}
												</Chip>
											) : null}
										</div>
									) : null}
								</section>

								{detailImages.length > 0 ? (
									<section className="grid gap-3">
										<h3 className="font-medium">全部图片</h3>
										<div className="grid grid-cols-2 gap-3">
											{detailImages.map((image, index) => (
												<img
													key={image}
													alt={`图文图片 ${index + 1}`}
													className="aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-border"
													loading="lazy"
													src={image}
												/>
											))}
										</div>
									</section>
								) : null}

								<section className="grid gap-3">
									<h3 className="font-medium">数据与发布信息</h3>
									<div className="grid grid-cols-3 gap-2">
										<DetailStat label="点赞" value={note.likedCount} />
										<DetailStat label="收藏" value={note.collectedCount} />
										<DetailStat label="评论" value={note.commentCount} />
									</div>
									<div className="grid gap-2 rounded-2xl bg-surface-secondary p-4 text-sm sm:grid-cols-2">
										<InfoRow
											label="可见范围"
											value={visibilityLabel(note.visibility)}
										/>
										<InfoRow
											label="创建时间"
											value={formatDate(note.createdAt)}
										/>
										<InfoRow
											label="发布时间"
											value={formatDate(note.publishedAt)}
										/>
										<InfoRow
											label="互动设置"
											value={`评论${note.advancedOptions.allowComment ? "开启" : "关闭"} · 分享${note.advancedOptions.allowShare ? "开启" : "关闭"}`}
										/>
									</div>
								</section>

								<section className="grid gap-3 rounded-2xl bg-surface-secondary p-4">
									<div className="flex items-center gap-2 font-medium">
										<ShieldCheck className="size-4 text-accent" />
										自动审核详情
									</div>
									<div className="grid gap-2 text-sm sm:grid-cols-2">
										<InfoRow
											label="审核结果"
											value={moderationStatusLabel[note.moderationStatus]}
										/>
										<InfoRow
											label="完成时间"
											value={formatDate(note.moderatedAt)}
										/>
									</div>
									<div className="rounded-xl bg-background p-3 text-sm ring-1 ring-border">
										<div className="text-muted text-xs">判断原因</div>
										<div className="mt-1">{moderationReasonText(note)}</div>
									</div>
									{note.rejectionReason ? (
										<div className="rounded-xl bg-danger-soft p-3 text-danger-soft-foreground text-sm">
											<div className="text-xs opacity-70">人工拒绝理由</div>
											<div className="mt-1">{note.rejectionReason}</div>
										</div>
									) : null}
								</section>
							</Drawer.Body>

							<Drawer.Footer className="border-border border-t">
								<Button slot="close" variant="secondary">
									关闭
								</Button>
							</Drawer.Footer>
						</Drawer.Dialog>
					</Drawer.Content>
				) : null}
			</Drawer.Backdrop>
		</Drawer>
	);
}

function DetailStat({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-xl bg-surface-secondary p-3 text-center">
			<div className="text-muted text-xs">{label}</div>
			<div className="mt-1 font-semibold text-lg tabular-nums">{value}</div>
		</div>
	);
}

function visibilityLabel(visibility: ReviewNote["visibility"]) {
	if (visibility === "followers") return "仅关注者";
	if (visibility === "private") return "仅自己";
	return "公开可见";
}

function formatDate(value?: Date | string | null) {
	return value ? new Date(value).toLocaleString() : "暂无";
}

function ModerationStatusChip({ status }: { status: ContentModerationStatus }) {
	const config = {
		blocked: { color: "danger" as const, icon: CircleXmark },
		failed: { color: "danger" as const, icon: TriangleExclamation },
		needs_review: { color: "warning" as const, icon: CircleInfo },
		not_started: { color: "default" as const, icon: Clock },
		passed: { color: "success" as const, icon: CircleCheck },
		pending: { color: "warning" as const, icon: Clock },
		processing: { color: "accent" as const, icon: ShieldCheck },
	}[status];
	const Icon = config.icon;

	return (
		<Chip color={config.color} size="sm" variant="soft">
			<Icon className="size-3" />
			{moderationStatusLabel[status]}
		</Chip>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl bg-background p-3 ring-1 ring-border">
			<div className="text-muted text-xs">{label}</div>
			<div className="mt-1">{value}</div>
		</div>
	);
}

function QueueLoadError({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => Promise<void>;
}) {
	return (
		<Card>
			<Card.Content className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
				<div className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
					<TriangleExclamation className="size-6" />
				</div>
				<div className="max-w-lg">
					<h2 className="font-medium">当前审核内容加载失败</h2>
					<p className="mt-1 text-muted text-sm">{message}</p>
				</div>
				<Button variant="secondary" onPress={() => void onRetry()}>
					重新加载
				</Button>
			</Card.Content>
		</Card>
	);
}

function EmptyQueue({ bucket }: { bucket: ModerationQueueBucket }) {
	return (
		<Card>
			<Card.Content className="flex min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
				<div className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
					<CircleCheck className="size-6" />
				</div>
				<div>
					<h2 className="font-medium">当前没有相关记录</h2>
					<p className="mt-1 text-muted text-sm">
						{bucket === "attention"
							? "待人工处理的内容已经清空。"
							: "可以切换其他分类查看自动审核记录。"}
					</p>
				</div>
			</Card.Content>
		</Card>
	);
}

function ReviewQueueLoading() {
	return (
		<div
			aria-busy="true"
			aria-live="polite"
			className="review-queue-loading grid gap-3"
			role="status"
		>
			<div className="flex items-center gap-2 rounded-2xl bg-accent-soft px-4 py-3 text-accent text-sm">
				<span className="size-2 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
				<span className="font-medium">正在加载当前分类的审核内容…</span>
			</div>
			<div className="grid min-h-[620px] gap-3 xl:grid-cols-[minmax(360px,0.85fr)_minmax(520px,1.4fr)]">
				<Card className="relative overflow-hidden">
					<Card.Header className="border-border border-b px-4 py-4">
						<Skeleton className="h-5 w-24 rounded-lg" />
					</Card.Header>
					<Card.Content className="grid content-start p-0">
						{["first", "second", "third", "fourth", "fifth"].map((item) => (
							<div
								key={item}
								className="flex gap-3 border-border border-b p-4 last:border-b-0"
							>
								<Skeleton className="size-[72px] shrink-0 rounded-xl" />
								<div className="grid flex-1 content-center gap-2.5">
									<div className="flex items-center justify-between gap-3">
										<Skeleton className="h-4 w-2/5 rounded-md" />
										<Skeleton className="h-6 w-20 rounded-full" />
									</div>
									<Skeleton className="h-3 w-4/5 rounded-md" />
									<Skeleton className="h-3 w-3/5 rounded-md" />
								</div>
							</div>
						))}
					</Card.Content>
					<Card.Footer className="flex items-center justify-between border-border border-t px-4 py-4">
						<Skeleton className="h-4 w-20 rounded-md" />
						<div className="flex gap-2">
							<Skeleton className="h-8 w-16 rounded-lg" />
							<Skeleton className="h-8 w-16 rounded-lg" />
						</div>
					</Card.Footer>
				</Card>

				<Card className="relative h-fit overflow-hidden">
					<Card.Header className="flex-row items-start justify-between gap-4 border-border border-b px-5 py-4">
						<div className="grid flex-1 gap-2">
							<Skeleton className="h-5 w-2/5 rounded-md" />
							<Skeleton className="h-3 w-1/3 rounded-md" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-6 w-20 rounded-full" />
							<Skeleton className="h-6 w-16 rounded-full" />
						</div>
					</Card.Header>
					<Card.Content className="grid gap-5 p-5">
						<section className="grid gap-3">
							<div className="flex items-center justify-between gap-3">
								<Skeleton className="h-4 w-24 rounded-md" />
								<Skeleton className="h-8 w-24 rounded-lg" />
							</div>
							<Skeleton className="h-3 w-full rounded-md" />
							<Skeleton className="h-3 w-3/4 rounded-md" />
							<div className="grid grid-cols-3 gap-2">
								{["image-first", "image-second", "image-third"].map((image) => (
									<Skeleton
										key={image}
										className="aspect-[4/3] w-full rounded-xl"
									/>
								))}
							</div>
						</section>
						<section className="grid gap-3 rounded-2xl bg-surface-secondary p-4">
							<Skeleton className="h-4 w-32 rounded-md" />
							<div className="grid gap-2 sm:grid-cols-2">
								<Skeleton className="h-16 rounded-xl" />
								<Skeleton className="h-16 rounded-xl" />
							</div>
							<Skeleton className="h-20 rounded-xl" />
						</section>
						<section className="grid gap-3 border-border border-t pt-5">
							<Skeleton className="h-4 w-24 rounded-md" />
							<Skeleton className="h-20 rounded-xl" />
							<div className="flex justify-end gap-2">
								<Skeleton className="h-9 w-32 rounded-lg" />
								<Skeleton className="h-9 w-24 rounded-lg" />
							</div>
						</section>
					</Card.Content>
				</Card>
			</div>
		</div>
	);
}
