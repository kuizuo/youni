import { useQuery } from "@tanstack/react-query";
import { FlatList, RefreshControl, Text, View } from "react-native";

import { NoteCard } from "@/components/note-card";
import { orpc } from "@/utils/orpc";

export default function Home() {
	const feed = useQuery(
		orpc.social.feed.queryOptions({ input: { limit: 40 } }),
	);

	return (
		<FlatList
			data={feed.data ?? []}
			keyExtractor={(item) => item.id}
			numColumns={2}
			contentInsetAdjustmentBehavior="automatic"
			ListHeaderComponent={
				<View className="gap-1 px-4 pt-4 pb-2">
					<Text className="font-semibold text-2xl text-foreground">发现</Text>
					<Text className="text-muted-foreground text-sm">
						看看大家最近分享的灵感、清单和生活方式。
					</Text>
				</View>
			}
			columnWrapperClassName="px-2"
			contentContainerClassName="pb-4"
			refreshControl={
				<RefreshControl
					refreshing={feed.isRefetching}
					onRefresh={feed.refetch}
				/>
			}
			renderItem={({ item }) => <NoteCard note={item} />}
			ListEmptyComponent={
				<View className="flex-1 items-center justify-center px-6 py-24">
					<Text className="text-center text-muted-foreground">
						{feed.isLoading
							? "正在加载内容"
							: feed.isError
								? "内容暂时加载失败，请稍后再试"
								: "还没有已发布的图文"}
					</Text>
				</View>
			}
		/>
	);
}
