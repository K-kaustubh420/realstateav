import { Suspense } from "react";
import AgentLoginModal from "../components/AgentLoginModal"; // Adjust path if needed

export const metadata = {
  title: "Agent Login | Bhu Market",
  description: "Sign in to your Bhu Market agent account.",
};

export default function AgentLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
      <AgentLoginModal />
    </Suspense>
  );
}