import { Ionicons } from "@expo/vector-icons";
import type {
	ContentNoteRow,
	HydratedContentNote,
} from "@youni/api/contracts/shared";
import {
	Avatar,
	Button,
	PressableFeedback,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useMemo } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Image, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	APP_HEADER_ICON_SIZE,
	AppHeaderIconButton,
} from "@/components/shared/app-header";
import { AppHeading } from "@/components/shared/app-heading";
import { FollowButton } from "@/components/users/follow-button";
import { formatRelativeTime } from "@/utils/format";

import { parseInlineTokens } from "./utils";

export function SimpleTopBar({ onBack }: { onBack: () => void }) {
	const mutedColor = useThemeColor("muted");
	const insets = useSafeAreaInsets();

	return (
		<View className="bg-background" style={{ paddingTop: insets.top }}>
			<View className="h-16 flex-row items-center justify-between px-2">
				<Button
					isIconOnly
					variant="ghost"
					className="h-11 w-11 rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="返回"
					onPress={onBack}
				>
					<Ionicons
						name="chevron-back"
						size={APP_HEADER_ICON_SIZE}
						color={mutedColor}
					/>
				</Button>
				<View className="h-11 w-11" />
			</View>
		</View>
	);
}

export function AuthorTopBar({
	author,
	isFollowing,
	isMenuVisible,
	isSelf,
	onBack,
	onFollow,
	onOpenMenu,
	onOpenAuthor,
}: {
	author: HydratedContentNote["author"];
	isFollowing: boolean;
	isMenuVisible: boolean;
	isSelf: boolean;
	onBack: () => void;
	onFollow: () => void;
	onOpenMenu: () => void;
	onOpenAuthor: () => void;
}) {
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");
	const insets = useSafeAreaInsets();

	return (
		<View className="bg-background" style={{ paddingTop: insets.top }}>
			<View className="h-16 flex-row items-center gap-2 px-2">
				<Button
					isIconOnly
					variant="ghost"
					className="h-11 w-11 rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="返回"
					onPress={onBack}
				>
					<Ionicons
						name="chevron-back"
						size={APP_HEADER_ICON_SIZE}
						color={mutedColor}
					/>
				</Button>
				<PressableFeedback
					onPress={onOpenAuthor}
					className="min-w-0 flex-1 flex-row items-center gap-2"
				>
					<Avatar size="sm" alt={author.name} className="size-8">
						{author.image ? (
							<Avatar.Image source={{ uri: author.image }} />
						) : null}
						<Avatar.Fallback>{author.name.slice(0, 1)}</Avatar.Fallback>
					</Avatar>
					<View className="min-w-0 flex-1">
						<Typography.Paragraph weight="semibold" numberOfLines={1}>
							{author.name}
						</Typography.Paragraph>
					</View>
				</PressableFeedback>
				{isSelf ? (
					<AppHeaderIconButton
						variant={isMenuVisible ? "secondary" : "ghost"}
						accessibilityLabel="更多操作"
						color={foregroundColor}
						icon="ellipsis-horizontal"
						onPress={onOpenMenu}
					/>
				) : (
					<FollowButton
						size="sm"
						isFollowing={isFollowing}
						onPress={onFollow}
					/>
				)}
			</View>
		</View>
	);
}

export function ImageCarousel({
	activeIndex,
	images,
	imageHeight,
	mutedColor,
	onIndexChange,
	pageWidth,
}: {
	activeIndex: number;
	images: string[];
	imageHeight: number;
	mutedColor: string;
	onIndexChange: (index: number) => void;
	pageWidth: number;
}) {
	const updateActiveIndex = (
		event: NativeSyntheticEvent<NativeScrollEvent>,
	) => {
		const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
		onIndexChange(Math.max(0, Math.min(images.length - 1, nextIndex)));
	};

	if (images.length === 0) {
		return (
			<View
				className="items-center justify-center gap-2 bg-content2"
				style={{ width: pageWidth, height: imageHeight }}
			>
				<Ionicons name="document-text-outline" size={34} color={mutedColor} />
				<Typography.Paragraph type="body-sm" color="muted">
					暂无封面
				</Typography.Paragraph>
			</View>
		);
	}

	return (
		<View className="bg-background">
			<ScrollView
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				className="bg-content2"
				style={{ width: pageWidth }}
				scrollEventThrottle={16}
				onMomentumScrollEnd={updateActiveIndex}
				onScroll={updateActiveIndex}
			>
				{images.map((image) => (
					<Image
						key={image}
						source={{ uri: image }}
						resizeMode="cover"
						style={{ width: pageWidth, height: imageHeight }}
					/>
				))}
			</ScrollView>
			{images.length > 1 ? (
				<View className="h-5 flex-row items-center justify-center gap-1">
					{images.map((image, index) => (
						<View
							key={`dot-${image}`}
							className={
								index === activeIndex
									? "size-1.5 rounded-full bg-muted"
									: "size-1.5 rounded-full bg-muted opacity-30"
							}
						/>
					))}
				</View>
			) : null}
		</View>
	);
}

export function ContentModerationNotice({
	rejectionReason,
	status,
}: {
	rejectionReason: null | string;
	status: "audit" | "draft" | "hidden" | "published" | "rejected";
}) {
	const accentColor = useThemeColor("accent");
	const dangerColor = useThemeColor("danger");

	if (status !== "audit" && status !== "rejected") {
		return null;
	}

	const isRejected = status === "rejected";
	return (
		<View className="mx-4 my-3 flex-row gap-3 rounded-xl bg-content2 px-4 py-3">
			<Ionicons
				name={isRejected ? "alert-circle-outline" : "time-outline"}
				size={21}
				color={isRejected ? dangerColor : accentColor}
			/>
			<View className="min-w-0 flex-1 gap-1">
				<Typography.Paragraph weight="semibold">
					{isRejected ? "内容未通过审核" : "内容正在审核"}
				</Typography.Paragraph>
				<Typography.Paragraph type="body-sm" color="muted">
					{isRejected
						? rejectionReason || "请修改内容后重新提交"
						: "通过后会自动发布，暂时只有你能看到"}
				</Typography.Paragraph>
			</View>
		</View>
	);
}

export function NoteBody({
	content,
	createdAt,
	onMentionPress,
	onTopicPress,
	title,
	topics,
}: {
	content: string;
	createdAt: ContentNoteRow["createdAt"];
	onMentionPress: (handle: string) => void;
	onTopicPress: (topic: string) => void;
	title: string;
	topics: string[];
}) {
	return (
		<View className="gap-4 px-4 pt-4 pb-5">
			<View className="gap-3">
				<AppHeading type="h4" className="text-foreground">
					{title}
				</AppHeading>
				<LinkedText
					value={content}
					onMentionPress={onMentionPress}
					onTopicPress={onTopicPress}
				/>
				{topics.length > 0 ? (
					<View className="flex-row flex-wrap gap-x-3 gap-y-2">
						{topics.map((topic) => (
							<PressableFeedback
								key={topic}
								accessibilityRole="link"
								accessibilityLabel={`查看话题 ${topic}`}
								onPress={() => onTopicPress(topic)}
							>
								<Typography.Paragraph
									type="body-sm"
									weight="semibold"
									className="text-accent"
								>
									#{topic}
								</Typography.Paragraph>
							</PressableFeedback>
						))}
					</View>
				) : null}
			</View>
			<Typography.Paragraph type="body-xs" color="muted">
				{formatRelativeTime(createdAt)}
			</Typography.Paragraph>
		</View>
	);
}

function LinkedText({
	onMentionPress,
	onTopicPress,
	value,
}: {
	onMentionPress: (handle: string) => void;
	onTopicPress: (topic: string) => void;
	value: string;
}) {
	const tokens = useMemo(() => parseInlineTokens(value), [value]);

	return (
		<Typography.Paragraph className="text-foreground leading-6">
			{tokens.map((token) => {
				if (token.type === "mention") {
					return (
						<Typography.Paragraph
							key={token.key}
							accessibilityRole="link"
							weight="semibold"
							className="text-accent"
							onPress={() => onMentionPress(token.value)}
						>
							{token.text}
						</Typography.Paragraph>
					);
				}
				if (token.type === "topic") {
					return (
						<Typography.Paragraph
							key={token.key}
							accessibilityRole="link"
							weight="semibold"
							className="text-accent"
							onPress={() => onTopicPress(token.value)}
						>
							{token.text}
						</Typography.Paragraph>
					);
				}
				return token.text;
			})}
		</Typography.Paragraph>
	);
}
