import { Ionicons } from "@expo/vector-icons";
import { Avatar, Button, Text, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";

import type { ChatPeer } from "./types";

export function ChatHeader({
	peer,
	topInset,
	onBack,
	onOpenPeer,
}: {
	peer?: ChatPeer;
	topInset: number;
	onBack: () => void;
	onOpenPeer: (id: string) => void;
}) {
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");

	return (
		<View
			className="bg-background px-4 pb-3"
			style={{ paddingTop: topInset + 8 }}
		>
			<View className="h-12 flex-row items-center gap-3">
				<Button
					isIconOnly
					size="sm"
					variant="ghost"
					className="rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="返回"
					onPress={onBack}
				>
					<Ionicons name="chevron-back" size={24} color={mutedColor} />
				</Button>
				{peer ? (
					<Avatar size="sm" alt={peer.name}>
						{peer.image ? <Avatar.Image source={{ uri: peer.image }} /> : null}
						<Avatar.Fallback>{peer.name.slice(0, 1)}</Avatar.Fallback>
					</Avatar>
				) : null}
				<View className="min-w-0 flex-1">
					<Text.Paragraph weight="bold" numberOfLines={1}>
						{peer?.name ?? "私信"}
					</Text.Paragraph>
					<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
						{peer?.handle ? `@${peer.handle}` : "实时同步中"}
					</Text.Paragraph>
				</View>
				{peer ? (
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						className="rounded-full"
						accessibilityLabel="查看主页"
						onPress={() => onOpenPeer(peer.id)}
					>
						<Ionicons
							name="person-circle-outline"
							size={24}
							color={foregroundColor}
						/>
					</Button>
				) : null}
			</View>
			<AppSeparator className="-mx-4 mt-3" />
		</View>
	);
}
