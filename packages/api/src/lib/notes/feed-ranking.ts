const PERSONALIZED_WEIGHTS = {
	exploration: 0.05,
	freshness: 0.15,
	interest: 0.45,
	quality: 0.2,
	social: 0.15,
} as const;

const COLD_START_WEIGHTS = {
	exploration: 0.2,
	freshness: 0.35,
	quality: 0.45,
} as const;

const FRESHNESS_HALF_LIFE_HOURS = 72;
const EXPLORATION_MAX_IMPRESSIONS = 5;
const EXPLORATION_MAX_AGE_HOURS = 72;
const AUTHOR_PAGE_LIMIT = 2;
const EXPLORATION_SHARE = 0.2;
const PERSONALIZATION_MIN_SIGNAL_WEIGHT = 6;

export type NoteFeedCandidate = {
	authorId: string;
	collectedCount: number;
	commentCount: number;
	followedEngagerCount: number;
	id: string;
	impressionCount: number;
	likedCount: number;
	publishedAt: Date;
	topics: string[];
};

export type RankedNoteFeedCandidate = NoteFeedCandidate & {
	score: number;
};

export function rankFallbackCandidates(
	candidates: NoteFeedCandidate[],
	now: Date,
) {
	return [...candidates]
		.sort((left, right) => {
			const leftScore =
				left.likedCount * 3 +
				left.collectedCount * 5 +
				left.commentCount * 2 +
				Math.max(0, 72 - ageHours(left.publishedAt, now));
			const rightScore =
				right.likedCount * 3 +
				right.collectedCount * 5 +
				right.commentCount * 2 +
				Math.max(0, 72 - ageHours(right.publishedAt, now));
			return rightScore - leftScore || left.id.localeCompare(right.id);
		})
		.map((item) => item.id);
}

type ScoredNoteFeedCandidate = RankedNoteFeedCandidate & {
	isExploration: boolean;
};

type RankNoteFeedInput = {
	candidates: NoteFeedCandidate[];
	now: Date;
	pageSize: number;
	seed: string;
	topicWeights: Record<string, number>;
};

function clamp(value: number, minimum: number, maximum: number) {
	return Math.min(maximum, Math.max(minimum, value));
}

function ageHours(publishedAt: Date, now: Date) {
	return Math.max(0, now.getTime() - publishedAt.getTime()) / 3_600_000;
}

function deterministicUnit(seed: string, id: string) {
	let hash = 2_166_136_261;
	for (const character of `${seed}:${id}`) {
		hash ^= character.codePointAt(0) ?? 0;
		hash = Math.imul(hash, 16_777_619);
	}
	return (hash >>> 0) / 4_294_967_295;
}

function getTopicInterest(
	topics: string[],
	topicWeights: Record<string, number>,
) {
	if (topics.length === 0) return 0;
	const maximumMagnitude = Math.max(
		0,
		...Object.values(topicWeights).map((value) => Math.abs(value)),
	);
	if (maximumMagnitude === 0) return 0;
	const average =
		topics.reduce((sum, topic) => sum + (topicWeights[topic] ?? 0), 0) /
		topics.length;
	return clamp(average / maximumMagnitude, -1, 1);
}

function isExplorationCandidate(candidate: NoteFeedCandidate, now: Date) {
	return (
		ageHours(candidate.publishedAt, now) <= EXPLORATION_MAX_AGE_HOURS &&
		candidate.impressionCount <= EXPLORATION_MAX_IMPRESSIONS
	);
}

function respectsTopicRun(
	selected: ScoredNoteFeedCandidate[],
	candidate: ScoredNoteFeedCandidate,
) {
	const topic = candidate.topics[0];
	if (!topic || selected.length < 2) return true;
	return !selected.slice(-2).every((item) => item.topics[0] === topic);
}

function chooseCandidate({
	authorCounts,
	candidates,
	requireExploration,
	selected,
	selectedIds,
}: {
	authorCounts: Map<string, number>;
	candidates: ScoredNoteFeedCandidate[];
	requireExploration: boolean;
	selected: ScoredNoteFeedCandidate[];
	selectedIds: Set<string>;
}) {
	const eligible = candidates.filter(
		(candidate) =>
			!selectedIds.has(candidate.id) &&
			(authorCounts.get(candidate.authorId) ?? 0) < AUTHOR_PAGE_LIMIT &&
			(!requireExploration || candidate.isExploration),
	);
	return (
		eligible.find((candidate) => respectsTopicRun(selected, candidate)) ??
		eligible[0]
	);
}

export function rankNoteFeedCandidates({
	candidates,
	now,
	pageSize,
	seed,
	topicWeights,
}: RankNoteFeedInput): RankedNoteFeedCandidate[] {
	if (pageSize <= 0 || candidates.length === 0) return [];
	const maximumQuality = Math.max(
		1,
		...candidates.map((candidate) =>
			Math.log1p(
				candidate.likedCount +
					candidate.commentCount * 2 +
					candidate.collectedCount * 3,
			),
		),
	);
	const isPersonalized =
		Object.values(topicWeights).reduce(
			(total, value) => total + Math.abs(value),
			0,
		) >= PERSONALIZATION_MIN_SIGNAL_WEIGHT;
	const scored = candidates
		.map((candidate) => {
			const quality =
				Math.log1p(
					candidate.likedCount +
						candidate.commentCount * 2 +
						candidate.collectedCount * 3,
				) / maximumQuality;
			const freshness =
				0.5 **
				(ageHours(candidate.publishedAt, now) / FRESHNESS_HALF_LIFE_HOURS);
			const exploration = deterministicUnit(seed, candidate.id);
			const social = clamp(candidate.followedEngagerCount / 3, 0, 1);
			const interest = getTopicInterest(candidate.topics, topicWeights);
			const score = isPersonalized
				? interest * PERSONALIZED_WEIGHTS.interest +
					quality * PERSONALIZED_WEIGHTS.quality +
					freshness * PERSONALIZED_WEIGHTS.freshness +
					social * PERSONALIZED_WEIGHTS.social +
					exploration * PERSONALIZED_WEIGHTS.exploration
				: quality * COLD_START_WEIGHTS.quality +
					freshness * COLD_START_WEIGHTS.freshness +
					exploration * COLD_START_WEIGHTS.exploration;
			return {
				...candidate,
				isExploration: isExplorationCandidate(candidate, now),
				score,
			};
		})
		.sort(
			(left, right) =>
				right.score - left.score || left.id.localeCompare(right.id),
		);

	const availableExploration = scored.filter(
		(item) => item.isExploration,
	).length;
	const targetSize = Math.min(pageSize, scored.length);
	const explorationTarget = Math.min(
		availableExploration,
		Math.ceil(targetSize * EXPLORATION_SHARE),
	);
	const selected: ScoredNoteFeedCandidate[] = [];
	const selectedIds = new Set<string>();
	const authorCounts = new Map<string, number>();
	let explorationCount = 0;

	while (selected.length < targetSize) {
		const requireExploration = explorationCount < explorationTarget;
		let candidate = chooseCandidate({
			authorCounts,
			candidates: scored,
			requireExploration,
			selected,
			selectedIds,
		});
		if (!candidate && requireExploration) {
			candidate = chooseCandidate({
				authorCounts,
				candidates: scored,
				requireExploration: false,
				selected,
				selectedIds,
			});
		}
		if (!candidate) break;
		selected.push(candidate);
		selectedIds.add(candidate.id);
		authorCounts.set(
			candidate.authorId,
			(authorCounts.get(candidate.authorId) ?? 0) + 1,
		);
		if (candidate.isExploration) explorationCount += 1;
	}

	return selected.map(
		({ isExploration: _isExploration, ...candidate }) => candidate,
	);
}

export function buildNoteFeedPages(input: RankNoteFeedInput) {
	const remaining = [...input.candidates];
	const pages: string[][] = [];
	while (remaining.length > 0) {
		const page = rankNoteFeedCandidates({
			...input,
			candidates: remaining,
		});
		if (page.length === 0) break;
		pages.push(page.map((item) => item.id));
		const selected = new Set(page.map((item) => item.id));
		for (let index = remaining.length - 1; index >= 0; index -= 1) {
			if (selected.has(remaining[index]?.id ?? "")) remaining.splice(index, 1);
		}
	}
	return pages;
}
