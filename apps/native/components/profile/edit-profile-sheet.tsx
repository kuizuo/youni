import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMutation } from "@tanstack/react-query";
import {
	BottomSheet,
	Button,
	Input,
	Label,
	Spinner,
	Text,
	TextArea,
	TextField,
	useBottomSheetAwareHandlers,
	useThemeColor,
} from "heroui-native";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { EditableAvatar } from "@/components/profile/editable-avatar";
import type {
	EditableProfile,
	ProfileSessionUser,
} from "@/components/profile/profile-tabs";
import { pickAndUploadAvatar } from "@/lib/avatar-upload";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

export function EditProfileSheet({
	displayName,
	onSaved,
	profile,
	user,
}: {
	displayName: string;
	onSaved: () => Promise<void>;
	profile?: EditableProfile;
	user?: ProfileSessionUser;
}) {
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const { onBlur, onFocus } = useBottomSheetAwareHandlers();
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [bio, setBio] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [gender, setGender] = useState<"female" | "male" | "unknown">(
		"unknown",
	);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const updateProfile = useMutation(
		orpc.updateProfile.mutationOptions({
			onSuccess: async () => {
				await onSaved();
				toast.show({ variant: "success", label: "资料已保存" });
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: "保存失败",
					description: error.message,
				});
			},
		}),
	);

	useEffect(() => {
		setName(profile?.name ?? user?.name ?? "");
		setHandle(profile?.handle ?? "");
		setBio(profile?.bio ?? "");
		setAvatarUrl(profile?.image ?? user?.image ?? "");
		setGender(
			profile?.gender === "male" || profile?.gender === "female"
				? profile.gender
				: "unknown",
		);
	}, [profile, user]);

	const chooseAvatar = async () => {
		fireHaptic();
		setIsUploadingAvatar(true);
		try {
			const uploaded = await pickAndUploadAvatar();
			if (uploaded) {
				setAvatarUrl(uploaded.url);
				toast.show({ variant: "success", label: "头像已上传，保存后生效" });
			}
		} catch (error) {
			if (isRequestTimeoutError(error)) return;
			toast.show({
				variant: "danger",
				label: "头像上传失败",
				description: error instanceof Error ? error.message : undefined,
			});
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const saveProfile = () => {
		fireHaptic();
		if (!name.trim()) {
			toast.show({ variant: "warning", label: "请输入昵称" });
			return;
		}

		updateProfile.mutate({
			bio: bio.trim(),
			gender,
			handle: handle.trim(),
			image: avatarUrl.trim(),
			name: name.trim(),
		});
	};

	return (
		<View className="flex-1">
			<View className="px-4 pb-2">
				<View className="min-w-0 flex-1">
					<BottomSheet.Title>编辑资料</BottomSheet.Title>
				</View>
			</View>

			<BottomSheetScrollView
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ paddingBottom: 20 }}
			>
				<View className="gap-4 px-4">
					<View className="flex-row items-center gap-3">
						<EditableAvatar
							alt={name || displayName}
							image={avatarUrl}
							initial={(name || displayName).slice(0, 1)}
							isDisabled={updateProfile.isPending}
							isUploading={isUploadingAvatar}
							onPress={chooseAvatar}
						/>
						<View className="min-w-0 flex-1">
							<Text.Paragraph weight="bold" numberOfLines={1}>
								{name || displayName}
							</Text.Paragraph>
							<Text.Paragraph type="body-sm" color="muted" numberOfLines={1}>
								{handle ? `@${handle}` : "设置公开资料"}
							</Text.Paragraph>
						</View>
					</View>

					<TextField isRequired>
						<Label>昵称</Label>
						<Input
							value={name}
							onBlur={onBlur}
							onChangeText={setName}
							onFocus={onFocus}
							placeholder="你的昵称"
							placeholderTextColor={mutedColor}
						/>
					</TextField>

					<TextField>
						<Label>用户名</Label>
						<Input
							value={handle}
							autoCapitalize="none"
							onBlur={onBlur}
							onChangeText={setHandle}
							onFocus={onFocus}
							placeholder="letters_and_numbers"
							placeholderTextColor={mutedColor}
						/>
					</TextField>

					<TextField>
						<Label>简介</Label>
						<TextArea
							value={bio}
							className="min-h-24"
							maxLength={160}
							onBlur={onBlur}
							onChangeText={setBio}
							onFocus={onFocus}
							placeholder="一句话介绍你分享的内容"
							placeholderTextColor={mutedColor}
						/>
					</TextField>

					<View className="gap-2">
						<Text.Paragraph type="body-sm" weight="semibold">
							性别
						</Text.Paragraph>
						<View className="flex-row rounded-full bg-content2 p-1">
							<GenderButton
								isActive={gender === "unknown"}
								label="不展示"
								onPress={() => setGender("unknown")}
							/>
							<GenderButton
								isActive={gender === "female"}
								label="女"
								onPress={() => setGender("female")}
							/>
							<GenderButton
								isActive={gender === "male"}
								label="男"
								onPress={() => setGender("male")}
							/>
						</View>
					</View>

					<Button
						variant="primary"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						isDisabled={updateProfile.isPending || isUploadingAvatar}
						onPress={saveProfile}
					>
						{updateProfile.isPending ? (
							<Spinner size="sm" color={accentForegroundColor} />
						) : (
							<Ionicons
								name="checkmark-outline"
								size={18}
								color={accentForegroundColor}
							/>
						)}
						<Button.Label>
							{updateProfile.isPending ? "保存中" : "保存资料"}
						</Button.Label>
					</Button>
				</View>
			</BottomSheetScrollView>
		</View>
	);
}

function GenderButton({
	isActive,
	label,
	onPress,
}: {
	isActive: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<Button
			size="sm"
			variant={isActive ? "primary" : "ghost"}
			className="h-9 flex-1 rounded-full"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}
