import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	Avatar,
	Button,
	Card,
	Spinner,
	Typography,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";

import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc } from "@/utils/orpc";

export function BlockedUsersCard() {
	const mutedColor = useThemeColor("muted");
	const { toast } = useAppToast();
	const blockedUsers = useQuery(orpc.blockedUsers.queryOptions());
	const unblock = useMutation(
		orpc.setBlocked.mutationOptions({
			onError: (error) => {
				toast.show({ label: error.message, variant: "danger" });
			},
			onSuccess: () => {
				toast.show({ label: "已解除拉黑", variant: "success" });
				void blockedUsers.refetch();
			},
		}),
	);

	return (
		<Card className="rounded-2xl">
			<Card.Body className="gap-3 p-4">
				<View className="flex-row items-center justify-between gap-3">
					<View className="min-w-0 flex-1 gap-1">
						<Card.Title>黑名单</Card.Title>
						<Card.Description>
							你不会再看到这些用户，双方也不能私信。
						</Card.Description>
					</View>
					<Ionicons name="ban-outline" size={22} color={mutedColor} />
				</View>

				{blockedUsers.isLoading ? (
					<View className="items-center py-3">
						<Spinner size="sm" />
					</View>
				) : blockedUsers.data?.length ? (
					<View className="gap-2">
						{blockedUsers.data.map((item) => (
							<View
								className="flex-row items-center gap-3 rounded-xl bg-content2 p-3"
								key={item.id}
							>
								<Avatar size="sm" alt={item.name}>
									{item.image ? (
										<Avatar.Image source={{ uri: item.image }} />
									) : null}
									<Avatar.Fallback>{item.name.slice(0, 1)}</Avatar.Fallback>
								</Avatar>
								<View className="min-w-0 flex-1">
									<Typography.Paragraph weight="semibold">
										{item.name}
									</Typography.Paragraph>
									{item.handle ? (
										<Typography.Paragraph color="muted" type="body-xs">
											@{item.handle}
										</Typography.Paragraph>
									) : null}
								</View>
								<Button
									accessibilityLabel={`解除拉黑 ${item.name}`}
									accessibilityRole="button"
									isDisabled={unblock.isPending}
									size="sm"
									variant="outline"
									onPress={() => {
										fireHaptic();
										unblock.mutate({ blocked: false, userId: item.id });
									}}
								>
									<Button.Label>解除</Button.Label>
								</Button>
							</View>
						))}
					</View>
				) : (
					<Typography.Paragraph color="muted" type="body-sm">
						暂无已拉黑用户
					</Typography.Paragraph>
				)}
			</Card.Body>
		</Card>
	);
}
