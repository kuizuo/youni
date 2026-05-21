import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	return (
		<div>
			<div className="flex h-12 flex-row items-center justify-between px-4">
				<Link to="/admin" className="font-semibold">
					Youni Admin
				</Link>
				<div className="flex items-center gap-2">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			<div className="border-b" />
		</div>
	);
}
