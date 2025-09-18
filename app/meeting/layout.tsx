import React from "react";
import { StreamVideoProvider } from "@/providers/StreamVideoProvider";
import AuthGuard from "@/components/auth/AuthGuard";

export default function MeetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <StreamVideoProvider>
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-orange-100">
          {children}
        </div>
      </StreamVideoProvider>
    </AuthGuard>
  );
}
