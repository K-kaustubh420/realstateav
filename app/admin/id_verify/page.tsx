"use client";

import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { 
    Check, X, Loader2, ShieldAlert, Eye, 
    Lock, Calendar, MapPin, 
    User, Briefcase, Globe, Server, Hash,
    FileCheck, Building2, Clock, Mail
} from 'lucide-react';
import { VerificationRequest, fetchPendingRequests, verifyAgentIntegrity, processDecision } from '@/lib/id_verify/service';
import { PayloadAgentIDVerify, PayloadAgencyIDVerify } from '@/utils/id_verify';
import { generateViewUrl } from '@/lib/id_verify/image_upload/r2';

const MapViewer = dynamic(() => import('./MapViewer'), { ssr: false, loading: () => <div className="h-48 w-full bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" /></div> });

function SecureDocument({ objectKey, type }: { objectKey: string | undefined, type: 'contain' | 'cover' }) {
    const [url, setUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!objectKey) {
            setLoading(false);
            return;
        }
        
        if (objectKey.startsWith('http') || objectKey.startsWith('mock_')) {
            setUrl(objectKey);
            setLoading(false);
            return;
        }

        generateViewUrl(objectKey).then(res => {
            if (res.success && res.url) {
                setUrl(res.url);
            }
            setLoading(false);
        });
    }, [objectKey]);

    if (loading) return <div className={`block relative aspect-${type === 'contain' ? 'video' : 'square'} bg-black flex items-center justify-center`}><Loader2 className="animate-spin text-zinc-500 w-6 h-6" /></div>;
    
    return (
        <a href={url} target="_blank" rel="noreferrer" className={`block relative aspect-${type === 'contain' ? 'video' : 'square'} bg-black hover:opacity-80 transition-opacity`}>
            <img src={url} className={`w-full h-full object-${type}`} alt="Secure Document" />
        </a>
    );
}

export default function AdminVerificationDashboard() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<VerificationRequest | null>(null);
  const [integrityStatus, setIntegrityStatus] = useState<'unchecked' | 'valid' | 'tampered'>('unchecked');
  const [verifyingHash, setVerifyingHash] = useState(false);

  // Load Data via Service
  const loadData = async () => {
      setLoading(true);
      try {
          const data = await fetchPendingRequests();
          setRequests(data);
      } catch (e) {
          console.error(e);
          toast.error("Failed to load requests");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => { 
      loadData(); 
  }, []);

  const openDetailModal = (req: VerificationRequest) => {
      setSelectedReq(req);
      setIntegrityStatus('unchecked');
      (document.getElementById('detail_modal') as HTMLDialogElement)?.showModal();
  };

  const checkIntegrity = async () => {
      if (!selectedReq) return;
      setVerifyingHash(true);
      const toastId = toast.loading("Verifying Cryptographic Signature...");

      try {
          const result = await verifyAgentIntegrity(selectedReq.id);
             
          if (result.valid) {
              setIntegrityStatus('valid');
              toast.success("Signature MATCHED. Data is authentic.", { id: toastId });
          } else {
              setIntegrityStatus('tampered');
              console.error("Integrity Mismatch Details:", result);
              toast.error(`Signature MISMATCH: ${result.reason || 'Data modified after signing'}`, { id: toastId });
          }
      } catch (e) {
          console.error(e);
          toast.error("Check Failed - API Error", { id: toastId });
      } finally {
          setVerifyingHash(false);
      }
  };

  const handleDecision = async (decision: 'verified' | 'rejected') => {
      if (!selectedReq) return;
      if (decision === 'verified' && integrityStatus !== 'valid') {
          if(!confirm("Warning: Integrity check not passed or not run. Approve anyway?")) return;
      }
      const toastId = toast.loading(`Processing...`);
      try {
          await processDecision(selectedReq.id, decision);
          toast.success(`User ${decision}`, { id: toastId });
          (document.getElementById('detail_modal') as HTMLDialogElement)?.close();
          setRequests(prev => prev.filter(r => r.id !== selectedReq.id));
          setSelectedReq(null);
      } catch (err: any) { 
          toast.error("Update Failed"); 
      }
  };

  // --- HELPER: Extract Metadata Safely ---
  const getMeta = (reqData: any) => {
      return reqData.metadata?.client_side || reqData.metadata || {};
  };

  // Helper: Render Agent Data (Uses 'DocumentDetails' interface with 'Adress_Line1')
  const renderAgentDetails = (data: PayloadAgentIDVerify) => (
      <>
        {/* Personal & ID */}
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden mb-6">
            <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                <User size={14}/> Agent Details
            </div>
            <div className="divide-y divide-zinc-800 text-sm">
                <div className="flex justify-between p-3"><span className="text-zinc-500">Full Name</span><span className="text-white font-bold">{data.fullName || "N/A"}</span></div>
                <div className="flex justify-between p-3"><span className="text-zinc-500">Email Address</span><span className="text-white">{data.email || "N/A"}</span></div>
                <div className="flex justify-between p-3"><span className="text-zinc-500">ID Type</span><span className="text-[#D4AF37] font-bold uppercase">{data.documentDetails.idtype || "N/A"}</span></div>
                <div className="flex justify-between p-3"><span className="text-zinc-500">ID Number</span><span className="text-white font-mono">{data.documentDetails.idno || "N/A"}</span></div>
                <div className="flex justify-between p-3"><span className="text-zinc-500">Date of Birth</span><span className="text-white">{data.documentDetails.DOB || "N/A"}</span></div>
                <div className="flex justify-between p-3"><span className="text-zinc-500">Issued By</span><span className="text-white">{data.documentDetails.issuedBy || "N/A"}</span></div>
                <div className="flex justify-between p-3"><span className="text-zinc-500">Issue Date</span><span className="text-white">{data.documentDetails.issuedDate || "N/A"}</span></div>
                <div className="flex justify-between p-3"><span className="text-zinc-500">Valid Till</span><span className="text-white">{data.documentDetails.validTill || "N/A"}</span></div>
            </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                    <FileCheck size={12}/> Permanent Address
                </div>
                <div className="p-3 text-sm text-zinc-300">
                    {data.documentDetails.permanent_address?.addressLine1}<br/>
                    {data.documentDetails.permanent_address?.addressLine2 && <>{data.documentDetails.permanent_address.addressLine2}<br/></>}
                    {data.documentDetails.permanent_address?.city}, {data.documentDetails.permanent_address?.state}<br/>
                    {data.documentDetails.permanent_address?.country} - {data.documentDetails.permanent_address?.postalCode}
                </div>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                    <FileCheck size={12}/> Mailing Address
                </div>
                <div className="p-3 text-sm text-zinc-300">
                    {data.documentDetails.mailing_address?.addressLine1 || data.documentDetails.permanent_address?.addressLine1}<br/>
                    {(data.documentDetails.mailing_address?.addressLine2 || data.documentDetails.permanent_address?.addressLine2) && <>{data.documentDetails.mailing_address?.addressLine2 || data.documentDetails.permanent_address?.addressLine2}<br/></>}
                    {data.documentDetails.mailing_address?.city || data.documentDetails.permanent_address?.city}, {data.documentDetails.mailing_address?.state || data.documentDetails.permanent_address?.state}<br/>
                    {data.documentDetails.mailing_address?.country || data.documentDetails.permanent_address?.country} - {data.documentDetails.mailing_address?.postalCode || data.documentDetails.permanent_address?.postalCode}
                </div>
            </div>
        </div>
      </>
  );

  // Helper: Render Agency Data (Uses 'BusinessDocumentDetails' + 'DocumentDetails')
  const renderAgencyDetails = (data: PayloadAgencyIDVerify) => {
      const biz = data.businessDocumentDetails;
      const owner = data.documentDetails_of_owner;

      return (
      <>
        {/* Business Information */}
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden mb-6">
            <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 text-xs font-bold text-blue-400 uppercase flex items-center gap-2">
                <Building2 size={14}/> Agency / Business Details
            </div>
            <div className="divide-y divide-zinc-800 text-sm">
                <div className="flex justify-between p-3">
                    <span className="text-zinc-500">Legal Name</span>
                    <span className="text-white font-bold uppercase">{biz?.legalName || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-3">
                    <span className="text-zinc-500">Structure</span>
                    <span className="text-blue-200 uppercase text-xs font-bold tracking-wider">{biz?.registrationType?.replace('_', ' ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-3">
                    <span className="text-zinc-500">Registration No</span>
                    <span className="text-white font-mono">{biz?.registrationNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-3">
                    <span className="text-zinc-500">Tax ID</span>
                    <span className="text-white font-mono">{biz?.taxId || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-3">
                    <span className="text-zinc-500">Incorporation Date</span>
                    <span className="text-white">{biz?.incorporationDate || 'N/A'}</span>
                </div>
            </div>
        </div>

        {/* Business Address & Owner Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Business Address */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                    <Briefcase size={12}/> Registered Business Address
                </div>
                <div className="p-3 text-sm text-zinc-300">
                    {biz?.registeredAddress?.addressLine1}<br/>
                    {biz?.registeredAddress?.addressLine2 && <>{biz.registeredAddress.addressLine2}<br/></>}
                    {biz?.registeredAddress?.city}, {biz?.registeredAddress?.state}<br/>
                    {biz?.registeredAddress?.country} - {biz?.registeredAddress?.postalCode}
                </div>
            </div>

            {/* Owner / Authorized Signatory Summary */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                    <User size={12}/> Owner / Authorized Person
                </div>
                <div className="divide-y divide-zinc-800 text-sm">
                    <div className="flex justify-between px-3 py-2">
                        <span className="text-zinc-500 text-xs">ID Type</span>
                        <span className="text-white text-xs uppercase">{owner?.idtype}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                        <span className="text-zinc-500 text-xs">ID Number</span>
                        <span className="text-white text-xs font-mono">{owner?.idno}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                        <span className="text-zinc-500 text-xs">Issued By</span>
                        <span className="text-white text-xs">{owner?.issuedBy}</span>
                    </div>
                </div>
            </div>
        </div>
      </>
  )};

  const renderMetadata = (reqData: any, submittedAt: string) => {
      const meta = getMeta(reqData);
      return (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-500 space-y-4">
            <div>
              <h4 className="font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2"><Server size={14}/> Metadata & Telemetry</h4>
              
              <div className="flex justify-between border-b border-zinc-800 pb-1">
                  <span className="flex items-center gap-1"><Clock size={12}/> Timestamp:</span> <span className="text-zinc-300">{new Date(submittedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1 mt-1">
                  <span>IP Address:</span> <span className="text-zinc-300">{meta.ip_address || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1 mt-1">
                  <span>Timezone:</span> <span className="text-zinc-300">{meta.timezone || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1 mt-1">
                  <span>Geolocation:</span> 
                  <span className="text-zinc-300">
                      {meta.geolocation?.city}, {meta.geolocation?.country} 
                      ({meta.geolocation?.latitude?.toFixed(4)}, {meta.geolocation?.longitude?.toFixed(4)})
                  </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1 mt-1">
                  <span>Device Model:</span> 
                  <span className="text-zinc-300">
                      {meta.inferredDevice?.device_brand} {meta.inferredDevice?.device_model}
                  </span>
              </div>
              <div className="pt-2">
                  <span className="block mb-1">Device Fingerprint:</span>
                  <span className="block bg-zinc-950 p-2 rounded break-all">{meta.device_fingerprint_hash || 'N/A'}</span>
              </div>
            </div>

            {/* Geolocation Map */}
            {meta.geolocation?.latitude && meta.geolocation?.longitude && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <h4 className="font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2"><MapPin size={14}/> Request Origin Map</h4>
                <MapViewer 
                  lat={meta.geolocation.latitude} 
                  lng={meta.geolocation.longitude} 
                  popupText={`${meta.geolocation.city}, ${meta.geolocation.country}`} 
                />
              </div>
            )}
        </div>
      );
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-[#D4AF37]"><Loader2 className="animate-spin w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-10">
       <Toaster position="top-right" toastOptions={{style: {background: '#333', color: '#fff'}}} />
       
       <div className="max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-zinc-800 pb-6">
               <div>
                   <h1 className="text-3xl font-bold text-[#D4AF37] flex items-center gap-3">
                       <ShieldAlert /> Verification Console
                   </h1>
                   <p className="text-zinc-500 mt-1">Queued Items: <span className="text-white font-bold">{requests.length}</span></p>
               </div>
               <button onClick={loadData} className="btn btn-sm btn-ghost text-zinc-400">Refresh List</button>
           </div>

           {/* TABLE */}
           <div className="overflow-x-auto bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl">
               <table className="table w-full">
                   <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs">
                       <tr>
                           <th>User Profile</th>
                           <th>Type</th>
                           <th>Location</th>
                           <th>Submitted Time</th>
                           <th className="text-right">Action</th>
                       </tr>
                   </thead>
                   <tbody className="text-sm">
                       {requests.map((req) => {
                           const meta = getMeta(req.data);
                           const isAgent = req.data.role === 'agent';
                           const fullName = isAgent ? (req.data as PayloadAgentIDVerify).fullName : (req.data as PayloadAgencyIDVerify).businessDocumentDetails?.legalName;
                           const email = isAgent ? (req.data as PayloadAgentIDVerify).email : '';

                           return (
                               <tr key={req.id} className="hover:bg-zinc-800/50 border-b border-zinc-800 last:border-0">
                                   <td>
                                       <div className="flex items-center gap-3">
                                           <div className="avatar placeholder">
                                               <div className="bg-zinc-800 text-zinc-400 rounded-full w-10 h-10 flex items-center justify-center">
                                                   {isAgent ? <User size={18}/> : <Building2 size={18}/>}
                                               </div>
                                           </div>
                                           <div>
                                              <div className="font-bold text-white">{fullName || "Unknown Name"}</div>
                                              <div className="text-xs text-zinc-500 flex flex-col gap-0.5 mt-0.5">
                                                <span className="flex items-center gap-1"><Hash size={10} /> {req.id}</span>
                                                {email && <span className="flex items-center gap-1"><Mail size={10} /> {email}</span>}
                                              </div>
                                           </div>
                                       </div>
                                   </td>
                                   <td>
                                       <span className={`badge border-none text-black font-bold text-xs uppercase ${req.data.role === 'agency' ? 'bg-blue-400' : 'bg-[#D4AF37]'}`}>
                                           {req.data.role}
                                       </span>
                                   </td>
                                   <td>
                                       <div className="flex items-center gap-2 text-zinc-300 text-xs">
                                           <Globe size={12}/> 
                                           {meta.geolocation?.city || 'Unknown'}, {meta.geolocation?.country || 'N/A'}
                                       </div>
                                   </td>
                                   <td>
                                       <div className="flex items-center gap-1 text-zinc-400 text-xs">
                                           <Clock size={12} /> {new Date(req.submittedAt).toLocaleString()}
                                       </div>
                                   </td>
                                   <td className="text-right">
                                       <button onClick={() => openDetailModal(req)} className="btn btn-sm btn-outline border-zinc-700 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black text-zinc-300">
                                           <Eye size={14} /> Inspect
                                       </button>
                                   </td>
                               </tr>
                           );
                       })}
                       {requests.length === 0 && (
                           <tr><td colSpan={5} className="text-center py-8 text-zinc-500">No pending verifications.</td></tr>
                       )}
                   </tbody>
               </table>
           </div>
       </div>

       {/* MODAL */}
       <dialog id="detail_modal" className="modal backdrop-blur-md">
          {selectedReq && (
              <div className="modal-box w-11/12 max-w-7xl bg-zinc-900 border border-zinc-700 shadow-2xl p-0 h-[90vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="bg-zinc-950 p-4 px-6 flex justify-between items-center border-b border-zinc-800">
                      <div>
                          <h3 className="font-bold text-lg text-white flex items-center gap-3">
                              KYC Inspection
                              <span className="badge bg-zinc-800 text-xs font-mono">{selectedReq.id}</span>
                          </h3>
                      </div>
                      <form method="dialog"><button className="btn btn-circle btn-sm btn-ghost text-zinc-400">✕</button></form>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 bg-zinc-900">
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                          
                          {/* Left Column: Integrity & Metadata */}
                          <div className="xl:col-span-4 space-y-6">
                              {/* Integrity Status */}
                              <div className={`p-5 rounded-xl border ${integrityStatus === 'valid' ? 'border-green-900 bg-green-900/10' : integrityStatus === 'tampered' ? 'border-red-900 bg-red-900/10' : 'border-zinc-700 bg-zinc-800/30'}`}>
                                  <h4 className="text-sm font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2"><Hash size={16}/> Digital Signature Check</h4>
                                  
                                  <div className="mb-4">
                                      <span className="text-[10px] uppercase text-zinc-600 font-bold block mb-1">Signed Hash</span>
                                      <p className="text-[10px] font-mono break-all text-zinc-500 bg-zinc-950 p-2 rounded border border-zinc-800 leading-tight">
                                          {selectedReq.data.digitalSignature}
                                      </p>
                                  </div>

                                  {integrityStatus === 'unchecked' && (
                                      <button onClick={checkIntegrity} disabled={verifyingHash} className="btn btn-sm w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-none">
                                          {verifyingHash ? <Loader2 className="animate-spin" size={14}/> : <Lock size={14}/>} 
                                          {verifyingHash ? 'Verifying...' : 'Verify Signature'}
                                      </button>
                                  )}
                                  
                                  {integrityStatus === 'valid' && (
                                      <div className="flex items-center gap-2 text-green-500 font-bold text-sm bg-green-950/30 p-2 rounded">
                                          <Check size={18} /> Signature Matches Stored Key
                                      </div>
                                  )}
                                  
                                  {integrityStatus === 'tampered' && (
                                      <div className="flex items-center gap-2 text-red-500 font-bold text-sm bg-red-950/30 p-2 rounded">
                                          <ShieldAlert size={18} /> INTEGRITY CHECK FAILED
                                      </div>
                                  )}
                              </div>

                              {/* Metadata Panel */}
                              {renderMetadata(selectedReq.data, selectedReq.submittedAt)}
                          </div>

                          {/* Right Column: Form Data & Images */}
                          <div className="xl:col-span-8">
                               {/* Data Details (RENDERED BASED ON ROLE) */}
                               {selectedReq.data.role === 'agent' 
                                  ? renderAgentDetails(selectedReq.data as PayloadAgentIDVerify) 
                                  : renderAgencyDetails(selectedReq.data as PayloadAgencyIDVerify)
                               }

                               {/* Images Grid */}
                               <h4 className="font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2"><Eye size={16}/> Proof Documents</h4>
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                   
                                   {/* --- AGENT IMAGES --- */}
                                   {selectedReq.data.role === 'agent' && (
                                       <>
                                         <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                                             <div className="bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-500 border-b border-zinc-800">ID DOCUMENT</div>
                                             <SecureDocument objectKey={(selectedReq.data as PayloadAgentIDVerify).documentDetails.id_ImageURL} type="contain" />
                                         </div>
                                         <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                                             <div className="bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-500 border-b border-zinc-800">SELFIE</div>
                                             <SecureDocument objectKey={(selectedReq.data as PayloadAgentIDVerify).documentDetails.selfie_ImageURL} type="cover" />
                                         </div>
                                         <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                                             <div className="bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-500 border-b border-zinc-800">SELFIE W/ ID</div>
                                             <SecureDocument objectKey={(selectedReq.data as PayloadAgentIDVerify).documentDetails.selfie_with_id_ImageURL} type="cover" />
                                         </div>
                                       </>
                                   )}

                                   {/* --- AGENCY IMAGES --- */}
                                   {selectedReq.data.role === 'agency' && (
                                       <>
                                         <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                                             <div className="bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-500 border-b border-zinc-800">BUSINESS LICENSE</div>
                                             <SecureDocument objectKey={(selectedReq.data as PayloadAgencyIDVerify).businessDocumentDetails?.businessLicenseURL} type="contain" />
                                         </div>
                                         <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                                             <div className="bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-500 border-b border-zinc-800">OWNER ID</div>
                                             <SecureDocument objectKey={(selectedReq.data as PayloadAgencyIDVerify).documentDetails_of_owner?.id_ImageURL} type="contain" />
                                         </div>
                                         <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                                             <div className="bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-500 border-b border-zinc-800">OWNER SELFIE</div>
                                             <SecureDocument objectKey={(selectedReq.data as PayloadAgencyIDVerify).documentDetails_of_owner?.selfie_ImageURL} type="cover" />
                                         </div>
                                       </>
                                   )}
                               </div>
                          </div>
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex justify-end gap-4 sticky bottom-0 z-10">
                      <button onClick={() => handleDecision('rejected')} className="btn btn-outline border-red-900 text-red-500 hover:bg-red-900 hover:text-white hover:border-red-900"><X size={18} /> Reject KYC</button>
                      <button onClick={() => handleDecision('verified')} className="btn bg-[#D4AF37] hover:bg-yellow-600 text-black border-none font-bold px-8"><Check size={18} /> Verify & Approve</button>
                  </div>
              </div>
          )}
       </dialog>
    </div>
  );
}