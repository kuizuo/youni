export type TopicFormMode = "create" | "edit";

export type TopicFormState = {
	id: string | null;
	name: string;
};

export const emptyTopicForm: TopicFormState = {
	id: null,
	name: "",
};

export const topicFormId = "admin-topic-form";

export function getErrorMessage(error: unknown) {
	if (error instanceof Error && error.message) return error.message;
	return "操作失败，请稍后重试";
}
