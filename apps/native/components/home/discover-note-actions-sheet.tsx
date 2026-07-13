import { Ionicons } from "@expo/vector-icons";
import {
	BottomSheet,
	ListGroup,
	Typography,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";

import { ListDivider } from "@/components/create/create-ui";
import type { NoteCardNote } from "@/components/note-card";
import { AppBottomSheetContent } from "@/components/shared/app-bottom-sheet";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";

type DiscoverEventType = "collect" | "like";

export function DiscoverNoteActionsSheet({
	isOpen,
	note,
	onBlockAuthor,
	onNotInterested,
	onOpenChange,
	onRecordDiscoverEvent,
}: {
	isOpen: boolean;
	note: NoteCardNote | null;
	onBlockAuthor: (note: NoteCardNote) => void;
	onNotInterested: (note: NoteCardNote) => void;
	onOpenChange: (isOpen: boolean) => void;
	onRecordDiscoverEvent: (note: NoteCardNote, type: DiscoverEventType) => void;
}) {
	const socialActions = useSocialActions();
	const mutedColor = useThemeColor("muted");
	const accentColor = useThemeColor("accent");
	const dangerColor = useThemeColor("danger");
	const isSelf = note?.author.id === socialActions.currentUserId;
	const likeState = socialActions.optimistic.like(
		note?.id ?? "",
		Boolean(note?.liked),
		note?.likedCount,
	);
	const collectState = socialActions.optimistic.collect(
		note?.id ?? "",
		Boolean(note?.collected),
		note?.collectedCount,
	);
	const followState = socialActions.optimistic.follow(
		note?.author.id ?? "",
		Boolean(note?.author.isFollowing),
	);

	const close = () => onOpenChange(false);

	const openAuthor = () => {
		if (!note) return;
		close();
		socialActions.goTo({ type: "user", id: note.author.id });
	};

	const toggleFollow = () => {
		if (!note || isSelf) return;
		if (
			socialActions.toggleFollow(
				{ active: followState.active, userId: note.author.id },
				{ redirectTo: "/" },
			)
		) {
			close();
		}
	};

	const toggleLike = () => {
		if (!note) return;
		if (
			socialActions.toggleLike(
				{ active: likeState.active, count: likeState.count, id: note.id },
				{
					redirectTo: "/",
					onSuccess: (result) => {
						if (result.liked) onRecordDiscoverEvent(note, "like");
					},
				},
			)
		) {
			close();
		}
	};

	const toggleCollect = () => {
		if (!note) return;
		if (
			socialActions.toggleCollect(
				{
					active: collectState.active,
					count: collectState.count,
					id: note.id,
				},
				{
					redirectTo: "/",
					onSuccess: (result) => {
						if (result.collected) onRecordDiscoverEvent(note, "collect");
					},
				},
			)
		) {
			close();
		}
	};

	return (
		<BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
			<BottomSheet.Portal disableFullWindowOverlay>
				<BottomSheet.Overlay />
				<AppBottomSheetContent enableOverDrag={false}>
					<View className="gap-2">
						<BottomSheet.Title>更多操作</BottomSheet.Title>
						<GroupLabel>内容</GroupLabel>
						<ListGroup
							variant="secondary"
							className="overflow-hidden rounded-xl"
						>
							<ActionItem
								disabled={!note}
								icon={likeState.active ? "heart" : "heart-outline"}
								iconColor={likeState.active ? dangerColor : mutedColor}
								label={likeState.active ? "取消点赞" : "点赞"}
								onPress={toggleLike}
							/>
							<ListDivider />
							<ActionItem
								disabled={!note}
								icon={collectState.active ? "bookmark" : "bookmark-outline"}
								iconColor={collectState.active ? accentColor : mutedColor}
								label={collectState.active ? "取消收藏" : "收藏图文"}
								onPress={toggleCollect}
							/>
							<ListDivider />
							<ActionItem
								disabled={!note}
								icon="person-circle-outline"
								iconColor={mutedColor}
								label="查看作者"
								onPress={openAuthor}
							/>
							{isSelf ? null : (
								<>
									<ListDivider />
									<ActionItem
										disabled={!note}
										icon={
											followState.active
												? "checkmark-circle"
												: "person-add-outline"
										}
										iconColor={followState.active ? accentColor : mutedColor}
										label={followState.active ? "取消关注" : "关注作者"}
										onPress={toggleFollow}
									/>
								</>
							)}
						</ListGroup>

						<GroupLabel>推荐反馈</GroupLabel>
						<ListGroup
							variant="secondary"
							className="overflow-hidden rounded-xl"
						>
							<ActionItem
								disabled={!note}
								icon="eye-off-outline"
								iconColor={mutedColor}
								label="不感兴趣"
								onPress={() => note && onNotInterested(note)}
							/>
							{isSelf ? null : (
								<>
									<ListDivider />
									<ActionItem
										disabled={!note}
										icon="ban-outline"
										iconColor={dangerColor}
										label="拉黑作者"
										labelClassName="text-danger"
										onPress={() => note && onBlockAuthor(note)}
									/>
								</>
							)}
						</ListGroup>
					</View>
				</AppBottomSheetContent>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}

function GroupLabel({ children }: { children: string }) {
	return (
		<Typography.Paragraph type="body-xs" color="muted" className="px-1">
			{children}
		</Typography.Paragraph>
	);
}

function ActionItem({
	disabled,
	icon,
	iconColor,
	label,
	labelClassName,
	onPress,
}: {
	disabled: boolean;
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	label: string;
	labelClassName?: string;
	onPress: () => void;
}) {
	return (
		<ListGroup.Item
			accessibilityLabel={label}
			disabled={disabled}
			className="gap-2.5 px-3 py-2.5"
			onPress={() => {
				fireHaptic();
				onPress();
			}}
		>
			<ListGroup.ItemPrefix>
				<Ionicons name={icon} size={21} color={iconColor} />
			</ListGroup.ItemPrefix>
			<ListGroup.ItemContent>
				<ListGroup.ItemTitle className={`text-sm ${labelClassName ?? ""}`}>
					{label}
				</ListGroup.ItemTitle>
			</ListGroup.ItemContent>
		</ListGroup.Item>
	);
}
