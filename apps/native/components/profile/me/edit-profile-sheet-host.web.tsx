import { Ionicons } from "@expo/vector-icons";
import type { ProfileUser } from "@youni/api/contracts/profiles";
import { Button, Typography, useThemeColor } from "heroui-native";
import { Modal, Pressable, View } from "react-native";

import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import type { AuthUser } from "@/lib/auth-client";

export function MeEditProfileSheetHost({
	displayName,
	isOpen,
	profile,
	user,
	onOpenChange,
	onSaved,
}: {
	displayName: string;
	isOpen: boolean;
	profile?: ProfileUser;
	user?: AuthUser;
	onOpenChange: (isOpen: boolean) => void;
	onSaved: () => Promise<void>;
}) {
	const backgroundColor = useThemeColor("background");
	const foregroundColor = useThemeColor("foreground");

	return (
		<Modal
			animationType="fade"
			onRequestClose={() => onOpenChange(false)}
			transparent
			visible={isOpen}
		>
			<View className="flex-1 items-center justify-center p-4">
				<Pressable
					accessibilityLabel="关闭编辑资料"
					className="absolute inset-0 bg-black/50"
					onPress={() => onOpenChange(false)}
				/>
				<View
					className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl"
					style={{ backgroundColor }}
				>
					<View className="flex-row items-center justify-between border-separator border-b px-5 py-4">
						<Typography.Paragraph weight="bold" style={{ fontSize: 20 }}>
							编辑资料
						</Typography.Paragraph>
						<Button
							accessibilityLabel="关闭"
							className="rounded-full"
							feedbackVariant="scale"
							isIconOnly
							onPress={() => onOpenChange(false)}
							size="sm"
							variant="ghost"
						>
							<Ionicons name="close" size={20} color={foregroundColor} />
						</Button>
					</View>
					<EditProfileSheet
						displayName={displayName}
						profile={profile}
						user={user}
						onSaved={onSaved}
					/>
				</View>
			</View>
		</Modal>
	);
}
