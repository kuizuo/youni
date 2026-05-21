import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

type NoteCardProps = {
	note: {
		id: string;
		title: string;
		cover: string;
		likedCount: number;
		author: {
			name: string;
			image: string | null;
		};
	};
};

export function NoteCard({ note }: NoteCardProps) {
	return (
		<Link
			href={
				{ pathname: "/note/[id]", params: { id: note.id } } as unknown as Href
			}
			asChild
		>
			<Pressable className="flex-1 overflow-hidden rounded-xl bg-content2">
				<Image
					source={{ uri: note.cover }}
					className="h-44 w-full bg-content3"
					resizeMode="cover"
				/>
				<View className="gap-2 p-2">
					<Text
						className="font-semibold text-foreground text-sm"
						numberOfLines={2}
					>
						{note.title}
					</Text>
					<View className="flex-row items-center justify-between gap-2">
						<View className="min-w-0 flex-1 flex-row items-center gap-1.5">
							{note.author.image ? (
								<Image
									source={{ uri: note.author.image }}
									className="size-5 rounded-full bg-content3"
								/>
							) : (
								<View className="size-5 items-center justify-center rounded-full bg-content3">
									<Text className="text-[10px] text-foreground">
										{note.author.name.slice(0, 1)}
									</Text>
								</View>
							)}
							<Text
								className="flex-1 text-muted-foreground text-xs"
								numberOfLines={1}
							>
								{note.author.name}
							</Text>
						</View>
						<View className="flex-row items-center gap-1">
							<Ionicons name="heart-outline" size={14} color="#f43f5e" />
							<Text className="text-muted-foreground text-xs tabular-nums">
								{note.likedCount}
							</Text>
						</View>
					</View>
				</View>
			</Pressable>
		</Link>
	);
}
