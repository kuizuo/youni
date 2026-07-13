import type { ProfileUser } from "@youni/api/contracts/profiles";
import { BottomSheet } from "heroui-native";

import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import { AppBottomSheetContent } from "@/components/shared/app-bottom-sheet";
import type { AuthUser } from "@/lib/auth-client";

export function MeEditProfileSheetHost({
	displayName,
	isOpen,
	profile,
	user,
	onOpenChange,
	onSaved,
}: {
	displayName: string;
	isOpen: boolean;
	profile?: ProfileUser;
	user?: AuthUser;
	onOpenChange: (isOpen: boolean) => void;
	onSaved: () => Promise<void>;
}) {
	return (
		<BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
			<BottomSheet.Portal disableFullWindowOverlay>
				<BottomSheet.Overlay />
				<AppBottomSheetContent
					snapPoints={["86%"]}
					enableDynamicSizing={false}
					enableOverDrag={false}
					keyboardBehavior="extend"
					contentContainerClassName="h-full px-0"
				>
					<EditProfileSheet
						displayName={displayName}
						profile={profile}
						user={user}
						onSaved={onSaved}
					/>
				</AppBottomSheetContent>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}
