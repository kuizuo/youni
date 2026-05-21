import { useQuery } from "@tanstack/react-query";
import { Button } from "heroui-native";
import { FlatList, Image, ScrollView, Text, View } from "react-native";

import { AuthPanel } from "@/components/auth-panel";
import { NoteCard } from "@/components/note-card";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

export default function MeScreen() {
	const session = authClient.useSession();
	const me = useQuery({
		...orpc.social.me.queryOptions(),
		enabled: !!session.data?.user,
	});

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

	return (
		<FlatList
			data={me.data?.notes ?? []}
			keyExtractor={(item) => item.id}
			numColumns={2}
			contentInsetAdjustmentBehavior="automatic"
			columnWrapperClassName="gap-3 px-3"
			contentContainerClassName="gap-3 py-3"
			ListHeaderComponent={
				<View className="gap-4 px-3">
					<View className="flex-row items-center gap-3">
						{me.data?.profile.image ? (
							<Image
								source={{ uri: me.data.profile.image }}
								className="size-16 rounded-full bg-content3"
							/>
						) : (
							<View className="size-16 items-center justify-center rounded-full bg-content3">
								<Text className="text-foreground text-xl">
									{session.data.user.name.slice(0, 1)}
								</Text>
							</View>
						)}
						<View className="flex-1">
							<Text className="font-semibold text-foreground text-xl">
								{me.data?.profile.name ?? session.data.user.name}
							</Text>
							<Text className="text-muted-foreground text-sm">
								{me.data?.profile.bio || "还没有简介"}
							</Text>
						</View>
						<Button
							variant="ghost"
							onPress={() => {
								authClient.signOut();
								queryClient.clear();
							}}
						>
							<Button.Label>退出</Button.Label>
						</Button>
					</View>
					<View className="flex-row justify-around rounded-xl bg-content2 p-3">
						<Stat label="图文" value={me.data?.profile.noteCount ?? 0} />
						<Stat label="粉丝" value={me.data?.profile.followerCount ?? 0} />
						<Stat label="关注" value={me.data?.profile.followingCount ?? 0} />
						<Stat label="获赞" value={me.data?.profile.likedCount ?? 0} />
					</View>
					<Text className="font-semibold text-base text-foreground">
						我的图文
					</Text>
				</View>
			}
			renderItem={({ item }) => <NoteCard note={item} />}
			ListEmptyComponent={
				<View className="items-center px-6 py-16">
					<Text className="text-muted-foreground">
						{me.isLoading
							? "正在加载"
							: me.isError
								? "个人数据暂时加载失败"
								: "还没有发布图文"}
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
