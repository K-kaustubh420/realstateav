"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw, Eye, X, Loader2, CheckCircle2, User, FileImage, Upload } from "lucide-react";
import { generateUploadUrl } from "@/lib/id_verify/image_upload/r2";
import exifr from "exifr";

interface Step3SelfieProps {
  onNext: (selfie_ImageURL: string, selfie_with_id_ImageURL: string) => void;
  onBack: () => void;
}

export default function Step3Selfie({ onNext, onBack }: Step3SelfieProps) {
  const webcamRef = useRef<Webcam>(null);
  
  // Phase 1: selfie (upload) | Phase 2: selfie_with_id (webcam)
  const [phase, setPhase] = useState<"selfie" | "selfie_with_id">("selfie");
  
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  
  const [selfieIdBlob, setSelfieIdBlob] = useState<Blob | null>(null);
  const [selfieIdPreview, setSelfieIdPreview] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSamples, setShowSamples] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Personal Selfie Upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setIsProcessing(true);

    try {
      // Check AI metadata
      const exifData = await exifr.parse(file, true).catch(() => null);
      if (exifData) {
        const softwareStr = (exifData.Software || "").toLowerCase();
        const makerStr = (exifData.Make || "").toLowerCase();
        if (softwareStr.includes("ai") || softwareStr.includes("midjourney") || softwareStr.includes("dall-e") || makerStr.includes("ai")) {
          throw new Error("AI generated images are not allowed. Please provide a real photograph.");
        }
      }

      const jpegBlob = await convertToJpeg(file);
      const previewUrl = URL.createObjectURL(jpegBlob);
      setSelfieBlob(jpegBlob);
      setSelfiePreview(previewUrl);

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process image.");
      setSelfieBlob(null);
      setSelfiePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Selfie with ID Capture
  const capture = useCallback(async () => {
    setErrorMsg("");
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setErrorMsg("Failed to capture image. Please ensure your camera is allowed.");
      return;
    }

    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      
      const jpegBlob = await convertToJpeg(blob);
      const previewUrl = URL.createObjectURL(jpegBlob);

      setSelfieIdBlob(jpegBlob);
      setSelfieIdPreview(previewUrl);
    } catch (err: any) {
      setErrorMsg("Failed to process image capture.");
    }
  }, [webcamRef]);

  const convertToJpeg = (blob: Blob | File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
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

        canvas.toBlob((outBlob) => {
          if (outBlob) resolve(outBlob);
          else reject(new Error("Canvas blob error"));
        }, "image/jpeg", 0.85);
      };
      img.onerror = () => reject(new Error("Image loading error"));
      img.src = url;
    });
  };

  const uploadToR2 = async (blob: Blob): Promise<string> => {
    const res = await generateUploadUrl("image/jpeg", "docs");
    if (!res.success || !res.url) throw new Error(res.error || "Failed to generate secure upload link.");

    const uploadRes = await fetch(res.url, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": "image/jpeg" },
    });

    if (!uploadRes.ok) throw new Error("Failed to upload image to secure storage.");
    return res.objectKey!;
  };

  const handleContinue = async () => {
    if (!selfieBlob || !selfieIdBlob) {
      setErrorMsg("Please provide both required photos.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      // Upload both sequentially
      const selfieR2Key = await uploadToR2(selfieBlob);
      const selfieIdR2Key = await uploadToR2(selfieIdBlob);

      onNext(selfieR2Key, selfieIdR2Key);
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900/50 border border-white/10 rounded-3xl backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {phase === "selfie" ? <User className="text-[#D4AF37]" /> : <FileImage className="text-[#D4AF37]" />}
            {phase === "selfie" ? "Upload Personal Photo" : "Selfie with ID"}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {phase === "selfie" ? "Upload a clear photograph of your face." : "Hold your ID card clearly next to your face."}
          </p>
        </div>
        <button 
          onClick={() => setShowSamples(true)}
          className="flex items-center gap-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
        >
          <Eye size={16} /> Samples
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-start gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Progress Pills */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex-1 h-1.5 rounded-full ${phase === "selfie" ? "bg-[#D4AF37]" : "bg-green-500"}`} />
        <div className={`flex-1 h-1.5 rounded-full ${phase === "selfie" ? "bg-zinc-800" : (selfieIdBlob ? "bg-green-500" : "bg-[#D4AF37]")}`} />
      </div>

      <div className="flex flex-col items-center">
        {isProcessing ? (
          <div className="w-full aspect-video bg-black rounded-2xl flex flex-col items-center justify-center border border-white/10 space-y-4">
            <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
            <span className="text-zinc-400">Processing & securing image...</span>
          </div>
        ) : (
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-xl flex items-center justify-center">
            
            {phase === "selfie" ? (
              // Phase 1: File Upload for Personal Photo
              <div className="w-full h-full flex flex-col items-center justify-center p-6">
                {!selfiePreview ? (
                  <div 
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                    className="w-full h-full border-2 border-dashed border-white/10 hover:border-[#D4AF37]/50 bg-zinc-900 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    <input 
                      type="file" ref={fileInputRef} className="hidden" accept="image/*"
                      onChange={handleFileSelect} disabled={isProcessing}
                    />
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-zinc-400" />
                    </div>
                    <span className="text-white font-medium text-lg">Click to upload your photo</span>
                    <span className="text-zinc-500 text-sm mt-2">JPEG, PNG up to 10MB</span>
                  </div>
                ) : (
                  <img 
                    src={selfiePreview} 
                    alt="Captured" 
                    className="w-full h-full object-contain bg-black" 
                  />
                )}
                {selfiePreview && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button 
                      onClick={() => { setSelfieBlob(null); setSelfiePreview(null); }}
                      className="px-4 py-2 bg-zinc-900/80 border border-white/20 text-white rounded-full font-semibold backdrop-blur-md hover:bg-zinc-800 transition flex items-center gap-2"
                    >
                      <RefreshCw size={16} /> Choose Another
                    </button>
                    <button 
                      onClick={() => setPhase("selfie_with_id")}
                      className="px-6 py-2 bg-[#D4AF37] text-black rounded-full font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:bg-[#c4a133] hover:scale-105 transition flex items-center gap-2"
                    >
                      <CheckCircle2 size={18} /> Confirm & Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Phase 2: Webcam for Selfie with ID
              <>
                {!selfieIdPreview ? (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "user" }}
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-1/3 aspect-[1.6/1] border-2 border-dashed border-[#D4AF37]/60 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-sm mr-32 mt-16">
                        <span className="text-[#D4AF37]/80 text-xs font-bold text-center px-2">Hold ID Here</span>
                      </div>
                      <div className="w-1/3 aspect-[3/4] border-2 border-dashed border-white/40 rounded-full bg-black/10 backdrop-blur-sm ml-10"></div>
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                      <button 
                        onClick={capture}
                        className="w-16 h-16 rounded-full bg-white/20 border-4 border-white backdrop-blur-sm hover:bg-white/40 hover:scale-105 transition-all shadow-lg flex items-center justify-center"
                      >
                        <Camera className="text-black w-6 h-6" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <img 
                      src={selfieIdPreview} 
                      alt="Captured ID" 
                      className="w-full h-full object-cover transform -scale-x-100" 
                    />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                      <button 
                        onClick={() => { setSelfieIdBlob(null); setSelfieIdPreview(null); }}
                        className="px-4 py-2 bg-zinc-900/80 border border-white/20 text-white rounded-full font-semibold backdrop-blur-md hover:bg-zinc-800 transition flex items-center gap-2"
                      >
                        <RefreshCw size={16} /> Retake
                      </button>
                      <button 
                        onClick={handleContinue}
                        className="px-6 py-2 bg-[#D4AF37] text-black rounded-full font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:bg-[#c4a133] hover:scale-105 transition flex items-center gap-2"
                      >
                        <CheckCircle2 size={18} /> Confirm & Upload
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
            
          </div>
        )}
      </div>

      <div className="flex justify-start mt-8">
        <button 
          onClick={() => {
            if (phase === "selfie_with_id") setPhase("selfie");
            else onBack();
          }} 
          disabled={isProcessing} 
          className="px-6 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition disabled:opacity-50"
        >
          Back
        </button>
      </div>

      {/* Samples Modal */}
      {showSamples && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button onClick={() => setShowSamples(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800 rounded-full p-1 transition">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Sample: Selfie with ID</h3>
            
            <div className="rounded-xl overflow-hidden border border-white/10 bg-zinc-900 aspect-square flex flex-col items-center justify-center p-4 space-y-4">
               <div className="relative w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-white/20">
                  <User size={64} className="text-zinc-600" />
                  <div className="absolute -bottom-4 -left-8 w-24 h-16 bg-zinc-700 rounded border-2 border-[#D4AF37] flex items-center justify-center shadow-lg transform -rotate-12">
                     <FileImage size={24} className="text-[#D4AF37]" />
                  </div>
               </div>
               <p className="text-zinc-400 text-sm text-center font-medium mt-4">
                 Ensure your face is clear and the text on your ID is fully legible without glare.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
