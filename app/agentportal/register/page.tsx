import AgentRegisterModal from "../components/AgentResigterModal"; // Adjust path if needed

export const metadata = {
  title: "Agent Registration | Bhu Market",
  description: "Create an account to join the premier real estate network as an agent.",
};

export default function AgentRegisterPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <AgentRegisterModal />
    </main>
  );
}