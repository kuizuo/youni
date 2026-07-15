import { Magnifier } from "@gravity-ui/icons";
import { Button, SearchField } from "@heroui/react";

export function AdminSearchField({
	ariaLabel,
	keyword,
	name,
	onChange,
	onClear,
	onSubmit,
	placeholder,
}: {
	ariaLabel: string;
	keyword: string;
	name: string;
	onChange: (value: string) => void;
	onClear: () => void;
	onSubmit: (value: string) => void;
	placeholder: string;
}) {
	return (
		<div className="flex w-full gap-2 sm:w-auto">
			<SearchField
				aria-label={ariaLabel}
				className="min-w-0 flex-1 sm:w-80"
				name={name}
				value={keyword}
				variant="secondary"
				onChange={onChange}
				onClear={onClear}
				onSubmit={onSubmit}
			>
				<SearchField.Group className="md:h-8">
					<SearchField.SearchIcon>
						<Magnifier className="size-4" />
					</SearchField.SearchIcon>
					<SearchField.Input placeholder={placeholder} />
					<SearchField.ClearButton />
				</SearchField.Group>
			</SearchField>
			<Button size="sm" variant="secondary" onPress={() => onSubmit(keyword)}>
				搜索
			</Button>
		</div>
	);
}
