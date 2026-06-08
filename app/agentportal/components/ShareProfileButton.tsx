import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareProfileButtonProps {
  agentId: string;
}

export default function ShareProfileButton({ agentId }: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    // Construct the URL exactly as requested
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/share/agentprofile?agentid=${encodeURIComponent(agentId)}&share=true`;
    
    navigator.clipboard.writeText(link);
    setCopied(true);
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopyLink}
      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-colors border border-white/10"
    >
      {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} className="text-zinc-400" />}
      {copied ? "Link Copied!" : "Share Profile"}
    </button>
  );
}
