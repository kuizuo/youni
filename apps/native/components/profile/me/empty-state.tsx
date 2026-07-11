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
		return <EmptyState icon="bookmark-outline" title="还没有收藏" />;
	}
	if (tab === "liked") {
		return <EmptyState title="还没有赞过" />;
	}
	if (tab === "comments") {
		return <EmptyState icon="chatbubble-ellipses-outline" title="还没有评论" />;
	}
	return (
		<EmptyState
			icon="add-circle-outline"
			title="还没有作品"
			actionLabel="去发布"
			onAction={onCreate}
		/>
	);
}
