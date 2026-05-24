"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Property, PropertyScene, PropertyStatus } from "@/lib/properties/property.types";
import { AgentData } from "@/lib/agents";
import { createProperty } from "@/lib/properties/createProperty";
import { updateProperty } from "@/lib/properties/updateProperty";

interface PropertyFormModalProps {
  property?: Property | null;
  agentData: AgentData;
  activeAgency: { agencyId: string; agencyName: string } | null;
  onClose: () => void;
  onSave: () => void;
}

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
];

const AVAILABLE_AMENITIES = [
  "Swimming Pool",
  "Gym",
  "Power Backup",
  "24x7 Security",
  "Reserved Parking",
  "Club House",
  "Private Garden",
  "Elevator",
  "Intercom",
  "Vastu Compliant"
];

export default function PropertyFormModal({
  property,
  agentData,
  activeAgency,
  onClose,
  onSave
}: PropertyFormModalProps) {
  const isEdit = !!property;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [propertyScene, setPropertyScene] = useState<PropertyScene>("on_sale");
  const [status, setStatus] = useState<PropertyStatus>("active");
  const [listAs, setListAs] = useState<"individual" | "agency">("individual");

  // Location
  const [location, setLocation] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [lat, setLat] = useState<number>(37.7749);
  const [lng, setLng] = useState<number>(-122.4194);

  // Specifications
  const [bedrooms, setBedrooms] = useState<number | "">("");
  const [bathrooms, setBathrooms] = useState<number | "">("");
  const [bhk, setBhk] = useState<number | "">("");
  const [floor, setFloor] = useState<number | "">("");
  const [totalFloors, setTotalFloors] = useState<number | "">("");
  const [carpetArea, setCarpetArea] = useState<number | "">("");
  const [builtUpArea, setBuiltUpArea] = useState<number | "">("");
  const [landArea, setLandArea] = useState<number | "">("");

  // Pricing
  const [expectedPrice, setExpectedPrice] = useState<number>(0);
  const [maintenance, setMaintenance] = useState<number | "">("");

  // Details
  const [condition, setCondition] = useState("New");
  const [renovation, setRenovation] = useState("Unfurnished");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>(DEFAULT_IMAGES);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Set default form values from property (if editing)
  useEffect(() => {
    if (property) {
      setTitle(property.title || "");
      setPropertyType(property.propertyType || "Apartment");
      setPropertyScene(property.property_scene || "on_sale");
      setStatus(property.status || "active");
      setListAs(property.listingType || "individual");

      setLocation(property.location || "");
      setAddressLine1(property.addressLine1 || "");
      setAddressLine2(property.addressLine2 || "");
      setCity(property.city || "");
      setState(property.state || "");
      setPincode(property.pincode || "");
      setLat(property.coordinates?.lat ?? 37.7749);
      setLng(property.coordinates?.lng ?? -122.4194);

      setBedrooms(property.bedrooms ?? "");
      setBathrooms(property.bathrooms ?? "");
      setBhk(property.bhk ?? "");
      setFloor(property.floor ?? "");
      setTotalFloors(property.totalFloors ?? "");
      setCarpetArea(property.carpetArea ?? "");
      setBuiltUpArea(property.builtUpArea ?? "");
      setLandArea(property.landArea ?? "");

      setExpectedPrice(property.expectedPrice ?? 0);
      setMaintenance(property.maintenance ?? "");

      setCondition(property.condition || "New");
      setRenovation(property.renovation || "Unfurnished");
      setDescription(property.description || "");
      setAmenities(property.amenities || []);
      setImages(property.images || DEFAULT_IMAGES);
    } else {
      // Default to agency if they belong to one
      if (activeAgency) {
        setListAs("agency");
      }
      // Populate GPS defaults if agent has them
      if (agentData.gpsLocation) {
        setLat(agentData.gpsLocation.lat);
        setLng(agentData.gpsLocation.lng);
      }
    }
  }, [property, activeAgency, agentData]);

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!title.trim()) {
      setError("Property Title is required.");
      setLoading(false);
      return;
    }
    if (!location.trim()) {
      setError("General locality/location is required.");
      setLoading(false);
      return;
    }
    if (!addressLine1.trim()) {
      setError("Address Line 1 is required.");
      setLoading(false);
      return;
    }
    if (!city.trim()) {
      setError("City is required.");
      setLoading(false);
      return;
    }
    if (!state.trim()) {
      setError("State is required.");
      setLoading(false);
      return;
    }
    if (!pincode.trim()) {
      setError("Pincode is required.");
      setLoading(false);
      return;
    }
    if (expectedPrice <= 0) {
      setError("Expected price must be greater than 0.");
      setLoading(false);
      return;
    }

    const payload: Omit<Property, "id" | "views" | "postedAt" | "verified"> = {
      title: title.trim(),
      propertyType,
      property_scene: propertyScene,
      status: property ? property.status : status,
      listedUnderAgency: listAs === "agency" && !!activeAgency,
      agencyId: listAs === "agency" && activeAgency ? activeAgency.agencyId : undefined,
      agencyName: listAs === "agency" && activeAgency ? activeAgency.agencyName : undefined,
      listingType: listAs,
      userId: property?.userId, // Keep user-owner details if claiming user draft
      userName: property?.userName,
      userEmail: property?.userEmail,
      userPhone: property?.userPhone,
      userPermanentAddress: property?.userPermanentAddress,
      userIdProofUrl: property?.userIdProofUrl,
      location: location.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      coordinates: { lat, lng },
      bedrooms: bedrooms === "" ? undefined : Number(bedrooms),
      bathrooms: bathrooms === "" ? undefined : Number(bathrooms),
      bhk: bhk === "" ? undefined : Number(bhk),
      floor: floor === "" ? undefined : Number(floor),
      totalFloors: totalFloors === "" ? undefined : Number(totalFloors),
      carpetArea: carpetArea === "" ? undefined : Number(carpetArea),
      builtUpArea: builtUpArea === "" ? undefined : Number(builtUpArea),
      landArea: landArea === "" ? undefined : Number(landArea),
      expectedPrice,
      maintenance: maintenance === "" ? undefined : Number(maintenance),
      condition,
      renovation,
      description: description.trim(),
      amenities,
      images,
    };

    try {
      if (isEdit && property) {
        await updateProperty(property.id, payload, agentData.uid);
      } else {
        await createProperty(payload, {
          uid: agentData.uid,
          fullName: agentData.fullName || "Unknown Agent",
        });
      }
      onSave();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save property listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-900/90 text-white shadow-2xl backdrop-blur-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {isEdit ? "Edit Property Listing" : "New Property Listing"}
            </h3>
            <p className="text-sm text-slate-400">
              {isEdit
                ? "Modify your premium listing details."
                : "Register a high-end luxury listing."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
              {error}
            </div>
          )}

          {/* SECTION: Ownership & Visibility */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
              Ownership & Listing Mode
            </h4>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">List As</span>
                <select
                  value={listAs}
                  onChange={(e) => setListAs(e.target.value as any)}
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                >
                  <option value="individual">Individual Agent (Personal)</option>
                  {activeAgency && (
                    <option value="agency">Agency: {activeAgency.agencyName}</option>
                  )}
                </select>
              </label>

              {!isEdit && (
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-300">Initial Status</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                  >
                    <option value="active">Active (Listed publicly)</option>
                    <option value="draft">Draft (Saved privately)</option>
                  </select>
                </label>
              )}
            </div>
          </div>

          {/* SECTION: Basic Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
              Property Information
            </h4>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-300">Listing Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 4 BHK Ultra-Luxury Villa at Palm Meadows"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Property Type</span>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="House">House</option>
                  <option value="Plot">Plot/Land</option>
                  <option value="Commercial">Commercial space</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Listing Option</span>
                <select
                  value={propertyScene}
                  onChange={(e) => setPropertyScene(e.target.value as any)}
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                >
                  <option value="on_sale">For Sale Only</option>
                  <option value="on_rent">For Rent Only</option>
                  <option value="sell_and_rent">Available for Sale & Rent</option>
                  <option value="draft_for_sale">Draft for Sale</option>
                  <option value="draft_for_rental">Draft for Rental</option>
                </select>
              </label>
            </div>
          </div>

          {/* SECTION: Specifications */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
              Specifications & Area
            </h4>
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">BHK</span>
                <input
                  type="number"
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 3"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Bedrooms</span>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 3"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Bathrooms</span>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 3"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Floor</span>
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 5"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Total Floors</span>
                <input
                  type="number"
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 15"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Carpet Area (sq ft)</span>
                <input
                  type="number"
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 1800"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Built Area (sq ft)</span>
                <input
                  type="number"
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 2100"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Land Area (sq ft)</span>
                <input
                  type="number"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 4000"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>
            </div>
          </div>

          {/* SECTION: Pricing & Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
              Pricing & Condition
            </h4>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Expected Price (₹)</span>
                <input
                  type="number"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(Number(e.target.value))}
                  placeholder="e.g. 25000000"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Monthly Maintenance (₹)</span>
                <input
                  type="number"
                  value={maintenance}
                  onChange={(e) => setMaintenance(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Property Condition</span>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                >
                  <option value="New">Ready to Move (Brand New)</option>
                  <option value="Resale">Resale</option>
                  <option value="Under Construction">Under Construction</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Furnishing</span>
                <select
                  value={renovation}
                  onChange={(e) => setRenovation(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                >
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                </select>
              </label>
            </div>
          </div>

          {/* SECTION: Location */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
              Location & Address
            </h4>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">General Locality/Area</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Indiranagar"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Address Line 1</span>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Street address, building name"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Address Line 2 (Optional)</span>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Suite, unit, landmark"
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
              </label>

              <div className="grid gap-4 grid-cols-3 sm:col-span-1">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-300">City</span>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 outline-none focus:border-[#D4AF37] transition"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-300">State</span>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 outline-none focus:border-[#D4AF37] transition"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-300">Pincode</span>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560038"
                    className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 outline-none focus:border-[#D4AF37] transition"
                  />
                </label>
              </div>

              <div className="grid gap-4 grid-cols-2 sm:col-span-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-300">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-300">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION: Amenities */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
              Amenities
            </h4>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const selected = amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center justify-center rounded-2xl border px-4 py-3 text-center text-xs font-semibold tracking-wide transition duration-300 ${
                      selected
                        ? "border-[#D4AF37]/35 bg-[#D4AF37]/15 text-white"
                        : "border-white/5 bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION: Description */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
              Detailed Description
            </h4>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-300">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe the premium highlights of the property, surroundings, connectivity..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 outline-none focus:border-[#D4AF37] transition resize-none"
              />
            </label>
          </div>

          {/* SECTION: Images */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#D4AF37]">
              Media Gallery
            </h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste luxury image URL..."
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-[#D4AF37] transition"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15 transition"
                >
                  <Plus className="h-4 w-4" />
                  Add URL
                </button>
              </div>

              {images.length > 0 && (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative h-28 w-full overflow-hidden rounded-2xl border border-white/10"
                    >
                      <img src={url} alt={`Listing`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-2 text-rose-400 opacity-0 group-hover:opacity-100 transition hover:bg-slate-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 border-t border-white/10 px-8 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-full bg-[#D4AF37] px-8 py-3 text-sm font-semibold text-black hover:bg-[#c5a12e] disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}
