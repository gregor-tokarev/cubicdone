import { useAuth } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "./trpc";
import { httpBatchLink } from "@trpc/client";

interface Props extends React.PropsWithChildren {}
export function TrpcProvider(props: Props) {
  const { getToken } = useAuth();

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:4000",
          async fetch(url, options) {
            const token = await getToken();

            return fetch(url, {
              ...options,
              headers: {
                ...options?.headers,
                Authorization: token ?? "",
                "cache-control": "no-cache",
              },
            });
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
