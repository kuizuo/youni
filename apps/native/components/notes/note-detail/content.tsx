import { Ionicons } from "@expo/vector-icons";
import {
	Avatar,
	Button,
	PressableFeedback,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Image, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APP_HEADER_ICON_SIZE } from "@/components/shared/app-header";
import { AppHeading } from "@/components/shared/app-heading";
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
	isSelf,
	onBack,
	onFollow,
	onOpenAuthor,
}: {
	author: {
		handle: null | string;
		id: string;
		image: null | string;
		name: string;
	};
	isFollowing: boolean;
	isSelf: boolean;
	onBack: () => void;
	onFollow: () => void;
	onOpenAuthor: () => void;
}) {
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
						<Text.Paragraph weight="semibold" numberOfLines={1}>
							{author.name}
						</Text.Paragraph>
					</View>
				</PressableFeedback>
				{isSelf ? (
					<View className="w-16" />
				) : (
					<Button
						size="sm"
						variant={isFollowing ? "secondary" : "primary"}
						feedbackVariant="scale-ripple"
						onPress={onFollow}
					>
						<Button.Label>{isFollowing ? "已关注" : "关注"}</Button.Label>
					</Button>
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
				<Text.Paragraph type="body-sm" color="muted">
					暂无封面
				</Text.Paragraph>
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

export function NoteBody({
	content,
	createdAt,
	onMentionPress,
	onTopicPress,
	title,
	topics,
}: {
	content: string;
	createdAt: Date | string;
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
								<Text.Paragraph
									type="body-sm"
									weight="semibold"
									className="text-accent"
								>
									#{topic}
								</Text.Paragraph>
							</PressableFeedback>
						))}
					</View>
				) : null}
			</View>
			<Text.Paragraph type="body-xs" color="muted">
				{formatRelativeTime(createdAt)}
			</Text.Paragraph>
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
		<Text.Paragraph className="text-foreground leading-6">
			{tokens.map((token) => {
				if (token.type === "mention") {
					return (
						<Text.Paragraph
							key={token.key}
							accessibilityRole="link"
							weight="semibold"
							className="text-accent"
							onPress={() => onMentionPress(token.value)}
						>
							{token.text}
						</Text.Paragraph>
					);
				}
				if (token.type === "topic") {
					return (
						<Text.Paragraph
							key={token.key}
							accessibilityRole="link"
							weight="semibold"
							className="text-accent"
							onPress={() => onTopicPress(token.value)}
						>
							{token.text}
						</Text.Paragraph>
					);
				}
				return token.text;
			})}
		</Text.Paragraph>
	);
}
