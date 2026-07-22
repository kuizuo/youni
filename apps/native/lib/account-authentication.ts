import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query/query-client";

type AuthenticationResult<TError> = {
	error?: TError | null;
};

export async function runAccountAuthentication<TError>({
	authenticate,
	onAuthenticated,
}: {
	authenticate: () => Promise<AuthenticationResult<TError>>;
	onAuthenticated?: () => Promise<void> | void;
}) {
	const result = await authenticate();
	if (result.error) return result.error;

	authClient.$store.notify("$sessionSignal");
	queryClient.clear();
	await onAuthenticated?.();
	return null;
}
