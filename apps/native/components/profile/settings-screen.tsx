import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	Button,
	Input,
	Label,
	Spinner,
	Surface,
	Text,
	TextArea,
	TextField,
	useThemeColor,
} from "heroui-native";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EditableAvatar } from "@/components/profile/editable-avatar";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { authClient } from "@/lib/auth-client";
import { pickAndUploadAvatar } from "@/lib/avatar-upload";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

export default function SettingsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const defaultForegroundColor = useThemeColor("default-foreground");
	const me = useQuery({
		...orpc.me.queryOptions(),
		enabled: Boolean(session.data?.user),
	});
	const profile = me.data?.profile;
	const user = session.data?.user;
	const displayName = profile?.name ?? user?.name ?? "我";
	const displayHandle = profile?.handle ? `@${profile.handle}` : user?.email;
	const image = profile?.image ?? user?.image;
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [bio, setBio] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [gender, setGender] = useState<"female" | "male" | "unknown">(
		"unknown",
	);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

	useEffect(() => {
		if (!profile) return;
		setName(profile.name ?? "");
		setHandle(profile.handle ?? "");
		setBio(profile.bio ?? "");
		setAvatarUrl(profile.image ?? user?.image ?? "");
		setGender(
			profile.gender === "male" || profile.gender === "female"
				? profile.gender
				: "unknown",
		);
	}, [profile, user]);

	const updateProfile = useMutation(
		orpc.updateProfile.mutationOptions({
			onSuccess: async () => {
				await me.refetch();
				await queryClient.refetchQueries();
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

	const saveProfile = () => {
		fireHaptic();
		if (!name.trim()) {
			toast.show({ variant: "warning", label: "请输入昵称" });
			return;
		}

		updateProfile.mutate({
			name: name.trim(),
			handle: handle.trim(),
			bio: bio.trim(),
			image: avatarUrl.trim(),
			gender,
		});
	};

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

	const signOut = () => {
		fireHaptic();
		authClient.signOut();
		queryClient.clear();
		router.replace("/" as Href);
	};

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="设置" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				<Surface className="gap-4 rounded-3xl p-4">
					<View className="flex-row items-center gap-3">
						<Avatar size="lg" alt={displayName}>
							{image ? <Avatar.Image source={{ uri: image }} /> : null}
							<Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
						</Avatar>
						<View className="min-w-0 flex-1">
							<Text.Paragraph weight="bold" numberOfLines={1}>
								{displayName}
							</Text.Paragraph>
							<Text.Paragraph
								type="body-sm"
								color="muted"
								numberOfLines={1}
								selectable
							>
								{displayHandle ?? "登录账号"}
							</Text.Paragraph>
						</View>
						{me.isLoading ? <Spinner size="sm" /> : null}
					</View>
				</Surface>

				<Surface className="gap-4 rounded-3xl p-4">
					<View className="flex-row items-center justify-between gap-3">
						<View className="min-w-0 flex-1">
							<Text.Paragraph weight="bold">编辑主页</Text.Paragraph>
						</View>
						<EditableAvatar
							alt={name || displayName}
							image={avatarUrl}
							initial={(name || displayName).slice(0, 1)}
							isDisabled={updateProfile.isPending}
							isUploading={isUploadingAvatar}
							onPress={chooseAvatar}
						/>
					</View>

					<TextField isRequired>
						<Label>昵称</Label>
						<Input
							value={name}
							onChangeText={setName}
							placeholder="你的昵称"
							placeholderTextColor={mutedColor}
						/>
					</TextField>

					<TextField>
						<Label>用户名</Label>
						<Input
							value={handle}
							onChangeText={setHandle}
							autoCapitalize="none"
							placeholder="letters_and_numbers"
							placeholderTextColor={mutedColor}
						/>
					</TextField>

					<TextField>
						<Label>简介</Label>
						<TextArea
							value={bio}
							onChangeText={setBio}
							placeholder="一句话介绍你分享的内容"
							placeholderTextColor={mutedColor}
							className="min-h-24"
							maxLength={160}
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
						isDisabled={
							updateProfile.isPending || isUploadingAvatar || me.isLoading
						}
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
				</Surface>

				<Button
					variant="danger-soft"
					className="rounded-full"
					feedbackVariant="scale-ripple"
					onPress={signOut}
				>
					<Ionicons
						name="log-out-outline"
						size={18}
						color={dangerColor || defaultForegroundColor}
					/>
					<Button.Label>退出登录</Button.Label>
				</Button>
			</ScrollView>
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
