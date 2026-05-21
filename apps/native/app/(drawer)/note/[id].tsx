import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { Link, useLocalSearchParams } from "expo-router";
import { useToast } from "heroui-native";
import { useState } from "react";
import {
	Alert,
	Image,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export default function NoteDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const session = authClient.useSession();
	const { toast } = useToast();
	const [commentText, setCommentText] = useState("");
	const note = useQuery({
		...orpc.social.byId.queryOptions({ input: { id } }),
		enabled: !!id,
	});

	const likeMutation = useMutation(
		orpc.social.toggleLike.mutationOptions({ onSuccess: () => note.refetch() }),
	);
	const collectMutation = useMutation(
		orpc.social.toggleCollect.mutationOptions({
			onSuccess: () => note.refetch(),
		}),
	);
	const commentMutation = useMutation(
		orpc.social.addComment.mutationOptions({
			onSuccess: () => {
				setCommentText("");
				note.refetch();
			},
		}),
	);

	const requireLogin = () => {
		if (!session.data?.user) {
			Alert.alert("请先登录", "到“我的”页面登录后即可互动。");
			return false;
		}
		return true;
	};

	if (note.isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<Text className="text-muted-foreground">正在加载</Text>
			</View>
		);
	}

	if (note.isError || !note.data) {
		return (
			<View className="flex-1 items-center justify-center px-6">
				<Text className="text-center text-muted-foreground">
					{note.isError ? "图文暂时加载失败" : "图文不存在或还没有发布"}
				</Text>
			</View>
		);
	}

	return (
		<View className="flex-1">
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pb-28"
			>
				<ScrollView
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
				>
					{note.data.images.map((image) => (
						<Image
							key={image}
							source={{ uri: image }}
							className="h-96 w-screen bg-content3"
							resizeMode="cover"
						/>
					))}
				</ScrollView>
				<View className="gap-4 px-4">
					<Link
						href={
							{
								pathname: "/user/[id]",
								params: { id: note.data.author.id },
							} as unknown as Href
						}
						asChild
					>
						<Text className="font-medium text-muted-foreground text-sm">
							{note.data.author.name}
						</Text>
					</Link>
					<Text selectable className="font-semibold text-foreground text-xl">
						{note.data.title}
					</Text>
					<Text selectable className="text-base text-foreground leading-6">
						{note.data.content}
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{note.data.topics.map((topic) => (
							<View
								key={topic}
								className="rounded-full bg-content2 px-3 py-1.5"
							>
								<Text className="text-foreground text-xs">#{topic}</Text>
							</View>
						))}
					</View>
					<View className="h-px bg-content3" />
					<Text className="font-semibold text-base text-foreground">评论</Text>
					<View className="gap-3">
						{note.data.comments.map((item) => (
							<View key={item.id} className="rounded-xl bg-content2 p-3">
								<Text className="font-medium text-foreground text-sm">
									{item.authorName}
								</Text>
								<Text selectable className="mt-1 text-foreground text-sm">
									{item.content}
								</Text>
							</View>
						))}
						{note.data.comments.length === 0 ? (
							<Text className="text-muted-foreground text-sm">还没有评论</Text>
						) : null}
					</View>
				</View>
			</ScrollView>
			<View className="absolute right-0 bottom-0 left-0 gap-2 border-content3 border-t bg-background p-3">
				<View className="flex-row gap-2">
					<TextInput
						value={commentText}
						onChangeText={setCommentText}
						placeholder="写评论"
						placeholderTextColor="#8a8a8a"
						className="h-10 flex-1 rounded-full bg-content2 px-4 text-foreground"
					/>
					<Pressable
						disabled={!commentText.trim() || commentMutation.isPending}
						onPress={() => {
							if (requireLogin()) {
								commentMutation.mutate({
									noteId: note.data.id,
									content: commentText,
								});
							}
						}}
						className="h-10 items-center justify-center rounded-full bg-primary px-4 disabled:opacity-50"
					>
						<Text className="font-medium text-primary-foreground text-sm">
							发送
						</Text>
					</Pressable>
				</View>
				<View className="flex-row justify-around">
					<ActionButton
						icon={note.data.liked ? "heart" : "heart-outline"}
						label={`${note.data.likedCount}`}
						onPress={() => {
							if (requireLogin()) likeMutation.mutate({ id: note.data.id });
						}}
					/>
					<ActionButton
						icon={note.data.collected ? "bookmark" : "bookmark-outline"}
						label={`${note.data.collectedCount}`}
						onPress={() => {
							if (requireLogin()) collectMutation.mutate({ id: note.data.id });
						}}
					/>
					<ActionButton
						icon="chatbubble-outline"
						label={`${note.data.commentCount}`}
						onPress={() => toast.show({ label: "向下查看评论" })}
					/>
				</View>
			</View>
		</View>
	);
}

function ActionButton({
	icon,
	label,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			className="h-9 flex-row items-center justify-center gap-1 rounded-full px-3"
		>
			<Ionicons name={icon} size={18} color="#f43f5e" />
			<Text className="text-foreground text-sm">{label}</Text>
		</Pressable>
	);
}
