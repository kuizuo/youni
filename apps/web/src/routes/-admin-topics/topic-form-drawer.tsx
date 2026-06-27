import { Button, Drawer, Input, Label, TextField } from "@heroui/react";
import type { FormEvent } from "react";

import { type TopicFormMode, type TopicFormState, topicFormId } from "./types";

export function TopicFormDrawer({
	form,
	formMessage,
	isOpen,
	isSubmitting,
	mode,
	onCancel,
	onChange,
	onSubmit,
}: {
	form: TopicFormState;
	formMessage: string | null;
	isOpen: boolean;
	isSubmitting: boolean;
	mode: TopicFormMode;
	onCancel: () => void;
	onChange: (value: TopicFormState) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
	const isEdit = mode === "edit";
	const title = isEdit ? "编辑话题" : "新建话题";

	return (
		<Drawer>
			<Drawer.Backdrop
				isOpen={isOpen}
				onOpenChange={(open) => {
					if (!open) onCancel();
				}}
				variant="blur"
			>
				<Drawer.Content placement="right">
					<Drawer.Dialog aria-label={title} className="w-full sm:max-w-md">
						<Drawer.CloseTrigger />
						<form id={topicFormId} className="contents" onSubmit={onSubmit}>
							<Drawer.Header>
								<Drawer.Heading>{title}</Drawer.Heading>
							</Drawer.Header>
							<Drawer.Body>
								<TextField name="topic-name">
									<Label>话题名称</Label>
									<Input
										fullWidth
										placeholder="请输入话题名称"
										value={form.name}
										onChange={(event) =>
											onChange({ ...form, name: event.target.value })
										}
									/>
								</TextField>
								{formMessage ? (
									<p className="rounded-xl bg-danger-soft px-3 py-2 text-danger-soft-foreground text-sm">
										{formMessage}
									</p>
								) : null}
							</Drawer.Body>
							<Drawer.Footer>
								<Button type="submit" isPending={isSubmitting}>
									{isEdit ? "保存修改" : "创建话题"}
								</Button>
								<Button type="button" variant="tertiary" onPress={onCancel}>
									取消
								</Button>
							</Drawer.Footer>
						</form>
					</Drawer.Dialog>
				</Drawer.Content>
			</Drawer.Backdrop>
		</Drawer>
	);
}
