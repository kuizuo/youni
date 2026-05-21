import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useToast } from "heroui-native";
import { useState } from "react";
import {
	Image,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

import { AuthPanel } from "@/components/auth-panel";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

const sampleImages = [
	"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80",
];

const topicPresets = ["穿搭", "美食", "周末", "旅行", "灵感", "好物"];

export default function CreateScreen() {
	const router = useRouter();
	const session = authClient.useSession();
	const { toast } = useToast();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [imageText, setImageText] = useState("");
	const [topicText, setTopicText] = useState("");
	const createMutation = useMutation(
		orpc.social.create.mutationOptions({
			onSuccess: () => {
				toast.show({ variant: "success", label: "已提交审核" });
				setTitle("");
				setContent("");
				setImageText("");
				setTopicText("");
				queryClient.refetchQueries();
				router.replace("/me" as Href);
			},
			onError: (error) => {
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);

	if (!session.data?.user) {
		return (
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 p-4"
			>
				<AuthPanel />
			</ScrollView>
		);
	}

	const imageUrls = imageText
		.split(/\s+/)
		.map((item) => item.trim())
		.filter(Boolean)
		.slice(0, 9);
	const topics = topicText
		.split(/[,\s，#]+/)
		.map((item) => item.trim())
		.filter(Boolean);

	const appendImage = (url: string) => {
		if (imageUrls.includes(url) || imageUrls.length >= 9) return;
		setImageText([...imageUrls, url].join("\n"));
	};

	const appendTopic = (topic: string) => {
		if (topics.includes(topic)) return;
		setTopicText([...topics, topic].join(" "));
	};

	return (
		<ScrollView
			contentInsetAdjustmentBehavior="automatic"
			contentContainerClassName="gap-5 p-4 pb-10"
		>
			<View className="flex-row items-center justify-between">
				<View>
					<Text className="font-semibold text-2xl text-foreground">
						发布图文
					</Text>
					<Text className="mt-1 text-muted-foreground text-sm">
						第一阶段使用图片链接，提交后进入后台审核。
					</Text>
				</View>
				<Pressable
					disabled={
						!title.trim() ||
						!content.trim() ||
						imageUrls.length === 0 ||
						createMutation.isPending
					}
					onPress={() =>
						createMutation.mutate({ title, content, images: imageUrls, topics })
					}
					className="h-9 items-center justify-center rounded-full bg-primary px-4 disabled:opacity-50"
				>
					<Text className="font-medium text-primary-foreground text-sm">
						{createMutation.isPending ? "提交中" : "发布"}
					</Text>
				</Pressable>
			</View>

			<View className="gap-3">
				<Text className="font-medium text-foreground text-sm">图片</Text>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View className="flex-row gap-3 pr-4">
						{imageUrls.map((url) => (
							<Image
								key={url}
								source={{ uri: url }}
								className="size-28 rounded-xl bg-content3"
								resizeMode="cover"
							/>
						))}
						<View className="size-28 items-center justify-center rounded-xl border border-content3 border-dashed bg-content2">
							<Ionicons name="image-outline" size={28} color="#8a8a8a" />
							<Text className="mt-1 text-muted-foreground text-xs">
								{imageUrls.length}/9
							</Text>
						</View>
					</View>
				</ScrollView>
				<View className="flex-row flex-wrap gap-2">
					{sampleImages.map((url, index) => (
						<Pressable
							key={url}
							onPress={() => appendImage(url)}
							className="rounded-full bg-content2 px-3 py-1.5"
						>
							<Text className="text-foreground text-xs">
								示例图 {index + 1}
							</Text>
						</Pressable>
					))}
				</View>
				<TextInput
					value={imageText}
					onChangeText={setImageText}
					multiline
					autoCapitalize="none"
					placeholder="也可以粘贴图片链接，每行或空格分隔"
					placeholderTextColor="#8a8a8a"
					className="min-h-20 rounded-xl bg-content2 px-3 py-3 text-foreground"
					textAlignVertical="top"
				/>
			</View>

			<View className="gap-2">
				<Text className="font-medium text-foreground text-sm">标题</Text>
				<TextInput
					value={title}
					onChangeText={setTitle}
					placeholder="写一个吸引人的标题"
					placeholderTextColor="#8a8a8a"
					className="h-11 rounded-xl bg-content2 px-3 text-foreground"
				/>
			</View>
			<View className="gap-2">
				<Text className="font-medium text-foreground text-sm">正文</Text>
				<TextInput
					value={content}
					onChangeText={setContent}
					multiline
					placeholder="分享你的体验、清单或灵感"
					placeholderTextColor="#8a8a8a"
					className="min-h-32 rounded-xl bg-content2 px-3 py-3 text-foreground"
					textAlignVertical="top"
				/>
			</View>
			<View className="gap-3">
				<Text className="font-medium text-foreground text-sm">话题</Text>
				<View className="flex-row flex-wrap gap-2">
					{topicPresets.map((topic) => (
						<Pressable
							key={topic}
							onPress={() => appendTopic(topic)}
							className="rounded-full bg-content2 px-3 py-1.5"
						>
							<Text className="text-foreground text-xs">#{topic}</Text>
						</Pressable>
					))}
				</View>
				<TextInput
					value={topicText}
					onChangeText={setTopicText}
					placeholder="例如：穿搭 美食 周末"
					placeholderTextColor="#8a8a8a"
					className="h-11 rounded-xl bg-content2 px-3 text-foreground"
				/>
			</View>
		</ScrollView>
	);
}
