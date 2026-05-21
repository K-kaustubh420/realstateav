import AgentNavbar
from "./components/AgentNavbar";

export default function AgentPage() {

  return (
    <main className="min-h-screen bg-black text-white">

      <AgentNavbar />

      <section className="h-screen flex items-center justify-center">

        <div className="text-center">

          <h1 className="text-6xl font-bold">
            Agent Portal
          </h1>

          <p className="text-zinc-400 mt-4">
            Manage properties and clients
          </p>

        </div>

      </section>

    </main>
  );

}