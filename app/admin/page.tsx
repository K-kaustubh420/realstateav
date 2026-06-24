"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService } from '@/lib/admin/adminService';
import { ShieldAlert, Users, Home, MessageCircle, BarChart3, Globe, Search, MoreVertical, ShieldCheck, CheckCircle2, XCircle, Building2, Eye, Check, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const metrics = await AdminService.getDashboardMetrics();
        setData(metrics);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handlePropertyStatus = async (id: string, status: 'active' | 'inactive') => {
    const toastId = toast.loading("Updating status...");
    try {
      await AdminService.updatePropertyStatus(id, status);
      toast.success("Property updated", { id: toastId });
      // update local state
      setData((prev: any) => ({
        ...prev,
        properties: prev.properties.map((p: any) => p.id === id ? { ...p, status } : p)
      }));
    } catch (e) {
      toast.error("Failed to update", { id: toastId });
    }
  };

  const handleAgencyDecision = async (agencyId: string, status: 'approved' | 'rejected', reason?: string) => {
    const toastId = toast.loading(`Processing ${status}...`);
    try {
      if (status === 'approved') {
        await AdminService.approveAgencyRequest(agencyId);
      } else {
        await AdminService.rejectAgencyRequest(agencyId, reason || "No reason provided");
      }
      toast.success(`Agency ${status}`, { id: toastId });
      // update local state
      setData((prev: any) => ({
        ...prev,
        agencies: prev.agencies.map((a: any) => (a.id || a.agencyId) === agencyId ? { ...a, agencyStatus: status } : a)
      }));
      setSelectedAgency(null); // Close modal on action
    } catch (e) {
      toast.error("Failed to process", { id: toastId });
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#D4AF37]">Loading Admin Console...</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <Toaster position="top-right" toastOptions={{style: {background: '#333', color: '#fff'}}} />

      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight text-red-500 font-[Playfair_Display]">Admin Ops</h2>
              <p className="text-xs text-zinc-500">Superuser Access</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}>
            <BarChart3 size={18} className={activeTab === 'overview' ? 'text-[#D4AF37]' : ''} /> Analytics
          </button>
          <button onClick={() => setActiveTab('members')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'members' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}>
            <Users size={18} className={activeTab === 'members' ? 'text-[#D4AF37]' : ''} /> Member Directory
          </button>
          <button onClick={() => setActiveTab('properties')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'properties' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}>
            <Home size={18} className={activeTab === 'properties' ? 'text-[#D4AF37]' : ''} /> Properties
          </button>
          <button onClick={() => setActiveTab('agencies')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'agencies' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}>
            <Building2 size={18} className={activeTab === 'agencies' ? 'text-[#D4AF37]' : ''} /> Agency Requests
          </button>
          <button onClick={() => setActiveTab('chats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'chats' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}>
            <MessageCircle size={18} className={activeTab === 'chats' ? 'text-[#D4AF37]' : ''} /> Global Chats
          </button>
          <button onClick={() => router.push('/admin/id_verify')} className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:bg-zinc-900/50 hover:text-white rounded-xl font-medium transition-colors mt-4">
            <ShieldCheck size={18} /> ID Verification
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-3xl font-bold font-[Playfair_Display] mb-8">Platform Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm font-bold uppercase mb-2">Total Users</p>
                <h3 className="text-4xl font-bold">{data.totalUsers}</h3>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm font-bold uppercase mb-2">Total Agents</p>
                <h3 className="text-4xl font-bold">{data.totalAgents}</h3>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm font-bold uppercase mb-2">Registered Agencies</p>
                <h3 className="text-4xl font-bold">{data.totalAgencies}</h3>
              </div>
              <div className="bg-gradient-to-br from-[#D4AF37] to-[#B38F2B] rounded-2xl p-6 text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <p className="text-black/70 text-sm font-bold uppercase mb-2">Active Properties</p>
                <h3 className="text-4xl font-bold">{data.activeProperties}</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-3xl font-bold font-[Playfair_Display]">Member Directory</h1>
               <div className="bg-zinc-900 border border-zinc-800 rounded-full flex items-center px-4 py-2">
                 <Search size={16} className="text-zinc-500 mr-2" />
                 <input type="text" placeholder="Search members..." className="bg-transparent text-sm text-white focus:outline-none" />
               </div>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-zinc-950 text-xs uppercase text-zinc-500 font-bold">
                     <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Verification</th>
                        <th className="px-6 py-4">Joined</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-sm">
                     {[...data.agents, ...data.agencies, ...data.users].slice(0, 50).map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                           <td className="px-6 py-4">
                              <p className="font-bold text-white">{m.name?.firstname || m.name || m.email}</p>
                              <p className="text-xs text-zinc-500">{m.email}</p>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${m.role === 'agency' ? 'bg-blue-500/20 text-blue-400' : m.role === 'agent' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                 {m.role || 'user'}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              {m.id_verify === 'verified' ? <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={14}/> Verified</span> : <span className="text-zinc-500 flex items-center gap-1"><XCircle size={14}/> Pending</span>}
                           </td>
                           <td className="px-6 py-4 text-zinc-400">
                              {m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
             <h1 className="text-3xl font-bold font-[Playfair_Display] mb-8">Properties Management</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.properties.map((p: any) => (
                   <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col group">
                      <div className="h-48 bg-zinc-800 relative">
                         <img src={p.images?.[0] || 'https://via.placeholder.com/400'} alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute top-3 right-3 flex gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase shadow-lg ${p.status === 'active' ? 'bg-green-500 text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-700'}`}>
                               {p.status}
                            </span>
                         </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                         <h3 className="font-bold text-lg leading-tight mb-1">{p.location}</h3>
                         <p className="text-zinc-500 text-sm mb-4 line-clamp-1">{p.addressLine1}</p>
                         <div className="mt-auto flex justify-between items-center">
                            <p className="font-bold text-[#D4AF37] text-xl">${parseInt(p.expectedPrice).toLocaleString()}</p>
                            
                            <div className="dropdown dropdown-end">
                              <label tabIndex={0} className="btn btn-circle btn-sm btn-ghost text-zinc-400">
                                <MoreVertical size={16} />
                              </label>
                              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-zinc-950 border border-zinc-800 rounded-box w-40">
                                {p.status !== 'active' && <li><a onClick={() => handlePropertyStatus(p.id, 'active')} className="text-green-500">Set Active</a></li>}
                                {p.status === 'active' && <li><a onClick={() => handlePropertyStatus(p.id, 'inactive')} className="text-red-500">Unlist / Disable</a></li>}
                              </ul>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'chats' && (
           <div className="animate-in fade-in slide-in-from-bottom-4">
               <h1 className="text-3xl font-bold font-[Playfair_Display] mb-8">Global Chat Viewer</h1>
               <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                  <Globe size={48} className="text-zinc-700 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Omniscient View</h3>
                  <p className="text-zinc-500 max-w-md mx-auto">
                     This interface connects directly to the Firestore `chats` collection to allow administrators to monitor all communications. Select a chat thread to view transcripts.
                  </p>
                  <button className="btn bg-[#D4AF37] hover:bg-yellow-600 text-black font-bold mt-6">
                     Sync Chat Logs
                  </button>
               </div>
           </div>
        )}

        {activeTab === 'agencies' && (
           <div className="animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-3xl font-bold font-[Playfair_Display] mb-8">Agency Verification Requests</h1>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-zinc-950 text-xs uppercase text-zinc-500 font-bold">
                       <tr>
                          <th className="px-6 py-4">Agency Name</th>
                          <th className="px-6 py-4">Owner</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Applied On</th>
                          <th className="px-6 py-4 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-sm">
                       {data.agencies.map((ag: any, idx: number) => (
                          <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                             <td className="px-6 py-4">
                                <p className="font-bold text-white">{ag.agencyName}</p>
                                <p className="text-xs text-zinc-500">{ag.details?.email || ag.owner?.email}</p>
                             </td>
                             <td className="px-6 py-4">
                                <p className="font-bold text-white">{ag.owner?.name}</p>
                                <p className="text-xs text-zinc-500">{ag.owner?.agentId}</p>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${ag.agencyStatus === 'approved' ? 'bg-green-500/20 text-green-400' : ag.agencyStatus === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                   {ag.agencyStatus || 'pending'}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-zinc-400">
                                {ag.createdAt ? new Date(ag.createdAt).toLocaleDateString() : 'N/A'}
                             </td>
                             <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button onClick={() => setSelectedAgency(ag)} className="btn btn-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white border-none">
                                  <Eye size={14} /> Review
                                </button>
                             </td>
                          </tr>
                       ))}
                       {data.agencies.length === 0 && (
                          <tr><td colSpan={5} className="text-center py-8 text-zinc-500">No agency requests found.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>

               {/* Agency Details Modal */}
               {selectedAgency && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animation-fade-in">
                     <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-6 flex justify-between items-center z-10">
                           <div>
                              <h2 className="text-2xl font-bold font-[Playfair_Display]">Agency Review</h2>
                              <p className="text-zinc-500 text-sm">Verify details for {selectedAgency.agencyName || selectedAgency.details?.agencyName}</p>
                           </div>
                           <button onClick={() => setSelectedAgency(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                              <X size={20} className="text-zinc-400" />
                           </button>
                        </div>
                        
                        <div className="p-6 space-y-8">
                           {/* Basic Info */}
                           <div className="grid grid-cols-2 gap-6">
                              <div>
                                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Agency Name & Type</p>
                                 <p className="font-medium text-lg">{selectedAgency.agencyName || selectedAgency.details?.agencyName}</p>
                                 <p className="text-sm text-zinc-400 capitalize">{selectedAgency.details?.agencyType?.replace('_', ' ') || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Contact Details</p>
                                 <p className="font-medium flex items-center gap-2">
                                    {selectedAgency.details?.email || selectedAgency.owner?.email}
                                    <span className="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-bold">Verified</span>
                                 </p>
                                 <p className="text-sm text-zinc-400">{selectedAgency.details?.phone || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Agent Details</p>
                                 <p className="font-medium">{selectedAgency.owner?.name || 'N/A'}</p>
                                 <p className="text-xs text-zinc-400 font-mono mt-1" title="Agent ID">{selectedAgency.owner?.agentId || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Application Date</p>
                                 <p className="font-medium">{selectedAgency.createdAt ? new Date(selectedAgency.createdAt).toLocaleString() : 'N/A'}</p>
                              </div>
                           </div>

                           {/* Location Details */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                 <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Location Information</p>
                                 <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 h-full">
                                    {selectedAgency.details?.Address ? (
                                       <>
                                          <p className="font-medium">{selectedAgency.details.Address.addressLine1}</p>
                                          {selectedAgency.details.Address.addressLine2 && <p className="font-medium">{selectedAgency.details.Address.addressLine2}</p>}
                                          <p className="text-zinc-400 mt-1">
                                             {selectedAgency.details.Address.city}, {selectedAgency.details.Address.state} {selectedAgency.details.Address.postalCode}
                                          </p>
                                          <p className="text-zinc-500">{selectedAgency.details.Address.country}</p>
                                       </>
                                    ) : (
                                       <p className="text-zinc-500 italic">No structured address provided.</p>
                                    )}
                                 </div>
                              </div>
                              <div>
                                 <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Geolocation Details</p>
                                 <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 h-full flex flex-col justify-center">
                                    {selectedAgency.details?.geolocation ? (
                                       <div className="space-y-2">
                                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                             <span className="text-zinc-500 text-sm">Latitude:</span>
                                             <span className="font-mono text-zinc-300">{selectedAgency.details.geolocation.lat}</span>
                                          </div>
                                          <div className="flex justify-between items-center pt-1">
                                             <span className="text-zinc-500 text-sm">Longitude:</span>
                                             <span className="font-mono text-zinc-300">{selectedAgency.details.geolocation.lng}</span>
                                          </div>
                                       </div>
                                    ) : (
                                       <p className="text-zinc-500 italic">No exact coordinates recorded.</p>
                                    )}
                                 </div>
                              </div>
                           </div>

                           {/* Legal & KYC */}
                           <div className="grid grid-cols-2 gap-6">
                              <div>
                                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Company PAN</p>
                                 <p className="font-medium uppercase tracking-wider">{selectedAgency.details?.panNumber || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Registration Date</p>
                                 <p className="font-medium">{selectedAgency.details?.registrationDate || 'N/A'}</p>
                              </div>
                           </div>

                           {/* PAN Image Viewer */}
                           <div>
                              <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Uploaded Document (PAN)</p>
                              {selectedAgency.details?.panImageUrl ? (
                                 <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center">
                                    <img src={selectedAgency.details.panImageUrl} alt="PAN Document" className="w-full max-w-[500px] h-auto object-contain max-h-[400px] p-2" />
                                 </div>
                              ) : (
                                 <div className="p-8 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 bg-zinc-950">
                                    No document uploaded
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Actions */}
                        {(!selectedAgency.agencyStatus || selectedAgency.agencyStatus === 'pending') && (
                           <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 p-6 flex gap-4 justify-end">
                              <button 
                                 onClick={() => {
                                    const reason = prompt("Enter rejection reason:");
                                    if (reason) handleAgencyDecision(selectedAgency.id || selectedAgency.agencyId, 'rejected', reason);
                                 }}
                                 className="px-6 py-2 rounded-lg font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                              >
                                 Reject Agency
                              </button>
                              <button 
                                 onClick={() => handleAgencyDecision(selectedAgency.id || selectedAgency.agencyId, 'approved')}
                                 className="px-6 py-2 rounded-lg font-bold bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                              >
                                 <ShieldCheck size={18} /> Approve & Verify
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </div>
         )}
      </main>
    </div>
  );
}
