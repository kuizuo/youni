import { File as ExpoFile } from "expo-file-system";

export function appendUploadFile({
	fieldName,
	fileName,
	formData,
	isWeb,
	uri,
	webFile,
}: {
	fieldName: string;
	fileName: string;
	formData: FormData;
	isWeb: boolean;
	uri: string;
	webFile?: File;
}) {
	if (isWeb && webFile) {
		formData.append(fieldName, webFile, fileName);
		return;
	}

	formData.append(fieldName, new ExpoFile(uri) as unknown as Blob);
}
