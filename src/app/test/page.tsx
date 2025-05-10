"use client";

import BuilderPage from "@/app/components/BuilderPage";

export default function Test() {
  return (
    <div className="min-h-screen bg-background">
      <BuilderPage isLoggedIn={true} />
    </div>
  );
}
