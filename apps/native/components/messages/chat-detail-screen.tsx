import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Avatar,
	Button,
	cn,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo, useState } from "react";
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

type ChatMessage = {
	content: string;
	createdAt: Date | string;
	id: string;
	senderId: string;
};

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

function formatTime(value: Date | string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return `${String(date.getHours()).padStart(2, "0")}:${String(
		date.getMinutes(),
	).padStart(2, "0")}`;
}

export default function ChatDetailScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const conversationId = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");
	const fieldForegroundColor = useThemeColor("field-foreground");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const [content, setContent] = useState("");
	const chat = useQuery({
		...orpc.messages.byId.queryOptions({
			input: { conversationId: conversationId || "missing", limit: 80 },
		}),
		enabled: Boolean(conversationId && session.data?.user),
		refetchInterval: 2500,
	});
	const sendMutation = useMutation(
		orpc.messages.send.mutationOptions({
			onSuccess: async () => {
				setContent("");
				await Promise.all([chat.refetch(), queryClient.refetchQueries()]);
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const messages = useMemo(
		() => (chat.data?.messages ?? []) as ChatMessage[],
		[chat.data?.messages],
	);
	const peer = chat.data?.peer;
	const canSend = content.trim().length > 0 && !sendMutation.isPending;

	const send = () => {
		const nextContent = content.trim();
		if (!nextContent || !conversationId) return;
		sendMutation.mutate({ conversationId, content: nextContent });
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-background"
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<View
				className="border-border-secondary border-b bg-background px-4 pb-3"
				style={{ paddingTop: insets.top + 8 }}
			>
				<View className="h-12 flex-row items-center gap-3">
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						accessibilityLabel="返回"
						onPress={() => router.back()}
					>
						<Ionicons name="chevron-back" size={24} color={mutedColor} />
					</Button>
					{peer ? (
						<Avatar size="sm" alt={peer.name}>
							{peer.image ? (
								<Avatar.Image source={{ uri: peer.image }} />
							) : null}
							<Avatar.Fallback>{peer.name.slice(0, 1)}</Avatar.Fallback>
						</Avatar>
					) : null}
					<View className="min-w-0 flex-1">
						<Text.Paragraph weight="bold" numberOfLines={1}>
							{peer?.name ?? "私信"}
						</Text.Paragraph>
						<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
							{peer?.handle ? `@${peer.handle}` : "实时同步中"}
						</Text.Paragraph>
					</View>
					{peer ? (
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							className="rounded-full"
							accessibilityLabel="查看主页"
							onPress={() =>
								router.push({
									pathname: "/user/[id]",
									params: { id: peer.id },
								} as unknown as Href)
							}
						>
							<Ionicons
								name="person-circle-outline"
								size={24}
								color={foregroundColor}
							/>
						</Button>
					) : null}
				</View>
			</View>

			{chat.isError ? (
				<View className="flex-1 justify-center">
					<ErrorState
						description="聊天暂时没有加载出来，请稍后重试。"
						onRetry={() => chat.refetch()}
					/>
				</View>
			) : (
				<FlatList
					className="flex-1"
					data={messages}
					keyExtractor={(item) => item.id}
					contentContainerClassName="gap-3 px-4 py-4"
					renderItem={({ item }) => (
						<MessageBubble
							item={item}
							isMine={item.senderId === session.data?.user?.id}
						/>
					)}
					ListEmptyComponent={
						chat.isLoading ? (
							<View className="items-center py-16">
								<Spinner />
							</View>
						) : (
							<View className="items-center py-16">
								<Text.Paragraph type="body-sm" color="muted">
									还没有消息，先打个招呼。
								</Text.Paragraph>
							</View>
						)
					}
				/>
			)}

			<View
				className="flex-row items-end gap-2 border-border-secondary border-t bg-background px-3 pt-3"
				style={{ paddingBottom: insets.bottom + 10 }}
			>
				<View className="min-h-11 flex-1 justify-center rounded-3xl bg-content2 px-4 py-2">
					<TextInput
						value={content}
						onChangeText={setContent}
						placeholder="发送私信"
						placeholderTextColor={mutedColor}
						multiline
						maxLength={1000}
						style={{
							color: fieldForegroundColor,
							fontSize: 16,
							lineHeight: 22,
							maxHeight: 120,
							padding: 0,
						}}
					/>
				</View>
				<Button
					isIconOnly
					variant={canSend ? "primary" : "secondary"}
					className="h-11 w-11 rounded-full"
					feedbackVariant="scale-ripple"
					isDisabled={!canSend}
					accessibilityLabel="发送"
					onPress={send}
				>
					{sendMutation.isPending ? (
						<Spinner size="sm" />
					) : (
						<Ionicons
							name="send"
							size={18}
							color={canSend ? accentForegroundColor : foregroundColor}
						/>
					)}
				</Button>
			</View>
		</KeyboardAvoidingView>
	);
}

function MessageBubble({
	isMine,
	item,
}: {
	isMine: boolean;
	item: ChatMessage;
}) {
	return (
		<View className={cn("gap-1", isMine ? "items-end" : "items-start")}>
			<View
				className={cn(
					"max-w-[78%] rounded-3xl px-4 py-2",
					isMine ? "bg-accent" : "bg-content2",
				)}
			>
				<Text.Paragraph
					className={isMine ? "text-accent-foreground" : "text-foreground"}
				>
					{item.content}
				</Text.Paragraph>
			</View>
			<Text.Paragraph type="body-xs" color="muted">
				{formatTime(item.createdAt)}
			</Text.Paragraph>
		</View>
	);
}
