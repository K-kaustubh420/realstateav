"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit3, CheckCircle, Ban, RefreshCw, Trash2, Home, User, Building2, MapPin, DollarSign, Layers } from "lucide-react";
import { fetchUserProfile, UserProfile } from '@/lib/users/profile';
import { Property, PropertyScene, PropertyStatus } from "@/lib/properties/property.types";
import { AgentData, getAgentData } from "@/lib/agents";
import { getAgentActiveAgency } from "@/lib/agents/joinAgency";
import { updatePropertyStatus } from "@/lib/properties/propertyStatus";
import { deleteProperty } from "@/lib/properties/deleteProperty";
import PropertyFormModal from "./PropertyFormModal";

interface AgentPropertiesSectionProps {
  email: string;
}

export default function AgentPropertiesSection({ email }: AgentPropertiesSectionProps) {
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [activeAgency, setActiveAgency] = useState<{ agencyId: string; agencyName: string } | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Sub-tabs: active | draft | sold | rented
  const [activeSubTab, setActiveSubTab] = useState<PropertyStatus>("active");

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  // Draft review state
  const [reviewingProperty, setReviewingProperty] = useState<Property | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewUserProfile, setReviewUserProfile] = useState<UserProfile | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);


  const [claimListAs, setClaimListAs] = useState<"individual" | "agency">("individual");

  const loadPropertiesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const agent = await getAgentData(email);
      if (!agent) {
        setError("Unable to resolve agent profile.");
        setLoading(false);
        return;
      }
      setAgentData(agent);

      // Resolve active agency if any
      const agencyRecord = await getAgentActiveAgency(agent);
      if (agencyRecord) {
        setActiveAgency({
          agencyId: agencyRecord.agencyId,
          agencyName: agencyRecord.agencyName,
        });
      } else {
        setActiveAgency(null);
      }

      // Query agent's own properties
      const propertiesCol = collection(db, "properties");
      const qAgent = query(propertiesCol, where("agentId", "==", agent.uid));
      const snapAgent = await getDocs(qAgent);
      const agentProps = snapAgent.docs.map((d) => d.data() as Property);

      // Query all draft properties to search for user drafts (unclaimed)
      const qDrafts = query(propertiesCol, where("status", "==", "draft"));
      const snapDrafts = await getDocs(qDrafts);
      const userDrafts = snapDrafts.docs
        .map((d) => d.data() as Property)
        .filter((p) => p.userId && !p.agentId);

      // Combine and deduplicate
      const allPropsMap = new Map<string, Property>();
      agentProps.forEach((p) => allPropsMap.set(p.id, p));
      userDrafts.forEach((p) => allPropsMap.set(p.id, p));

      setProperties(Array.from(allPropsMap.values()));
    } catch (err: any) {
      console.error(err);
      setError("Failed to load property listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertiesData();
  }, [email]);

  const handleStatusChange = async (
    propertyId: string,
    newScene: PropertyScene,
    newStatus: PropertyStatus
  ) => {
    if (!agentData) return;
    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      await updatePropertyStatus(
        propertyId,
        agentData.uid,
        agentData.fullName || "Unknown Agent",
        newScene,
        newStatus
      );
      setMessage("Property status updated successfully.");
      await loadPropertiesData();
    } catch (err: any) {
      setError(err?.message || "Failed to update property status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimUserDraft = async (property: Property) => {
    if (!agentData || !property) return;
    setActionLoading(true);
    setError(null);
    setMessage(null);

    const agencyInfo =
      claimListAs === "agency" && activeAgency
        ? { agencyId: activeAgency.agencyId, agencyName: activeAgency.agencyName }
        : undefined;

    try {
      await updatePropertyStatus(
        property.id,
        agentData.uid,
        agentData.fullName || "Unknown Agent",
        "on_sale", // Default scene when claiming/activating
        "active",
        agencyInfo
      );
      setMessage("User draft property claimed and activated successfully!");
      await loadPropertiesData();
    } catch (err: any) {
      setError(err?.message || "Failed to claim and activate property draft.");
    } finally {
      setActionLoading(false);
    }
  };

  const openReview = async (property: Property) => {
    setReviewingProperty(property);
    setShowReviewModal(true);
    setReviewLoading(true);
    setReviewUserProfile(null);
    try {
      // Attempt to fetch by email if available, else by UID
      const email = property.userEmail;
      if (email) {
        const profile = await fetchUserProfile(email);
        if (profile) setReviewUserProfile(profile);
      }
    } catch (e) {
      console.error('Failed to load user profile for draft review', e);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!agentData) return;
    const confirmed = window.confirm("Are you sure you want to permanently delete this listing?");
    if (!confirmed) return;

    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      await deleteProperty(propertyId, agentData.uid);
      setMessage("Property listing deleted permanently.");
      await loadPropertiesData();
    } catch (err: any) {
      setError(err?.message || "Failed to delete property listing.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProperties = properties.filter((p) => p.status === activeSubTab);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/55 p-12 text-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-[#D4AF37]" />
          <p className="text-lg font-medium text-white">Loading properties workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {message && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main Header / Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-zinc-950/40 p-6 rounded-3xl border border-white/5">
        <div>
          <h3 className="text-2xl font-semibold text-white">Manage Listings</h3>
          <p className="text-sm text-slate-400">Manage your real estate listings and claim incoming user drafts.</p>
        </div>
        <button
          onClick={() => {
            setEditingProperty(null);
            setShowFormModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-[#c5a12e]"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Property
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/15 bg-zinc-950/20 rounded-2xl p-1 gap-1">
        {(["active", "draft", "sold", "rented"] as PropertyStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold capitalize tracking-wide transition duration-300 ${activeSubTab === tab
              ? "bg-[#D4AF37]/15 text-white shadow-[inset_0_0_0_1px_rgba(212,175,55,0.2)] border-b border-[#D4AF37]/30"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
          >
            {tab} Listings
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredProperties.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-black/40 py-16 text-center text-slate-400">
          <Home className="mx-auto h-12 w-12 text-slate-600 mb-4" />
          <p className="text-lg font-medium text-white">No listings found</p>
          <p className="mt-2 text-sm text-slate-500">There are no properties in the "{activeSubTab}" state currently.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => {
            const isUserDraft = !!property.userId && !property.agentId;
            const price = property.expectedPrice.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            });

            return (
              <div
                key={property.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-lg transition duration-300 hover:border-[#D4AF37]/30 hover:shadow-[0_24px_50px_-25px_rgba(0,0,0,0.8)]"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/5 bg-slate-900">
                  <img
                    src={property.images?.[0] || DEFAULT_IMAGES[0]}
                    alt={property.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {/* Status/User Tag */}
                  <div className="absolute left-3 top-3 flex gap-2">
                    {isUserDraft ? (
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md">
                        USER DRAFT
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
                        {property.status}
                      </span>
                    )}

                    {property.listedUnderAgency && (
                      <span className="rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D4AF37] backdrop-blur-md">
                        AGENCY
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="mt-4 flex-1">
                  <h4 className="text-lg font-bold text-white line-clamp-1">{property.title}</h4>

                  <div className="mt-2 flex items-center gap-2 text-slate-400 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span className="line-clamp-1">{property.location}, {property.city}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-y border-white/5 py-3 my-3 text-center text-slate-400 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-500">BHK</span>
                      <span className="font-semibold text-white">{property.bhk || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-500">Area</span>
                      <span className="font-semibold text-white">{property.carpetArea || property.builtUpArea || "-"} sqft</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-500">Price</span>
                      <span className="font-semibold text-[#D4AF37]">₹{price}</span>
                    </div>
                  </div>

                  {/* Creator info */}
                  {property.userId && (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-3 my-3 space-y-1 text-xs">
                      <p className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Contact Source</p>
                      <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                        <User className="h-3 w-3" />
                        <span>{property.userName || "Guest User"}</span>
                      </div>
                      <p className="text-slate-400 break-all">{property.userEmail || property.userPhone}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  {isUserDraft ? (
                    <button
                      onClick={() => openReview(property)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Review & Claim
                    </button>
                  ) : (
                    <>
                      {/* Active Actions */}
                      {property.status === "active" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(property.id, "sold", "sold")}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-slate-700 hover:border-slate-500 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition"
                          >
                            Mark Sold
                          </button>
                          <button
                            onClick={() => handleStatusChange(property.id, "rented", "rented")}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-slate-700 hover:border-slate-500 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition"
                          >
                            Mark Rented
                          </button>
                          <button
                            onClick={() => handleStatusChange(property.id, "draft_for_sale", "draft")}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-slate-700 hover:border-slate-500 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition"
                          >
                            Draft
                          </button>
                        </>
                      )}

                      {/* Draft Actions */}
                      {property.status === "draft" && (
                        <button
                          onClick={() => handleStatusChange(property.id, "on_sale", "active")}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black hover:bg-[#c5a12e] transition"
                        >
                          Activate
                        </button>
                      )}

                      {/* Sold / Rented Actions */}
                      {(property.status === "sold" || property.status === "rented") && (
                        <button
                          onClick={() => handleStatusChange(property.id, "draft_for_sale", "draft")}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition"
                        >
                          Revert to Draft
                        </button>
                      )}

                      {/* Standard Edit & Delete */}
                      <button
                        onClick={() => {
                          setEditingProperty(property);
                          setShowFormModal(true);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white/5 text-slate-300 hover:border-white/15 hover:bg-white/10 hover:text-white transition"
                        title="Edit Details"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      {/* Only allow deleting if it's agent-created (not user draft) */}
                      {!property.userId && (
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Property Creation/Edit Modal */}
      {showFormModal && agentData && (
        <PropertyFormModal
          property={editingProperty}
          agentData={agentData}
          activeAgency={activeAgency}
          onClose={() => setShowFormModal(false)}
          onSave={() => {
            setShowFormModal(false);
            loadPropertiesData();
          }}
        />
      )}

      {/* Draft Review Modal */}
      {showReviewModal && reviewingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-900 p-6 text-white shadow-2xl backdrop-blur-2xl overflow-y-auto max-h-[90vh]">
            <h4 className="text-xl font-bold text-white mb-4">Review Draft Property</h4>
            {/* Property Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="col-span-2">
                <img src={reviewingProperty.images?.[0] || DEFAULT_IMAGES[0]} alt={reviewingProperty.title} className="w-full h-48 object-cover rounded-2xl mb-4" />
              </div>
              <div>
                <p className="font-semibold">Title:</p>
                <p>{reviewingProperty.title}</p>
              </div>
              <div>
                <p className="font-semibold">Location:</p>
                <p>{reviewingProperty.location}, {reviewingProperty.city}</p>
              </div>
              <div>
                <p className="font-semibold">Price:</p>
                <p>₹{reviewingProperty.expectedPrice?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="font-semibold">BHK:</p>
                <p>{reviewingProperty.bhk || "-"}</p>
              </div>
              <div>
                <p className="font-semibold">Area:</p>
                <p>{reviewingProperty.carpetArea || reviewingProperty.builtUpArea || "-"} sqft</p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold">Description:</p>
                <p>{reviewingProperty.description}</p>
              </div>
            </div>

            {/* User Identity Section */}
            <hr className="my-4 border-white/20" />
            <h5 className="text-lg font-semibold mb-2">User Contact Details</h5>
            {reviewLoading ? (
              <p className="text-sm text-slate-400">Loading user info...</p>
            ) : reviewUserProfile ? (
              <div className="grid gap-2">
                <p><strong>Name:</strong> {reviewUserProfile.fullName || "-"}</p>
                <p><strong>Email:</strong> {reviewUserProfile.email}</p>
                <p><strong>Phone:</strong> {reviewUserProfile.phoneNumber || "-"}</p>
                <p><strong>ID Type:</strong> {reviewUserProfile.governmentIdType || "-"}</p>
                {reviewUserProfile.governmentIdImageUrl && (
                  <img src={reviewUserProfile.governmentIdImageUrl} alt="Government ID" className="mt-2 max-h-32 object-contain" />
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">User profile not available.</p>
            )}

            {/* Claim action */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewingProperty(null);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (reviewingProperty) {
                    handleClaimUserDraft(reviewingProperty);
                  }
                  setShowReviewModal(false);
                  setReviewingProperty(null);
                }}
                className="rounded-full bg-[#D4AF37] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#c5a12e] transition"
              >
                Confirm Claim & List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
];
