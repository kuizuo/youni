import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";

import { NoteCard } from "@/components/note-card";
import { orpc } from "@/utils/orpc";

export default function SearchScreen() {
	const [keyword, setKeyword] = useState("");
	const input = useMemo(
		() => ({ keyword: keyword.trim() || undefined, limit: 40 }),
		[keyword],
	);
	const notes = useQuery(orpc.social.feed.queryOptions({ input }));
	const topics = useQuery(
		orpc.social.topics.queryOptions({
			input: { keyword: keyword.trim() || undefined, limit: 12 },
		}),
	);

	return (
		<FlatList
			data={notes.data ?? []}
			keyExtractor={(item) => item.id}
			numColumns={2}
			contentInsetAdjustmentBehavior="automatic"
			columnWrapperClassName="gap-3 px-3"
			contentContainerClassName="gap-3 py-3"
			ListHeaderComponent={
				<View className="gap-3 px-3">
					<TextInput
						value={keyword}
						onChangeText={setKeyword}
						placeholder="搜索图文或话题"
						placeholderTextColor="#8a8a8a"
						className="h-11 rounded-full bg-content2 px-4 text-foreground"
					/>
					<View className="flex-row flex-wrap gap-2">
						{topics.isError ? (
							<Text className="text-muted-foreground text-xs">
								话题暂时加载失败
							</Text>
						) : null}
						{topics.data?.map((item) => (
							<View
								key={item.id}
								className="rounded-full bg-content2 px-3 py-1.5"
							>
								<Text className="text-foreground text-xs">
									#{item.name} · {item.noteCount}
								</Text>
							</View>
						))}
					</View>
				</View>
			}
			renderItem={({ item }) => <NoteCard note={item} />}
			ListEmptyComponent={
				<View className="items-center px-6 py-16">
					<Text className="text-muted-foreground">
						{notes.isLoading
							? "正在搜索"
							: notes.isError
								? "搜索暂时失败，请稍后再试"
								: "没有匹配的图文"}
					</Text>
				</View>
			}
		/>
	);
}
