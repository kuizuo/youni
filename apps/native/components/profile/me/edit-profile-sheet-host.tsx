import { BottomSheet } from "heroui-native";

import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import type {
	EditableProfile,
	ProfileSessionUser,
} from "@/components/profile/profile-tabs";

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
				<BottomSheet.Content
					snapPoints={["86%"]}
					enableDynamicSizing={false}
					enableOverDrag={false}
					keyboardBehavior="extend"
					contentContainerClassName="h-full"
				>
					<EditProfileSheet
						displayName={displayName}
						profile={profile}
						user={user}
						onSaved={onSaved}
					/>
				</BottomSheet.Content>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}
