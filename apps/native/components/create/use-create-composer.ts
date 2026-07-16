import { useMutation, useQuery } from "@tanstack/react-query";
import type { NoteVisibility } from "@youni/api/contracts/shared";
import type * as ImagePicker from "expo-image-picker";
import type { Href } from "expo-router";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager } from "react-native";

import type { PublishSubmitMode } from "@/components/create/create-types";
import { reorderImages } from "@/components/media/image-order";
import { isRegisteredUser } from "@/lib/anonymous-session";
import { apiBaseUrl } from "@/lib/api-url";
import { resolveStoredNoteImageUrl } from "@/lib/api-url-resolver";
import { authClient } from "@/lib/auth-client";
import {
	createDraftCoverThumbnail,
	materializeLocalDraftImage,
	releaseMaterializedDraftImages,
	serializeComposerImages,
} from "@/lib/local-drafts/image-io";
import {
	deleteLocalDraft,
	getLocalDraft,
	saveLocalDraft,
} from "@/lib/local-drafts/store";
import type { LocalDraftAdvancedOptions } from "@/lib/local-drafts/types";
import { prepareMediaImage } from "@/lib/media/prepare-media-image";
import { selectImagesFromSystem } from "@/lib/media/system-image-picker";
import type { MediaImage } from "@/lib/media/types";
import {
	deleteUploadedNoteImages,
	uploadNoteImages,
} from "@/lib/note-image-upload";
import { NotePublishAttempt } from "@/lib/note-publish-attempt";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { confirmAction } from "@/utils/confirm-action";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const DEFAULT_ADVANCED_OPTIONS: LocalDraftAdvancedOptions = {
	allowComment: true,
	allowShare: true,
};

type NotePublishPayload = {
	advancedOptions: LocalDraftAdvancedOptions;
	components: [];
	content: string;
	imageMetas: Array<{ height: number; url: string; width: number }>;
	images: string[];
	locationName: undefined;
	publishAttemptId: string;
	title: string;
	topics: string[];
	visibility: NoteVisibility;
};

const DEFINITIVE_PUBLISH_ERROR_CODES = new Set([
	"BAD_REQUEST",
	"CONFLICT",
	"FORBIDDEN",
	"NOT_FOUND",
	"UNAUTHORIZED",
]);

function isUnknownPublishResult(error: unknown) {
	if (isRequestTimeoutError(error)) return true;
	return !(
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		DEFINITIVE_PUBLISH_ERROR_CODES.has(String(error.code))
	);
}

function composerSignature(composer: {
	advancedOptions: LocalDraftAdvancedOptions;
	content: string;
	images: MediaImage[];
	title: string;
	topics: string[];
	visibility: NoteVisibility;
}) {
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

type UseCreateComposerOptions = {
	onRequestClose?: () => void;
};

export function useCreateComposer({
	onRequestClose,
}: UseCreateComposerOptions) {
	const params = useLocalSearchParams<{
		draftId?: string | string[];
		noteId?: string | string[];
	}>();
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const [hasAuthenticated, setHasAuthenticated] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [images, setImages] = useState<MediaImage[]>([]);
	const [topics, setTopics] = useState<string[]>([]);
	const [visibility, setVisibility] = useState<NoteVisibility>("public");
	const [advancedOptions, setAdvancedOptions] =
		useState<LocalDraftAdvancedOptions>(DEFAULT_ADVANCED_OPTIONS);
	const [pendingSubmitMode, setPendingSubmitMode] =
		useState<PublishSubmitMode | null>(null);
	const [isAddingImages, setIsAddingImages] = useState(false);
	const [isLocalDraftSaving, setIsLocalDraftSaving] = useState(false);
	const [isUploadingImages, setIsUploadingImages] = useState(false);
	const [isDraftLoading, setIsDraftLoading] = useState(false);
	const [draftLoadError, setDraftLoadError] = useState<Error | null>(null);
	const [draftLoadAttempt, setDraftLoadAttempt] = useState(0);
	const [hydratedDraftId, setHydratedDraftId] = useState<null | string>(null);
	const [hydratedNoteId, setHydratedNoteId] = useState<null | string>(null);
	const draftBaselineRef = useRef<null | string>(null);
	const draftSaveInFlightRef = useRef(false);
	const materializedDraftUrisRef = useRef<string[]>([]);
	const publishAttemptRef =
		useRef<NotePublishAttempt<NotePublishPayload> | null>(null);
	publishAttemptRef.current ??= new NotePublishAttempt<NotePublishPayload>();
	const publishAttempt = publishAttemptRef.current;
	const rawDraftId = params.draftId;
	const rawNoteId = params.noteId;
	const draftId = Array.isArray(rawDraftId) ? rawDraftId[0] : rawDraftId;
	const noteId = Array.isArray(rawNoteId) ? rawNoteId[0] : rawNoteId;
	const isEditingDraft = Boolean(draftId);
	const isEditingNote = Boolean(noteId && !draftId);
	const registeredUser = isRegisteredUser(session.data?.user)
		? session.data?.user
		: undefined;
	const isAuthenticated = Boolean(registeredUser) || hasAuthenticated;
	const userId = registeredUser?.id;

	useEffect(() => {
		if (registeredUser) {
			setHasAuthenticated(true);
		}
	}, [registeredUser]);

	const missingItems = useMemo(
		() =>
			[
				images.length === 0 ? "图片" : null,
				title.trim().length === 0 ? "标题" : null,
				content.trim().length === 0 ? "正文" : null,
			].filter((item): item is string => Boolean(item)),
		[content, images.length, title],
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
		draftBaselineRef.current !== null &&
		draftBaselineRef.current !== currentComposerSignature;
	const visibilityLabel =
		visibility === "public"
			? "公开可见"
			: visibility === "followers"
				? "仅关注者可见"
				: "仅自己可见";
	const advancedLabel = advancedOptions.allowComment ? "评论开启" : "评论关闭";
	const editNoteQuery = useQuery({
		...orpc.notes.editById.queryOptions({
			input: { id: noteId || "missing" },
		}),
		enabled: Boolean(isEditingNote && noteId && isAuthenticated),
	});
	const resetForm = () => {
		publishAttempt.reset();
		const materializedUris = materializedDraftUrisRef.current;
		materializedDraftUrisRef.current = [];
		if (materializedUris.length > 0) {
			void releaseMaterializedDraftImages(materializedUris);
		}
		setTitle("");
		setContent("");
		setImages([]);
		setTopics([]);
		setVisibility("public");
		setAdvancedOptions(DEFAULT_ADVANCED_OPTIONS);
		setHydratedDraftId(null);
		setHydratedNoteId(null);
		draftBaselineRef.current = null;
	};

	const createMutation = useMutation(orpc.notes.create.mutationOptions());
	const updateNoteMutation = useMutation(
		orpc.notes.updateNote.mutationOptions(),
	);

	// draftLoadAttempt is an explicit retry token for the same local draft id.
	// biome-ignore lint/correctness/useExhaustiveDependencies: retry must rerun this effect
	useEffect(() => {
		if (!draftId || !userId) return;
		let cancelled = false;
		setIsDraftLoading(true);
		setDraftLoadError(null);

		void getLocalDraft(userId, draftId)
			.then(async (draft) => {
				if (!draft) throw new Error("这份草稿已经不存在了");
				const draftImages = await Promise.all(
					draft.images.map((image) =>
						materializeLocalDraftImage(draft.id, image),
					),
				);
				if (cancelled) {
					await releaseMaterializedDraftImages(
						draftImages.map((image) => image.uri),
					);
					return;
				}

				materializedDraftUrisRef.current = draftImages.map(
					(image) => image.uri,
				);
				setTitle(draft.title);
				setContent(draft.content);
				setImages(draftImages);
				setTopics(draft.topics);
				setVisibility(draft.visibility);
				setAdvancedOptions(draft.advancedOptions);
				setHydratedDraftId(draft.id);
				draftBaselineRef.current = composerSignature({
					advancedOptions: draft.advancedOptions,
					content: draft.content,
					images: draftImages,
					title: draft.title,
					topics: draft.topics,
					visibility: draft.visibility,
				});
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				setDraftLoadError(
					error instanceof Error ? error : new Error("草稿读取失败"),
				);
			})
			.finally(() => {
				if (!cancelled) setIsDraftLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [draftId, draftLoadAttempt, userId]);

	useEffect(
		() => () => {
			const uris = materializedDraftUrisRef.current;
			materializedDraftUrisRef.current = [];
			if (uris.length > 0) void releaseMaterializedDraftImages(uris);
		},
		[],
	);

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
				const previewUrl = resolveStoredNoteImageUrl(url, apiBaseUrl);
				return {
					height: meta?.height,
					id: url,
					originalUri: url,
					remoteUrl: url,
					uri: previewUrl,
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

	const imageMetasFrom = (items: MediaImage[]) =>
		items.flatMap((image) => {
			const url = image.remoteUrl ?? image.uri;
			return image.width && image.height
				? [{ height: image.height, url, width: image.width }]
				: [];
		});

	const uploadLocalImages = async (composerImages: MediaImage[]) => {
		const localAssets = composerImages.flatMap((image) =>
			image.asset ? [image.asset] : [],
		);
		if (localAssets.length === 0) {
			return {
				imageMetas: imageMetasFrom(composerImages),
				images: composerImages.map((image) => image.remoteUrl ?? image.uri),
				uploadedKeys: [] as string[],
			};
		}

		setIsUploadingImages(true);
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
			return {
				imageMetas: imageMetasFrom(nextImages),
				images: nextImages.map((image) => image.remoteUrl ?? image.uri),
				uploadedKeys: uploaded.map((item) => item.key),
			};
		} finally {
			setIsUploadingImages(false);
		}
	};

	const buildPayload = async (publishAttemptId: string) => {
		const source = {
			advancedOptions,
			content,
			images,
			title,
			topics,
			visibility,
		};
		const { uploadedKeys, ...uploadedImages } = await uploadLocalImages(
			source.images,
		);
		return {
			payload: {
				advancedOptions: source.advancedOptions,
				components: [] as [],
				content: source.content.trim(),
				...uploadedImages,
				locationName: undefined,
				publishAttemptId,
				title: source.title.trim(),
				topics: source.topics,
				visibility: source.visibility,
			},
			uploadedKeys,
		};
	};
	const isSubmitting =
		createMutation.isPending ||
		updateNoteMutation.isPending ||
		isAddingImages ||
		isLocalDraftSaving ||
		isUploadingImages;

	const submitNote = async () => {
		try {
			const result = await publishAttempt.run({
				cleanup: deleteUploadedNoteImages,
				isUnknownResult: isUnknownPublishResult,
				key: `${isEditingNote ? `edit:${noteId}` : "create"}:${currentComposerSignature}`,
				prepare: buildPayload,
				submit: async ({ publishAttemptId, ...payload }) => {
					if (isEditingNote && noteId) {
						return updateNoteMutation.mutateAsync({ id: noteId, ...payload });
					}
					return createMutation.mutateAsync({
						publishAttemptId,
						...payload,
					});
				},
			});
			if (!isEditingNote && draftId && userId) {
				await deleteLocalDraft(userId, draftId).catch(() => {
					toast.show({
						label: "发布成功，本地草稿未能自动删除",
						variant: "warning",
					});
				});
			}
			toast.show({
				label: isEditingNote
					? "修改已提交审核，通过后会自动发布"
					: "已提交审核，通过后会自动发布",
				variant: "success",
			});
			await queryClient.invalidateQueries();
			router.replace(`/note/${result.id}` as Href);
			InteractionManager.runAfterInteractions(resetForm);
		} catch (error) {
			if (isRequestTimeoutError(error)) return;
			toast.show({
				variant: "danger",
				label: error instanceof Error ? error.message : "图片上传失败",
			});
		} finally {
			setPendingSubmitMode(null);
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
			confirmAction({
				cancelText: "继续编辑",
				confirmText: "放弃并返回",
				message: "当前修改还没有保存，返回后将会丢失。",
				onConfirm: leaveComposer,
				title: "放弃草稿修改？",
			});
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

		confirmAction({
			cancelText: "取消",
			confirmText: "放弃并打开",
			message: "当前未保存的内容会丢失。",
			onConfirm: goToDrafts,
			title: "打开我的草稿？",
		});
	};

	const addImageAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
		if (isAddingImages) return false;

		const remaining = Math.max(0, 9 - images.length);
		if (remaining === 0) {
			toast.show({ variant: "warning", label: "最多只能选择 9 张图片" });
			return false;
		}
		if (assets.length === 0) return false;

		setIsAddingImages(true);
		try {
			const selectedImages = await Promise.all(
				assets.slice(0, remaining).map((asset) => prepareMediaImage(asset)),
			);

			setImages((current) => [...current, ...selectedImages].slice(0, 9));
			return true;
		} catch {
			toast.show({
				variant: "danger",
				label: "图片处理失败",
			});
			return false;
		} finally {
			setIsAddingImages(false);
		}
	};

	const pickImagesFromSystem = async () => {
		if (isAddingImages) return;
		fireHaptic();
		const remaining = Math.max(0, 9 - images.length);
		if (remaining === 0) {
			toast.show({ variant: "warning", label: "最多只能选择 9 张图片" });
			return;
		}

		try {
			const assets = await selectImagesFromSystem(remaining);
			if (assets.length > 0) await addImageAssets(assets);
		} catch {
			toast.show({ variant: "danger", label: "图片选择失败" });
		}
	};

	const removeImage = (id: string) => {
		fireHaptic();
		setImages((current) => current.filter((item) => item.id !== id));
	};

	const moveImage = (imageId: string, toIndex: number) => {
		setImages((current) => {
			const fromIndex = current.findIndex((image) => image.id === imageId);
			if (fromIndex < 0) return current;
			return reorderImages(current, fromIndex, toIndex);
		});
	};

	const updateImage = (image: MediaImage) => {
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

	const saveDraft = async () => {
		fireHaptic();
		if (isSubmitting || draftSaveInFlightRef.current) return;
		if (isEditingNote) return;
		if (!isAuthenticated || !userId) {
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

		draftSaveInFlightRef.current = true;
		setIsLocalDraftSaving(true);
		setPendingSubmitMode("draft");
		try {
			const [serializedImages, cover] = await Promise.all([
				serializeComposerImages(images),
				createDraftCoverThumbnail(images[0]),
			]);
			await saveLocalDraft({
				advancedOptions,
				content,
				coverAspectRatio: cover?.aspectRatio,
				coverData: cover?.data,
				coverMimeType: cover?.mimeType,
				id: draftId,
				images: serializedImages,
				title,
				topics,
				userId,
				visibility,
			});
			toast.show({
				id: "draft-save-status",
				label: "已存入草稿",
				variant: "success",
			});
			resetForm();
			leaveComposer();
		} catch (error) {
			toast.show({
				id: "draft-save-status",
				label: error instanceof Error ? error.message : "草稿保存失败",
				variant: "danger",
			});
		} finally {
			draftSaveInFlightRef.current = false;
			setIsLocalDraftSaving(false);
			setPendingSubmitMode(null);
		}
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
		void submitNote();
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
		addImageAssets,
		content,
		cycleVisibility,
		editNoteQuery,
		goBack,
		images,
		isAddingImages,
		isEditingDraft,
		isEditingNote,
		isLoadingExistingContent:
			(isEditingDraft && (isDraftLoading || hydratedDraftId === null)) ||
			(isEditingNote && (editNoteQuery.isLoading || !editNoteQuery.data)),
		loadExistingContentError: draftLoadError ?? editNoteQuery.error,
		isSubmitting,
		pendingSubmitMode,
		pickImagesFromSystem,
		openDrafts,
		publish,
		moveImage,
		removeImage,
		saveDraft,
		setAllowComment,
		setAllowShare,
		setContent: setComposerContent,
		setTitle,
		retryLoadExistingContent: () => {
			if (isEditingDraft) {
				setDraftLoadAttempt((current) => current + 1);
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
