import * as ImagePicker from "expo-image-picker";

export async function selectImagesFromSystem(selectionLimit: number) {
	const result = await ImagePicker.launchImageLibraryAsync({
		allowsEditing: false,
		allowsMultipleSelection: true,
		mediaTypes: "images",
		orderedSelection: true,
		preferredAssetRepresentationMode:
			ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
		quality: 0.92,
		selectionLimit,
		shouldDownloadFromNetwork: true,
	});

	return result.canceled ? [] : result.assets;
}
