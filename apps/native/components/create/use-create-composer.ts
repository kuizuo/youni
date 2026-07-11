import { useMutation, useQuery } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import type { Href } from "expo-router";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

import type {
	AdvancedOptions,
	ComposerImage,
	ComposerSnapshot,
	NoteVisibility,
	PublishSubmitMode,
} from "@/components/create/create-types";
import {
	clearDraftRecovery,
	consumeDraftRecovery,
	setDraftRecovery,
} from "@/components/create/draft-recovery";
import { authClient } from "@/lib/auth-client";
import { uploadNoteImages } from "@/lib/note-image-upload";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const DEFAULT_ADVANCED_OPTIONS: AdvancedOptions = {
	allowComment: true,
	allowShare: true,
};

function composerSignature(
	composer: Pick<
		ComposerSnapshot,
		"advancedOptions" | "content" | "images" | "title" | "topics" | "visibility"
	>,
) {
	return JSON.stringify({
		advancedOptions: composer.advancedOptions,
		content: composer.content,
		images: composer.images.map((image) => ({
			height: image.height,
			id: image.id,
			isEdited: image.isEdited,
			remoteUrl: image.remoteUrl,
			uri: image.uri,
			width: image.width,
		})),
		title: composer.title,
		topics: composer.topics,
		visibility: composer.visibility,
	});
}

function extractTopicsFromContent(value: string) {
	const topics = new Set<string>();
	const matches = value.matchAll(/(?:^|\s)#([^\s#@]{1,24})/g);
	for (const match of matches) {
		const topic = match[1]?.trim();
		if (topic) topics.add(topic);
		if (topics.size >= 8) break;
	}
	return [...topics];
}

function mergeTopics(...topicGroups: string[][]) {
	const topics = new Set<string>();
	for (const group of topicGroups) {
		for (const topic of group) {
			const cleanTopic = topic.replace(/^#/, "").trim();
			if (cleanTopic) topics.add(cleanTopic);
			if (topics.size >= 8) return [...topics];
		}
	}
	return [...topics];
}

function isGifAsset(asset: ImagePicker.ImagePickerAsset) {
	const mimeType = asset.mimeType?.toLowerCase();
	if (mimeType === "image/gif") return true;
	return asset.uri.split("?")[0]?.toLowerCase().endsWith(".gif") ?? false;
}

function imageFileName(asset: ImagePicker.ImagePickerAsset, extension: string) {
	const rawName =
		asset.fileName?.split(".").slice(0, -1).join(".") ||
		asset.assetId ||
		`note-image-${Date.now()}`;
	const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-");
	return `${safeName}.${extension}`;
}

async function createComposerImageFromAsset(
	asset: ImagePicker.ImagePickerAsset,
): Promise<ComposerImage> {
	if (Platform.OS === "web" || isGifAsset(asset)) {
		return {
			asset,
			fileName: asset.fileName,
			fileSize: asset.fileSize,
			height: asset.height,
			id: `${asset.assetId ?? asset.uri}-${asset.uri}`,
			mimeType: asset.mimeType,
			originalUri: asset.uri,
			uri: asset.uri,
			width: asset.width,
		};
	}

	const converted = await manipulateAsync(asset.uri, [], {
		compress: 0.92,
		format: SaveFormat.JPEG,
	});
	const info = await FileSystem.getInfoAsync(converted.uri);
	const fileSize =
		info.exists && !info.isDirectory ? info.size : asset.fileSize;
	const fileName = imageFileName(asset, "jpg");

	return {
		asset: {
			fileName,
			fileSize,
			mimeType: "image/jpeg",
			uri: converted.uri,
		},
		fileName,
		fileSize,
		height: converted.height,
		id: `${asset.assetId ?? asset.uri}-${converted.uri}`,
		mimeType: "image/jpeg",
		originalUri: asset.uri,
		uri: converted.uri,
		width: converted.width,
	};
}

type UseCreateComposerOptions = {
	onRequestClose?: () => void;
};

export function useCreateComposer({
	onRequestClose,
}: UseCreateComposerOptions) {
	const params = useLocalSearchParams<{
		draftId?: string | string[];
		noteId?: string | string[];
		recoverDraft?: string | string[];
	}>();
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const [hasAuthenticated, setHasAuthenticated] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [images, setImages] = useState<ComposerImage[]>([]);
	const [topics, setTopics] = useState<string[]>([]);
	const [visibility, setVisibility] = useState<NoteVisibility>("public");
	const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>(
		DEFAULT_ADVANCED_OPTIONS,
	);
	const [pendingSubmitMode, setPendingSubmitMode] =
		useState<PublishSubmitMode | null>(null);
	const [isAddingImages, setIsAddingImages] = useState(false);
	const [isOptimisticDraftSaving, setIsOptimisticDraftSaving] = useState(false);
	const [isUploadingImages, setIsUploadingImages] = useState(false);
	const [hydratedDraftId, setHydratedDraftId] = useState<null | string>(null);
	const [hydratedNoteId, setHydratedNoteId] = useState<null | string>(null);
	const draftBaselineRef = useRef<null | string>(null);
	const recoveredDraftRef = useRef(false);
	const optimisticDraftSaveRef = useRef<ComposerSnapshot | null>(null);
	const rawDraftId = params.draftId;
	const rawNoteId = params.noteId;
	const rawRecoverDraft = params.recoverDraft;
	const draftId = Array.isArray(rawDraftId) ? rawDraftId[0] : rawDraftId;
	const noteId = Array.isArray(rawNoteId) ? rawNoteId[0] : rawNoteId;
	const shouldRecoverDraft = Array.isArray(rawRecoverDraft)
		? rawRecoverDraft[0] === "1"
		: rawRecoverDraft === "1";
	const isEditingDraft = Boolean(draftId);
	const isEditingNote = Boolean(noteId && !draftId);
	const isAuthenticated = Boolean(session.data?.user) || hasAuthenticated;

	useEffect(() => {
		if (session.data?.user) {
			setHasAuthenticated(true);
		}
	}, [session.data?.user]);

	const missingItems = useMemo(
		() =>
			[
				images.length === 0 ? "图片" : null,
				title.trim().length === 0 ? "标题" : null,
				content.trim().length === 0 ? "正文" : null,
				topics.length === 0 ? "话题" : null,
			].filter((item): item is string => Boolean(item)),
		[content, images.length, title, topics.length],
	);
	const canPublish = missingItems.length === 0;
	const hasSavableContent =
		title.trim().length > 0 || content.trim().length > 0 || images.length > 0;
	const hasUnsavedChanges =
		hasSavableContent ||
		topics.length > 0 ||
		visibility !== "public" ||
		advancedOptions.allowComment !== DEFAULT_ADVANCED_OPTIONS.allowComment ||
		advancedOptions.allowShare !== DEFAULT_ADVANCED_OPTIONS.allowShare;
	const currentComposerSignature = useMemo(
		() =>
			composerSignature({
				advancedOptions,
				content,
				images,
				title,
				topics,
				visibility,
			}),
		[advancedOptions, content, images, title, topics, visibility],
	);
	const hasDraftChanges =
		isEditingDraft &&
		(recoveredDraftRef.current ||
			(draftBaselineRef.current !== null &&
				draftBaselineRef.current !== currentComposerSignature));
	const visibilityLabel =
		visibility === "public"
			? "公开可见"
			: visibility === "followers"
				? "仅关注者可见"
				: "仅自己可见";
	const advancedLabel = advancedOptions.allowComment ? "评论开启" : "评论关闭";
	const draftQuery = useQuery({
		...orpc.draftById.queryOptions({
			input: { id: draftId || "missing" },
		}),
		enabled: Boolean(draftId && isAuthenticated),
	});
	const editNoteQuery = useQuery({
		...orpc.editById.queryOptions({
			input: { id: noteId || "missing" },
		}),
		enabled: Boolean(isEditingNote && noteId && isAuthenticated),
	});
	const draftsOptions = orpc.drafts.queryOptions();
	const creatorStatsOptions = orpc.creatorStats.queryOptions();

	const resetForm = () => {
		setTitle("");
		setContent("");
		setImages([]);
		setTopics([]);
		setVisibility("public");
		setAdvancedOptions(DEFAULT_ADVANCED_OPTIONS);
		setHydratedDraftId(null);
		setHydratedNoteId(null);
		draftBaselineRef.current = null;
		recoveredDraftRef.current = false;
	};

	const snapshotComposer = (): ComposerSnapshot => ({
		advancedOptions: { ...advancedOptions },
		content,
		draftId,
		images: images.map((image) => ({
			...image,
			asset: image.asset ? { ...image.asset } : undefined,
		})),
		title,
		topics: [...topics],
		visibility,
	});

	const invalidateDraftData = async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: draftsOptions.queryKey }),
			queryClient.invalidateQueries({ queryKey: creatorStatsOptions.queryKey }),
		]);
	};

	const finishOptimisticDraftSave = async () => {
		const completedSnapshot = optimisticDraftSaveRef.current;
		optimisticDraftSaveRef.current = null;
		if (completedSnapshot) clearDraftRecovery(completedSnapshot);
		setIsOptimisticDraftSaving(false);
		await invalidateDraftData();
	};

	const failOptimisticDraftSave = (_error: unknown) => {
		const optimisticSave = optimisticDraftSaveRef.current;
		if (!optimisticSave) return;

		optimisticDraftSaveRef.current = null;
		setIsOptimisticDraftSaving(false);
		setPendingSubmitMode(null);

		toast.show({
			actionLabel: "重新编辑",
			id: "draft-save-status",
			label: "草稿保存失败",
			onActionPress: ({ hide }) => {
				hide();
				setDraftRecovery(optimisticSave);
				router.push({
					pathname: "/publish",
					params: {
						...(optimisticSave.draftId
							? { draftId: optimisticSave.draftId }
							: {}),
						recoverDraft: "1",
					},
				} as unknown as Href);
			},
			variant: "danger",
		});
		void invalidateDraftData();
	};

	const createMutation = useMutation(
		orpc.create.mutationOptions({
			onSuccess: async (result, variables) => {
				if (variables.submitMode === "draft") {
					await finishOptimisticDraftSave();
					return;
				}
				resetForm();
				await queryClient.invalidateQueries();
				router.replace(`/note/${result.id}` as Href);
			},
			onError: (error, variables) => {
				if (variables.submitMode === "draft") {
					failOptimisticDraftSave(error);
					return;
				}
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: error.message,
				});
			},
			onSettled: () => {
				setPendingSubmitMode(null);
			},
		}),
	);
	const updateDraftMutation = useMutation(
		orpc.updateDraft.mutationOptions({
			onSuccess: async (result, variables) => {
				if (variables.submitMode === "draft") {
					await finishOptimisticDraftSave();
					return;
				}
				resetForm();
				await queryClient.invalidateQueries();
				router.replace(`/note/${result.id}` as Href);
			},
			onError: (error, variables) => {
				if (variables.submitMode === "draft") {
					failOptimisticDraftSave(error);
					return;
				}
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: error.message,
				});
			},
			onSettled: () => {
				setPendingSubmitMode(null);
			},
		}),
	);
	const updateNoteMutation = useMutation(
		orpc.updateNote.mutationOptions({
			onSuccess: async (result) => {
				resetForm();
				await queryClient.invalidateQueries();
				router.replace(`/note/${result.id}` as Href);
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: error.message,
				});
			},
			onSettled: () => {
				setPendingSubmitMode(null);
			},
		}),
	);

	useEffect(() => {
		if (!shouldRecoverDraft) return;
		const snapshot = consumeDraftRecovery();
		if (!snapshot) return;

		setTitle(snapshot.title);
		setContent(snapshot.content);
		setImages(snapshot.images);
		setTopics(snapshot.topics);
		setVisibility(snapshot.visibility);
		setAdvancedOptions(snapshot.advancedOptions);
		setHydratedDraftId(snapshot.draftId ?? null);
		draftBaselineRef.current = null;
		recoveredDraftRef.current = Boolean(snapshot.draftId);
	}, [shouldRecoverDraft]);

	useEffect(() => {
		if (shouldRecoverDraft) return;
		const draft = draftQuery.data;
		if (!draftId || !draft || hydratedDraftId === draftId) return;
		setTitle(draft.title ?? "");
		const draftContent = draft.content ?? "";
		setContent(draftContent);
		const draftImages = (draft.images ?? []).map((url) => {
			const meta = (draft.imageMetas ?? []).find((item) => item.url === url);
			return {
				height: meta?.height,
				id: url,
				originalUri: url,
				remoteUrl: url,
				uri: url,
				width: meta?.width,
			};
		});
		const draftTopics = mergeTopics(
			draft.topics ?? [],
			extractTopicsFromContent(draftContent),
		);
		const draftVisibility = draft.visibility ?? "public";
		const draftAdvancedOptions = {
			allowComment:
				draft.advancedOptions.allowComment ??
				DEFAULT_ADVANCED_OPTIONS.allowComment,
			allowShare:
				draft.advancedOptions.allowShare ?? DEFAULT_ADVANCED_OPTIONS.allowShare,
		};
		setImages(draftImages);
		setTopics(draftTopics);
		setVisibility(draftVisibility);
		setAdvancedOptions(draftAdvancedOptions);
		setHydratedDraftId(draftId);
		draftBaselineRef.current = composerSignature({
			advancedOptions: draftAdvancedOptions,
			content: draftContent,
			images: draftImages,
			title: draft.title ?? "",
			topics: draftTopics,
			visibility: draftVisibility,
		});
		recoveredDraftRef.current = false;
	}, [draftId, draftQuery.data, hydratedDraftId, shouldRecoverDraft]);

	useEffect(() => {
		const editableNote = editNoteQuery.data;
		if (!noteId || !editableNote || hydratedNoteId === noteId) return;
		setTitle(editableNote.title ?? "");
		const noteContent = editableNote.content ?? "";
		setContent(noteContent);
		setImages(
			(editableNote.images ?? []).map((url) => {
				const meta = (editableNote.imageMetas ?? []).find(
					(item) => item.url === url,
				);
				return {
					height: meta?.height,
					id: url,
					originalUri: url,
					remoteUrl: url,
					uri: url,
					width: meta?.width,
				};
			}),
		);
		setTopics(
			mergeTopics(
				editableNote.topics ?? [],
				extractTopicsFromContent(noteContent),
			),
		);
		setVisibility(editableNote.visibility ?? "public");
		setAdvancedOptions({
			allowComment:
				editableNote.advancedOptions.allowComment ??
				DEFAULT_ADVANCED_OPTIONS.allowComment,
			allowShare:
				editableNote.advancedOptions.allowShare ??
				DEFAULT_ADVANCED_OPTIONS.allowShare,
		});
		setHydratedNoteId(noteId);
	}, [editNoteQuery.data, hydratedNoteId, noteId]);

	const imageMetasFrom = (items: ComposerImage[]) =>
		items.flatMap((image) => {
			const url = image.remoteUrl ?? image.uri;
			return image.width && image.height
				? [{ height: image.height, url, width: image.width }]
				: [];
		});

	const uploadLocalImages = async (
		composerImages: ComposerImage[],
		trackComposerState: boolean,
	) => {
		const localAssets = composerImages.flatMap((image) =>
			image.asset ? [image.asset] : [],
		);
		if (localAssets.length === 0) {
			return {
				imageMetas: imageMetasFrom(composerImages),
				images: composerImages.map((image) => image.remoteUrl ?? image.uri),
			};
		}

		if (trackComposerState) setIsUploadingImages(true);
		try {
			const uploaded = await uploadNoteImages(localAssets);
			let uploadedIndex = 0;
			const nextImages = composerImages.map((image) => {
				if (!image.asset) return image;
				const item = uploaded[uploadedIndex];
				uploadedIndex += 1;
				if (!item) {
					throw new Error("图片上传失败");
				}
				return {
					height: image.height,
					id: item.url,
					originalUri: image.originalUri ?? image.uri,
					remoteUrl: item.url,
					uri: item.url,
					width: image.width,
				};
			});
			if (trackComposerState) setImages(nextImages);
			return {
				imageMetas: imageMetasFrom(nextImages),
				images: nextImages.map((image) => image.remoteUrl ?? image.uri),
			};
		} finally {
			if (trackComposerState) setIsUploadingImages(false);
		}
	};

	const buildPayload = async (
		submitMode: PublishSubmitMode,
		snapshot?: ComposerSnapshot,
	) => {
		const source = snapshot ?? {
			advancedOptions,
			content,
			images,
			title,
			topics,
			visibility,
		};
		const uploadedImages = await uploadLocalImages(source.images, !snapshot);
		return {
			title: source.title.trim(),
			content: source.content.trim(),
			...uploadedImages,
			topics: source.topics,
			locationName: undefined,
			visibility: source.visibility,
			components: [],
			advancedOptions: source.advancedOptions,
			submitMode,
		};
	};
	const isSubmitting =
		createMutation.isPending ||
		updateDraftMutation.isPending ||
		updateNoteMutation.isPending ||
		isAddingImages ||
		isOptimisticDraftSaving ||
		isUploadingImages;

	const submitNote = async (
		submitMode: PublishSubmitMode,
		snapshot?: ComposerSnapshot,
	) => {
		try {
			const payload = await buildPayload(submitMode, snapshot);
			if (isEditingNote && noteId) {
				updateNoteMutation.mutate({
					id: noteId,
					title: payload.title,
					content: payload.content,
					images: payload.images,
					imageMetas: payload.imageMetas,
					topics: payload.topics,
					locationName: payload.locationName,
					visibility: payload.visibility,
					components: payload.components,
					advancedOptions: payload.advancedOptions,
				});
				return;
			}
			if (draftId) {
				updateDraftMutation.mutate({ id: draftId, ...payload });
				return;
			}
			createMutation.mutate(payload);
		} catch (error) {
			if (submitMode === "draft" && optimisticDraftSaveRef.current) {
				failOptimisticDraftSave(error);
				return;
			}
			if (isRequestTimeoutError(error)) return;
			setPendingSubmitMode(null);
			toast.show({
				variant: "danger",
				label: error instanceof Error ? error.message : "图片上传失败",
			});
		}
	};

	const leaveComposer = () => {
		if (onRequestClose) {
			onRequestClose();
			return;
		}
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/" as Href);
	};

	const goBack = () => {
		fireHaptic();
		if (hasDraftChanges) {
			Alert.alert("放弃草稿修改？", "当前修改还没有保存，返回后将会丢失。", [
				{ style: "cancel", text: "继续编辑" },
				{
					onPress: leaveComposer,
					style: "destructive",
					text: "放弃并返回",
				},
			]);
			return;
		}
		leaveComposer();
	};

	const goToDrafts = () => {
		resetForm();
		if (onRequestClose) {
			router.push("/drafts" as Href);
			return;
		}
		router.replace("/drafts" as Href);
	};

	const openDrafts = () => {
		fireHaptic();
		if (!hasUnsavedChanges) {
			goToDrafts();
			return;
		}

		Alert.alert("打开我的草稿？", "当前未保存的内容会丢失。", [
			{ style: "cancel", text: "取消" },
			{
				onPress: goToDrafts,
				style: "destructive",
				text: "放弃并打开",
			},
		]);
	};

	const addImage = async () => {
		if (isAddingImages) return;
		fireHaptic();
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			toast.show({
				variant: "warning",
				label: "需要允许访问相册",
			});
			return;
		}

		const remaining = Math.max(0, 9 - images.length);
		if (remaining === 0) {
			toast.show({ variant: "warning", label: "最多只能选择 9 张图片" });
			return;
		}

		setIsAddingImages(true);
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				allowsEditing: false,
				allowsMultipleSelection: true,
				mediaTypes: "images",
				orderedSelection: true,
				preferredAssetRepresentationMode:
					ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
				quality: 0.92,
				selectionLimit: remaining,
				shouldDownloadFromNetwork: true,
			});

			if (result.canceled) {
				return;
			}

			const selectedImages = await Promise.all(
				result.assets.map((asset) => createComposerImageFromAsset(asset)),
			);

			setImages((current) => [...current, ...selectedImages].slice(0, 9));
		} catch {
			toast.show({
				variant: "danger",
				label: "图片处理失败",
			});
		} finally {
			setIsAddingImages(false);
		}
	};

	const removeImage = (id: string) => {
		fireHaptic();
		setImages((current) => current.filter((item) => item.id !== id));
	};

	const updateImage = (image: ComposerImage) => {
		setImages((current) =>
			current.map((item) => (item.id === image.id ? image : item)),
		);
	};

	const setComposerContent = (value: string) => {
		setContent(value);
		setTopics(extractTopicsFromContent(value));
	};

	const toggleTopic = (topic: string) => {
		fireHaptic();
		const cleanTopic = topic.replace(/^#/, "").trim();
		if (!cleanTopic) return;
		setTopics((current) =>
			current.includes(cleanTopic)
				? current.filter((item) => item !== cleanTopic)
				: [...current, cleanTopic].slice(0, 8),
		);
	};

	const insertMention = (label: string) => {
		fireHaptic();
		const cleanLabel = label.replace(/^@/, "").trim();
		if (!cleanLabel) return;
		setContent((current) => {
			const prefix = current.trimEnd();
			return `${prefix}${prefix ? " " : ""}@${cleanLabel} `;
		});
	};

	const saveDraft = () => {
		fireHaptic();
		if (isSubmitting) return;
		if (isEditingNote) return;
		if (!isAuthenticated) {
			toast.show({
				variant: "warning",
				label: "登录后再保存",
			});
			return;
		}
		if (!hasSavableContent) {
			toast.show({
				variant: "warning",
				label: "还没有可保存的内容",
			});
			return;
		}

		const snapshot = snapshotComposer();
		setIsOptimisticDraftSaving(true);
		clearDraftRecovery();
		setDraftRecovery(snapshot);
		optimisticDraftSaveRef.current = snapshot;

		toast.show({
			id: "draft-save-status",
			label: "已存入草稿",
			variant: "success",
		});
		void submitNote("draft", snapshot);
		resetForm();
		leaveComposer();
	};

	const publish = () => {
		fireHaptic();
		if (isSubmitting) return;

		if (!isAuthenticated) {
			toast.show({
				variant: "warning",
				label: "登录后再发布",
			});
			return;
		}

		if (!canPublish) {
			toast.show({
				variant: "warning",
				label: `还差：${missingItems.join("、")}`,
			});
			return;
		}

		setPendingSubmitMode("publish");
		void submitNote("publish");
	};

	const cycleVisibility = () => {
		fireHaptic();
		setVisibility((value) => {
			if (value === "public") return "followers";
			if (value === "followers") return "private";
			return "public";
		});
	};

	const setAllowComment = (value: boolean) => {
		fireHaptic();
		setAdvancedOptions((current) => ({
			...current,
			allowComment: value,
		}));
	};

	const setAllowShare = (value: boolean) => {
		fireHaptic();
		setAdvancedOptions((current) => ({
			...current,
			allowShare: value,
		}));
	};

	return {
		advancedLabel,
		advancedOptions,
		addImage,
		content,
		cycleVisibility,
		draftQuery,
		editNoteQuery,
		goBack,
		images,
		isAddingImages,
		isEditingDraft,
		isEditingNote,
		isLoadingExistingContent:
			(isEditingDraft &&
				!shouldRecoverDraft &&
				(draftQuery.isLoading || !draftQuery.data)) ||
			(isEditingNote && (editNoteQuery.isLoading || !editNoteQuery.data)),
		loadExistingContentError:
			(!shouldRecoverDraft && draftQuery.isError) || editNoteQuery.isError,
		isSubmitting,
		isUploadingImages,
		pendingSubmitMode,
		openDrafts,
		publish,
		removeImage,
		saveDraft,
		setAllowComment,
		setAllowShare,
		setContent: setComposerContent,
		setTitle,
		retryLoadExistingContent: () => {
			if (isEditingDraft) {
				void draftQuery.refetch();
				return;
			}
			void editNoteQuery.refetch();
		},
		title,
		updateImage,
		insertMention,
		toggleTopic,
		topics,
		visibilityLabel,
	};
}
