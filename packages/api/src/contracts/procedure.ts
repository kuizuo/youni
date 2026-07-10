import { type as contractType, oc } from "@orpc/contract";

import { commonErrors } from "./errors";

export const procedure = oc.errors(commonErrors);

export function output<T>() {
	return contractType<T>((value) => value);
}
