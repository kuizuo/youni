import { CloudArrowUpIn, TrashBin } from "@gravity-ui/icons";
import { Avatar, Button, Input, Label } from "@heroui/react";
import { type ChangeEvent, type ReactNode, useRef } from "react";

export function TextInputField({
	id,
	label,
	onChange,
	placeholder,
	type = "text",
	value,
}: {
	id: string;
	label: string;
	onChange: (value: string) => void;
	placeholder?: string;
	type?: string;
	value: string;
}) {
	return (
		<TextFieldWrapper id={id} label={label}>
			<Input
				id={id}
				type={type}
				value={value}
				placeholder={placeholder}
				onChange={(event) => onChange(event.target.value)}
				fullWidth
			/>
		</TextFieldWrapper>
	);
}

export function SelectField<T extends string>({
	id,
	isDisabled,
	label,
	onChange,
	options,
	value,
}: {
	id: string;
	isDisabled?: boolean;
	label: string;
	onChange: (value: T) => void;
	options: readonly { label: string; value: T }[];
	value: T;
}) {
	return (
		<TextFieldWrapper id={id} label={label}>
			<select
				id={id}
				className="h-10 rounded-xl border border-border bg-background px-3 text-foreground text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
				disabled={isDisabled}
				value={value}
				onChange={(event) => onChange(event.target.value as T)}
			>
				{options.map((option) => (
					<option key={option.value || "empty"} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</TextFieldWrapper>
	);
}

export function AvatarUploadField({
	isUploading,
	label,
	name,
	onChange,
	onUpload,
	value,
}: {
	isUploading: boolean;
	label: string;
	name: string;
	onChange: (value: string) => void;
	onUpload: (file: File) => Promise<string>;
	value: string;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		const url = await onUpload(file);
		onChange(url);
	};

	return (
		<div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
			<Label>{label}</Label>
			<div className="flex items-center gap-3 rounded-xl border border-border p-3">
				<Avatar className="size-14">
					{value ? <Avatar.Image alt={name || "头像"} src={value} /> : null}
					<Avatar.Fallback>{(name || "用").slice(0, 1)}</Avatar.Fallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<p className="truncate text-muted text-sm">
						{value ? "已上传头像" : "未上传头像"}
					</p>
					<p className="text-muted text-xs">
						支持 JPG、PNG、WebP、GIF，最大 2MB
					</p>
				</div>
				<input
					ref={inputRef}
					accept="image/jpeg,image/png,image/webp,image/gif"
					className="hidden"
					type="file"
					onChange={handleFileChange}
				/>
				<Button
					type="button"
					size="sm"
					variant="secondary"
					isPending={isUploading}
					onPress={() => inputRef.current?.click()}
				>
					<CloudArrowUpIn className="size-4" />
					上传
				</Button>
				<Button
					type="button"
					size="sm"
					variant="tertiary"
					isIconOnly
					aria-label="移除头像"
					isDisabled={!value || isUploading}
					onPress={() => onChange("")}
				>
					<TrashBin className="size-4" />
				</Button>
			</div>
		</div>
	);
}

function TextFieldWrapper({
	children,
	id,
	label,
}: {
	children: ReactNode;
	id: string;
	label: string;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<Label htmlFor={id}>{label}</Label>
			{children}
		</div>
	);
}
