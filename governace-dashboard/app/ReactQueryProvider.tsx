"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useRef } from "react";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure QueryClient is only created once per client

  // Inline fetcher for React Query (if you use fetchQuery)
  const fetcher = async ({ queryKey }: { queryKey: [string] }) => {
    const res = await fetch(queryKey[0]);
    if (!res.ok) {
      throw new Error("An error occurred while fetching the data.");
    }
    return res.json();
  };

  // Inline defaultOptions to avoid passing imported functions
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          queryFn: fetcher,
          refetchOnWindowFocus: true,
          retry: 2,
          staleTime: 60000,
          cacheTime: 120000,
        },
      },
    });
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  );
}
