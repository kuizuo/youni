import type { ProfileUser } from "@youni/api/contracts/profiles";
import { Avatar, PressableFeedback, Skeleton, Typography } from "heroui-native";
import { ScrollView, View } from "react-native";

const FILTER_SKELETON_ITEMS = [0, 1, 2, 3] as const;

export function FollowingAuthorFilter({
	isLoading,
	selectedUserId,
	users,
	onInteractionChange,
	onSelect,
}: {
	isLoading: boolean;
	selectedUserId: string | null;
	users: ProfileUser[];
	onInteractionChange: (active: boolean) => void;
	onSelect: (userId: string) => void;
}) {
	if (!isLoading && users.length === 0) return null;

	return (
		<View className="bg-background py-2.5">
			<ScrollView
				horizontal
				directionalLockEnabled
				nestedScrollEnabled
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ gap: 10, paddingHorizontal: 12 }}
				onTouchCancel={() => onInteractionChange(false)}
				onTouchEnd={() => onInteractionChange(false)}
				onTouchStart={() => onInteractionChange(true)}
			>
				{isLoading
					? FILTER_SKELETON_ITEMS.map((item) => (
							<View
								key={item}
								className="items-center gap-1.5"
								style={{ width: 58 }}
							>
								<Skeleton
									animation={{ exiting: "disabled" }}
									className="size-12 rounded-full"
								/>
								<Skeleton
									animation={{ exiting: "disabled" }}
									className="h-3 w-12 rounded-full"
								/>
							</View>
						))
					: users.map((user) => {
							const selected = user.id === selectedUserId;

							return (
								<PressableFeedback
									key={user.id}
									accessibilityRole="button"
									accessibilityLabel={`${selected ? "取消筛选" : "只看"} ${user.name} 的图文`}
									accessibilityState={{ selected }}
									className="items-center gap-1.5"
									style={{ width: 58 }}
									onPress={() => onSelect(user.id)}
								>
									<View
										className={
											selected
												? "rounded-full border-2 border-accent p-0.5"
												: "rounded-full border-2 border-transparent p-0.5"
										}
									>
										<Avatar size="md" alt={user.name} className="size-11">
											{user.image ? (
												<Avatar.Image source={{ uri: user.image }} />
											) : null}
											<Avatar.Fallback>{user.name.slice(0, 1)}</Avatar.Fallback>
										</Avatar>
									</View>
									<Typography.Paragraph
										weight={selected ? "semibold" : "normal"}
										numberOfLines={1}
										className={selected ? "text-foreground" : "text-muted"}
										type="body-sm"
									>
										{user.name}
									</Typography.Paragraph>
								</PressableFeedback>
							);
						})}
			</ScrollView>
		</View>
	);
}
