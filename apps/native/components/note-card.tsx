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
		collectedCount?: number;
		commentCount?: number;
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
			<Pressable className="m-1 flex-1 overflow-hidden rounded-md bg-content2 shadow-sm">
				<Image
					source={{ uri: note.cover }}
					className="h-48 w-full bg-content3"
					resizeMode="cover"
				/>
				<View className="gap-2 p-2.5">
					<Text
						className="font-semibold text-foreground text-sm leading-5"
						numberOfLines={2}
					>
						{note.title}
					</Text>
					<View className="flex-row items-center justify-between gap-2">
						<View className="min-w-0 flex-1 flex-row items-center gap-1.5">
							<Avatar name={note.author.name} image={note.author.image} />
							<Text
								className="flex-1 text-muted-foreground text-xs"
								numberOfLines={1}
							>
								{note.author.name}
							</Text>
						</View>
						<View className="flex-row items-center gap-1">
							<Ionicons name="heart" size={14} color="#f43f5e" />
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

function Avatar({ name, image }: { name: string; image: string | null }) {
	if (image) {
		return (
			<Image
				source={{ uri: image }}
				className="size-6 rounded-full bg-content3"
			/>
		);
	}

	return (
		<View className="size-6 items-center justify-center rounded-full bg-primary">
			<Text className="font-medium text-[10px] text-primary-foreground">
				{name.slice(0, 1)}
			</Text>
		</View>
	);
}
