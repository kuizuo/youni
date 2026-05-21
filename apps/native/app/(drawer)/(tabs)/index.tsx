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
			columnWrapperClassName="gap-3 px-3"
			contentContainerClassName="gap-3 py-3"
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
