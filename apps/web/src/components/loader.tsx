import { ArrowsRotateLeft } from "@gravity-ui/icons";

export default function Loader() {
	return (
		<div className="flex h-full items-center justify-center pt-8">
			<ArrowsRotateLeft className="animate-spin" />
		</div>
	);
}
