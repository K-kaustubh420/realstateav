"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Eye, Info, X, Loader2, CheckCircle2 } from "lucide-react";
import exifr from "exifr";
import { generateUploadUrl } from "@/lib/id_verify/image_upload/r2";

interface Step2DocumentProps {
  onNext: (documentDetails: { idtype: string; idno: string; id_ImageURL: string; DOB: string; issuedBy: string; issuedDate: string; validTill: string; }) => void;
  onBack: () => void;
}

export default function Step2Document({ onNext, onBack }: Step2DocumentProps) {
  const [formData, setFormData] = useState({
    idtype: "passport",
    idno: "",
    DOB: "",
    issuedBy: "",
    issuedDate: "",
    validTill: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSamples, setShowSamples] = useState(false);
  const [uploadedR2Key, setUploadedR2Key] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samples = [
    { title: "Passport Sample", url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Nepal_new_passport.jpg?_=20120507105541" },
    { title: "Citizenship Sample", url: "https://assets.rumsan.net/clients/recordnepal/40d56cf8-0fa6-4e3b-98ad-a6acc588a56e-1.jpg" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setIsProcessing(true);

    try {
      // 1. Check AI metadata
      const exifData = await exifr.parse(file, true).catch(() => null);
      if (exifData) {
        const softwareStr = (exifData.Software || "").toLowerCase();
        const makerStr = (exifData.Make || "").toLowerCase();
        if (softwareStr.includes("ai") || softwareStr.includes("midjourney") || softwareStr.includes("dall-e") || makerStr.includes("ai")) {
          throw new Error("AI generated images are not allowed. Please provide a real photograph.");
        }
      }

      // 2. Convert to JPEG via Canvas
      const jpegBlob = await convertToJpeg(file);
      const previewUrl = URL.createObjectURL(jpegBlob);
      setImagePreview(previewUrl);

      // 3. Upload to R2 immediately
      const res = await generateUploadUrl("image/jpeg", "docs");
      if (!res.success || !res.url) throw new Error(res.error || "Failed to generate secure upload link.");

      const uploadRes = await fetch(res.url, {
        method: "PUT",
        body: jpegBlob,
        headers: { "Content-Type": "image/jpeg" },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload document image to secure storage.");
      setUploadedR2Key(res.objectKey!);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process image.");
      setImagePreview(null);
      setUploadedR2Key(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToJpeg = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context error"));
        
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas blob error"));
        }, "image/jpeg", 0.85);
      };
      img.onerror = () => reject(new Error("Image loading error"));
      img.src = url;
    });
  };

  const handleContinue = () => {
    if (!formData.idno || !formData.DOB || !formData.issuedBy || !formData.issuedDate) {
      setErrorMsg("Please fill out all document details.");
      return;
    }
    if (!uploadedR2Key) {
      setErrorMsg("Please upload your document photo.");
      return;
    }
    onNext({
      ...formData,
      id_ImageURL: uploadedR2Key
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900/50 border border-white/10 rounded-3xl backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="text-[#D4AF37]" /> Document Upload</h2>
          <p className="text-zinc-400 text-sm mt-1">Provide your valid government-issued ID details.</p>
        </div>
        <button 
          onClick={() => setShowSamples(true)}
          className="flex items-center gap-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
        >
          <Eye size={16} /> View Samples
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-start gap-2">
          <Info size={18} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Document Type</label>
            <select 
              name="idtype" value={formData.idtype} onChange={handleInputChange}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors appearance-none"
            >
              <option value="passport">Passport</option>
              <option value="citizenship">Citizenship</option>
              <option value="driver's license">Driver's License</option>
              <option value="voter ID">Voter ID</option>
              <option value="pan card">PAN Card</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">ID Number</label>
            <input 
              type="text" name="idno" value={formData.idno} onChange={handleInputChange} placeholder="e.g. 12-34-56"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date of Birth</label>
            <input 
              type="date" name="DOB" value={formData.DOB} onChange={handleInputChange}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Issued By</label>
            <input 
              type="text" name="issuedBy" value={formData.issuedBy} onChange={handleInputChange} placeholder="Issuing Authority"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Issue Date</label>
            <input 
              type="date" name="issuedDate" value={formData.issuedDate} onChange={handleInputChange}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Valid Till (Or 'lifetime')</label>
            <input 
              type="text" name="validTill" value={formData.validTill} onChange={handleInputChange} placeholder="YYYY-MM-DD or lifetime"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Document Photo</label>
          <p className="text-xs text-zinc-500 mb-2">Upload a clear photo. If it has a back side, please provide front and back in the same photo.</p>
          
          <div 
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
              ${imagePreview ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}
            `}
          >
            <input 
              type="file" ref={fileInputRef} className="hidden" accept="image/*"
              onChange={handleFileSelect} disabled={isProcessing}
            />
            
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                <span className="text-zinc-400 text-sm">Processing & securing image...</span>
              </div>
            ) : imagePreview ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-full max-w-sm aspect-[1.6/1] rounded-xl overflow-hidden border border-white/10">
                  <img src={imagePreview} alt="Document preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                    <CheckCircle2 size={12} /> Secure
                  </div>
                </div>
                <span className="text-[#D4AF37] text-sm font-medium hover:underline">Click to replace photo</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6 text-zinc-400" />
                </div>
                <span className="text-white font-medium">Click to upload document</span>
                <span className="text-zinc-500 text-xs">JPEG, PNG up to 10MB</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button onClick={onBack} className="px-6 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition">
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={isProcessing || !uploadedR2Key || !formData.idno}
            className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Samples Modal */}
      {showSamples && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowSamples(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800 rounded-full p-1 transition">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Accepted Sample Documents</h3>
            <div className="space-y-8">
              {samples.map((s, i) => (
                <div key={i} className="space-y-3">
                  <h4 className="text-[#D4AF37] font-semibold">{s.title}</h4>
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center">
                    <img src={s.url} alt={s.title} className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
