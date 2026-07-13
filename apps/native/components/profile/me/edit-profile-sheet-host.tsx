import { BottomSheet } from "heroui-native";

import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import type {
	EditableProfile,
	ProfileSessionUser,
} from "@/components/profile/profile-tabs";
import { AppBottomSheetContent } from "@/components/shared/app-bottom-sheet";

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
	profile?: EditableProfile;
	user?: ProfileSessionUser;
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
