import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	Button,
	Input,
	Label,
	Skeleton,
	Spinner,
	Text,
	TextArea,
	TextField,
	useThemeColor,
	useToast,
} from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";

import { AuthPanel } from "@/components/auth-panel";
import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { createTwoColumnFeed } from "@/lib/utils/two-column-feed";
import { orpc, queryClient } from "@/utils/orpc";

export default function MeScreen() {
	const router = useRouter();
	const session = authClient.useSession();
	const { toast } = useToast();
	const mutedColor = useThemeColor("muted");
	const currentUser = session.data?.user;
	const [hasAuthenticated, setHasAuthenticated] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [bio, setBio] = useState("");
	const [image, setImage] = useState("");
	const [showAvatarLink, setShowAvatarLink] = useState(false);
	const isAuthenticated = Boolean(currentUser) || hasAuthenticated;
	const me = useQuery({
		...orpc.social.me.queryOptions(),
		enabled: isAuthenticated,
	});
	const profile = me.data?.profile;
	const isProfileLoading = !me.data && me.isLoading;
	const isAccountLoading = isProfileLoading && !currentUser;
	const displayName = profile?.name ?? currentUser?.name ?? "我";
	const displayEmail = currentUser?.email ?? "登录账号";

	useEffect(() => {
		if (!profile || isEditing) return;
		setName(profile.name ?? "");
		setHandle(profile.handle ?? "");
		setBio(profile.bio ?? "");
		setImage(profile.image ?? "");
	}, [isEditing, profile]);

	useEffect(() => {
		if (currentUser) {
			setHasAuthenticated(true);
		}
	}, [currentUser]);

	const updateProfile = useMutation(
		orpc.social.updateProfile.mutationOptions({
			onSuccess: () => {
				setIsEditing(false);
				setShowAvatarLink(false);
				me.refetch();
				queryClient.refetchQueries();
				toast.show({ variant: "success", label: "资料已保存" });
			},
			onError: (error) => {
				toast.show({
					variant: "danger",
					label: "保存失败",
					description: error.message,
				});
			},
		}),
	);

	const listData = useMemo(() => me.data?.notes ?? [], [me.data?.notes]);
	const feedItems = useMemo(() => createTwoColumnFeed(listData), [listData]);

	if (!isAuthenticated) {
		return (
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="bg-background p-4 pb-32"
			>
				<AuthPanel
					onAuthenticated={() => {
						setHasAuthenticated(true);
						session.refetch();
					}}
				/>
			</ScrollView>
		);
	}

	const saveProfile = () => {
		if (!name.trim()) {
			toast.show({ variant: "warning", label: "请输入昵称" });
			return;
		}

		updateProfile.mutate({
			name: name.trim(),
			handle: handle.trim(),
			bio: bio.trim(),
			image: image.trim(),
			gender:
				profile?.gender === "male" || profile?.gender === "female"
					? profile.gender
					: "unknown",
		});
	};

	const signOut = () => {
		setHasAuthenticated(false);
		authClient.signOut();
		queryClient.clear();
		toast.show({ label: "已退出登录" });
		router.replace("/" as Href);
	};

	return (
		<View className="flex-1 bg-background">
			<FlatList
				className="mx-auto w-full max-w-xl"
				data={feedItems}
				keyExtractor={(item) => item.id}
				numColumns={2}
				columnWrapperClassName="gap-3 px-3"
				renderItem={({ item }) => (
					<View className="flex-1 basis-0">
						{item.type === "item" ? (
							<NoteCard compact note={item.item} />
						) : null}
					</View>
				)}
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="bg-background pt-4 pb-32"
				ListHeaderComponent={
					<View className="gap-4 px-4 pb-5">
						<View className="flex-row items-center gap-4">
							{isAccountLoading ? (
								<Skeleton className="size-14 rounded-full" />
							) : (
								<Avatar size="lg" alt={displayName}>
									{profile?.image ? (
										<Avatar.Image source={{ uri: profile.image }} />
									) : null}
									<Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
								</Avatar>
							)}
							<View className="min-w-0 flex-1 gap-2">
								{isAccountLoading ? (
									<>
										<Skeleton className="h-4 w-24 rounded-full" />
										<Skeleton className="h-3 w-36 rounded-full" />
									</>
								) : (
									<>
										<Text.Paragraph weight="semibold" numberOfLines={1}>
											{displayName}
										</Text.Paragraph>
										<Text.Paragraph
											type="body-sm"
											color="muted"
											numberOfLines={1}
										>
											{profile?.handle ? `@${profile.handle}` : displayEmail}
										</Text.Paragraph>
									</>
								)}
							</View>
							<Button
								isIconOnly
								size="sm"
								variant="ghost"
								feedbackVariant="scale-ripple"
								accessibilityLabel="退出登录"
								onPress={signOut}
							>
								<Ionicons name="log-out-outline" size={19} color={mutedColor} />
							</Button>
						</View>

						{profile?.bio ? (
							<Text.Paragraph className="text-foreground leading-6">
								{profile.bio}
							</Text.Paragraph>
						) : isProfileLoading ? (
							<View className="gap-2">
								<Skeleton className="h-3 w-4/5 rounded-full" />
								<Skeleton className="h-3 w-2/3 rounded-full" />
							</View>
						) : null}

						<View className="flex-row border-border-tertiary border-y py-3">
							<ProfileStat
								isLoading={isProfileLoading}
								label="作品"
								value={profile?.noteCount}
							/>
							<ProfileStat
								isLoading={isProfileLoading}
								label="获赞"
								value={profile?.likedCount}
							/>
							<ProfileStat
								isLoading={isProfileLoading}
								label="粉丝"
								value={profile?.followerCount}
							/>
						</View>

						<View className="flex-row gap-2">
							<Button
								variant="secondary"
								className="flex-1"
								feedbackVariant="scale-ripple"
								isDisabled={isProfileLoading}
								onPress={() => {
									setIsEditing((value) => !value);
									setShowAvatarLink(false);
								}}
							>
								<Button.Label>{isEditing ? "取消" : "编辑资料"}</Button.Label>
							</Button>
							<Button
								variant="primary"
								className="flex-1"
								feedbackVariant="scale-ripple"
								isDisabled={isEditing && updateProfile.isPending}
								onPress={() => {
									if (isEditing) {
										saveProfile();
										return;
									}
									router.push("/create" as Href);
								}}
							>
								{isEditing && updateProfile.isPending ? (
									<Spinner size="sm" />
								) : null}
								<Button.Label>
									{isEditing
										? updateProfile.isPending
											? "保存中"
											: "保存"
										: "发布图文"}
								</Button.Label>
							</Button>
						</View>

						{isEditing ? (
							<View className="gap-4 border-border-tertiary border-t pt-5">
								<View className="gap-3">
									<View className="flex-row items-center gap-3">
										<Avatar size="md" alt={name || "头像预览"}>
											{image ? <Avatar.Image source={{ uri: image }} /> : null}
											<Avatar.Fallback>
												{(name || profile?.name || displayName).slice(0, 1)}
											</Avatar.Fallback>
										</Avatar>
										<View className="min-w-0 flex-1">
											<Text.Paragraph
												weight="semibold"
												className="text-foreground"
											>
												头像
											</Text.Paragraph>
											<Text.Paragraph
												type="body-sm"
												color="muted"
												numberOfLines={1}
											>
												默认沿用当前头像。
											</Text.Paragraph>
										</View>
										<Button
											size="sm"
											variant="ghost"
											feedbackVariant="scale-ripple"
											onPress={() => setShowAvatarLink((value) => !value)}
										>
											<Button.Label>
												{showAvatarLink ? "收起" : "更换"}
											</Button.Label>
										</Button>
									</View>
									{showAvatarLink ? (
										<TextField>
											<Label>头像链接</Label>
											<Input
												value={image}
												onChangeText={setImage}
												autoCapitalize="none"
												placeholder="https://..."
												placeholderTextColor={mutedColor}
											/>
										</TextField>
									) : null}
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
							</View>
						) : null}

						<View className="flex-row items-center justify-between border-border-tertiary border-t pt-4">
							<Text.Paragraph weight="semibold" className="text-foreground">
								作品
							</Text.Paragraph>
							<Text.Paragraph type="body-xs" color="muted">
								{listData.length} 篇
							</Text.Paragraph>
						</View>
					</View>
				}
				ListEmptyComponent={
					me.isLoading ? (
						<FeedSkeleton />
					) : me.isError ? (
						<ErrorState
							description="个人页暂时没有加载出来，请稍后重试。"
							onRetry={() => me.refetch()}
						/>
					) : (
						<EmptyState
							icon="add-circle-outline"
							title="还没有作品"
							description="发布第一篇图文后，会出现在这里。"
							actionLabel="去发布"
							onAction={() => router.push("/create" as Href)}
						/>
					)
				}
			/>
		</View>
	);
}

function ProfileStat({
	isLoading,
	label,
	value,
}: {
	isLoading: boolean;
	label: string;
	value?: number;
}) {
	return (
		<View className="flex-1 items-center gap-1">
			{isLoading ? (
				<Skeleton className="h-5 w-8 rounded-full" />
			) : (
				<Text.Paragraph weight="semibold" className="text-foreground">
					{value ?? "—"}
				</Text.Paragraph>
			)}
			<Text.Paragraph type="body-xs" color="muted">
				{label}
			</Text.Paragraph>
		</View>
	);
}
