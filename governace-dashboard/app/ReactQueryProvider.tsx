"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryFunctionContext,
} from "@tanstack/react-query";
import React, { useRef } from "react";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure QueryClient is only created once per client

  // Inline fetcher for React Query (if you use fetchQuery)
  const fetcher = async (context: QueryFunctionContext) => {
    const url = context.queryKey[0] as string;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("An error occurred while fetching the data.");
    }
    return res.json();
  };

  // Inline defaultOptions to avoid passing imported functions
  const queryClientRef = useRef<QueryClient>(
    new QueryClient({
      defaultOptions: {
        queries: {
          queryFn: fetcher,
          refetchOnWindowFocus: true,
          retry: 2,
          staleTime: 60000,
          gcTime: 120000,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  );
}
