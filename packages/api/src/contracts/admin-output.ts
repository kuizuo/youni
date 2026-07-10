import type {
	AdminContentNoteDetail,
	AdminHydratedContentNote,
} from "./content-note-types";

export type AdminOutputs = {
	me: {
		isAdmin: boolean;
		role: "admin" | "operator" | "user";
		user: {
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
			gender: string;
			role: string;
			status: string;
			createdAt: Date;
			updatedAt: Date;
		};
	};
	updateCurrentProfile: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		handle: string | null;
		bio: string | null;
		gender: string;
		role: string;
		status: string;
		createdAt: Date;
		updatedAt: Date;
	};
	overview: {
		noteCount: number;
		auditCount: number;
		userCount: number;
		topicCount: number;
		interactionCount: number;
		recentNotes: {
			id: string;
			title: string;
			status: "draft" | "audit" | "published" | "rejected" | "hidden";
			createdAt: Date;
			authorName: string;
		}[];
	};
	notes: {
		items: AdminHydratedContentNote<{
			id: string;
			title: string;
			content: string;
			cover: string | null;
			images: string[];
			imageMetas: { height: number; url: string; width: number }[];
			locationName: string | null;
			visibility: "public" | "followers" | "private";
			components: {
				options?: string[];
				title: string;
				type: "file" | "poll";
				value?: string;
			}[];
			advancedOptions: {
				allowComment: boolean;
				allowShare: boolean;
				contentDisclosure?: string | null;
				isOriginal: boolean;
			};
			status: "draft" | "audit" | "published" | "rejected" | "hidden";
			rejectionReason: string | null;
			createdAt: Date;
			publishedAt: Date | null;
			draftSavedAt: Date | null;
			userId: string;
			authorName: string;
			authorEmail: string;
		}>[];
		total: number;
	};
	noteDetail: AdminContentNoteDetail;
	updateNoteStatus:
		| {
				title: string;
				images: string[];
				id: string;
				status: "draft" | "audit" | "published" | "rejected" | "hidden";
				createdAt: Date;
				updatedAt: Date;
				userId: string;
				content: string;
				imageMetas: { height: number; url: string; width: number }[];
				cover: string | null;
				locationName: string | null;
				visibility: "public" | "followers" | "private";
				components: {
					options?: string[];
					title: string;
					type: "file" | "poll";
					value?: string;
				}[];
				advancedOptions: {
					allowComment: boolean;
					allowShare: boolean;
					contentDisclosure?: string | null;
					isOriginal: boolean;
				};
				rejectionReason: string | null;
				publishedAt: Date | null;
				draftSavedAt: Date | null;
		  }
		| undefined;
	deleteNote: { ok: boolean };
	topics: {
		items: { noteCount: number; id: string; name: string; createdAt: Date }[];
		total: number;
	};
	topicDetail: {
		topic: {
			noteCount: number;
			id: string;
			name: string;
			createdAt: Date;
			updatedAt: Date;
		};
		notes: AdminHydratedContentNote<{
			id: string;
			title: string;
			content: string;
			cover: string | null;
			images: string[];
			imageMetas: { height: number; url: string; width: number }[];
			locationName: string | null;
			visibility: "public" | "followers" | "private";
			components: {
				options?: string[];
				title: string;
				type: "file" | "poll";
				value?: string;
			}[];
			advancedOptions: {
				allowComment: boolean;
				allowShare: boolean;
				contentDisclosure?: string | null;
				isOriginal: boolean;
			};
			status: "draft" | "audit" | "published" | "rejected" | "hidden";
			rejectionReason: string | null;
			createdAt: Date;
			publishedAt: Date | null;
			draftSavedAt: Date | null;
			userId: string;
			authorName: string;
			authorEmail: string;
		}>[];
	};
	saveTopic:
		| { name: string; id: string; createdAt: Date; updatedAt: Date }
		| undefined;
	deleteTopic: { ok: boolean };
	users: {
		items: {
			noteCount: number;
			followerCount: number;
			followingCount: number;
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
			gender: string;
			role: string;
			status: string;
			createdAt: Date;
			updatedAt: Date;
		}[];
		total: number;
	};
	userDetail: {
		user: {
			noteCount: number;
			followerCount: number;
			followingCount: number;
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
			gender: string;
			role: string;
			status: string;
			createdAt: Date;
			updatedAt: Date;
		};
		notes: AdminHydratedContentNote<{
			id: string;
			title: string;
			content: string;
			cover: string | null;
			images: string[];
			imageMetas: { height: number; url: string; width: number }[];
			locationName: string | null;
			visibility: "public" | "followers" | "private";
			components: {
				options?: string[];
				title: string;
				type: "file" | "poll";
				value?: string;
			}[];
			advancedOptions: {
				allowComment: boolean;
				allowShare: boolean;
				contentDisclosure?: string | null;
				isOriginal: boolean;
			};
			status: "draft" | "audit" | "published" | "rejected" | "hidden";
			rejectionReason: string | null;
			createdAt: Date;
			publishedAt: Date | null;
			draftSavedAt: Date | null;
			userId: string;
			authorName: string;
			authorEmail: string;
		}>[];
		followers: {
			userId: string;
			name: string;
			email: string;
			image: string | null;
			createdAt: Date;
		}[];
		following: {
			userId: string;
			name: string;
			email: string;
			image: string | null;
			createdAt: Date;
		}[];
	};
	createUser:
		| {
				name: string;
				email: string;
				id: string;
				emailVerified: boolean;
				image: string | null;
				handle: string | null;
				bio: string | null;
				gender: string;
				role: string;
				status: string;
				banned: boolean;
				banReason: string | null;
				banExpires: Date | null;
				createdAt: Date;
				updatedAt: Date;
		  }
		| undefined;
	updateUser:
		| {
				name: string;
				email: string;
				id: string;
				emailVerified: boolean;
				image: string | null;
				handle: string | null;
				bio: string | null;
				gender: string;
				role: string;
				status: string;
				banned: boolean;
				banReason: string | null;
				banExpires: Date | null;
				createdAt: Date;
				updatedAt: Date;
		  }
		| undefined;
	updateUserStatus:
		| {
				name: string;
				email: string;
				id: string;
				emailVerified: boolean;
				image: string | null;
				handle: string | null;
				bio: string | null;
				gender: string;
				role: string;
				status: string;
				banned: boolean;
				banReason: string | null;
				banExpires: Date | null;
				createdAt: Date;
				updatedAt: Date;
		  }
		| undefined;
	softDeleteUser:
		| {
				name: string;
				email: string;
				id: string;
				emailVerified: boolean;
				image: string | null;
				handle: string | null;
				bio: string | null;
				gender: string;
				role: string;
				status: string;
				banned: boolean;
				banReason: string | null;
				banExpires: Date | null;
				createdAt: Date;
				updatedAt: Date;
		  }
		| undefined;
	restoreUser:
		| {
				name: string;
				email: string;
				id: string;
				emailVerified: boolean;
				image: string | null;
				handle: string | null;
				bio: string | null;
				gender: string;
				role: string;
				status: string;
				banned: boolean;
				banReason: string | null;
				banExpires: Date | null;
				createdAt: Date;
				updatedAt: Date;
		  }
		| undefined;
};
