"use client";

import { UserButton } from "@clerk/nextjs";

export default function AuthUser() {
  return (
    <div className="flex items-center gap-2">
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "w-8 h-8",
          },
        }}
      />
    </div>
  );
}
