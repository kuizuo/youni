import { Plus } from "@gravity-ui/icons";
import { Button } from "@heroui/react";

import { AdminSearchField } from "@/components/admin-search-field";

export function TopicFilters({
	keyword,
	onClearKeyword,
	onCreateTopic,
	onKeywordChange,
	onKeywordSubmit,
}: {
	keyword: string;
	onClearKeyword: () => void;
	onCreateTopic: () => void;
	onKeywordChange: (value: string) => void;
	onKeywordSubmit: (value: string) => void;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<AdminSearchField
				ariaLabel="搜索话题"
				keyword={keyword}
				name="topics-search"
				placeholder="搜索话题..."
				onChange={onKeywordChange}
				onClear={onClearKeyword}
				onSubmit={onKeywordSubmit}
			/>

			<Button onPress={onCreateTopic}>
				<Plus className="size-4" />
				新建话题
			</Button>
		</div>
	);
}
