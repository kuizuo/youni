import { Gear, Plus, TrashBin } from "@gravity-ui/icons";
import {
	Button,
	Chip,
	Drawer,
	Input,
	Label,
	Skeleton,
	TextField,
} from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { orpc } from "@/utils/orpc";

const LOADING_ROWS = ["one", "two", "three", "four", "five", "six"];

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}

export function ProhibitedTermsSettings() {
	const [isOpen, setIsOpen] = useState(false);
	const [term, setTerm] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const termsQuery = useQuery({
		...orpc.admin.prohibitedTerms.queryOptions(),
		enabled: isOpen,
	});
	const addMutation = useMutation(
		orpc.admin.addProhibitedTerm.mutationOptions(),
	);
	const deleteMutation = useMutation(
		orpc.admin.deleteProhibitedTerm.mutationOptions(),
	);
	const isMutating = addMutation.isPending || deleteMutation.isPending;

	const refreshTerms = async () => {
		await termsQuery.refetch({ throwOnError: true });
	};

	const addTerm = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const normalized = term.normalize("NFKC").trim();
		if (!normalized) return;
		setErrorMessage(null);
		setMessage(null);
		try {
			const result = await addMutation.mutateAsync({ term: normalized });
			setTerm("");
			setMessage(result.created ? `已添加“${normalized}”` : "这个词已经存在");
			await refreshTerms();
		} catch (error) {
			setErrorMessage(getErrorMessage(error, "新增失败，请稍后重试"));
		}
	};

	const deleteTerm = async (value: string) => {
		setErrorMessage(null);
		setMessage(null);
		try {
			await deleteMutation.mutateAsync({ term: value });
			setMessage(`已删除“${value}”`);
			await refreshTerms();
		} catch (error) {
			setErrorMessage(getErrorMessage(error, "删除失败，请稍后重试"));
		}
	};

	return (
		<>
			<Button variant="secondary" onPress={() => setIsOpen(true)}>
				<Gear className="size-4" />
				违禁词配置
			</Button>
			<Drawer>
				<Drawer.Backdrop
					isOpen={isOpen}
					onOpenChange={(open) => {
						setIsOpen(open);
						if (!open) {
							setErrorMessage(null);
							setMessage(null);
							setTerm("");
						}
					}}
					variant="blur"
				>
					<Drawer.Content placement="right">
						<Drawer.Dialog
							aria-label="违禁词配置"
							className="w-full sm:max-w-lg"
						>
							<Drawer.CloseTrigger />
							<Drawer.Header className="border-border border-b pr-14">
								<Drawer.Heading>违禁词配置</Drawer.Heading>
								<p className="mt-1 text-muted text-sm leading-6">
									新发布的图文会按这里的词库检查文字内容。
								</p>
							</Drawer.Header>
							<Drawer.Body className="grid content-start gap-5 py-5">
								<form className="grid gap-2" onSubmit={addTerm}>
									<TextField name="prohibited-term">
										<Label>新增违禁词</Label>
										<div className="flex items-center gap-2">
											<Input
												fullWidth
												maxLength={50}
												placeholder="输入后添加"
												value={term}
												onChange={(event) => setTerm(event.target.value)}
											/>
											<Button
												type="submit"
												isDisabled={!term.trim() || isMutating}
												isPending={addMutation.isPending}
											>
												<Plus className="size-4" />
												添加
											</Button>
										</div>
									</TextField>
								</form>

								{message ? (
									<p className="rounded-xl bg-success-soft px-3 py-2 text-sm text-success-soft-foreground">
										{message}
									</p>
								) : null}
								{errorMessage ? (
									<p className="rounded-xl bg-danger-soft px-3 py-2 text-danger-soft-foreground text-sm">
										{errorMessage}
									</p>
								) : null}

								<section className="grid gap-3">
									<div className="flex items-center justify-between gap-3">
										<div>
											<h3 className="font-medium">当前词库</h3>
											<p className="mt-1 text-muted text-xs">
												系统每 12 小时自动补回默认词，自定义词会一直保留。
											</p>
										</div>
										{termsQuery.data ? (
											<Chip size="sm" variant="soft">
												{termsQuery.data.length} 个
											</Chip>
										) : null}
									</div>

									{termsQuery.isLoading ? (
										<div className="grid gap-2">
											{LOADING_ROWS.map((key) => (
												<Skeleton key={key} className="h-12 rounded-xl" />
											))}
										</div>
									) : termsQuery.isError ? (
										<div className="grid justify-items-start gap-3 rounded-xl bg-danger-soft p-4 text-danger-soft-foreground text-sm">
											<p>词库加载失败，请重新加载。</p>
											<Button
												size="sm"
												variant="secondary"
												onPress={refreshTerms}
											>
												重新加载
											</Button>
										</div>
									) : termsQuery.data?.length ? (
										<div className="divide-y divide-border overflow-hidden rounded-2xl ring-1 ring-border">
											{termsQuery.data.map((item) => (
												<div
													key={item.term}
													className="flex min-h-12 items-center gap-3 px-3 py-2"
												>
													<span className="min-w-0 flex-1 break-all text-sm">
														{item.term}
													</span>
													<Button
														isIconOnly
														aria-label={`删除${item.term}`}
														isDisabled={isMutating}
														size="sm"
														variant="tertiary"
														onPress={() => deleteTerm(item.term)}
													>
														<TrashBin className="size-4" />
													</Button>
												</div>
											))}
										</div>
									) : (
										<div className="rounded-xl bg-surface-secondary p-4 text-muted text-sm">
											词库为空，文字审核暂时不会拦截违禁词。
										</div>
									)}
								</section>
							</Drawer.Body>
							<Drawer.Footer className="border-border border-t">
								<Button slot="close" variant="tertiary">
									关闭
								</Button>
							</Drawer.Footer>
						</Drawer.Dialog>
					</Drawer.Content>
				</Drawer.Backdrop>
			</Drawer>
		</>
	);
}
