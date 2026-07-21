import { QueryCache, QueryClient } from "@tanstack/react-query";
import { isNetworkRequestError } from "@/utils/request-timeout";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 30,
			refetchOnReconnect: true,
			refetchOnWindowFocus: true,
			retry: 2,
			staleTime: 1000 * 60,
		},
		mutations: {
			retry: 0,
		},
	},
	queryCache: new QueryCache({
		onError: (error) => {
			if (!isNetworkRequestError(error)) console.log(error);
		},
	}),
});
