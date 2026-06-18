import { Button } from "@heroui/react";
import { Link } from "@tanstack/react-router";

import UserMenu from "./user-menu";

export default function Header() {
	return (
		<div>
			<div className="flex h-14 flex-row items-center justify-between px-4">
				<Link to="/admin" className="font-semibold text-foreground">
					Youni Admin
				</Link>
				<div className="flex items-center gap-2">
					<Link to="/preview">
						<Button size="sm" variant="ghost">
							Preview
						</Button>
					</Link>
					<UserMenu />
				</div>
			</div>
			<div className="border-separator border-b" />
		</div>
	);
}
