import { Magnifier, Plus } from "@gravity-ui/icons";
import { Button, SearchField } from "@heroui/react";

export function TopicFilters({
	keyword,
	onCreateTopic,
	onKeywordChange,
}: {
	keyword: string;
	onCreateTopic: () => void;
	onKeywordChange: (value: string) => void;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<SearchField
				aria-label="搜索话题"
				className="w-full sm:w-[260px]"
				name="topics-search"
				value={keyword}
				variant="secondary"
				onChange={onKeywordChange}
			>
				<SearchField.Group>
					<SearchField.SearchIcon>
						<Magnifier className="size-4" />
					</SearchField.SearchIcon>
					<SearchField.Input placeholder="搜索话题..." />
					<SearchField.ClearButton />
				</SearchField.Group>
			</SearchField>

			<Button onPress={onCreateTopic}>
				<Plus className="size-4" />
				新建话题
			</Button>
		</div>
	);
}
