import { expect, test } from "bun:test";

import { getHomeTabAtOffset } from "./types";

test("selects the home tab at the settled page offset", () => {
	expect(getHomeTabAtOffset(0, 390)).toBe("following");
	expect(getHomeTabAtOffset(390, 390)).toBe("discover");
	expect(getHomeTabAtOffset(900, 390)).toBe("discover");
});
