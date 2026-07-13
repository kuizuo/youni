import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import {
	Avatar,
	ListGroup,
	Spinner,
	Switch,
	Typography,
	useThemeColor,
} from "heroui-native";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { AppSeparator } from "@/components/shared/app-separator";
import { ErrorState } from "@/components/social-states";
import { FollowButton } from "@/components/users/follow-button";
import { isRegisteredUser } from "@/lib/anonymous-session";
import { refreshActiveQueries } from "@/lib/query/optimistic-cache";
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
		enabled: Boolean(
			conversationId && isRegisteredUser(socialActions.session.data?.user),
		),
	});
	const data = settings.data;
	const isFollowing = socialActions.optimistic.follow(
		data?.peer.id ?? "",
		data?.isFollowing ?? false,
	).active;
	const isBlocked = data?.hasBlockedPeer ?? false;

	const blockMutation = useMutation(
		orpc.messages.setBlocked.mutationOptions({
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
			onSuccess: refreshActiveQueries,
		}),
	);
	const clearMutation = useMutation(
		orpc.messages.clear.mutationOptions({
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
			onSuccess: refreshActiveQueries,
		}),
	);

	const toggleFollow = () => {
		if (!data?.peer.id) return;
		fireHaptic();
		socialActions.toggleFollow(
			{ active: isFollowing, userId: data.peer.id },
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
					<ErrorState onRetry={() => settings.refetch()} />
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
								<Typography.Paragraph weight="bold" className="text-center">
									{data.peer.name}
								</Typography.Paragraph>
								<Typography.Paragraph type="body-xs" color="muted">
									{data.peer.handle ? `@${data.peer.handle}` : data.peer.email}
								</Typography.Paragraph>
							</View>
							<FollowButton
								className="min-w-32 rounded-full"
								isFollowing={isFollowing}
								showIcon
								onPress={toggleFollow}
							/>
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
