import type { ContentModerationDetail } from "@youni/db/schema/content";
import SensitiveWordTool from "sensitive-word-tool";

type ContentTextModerationInput = {
	advancedOptions: {
		contentDisclosure?: string | null;
	};
	components: Array<{
		options?: string[];
		title: string;
		value?: string;
	}>;
	content: string;
	locationName?: string;
	title: string;
	topics: string[];
};

export type ContentTextModerationField = NonNullable<
	ContentModerationDetail["field"]
>;

export type ContentTextModerationMatch = {
	field: ContentTextModerationField;
	terms: string[];
};

function contentTextParts(
	input: ContentTextModerationInput,
): Array<{ field: ContentTextModerationField; value: string }> {
	const componentParts = input.components.flatMap((component) => [
		{ field: "component" as const, value: component.title },
		{ field: "component" as const, value: component.value ?? "" },
		...(component.options ?? []).map((value) => ({
			field: "component" as const,
			value,
		})),
	]);

	return [
		{ field: "title", value: input.title },
		{ field: "content", value: input.content },
		...input.topics.map((value) => ({ field: "topic" as const, value })),
		{ field: "location", value: input.locationName ?? "" },
		{
			field: "content_disclosure",
			value: input.advancedOptions.contentDisclosure ?? "",
		},
		...componentParts,
	];
}

export function findBlockedContentText(
	input: ContentTextModerationInput,
	blockedTerms: string[],
): ContentTextModerationMatch[] {
	if (blockedTerms.length === 0) return [];
	const blockedContentText = new SensitiveWordTool({ wordList: blockedTerms });
	const termsByField = new Map<ContentTextModerationField, Set<string>>();
	for (const { field, value } of contentTextParts(input)) {
		const terms = blockedContentText.match(value.normalize("NFKC"));
		if (terms.length === 0) continue;
		const fieldTerms = termsByField.get(field) ?? new Set<string>();
		for (const term of terms) fieldTerms.add(term);
		termsByField.set(field, fieldTerms);
	}

	return Array.from(termsByField, ([field, terms]) => ({
		field,
		terms: Array.from(terms),
	}));
}
