import { Ionicons } from "@expo/vector-icons";
import {
	cn,
	Menu,
	type MenuTriggerRef,
	PressableFeedback,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";

import { fireHaptic } from "@/lib/utils/fire-haptic";
import { formatTime } from "@/utils/format";
import type { ChatListMessage } from "./conversation-session";

const MESSAGE_LIST_HORIZONTAL_PADDING = 32;
const MESSAGE_BUBBLE_MAX_WIDTH_RATIO = 0.78;

export function MessageBubble({
	isMine,
	item,
	onCopy,
	onDelete,
	onRetry,
}: {
	isMine: boolean;
	item: ChatListMessage;
	onCopy: () => void;
	onDelete: () => void;
	onRetry?: () => void;
}) {
	const dangerColor = useThemeColor("danger");
	const foregroundColor = useThemeColor("foreground");
	const { width } = useWindowDimensions();
	const openedByLongPressRef = useRef(false);
	const triggerRef = useRef<MenuTriggerRef>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const isFailed = isMine && item.deliveryStatus === "failed";
	const isPending = isMine && item.deliveryStatus === "pending";

	return (
		<View className={cn("gap-1", isMine ? "items-end" : "items-start")}>
			<View className="max-w-full flex-row items-center justify-end gap-2">
				{isFailed ? (
					<PressableFeedback
						accessibilityRole="button"
						accessibilityLabel="发送失败，重新发送"
						accessibilityHint="点击后确认是否重新发送这条消息"
						className="size-8 items-center justify-center rounded-full"
						hitSlop={8}
						onPress={onRetry}
					>
						<Ionicons name="alert-circle" size={20} color={dangerColor} />
					</PressableFeedback>
				) : null}
				<Menu
					isOpen={isMenuOpen}
					onOpenChange={(open) => {
						if (!open) {
							openedByLongPressRef.current = false;
							setIsMenuOpen(false);
						} else if (openedByLongPressRef.current) {
							setIsMenuOpen(true);
						}
					}}
				>
					<Menu.Trigger
						delayLongPress={350}
						onLongPress={() => {
							openedByLongPressRef.current = true;
							fireHaptic();
							triggerRef.current?.open();
						}}
						onPress={() => {
							openedByLongPressRef.current = false;
						}}
						ref={triggerRef}
					>
						<View
							className={cn(
								"rounded-3xl px-4 py-2",
								isMine ? "bg-accent" : "bg-content2",
								isPending && "opacity-70",
							)}
							style={{
								maxWidth:
									(width - MESSAGE_LIST_HORIZONTAL_PADDING) *
									MESSAGE_BUBBLE_MAX_WIDTH_RATIO,
							}}
						>
							<Typography.Paragraph
								className={
									isMine ? "text-accent-foreground" : "text-foreground"
								}
							>
								{item.content}
							</Typography.Paragraph>
						</View>
					</Menu.Trigger>
					<Menu.Portal>
						<Menu.Overlay />
						<Menu.Content
							presentation="popover"
							placement="bottom"
							align={isMine ? "end" : "start"}
							width={132}
							className="p-1"
						>
							<Menu.Item accessibilityLabel="复制消息" onPress={onCopy}>
								<Ionicons
									name="copy-outline"
									size={18}
									color={foregroundColor}
								/>
								<Menu.ItemTitle>复制</Menu.ItemTitle>
							</Menu.Item>
							<Menu.Item
								accessibilityLabel="删除消息"
								variant="danger"
								onPress={onDelete}
							>
								<Ionicons name="trash-outline" size={18} color={dangerColor} />
								<Menu.ItemTitle>删除</Menu.ItemTitle>
							</Menu.Item>
						</Menu.Content>
					</Menu.Portal>
				</Menu>
			</View>
			<Typography.Paragraph
				type="body-xs"
				color={isFailed ? undefined : "muted"}
				className={isFailed ? "text-danger" : undefined}
			>
				{isPending ? "发送中 · " : isFailed ? "发送失败 · " : ""}
				{formatTime(item.createdAt)}
			</Typography.Paragraph>
		</View>
	);
}
