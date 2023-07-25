"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "./theme/theme-provider";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

type Props = {
  children: React.ReactNode;
  session: Session | null;
};

export default function Providers({ children, session }: Props) {
  const [client] = useState(
    new QueryClient({
      defaultOptions: { queries: { refetchOnWindowFocus: false } },
    })
  );

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
