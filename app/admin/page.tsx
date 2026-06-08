"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService } from '@/utils/adminService';
import { ShieldAlert, Users, Home, MessageCircle, BarChart3, Globe, Search, MoreVertical, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

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
      </main>
    </div>
  );
}
