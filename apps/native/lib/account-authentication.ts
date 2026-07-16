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

	await onAuthenticated?.();
	return null;
}
