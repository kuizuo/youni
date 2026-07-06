import { EmptyState } from "@/components/social-states";

import type { ProfileTabKey } from "../profile-tabs";

export function MeTabEmptyState({
	tab,
	onCreate,
}: {
	tab: ProfileTabKey;
	onCreate: () => void;
}) {
	if (tab === "collections") {
		return (
			<EmptyState
				icon="bookmark-outline"
				title="还没有收藏"
				description="收藏过的图文会出现在这里。"
			/>
		);
	}
	if (tab === "liked") {
		return (
			<EmptyState title="还没有赞过" description="赞过的内容会显示在这里。" />
		);
	}
	return (
		<EmptyState
			icon="add-circle-outline"
			title="还没有作品"
			description="发布第一篇图文后，会出现在这里。"
			actionLabel="去发布"
			onAction={onCreate}
		/>
	);
}
