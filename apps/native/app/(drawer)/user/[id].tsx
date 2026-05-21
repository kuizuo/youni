import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Button } from "heroui-native";
import { Alert, FlatList, Image, Text, View } from "react-native";

import { NoteCard } from "@/components/note-card";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export default function UserProfileScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const session = authClient.useSession();
	const profile = useQuery({
		...orpc.social.profile.queryOptions({ input: { userId: id } }),
		enabled: !!id,
	});
	const followMutation = useMutation(
		orpc.social.toggleFollow.mutationOptions({
			onSuccess: () => profile.refetch(),
		}),
	);

	return (
		<FlatList
			data={profile.data?.notes ?? []}
			keyExtractor={(item) => item.id}
			numColumns={2}
			contentInsetAdjustmentBehavior="automatic"
			columnWrapperClassName="gap-3 px-3"
			contentContainerClassName="gap-3 py-3"
			ListHeaderComponent={
				<View className="gap-4 px-3">
					<View className="flex-row items-center gap-3">
						{profile.data?.profile.image ? (
							<Image
								source={{ uri: profile.data.profile.image }}
								className="size-16 rounded-full bg-content3"
							/>
						) : (
							<View className="size-16 items-center justify-center rounded-full bg-content3">
								<Text className="text-foreground text-xl">
									{profile.data?.profile.name.slice(0, 1) ?? "U"}
								</Text>
							</View>
						)}
						<View className="flex-1">
							<Text className="font-semibold text-foreground text-xl">
								{profile.data?.profile.name ?? "用户"}
							</Text>
							<Text className="text-muted-foreground text-sm">
								{profile.data?.profile.bio || "还没有简介"}
							</Text>
						</View>
						{session.data?.user?.id !== id ? (
							<Button
								variant={
									profile.data?.profile.isFollowing ? "secondary" : undefined
								}
								onPress={() => {
									if (!session.data?.user) {
										Alert.alert("请先登录", "到“我的”页面登录后即可关注。");
										return;
									}
									followMutation.mutate({ userId: id });
								}}
							>
								<Button.Label>
									{profile.data?.profile.isFollowing ? "已关注" : "关注"}
								</Button.Label>
							</Button>
						) : null}
					</View>
					<View className="flex-row justify-around rounded-xl bg-content2 p-3">
						<Stat label="图文" value={profile.data?.profile.noteCount ?? 0} />
						<Stat
							label="粉丝"
							value={profile.data?.profile.followerCount ?? 0}
						/>
						<Stat
							label="关注"
							value={profile.data?.profile.followingCount ?? 0}
						/>
						<Stat label="获赞" value={profile.data?.profile.likedCount ?? 0} />
					</View>
					<Text className="font-semibold text-base text-foreground">发布</Text>
				</View>
			}
			renderItem={({ item }) => <NoteCard note={item} />}
			ListEmptyComponent={
				<View className="items-center px-6 py-16">
					<Text className="text-muted-foreground">
						{profile.isLoading
							? "正在加载"
							: profile.isError
								? "个人页暂时加载失败"
								: "还没有公开图文"}
					</Text>
				</View>
			}
		/>
	);
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<View className="items-center gap-1">
			<Text className="font-semibold text-base text-foreground tabular-nums">
				{value}
			</Text>
			<Text className="text-muted-foreground text-xs">{label}</Text>
		</View>
	);
}
