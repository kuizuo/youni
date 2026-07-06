export function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}
