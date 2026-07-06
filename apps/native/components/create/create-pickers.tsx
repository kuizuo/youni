import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
	Avatar,
	PressableFeedback,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";

import { nativeQueryKeys } from "@/lib/query/query-keys";
import { client } from "@/utils/orpc";
import { SuggestionChip } from "./create-ui";

const TOPIC_SUGGESTIONS = ["日常", "美食", "穿搭", "摄影", "旅行", "咖啡"];

function formatTopicLabel(topic: string) {
	return topic.startsWith("#") ? topic : `#${topic}`;
}

function stripTopicPrefix(topic: string) {
	return topic.trim().replace(/^#/, "");
}

function formatMentionHandle(value: string) {
	const handle = value.trim().replace(/^@/, "");
	return `@${handle}`;
}

type MentionUser = {
	handle: null | string;
	id: string;
	image: null | string;
	name: string;
};

export function InlineTopicPicker({
	onSelect,
	query,
	selectedTopics,
}: {
	onSelect: (value: string) => void;
	query: string;
	selectedTopics: string[];
}) {
	const mutedColor = useThemeColor("muted");
	const queryTopic = stripTopicPrefix(query);
	const suggestions = useMemo(() => {
		const keyword = queryTopic.toLowerCase();
		const selected = new Set(selectedTopics.map(stripTopicPrefix));
		return TOPIC_SUGGESTIONS.filter((item) => {
			if (selected.has(stripTopicPrefix(item))) return false;
			return !keyword || item.toLowerCase().includes(keyword);
		});
	}, [queryTopic, selectedTopics]);

	return (
		<View className="gap-2 rounded-xl bg-content2 px-3 py-3">
			<View className="flex-row items-center gap-2">
				<Ionicons name="pricetag-outline" size={16} color={mutedColor} />
				<Text.Paragraph type="body-xs" color="muted">
					选择话题
				</Text.Paragraph>
			</View>
			<ScrollView
				horizontal
				keyboardShouldPersistTaps="handled"
				showsHorizontalScrollIndicator={false}
				contentContainerClassName="gap-2 pr-3"
			>
				{queryTopic ? (
					<SuggestionChip
						label={`添加${formatTopicLabel(queryTopic)}`}
						onPress={() => onSelect(queryTopic)}
					/>
				) : null}
				{suggestions.map((item) => (
					<SuggestionChip
						key={item}
						label={formatTopicLabel(item)}
						onPress={() => onSelect(item)}
					/>
				))}
			</ScrollView>
		</View>
	);
}

export function InlineMentionPicker({
	onSelect,
	query,
}: {
	onSelect: (value: string) => void;
	query: string;
}) {
	const mutedColor = useThemeColor("muted");
	const keyword = query.trim().replace(/^@/, "");
	const users = useQuery({
		queryKey: nativeQueryKeys.create.mentionUsers(keyword),
		queryFn: () =>
			client.searchUsers({
				keyword,
				limit: 8,
			}),
	});
	const items = (users.data ?? []) as MentionUser[];

	return (
		<View className="gap-2 rounded-xl bg-content2 px-3 py-3">
			<View className="flex-row items-center gap-2">
				<Ionicons name="at-outline" size={16} color={mutedColor} />
				<Text.Paragraph type="body-xs" color="muted">
					选择用户
				</Text.Paragraph>
			</View>
			{users.isLoading ? (
				<View className="items-center py-3">
					<Spinner size="sm" />
				</View>
			) : items.length > 0 ? (
				<View className="gap-1">
					{items.map((item) => (
						<PressableFeedback
							key={item.id}
							accessibilityLabel={`提及 ${item.name}`}
							accessibilityRole="button"
							className="flex-row items-center gap-3 rounded-lg px-1 py-2"
							onPress={() => onSelect(item.handle ?? item.name)}
						>
							<Avatar size="sm" alt={item.name}>
								{item.image ? (
									<Avatar.Image source={{ uri: item.image }} />
								) : null}
								<Avatar.Fallback>{item.name.slice(0, 1)}</Avatar.Fallback>
							</Avatar>
							<View className="min-w-0 flex-1">
								<Text.Paragraph weight="semibold" numberOfLines={1}>
									{item.name}
								</Text.Paragraph>
								<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
									{formatMentionHandle(item.handle ?? item.name)}
								</Text.Paragraph>
							</View>
						</PressableFeedback>
					))}
				</View>
			) : (
				<Text.Paragraph type="body-sm" color="muted" className="py-2">
					没有找到用户。
				</Text.Paragraph>
			)}
		</View>
	);
}
