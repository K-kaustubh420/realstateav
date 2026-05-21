"use client";

type Props = {
  rejectionReason: string;
  onResubmit: () => void;
};

export default function AgencyRejected({ rejectionReason, onResubmit }: Props) {
  return (
    <section className="rounded-2xl border border-rose-600/10 bg-zinc-950/85 p-8 shadow-lg backdrop-blur-2xl">
      <p className="text-sm uppercase tracking-[0.32em] text-rose-300">Verification Rejected</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">Unfortunately your agency was not approved</h1>
      <p className="mt-4 text-rose-200">{rejectionReason}</p>
      <div className="mt-6 flex items-center gap-3">
        <button onClick={onResubmit} className="rounded-full bg-[#D4AF37]/10 px-6 py-2 text-sm font-semibold text-[#D4AF37]">Resubmit</button>
      </div>
    </section>
  );
}
