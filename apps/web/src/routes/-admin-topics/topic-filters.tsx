import { Magnifier, Plus } from "@gravity-ui/icons";
import { Button, SearchField } from "@heroui/react";

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
			<div className="flex w-full gap-2 sm:w-auto">
				<SearchField
					aria-label="搜索话题"
					className="min-w-0 flex-1 sm:w-80"
					name="topics-search"
					value={keyword}
					variant="secondary"
					onChange={onKeywordChange}
					onClear={onClearKeyword}
					onSubmit={onKeywordSubmit}
				>
					<SearchField.Group className="md:h-8">
						<SearchField.SearchIcon>
							<Magnifier className="size-4" />
						</SearchField.SearchIcon>
						<SearchField.Input placeholder="搜索话题..." />
						<SearchField.ClearButton />
					</SearchField.Group>
				</SearchField>
				<Button
					size="sm"
					variant="secondary"
					onPress={() => onKeywordSubmit(keyword)}
				>
					搜索
				</Button>
			</div>

			<Button onPress={onCreateTopic}>
				<Plus className="size-4" />
				新建话题
			</Button>
		</div>
	);
}
