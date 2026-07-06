import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import {
	Avatar,
	Button,
	ListGroup,
	Spinner,
	Switch,
	Text,
	useThemeColor,
} from "heroui-native";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { AppSeparator } from "@/components/shared/app-separator";
import { ErrorState } from "@/components/social-states";
import {
	applyConversationBlockedResult,
	invalidateConversation,
	optimisticClearConversation,
	optimisticSetConversationBlocked,
} from "@/lib/query/optimistic-cache";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";
import { getRouteParam } from "@/utils/route-params";

const SWITCH_THUMB_ANIMATION = {
	backgroundColor: {
		value: ["#FFFFFF", "#FFFFFF"] as [string, string],
		timingConfig: { duration: 175 },
	},
};

type ChatSettingsData = {
	hasBlockedPeer: boolean;
	id: string;
	isBlockedByPeer: boolean;
	isFollowing: boolean;
	peer: {
		bio: null | string;
		email: string;
		handle: null | string;
		id: string;
		image: null | string;
		name: string;
	};
};

export default function ChatSettingsScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const conversationId = getRouteParam(params.id) ?? "";
	const insets = useSafeAreaInsets();
	const foregroundColor = useThemeColor("foreground");
	const dangerColor = useThemeColor("danger");
	const { toast } = useAppToast();
	const socialActions = useSocialActions();

	const settings = useQuery({
		...orpc.messages.settings.queryOptions({
			input: { conversationId: conversationId || "missing" },
		}),
		enabled: Boolean(conversationId && socialActions.session.data?.user),
	});
	const data = settings.data as ChatSettingsData | undefined;
	const isFollowing = data?.isFollowing ?? false;
	const isBlocked = data?.hasBlockedPeer ?? false;

	const blockMutation = useMutation(
		orpc.messages.setBlocked.mutationOptions<{ rollback?: () => void }>({
			onError: (error, _variables, context) => {
				context?.rollback?.();
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
			onMutate: (variables) =>
				optimisticSetConversationBlocked({
					blocked: variables.blocked,
					conversationId: variables.conversationId,
				}),
			onSettled: (_data, _error, variables) => {
				void invalidateConversation(variables.conversationId);
			},
			onSuccess: (result, variables) => {
				applyConversationBlockedResult({
					blocked: result.blocked,
					conversationId: variables.conversationId,
					isBlockedByPeer: result.isBlockedByPeer,
				});
			},
		}),
	);
	const clearMutation = useMutation(
		orpc.messages.clear.mutationOptions<{ rollback?: () => void }>({
			onError: (error, _variables, context) => {
				context?.rollback?.();
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
			onMutate: (variables) =>
				optimisticClearConversation(variables.conversationId),
			onSettled: (_data, _error, variables) => {
				void invalidateConversation(variables.conversationId);
			},
		}),
	);

	const toggleFollow = () => {
		if (!data?.peer.id) return;
		if (socialActions.pending.follow(data.peer.id)) return;
		fireHaptic();
		socialActions.toggleFollow(
			{ userId: data.peer.id },
			{
				redirectTo: `/chat-settings/${conversationId}`,
			},
		);
	};

	const setBlocked = (blocked: boolean) => {
		if (!conversationId || blockMutation.isPending) return;
		fireHaptic();
		blockMutation.mutate({ conversationId, blocked });
	};

	const confirmClear = () => {
		if (!conversationId || clearMutation.isPending) return;
		fireHaptic();
		Alert.alert("清空聊天记录", "只会清空你看到的聊天记录，对方不受影响。", [
			{ text: "取消", style: "cancel" },
			{
				text: "清空",
				style: "destructive",
				onPress: () => clearMutation.mutate({ conversationId }),
			},
		]);
	};

	const displayedBlockState = blockMutation.isPending
		? (blockMutation.variables?.blocked ?? isBlocked)
		: isBlocked;

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="聊天设置" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="px-4 pt-6"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				{settings.isLoading ? (
					<View className="items-center justify-center py-24">
						<Spinner />
					</View>
				) : settings.isError || !data ? (
					<ErrorState
						description="聊天设置暂时没有加载出来，请稍后重试。"
						onRetry={() => settings.refetch()}
					/>
				) : (
					<View className="gap-7">
						<View className="items-center gap-3">
							<Avatar size="lg" alt={data.peer.name} className="size-24">
								{data.peer.image ? (
									<Avatar.Image source={{ uri: data.peer.image }} />
								) : null}
								<Avatar.Fallback>{data.peer.name.slice(0, 1)}</Avatar.Fallback>
							</Avatar>
							<View className="items-center gap-1">
								<Text.Paragraph weight="bold" className="text-center">
									{data.peer.name}
								</Text.Paragraph>
								<Text.Paragraph type="body-xs" color="muted">
									{data.peer.handle ? `@${data.peer.handle}` : data.peer.email}
								</Text.Paragraph>
							</View>
							<Button
								variant={isFollowing ? "secondary" : "primary"}
								className="min-w-32 rounded-full"
								feedbackVariant="scale-ripple"
								onPress={toggleFollow}
							>
								<Ionicons
									name={
										isFollowing ? "checkmark-outline" : "person-add-outline"
									}
									size={16}
									color={foregroundColor}
								/>
								<Button.Label>{isFollowing ? "已关注" : "关注"}</Button.Label>
							</Button>
						</View>

						<ListGroup
							variant="secondary"
							className="overflow-hidden rounded-2xl"
						>
							<ListGroup.Item
								accessibilityLabel="加入黑名单"
								accessibilityRole="switch"
								accessibilityState={{ checked: displayedBlockState }}
								className="px-3.5 py-3"
								onPress={() => setBlocked(!displayedBlockState)}
							>
								<ListGroup.ItemPrefix>
									<Ionicons
										name="ban-outline"
										size={21}
										color={foregroundColor}
									/>
								</ListGroup.ItemPrefix>
								<ListGroup.ItemContent>
									<ListGroup.ItemTitle className="text-sm">
										加入黑名单
									</ListGroup.ItemTitle>
								</ListGroup.ItemContent>
								<ListGroup.ItemSuffix>
									<Switch
										isSelected={displayedBlockState}
										onSelectedChange={setBlocked}
										className="h-6 w-12"
									>
										<Switch.Thumb
											animation={SWITCH_THUMB_ANIMATION}
											className="bg-white"
										/>
									</Switch>
								</ListGroup.ItemSuffix>
							</ListGroup.Item>
							<AppSeparator className="opacity-60" />
							<ListGroup.Item
								accessibilityLabel="清空聊天记录"
								accessibilityRole="button"
								className="px-3.5 py-3"
								onPress={confirmClear}
							>
								<ListGroup.ItemPrefix>
									<Ionicons
										name="trash-outline"
										size={21}
										color={dangerColor}
									/>
								</ListGroup.ItemPrefix>
								<ListGroup.ItemContent>
									<ListGroup.ItemTitle className="text-danger text-sm">
										清空聊天记录
									</ListGroup.ItemTitle>
								</ListGroup.ItemContent>
							</ListGroup.Item>
						</ListGroup>
					</View>
				)}
			</ScrollView>
		</View>
	);
}
