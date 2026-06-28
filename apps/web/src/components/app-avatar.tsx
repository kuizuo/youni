import { Avatar } from "@heroui/react";
import type { ReactNode } from "react";

type AppAvatarProps = {
	readonly alt: string;
	readonly className?: string;
	readonly fallback?: ReactNode;
	readonly src?: string | null;
};

export function AppAvatar({
	alt,
	className = "size-8",
	fallback,
	src,
}: AppAvatarProps) {
	return (
		<Avatar className={`${className} shrink-0 overflow-hidden rounded-full`}>
			{src ? (
				<Avatar.Image
					alt={alt}
					className="size-full rounded-full object-cover"
					src={src}
				/>
			) : null}
			<Avatar.Fallback
				className="flex size-full items-center justify-center rounded-full"
				delayMs={600}
			>
				{fallback ?? getAvatarFallback(alt)}
			</Avatar.Fallback>
		</Avatar>
	);
}

function getAvatarFallback(source: string) {
	return source.trim().slice(0, 1) || "用";
}
