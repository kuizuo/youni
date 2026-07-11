import { Ionicons } from "@expo/vector-icons";
import type * as MediaLibrary from "expo-media-library";
import { useThemeColor } from "heroui-native";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { mediaPickerStyles as styles } from "./media-picker-styles";

function albumKey(album: MediaLibrary.Album | null) {
	return album?.id ?? "recent";
}

export function AlbumPicker({
	albums,
	bottomInset,
	onClose,
	onSelect,
	selectedAlbum,
}: {
	albums: MediaLibrary.Album[];
	bottomInset: number;
	onClose: () => void;
	onSelect: (album: MediaLibrary.Album | null) => void;
	selectedAlbum: MediaLibrary.Album | null;
}) {
	const rows: Array<MediaLibrary.Album | null> = [null, ...albums];
	const themeColor = useThemeColor("accent");
	return (
		<View style={styles.albumPickerRoot}>
			<Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
			<View
				style={[styles.albumPickerCard, { paddingBottom: bottomInset + 12 }]}
			>
				<View style={styles.albumPickerHandle} />
				<Text style={styles.albumPickerTitle}>选择相册</Text>
				<FlatList
					data={rows}
					keyExtractor={(album) => albumKey(album)}
					renderItem={({ item: album }) => {
						const selected = albumKey(album) === albumKey(selectedAlbum);
						return (
							<Pressable
								onPress={() => onSelect(album)}
								style={styles.albumRow}
							>
								<View>
									<Text style={styles.albumRowTitle}>
										{album?.title ?? "最近项目"}
									</Text>
									{album ? (
										<Text style={styles.albumRowCount}>
											{album.assetCount} 张
										</Text>
									) : null}
								</View>
								{selected ? (
									<Ionicons color={themeColor} name="checkmark" size={23} />
								) : null}
							</Pressable>
						);
					}}
				/>
			</View>
		</View>
	);
}
