export function shouldShowTabBar(pathname: string) {
	return (
		pathname === "/" ||
		pathname === "/search" ||
		pathname === "/messages" ||
		pathname === "/me"
	);
}
