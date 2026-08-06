"use client";

import type { ReactNode } from "react";
import { ConversationProvider } from "@elevenlabs/react";

export default function DemoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConversationProvider>
      {children}
    </ConversationProvider>
  );
}
