import { useMutation } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Button, useToast } from "heroui-native";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { AuthPanel } from "@/components/auth-panel";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

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
		.filter(Boolean);
	const topics = topicText
		.split(/[,\s，#]+/)
		.map((item) => item.trim())
		.filter(Boolean);

	return (
		<ScrollView
			contentInsetAdjustmentBehavior="automatic"
			contentContainerClassName="gap-4 p-4"
		>
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
			<View className="gap-2">
				<Text className="font-medium text-foreground text-sm">图片链接</Text>
				<TextInput
					value={imageText}
					onChangeText={setImageText}
					multiline
					autoCapitalize="none"
					placeholder="每行或空格分隔，最多 9 张"
					placeholderTextColor="#8a8a8a"
					className="min-h-24 rounded-xl bg-content2 px-3 py-3 text-foreground"
					textAlignVertical="top"
				/>
			</View>
			<View className="gap-2">
				<Text className="font-medium text-foreground text-sm">话题</Text>
				<TextInput
					value={topicText}
					onChangeText={setTopicText}
					placeholder="例如：穿搭 美食 周末"
					placeholderTextColor="#8a8a8a"
					className="h-11 rounded-xl bg-content2 px-3 text-foreground"
				/>
			</View>
			<Button
				isDisabled={
					!title.trim() ||
					!content.trim() ||
					imageUrls.length === 0 ||
					createMutation.isPending
				}
				onPress={() =>
					createMutation.mutate({ title, content, images: imageUrls, topics })
				}
			>
				<Button.Label>
					{createMutation.isPending ? "提交中" : "提交审核"}
				</Button.Label>
			</Button>
		</ScrollView>
	);
}
