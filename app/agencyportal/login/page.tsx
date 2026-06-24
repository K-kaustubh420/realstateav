import AgencyLoginModal from "../components/AgencyLoginModal";

export const metadata = {
  title: "Agency Login | Bhu Market",
  description: "Sign in to your agency account to manage listings and clients.",
};

export default function AgencyLoginPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <AgencyLoginModal />
    </main>
  );
}
