"use client";

import { useEffect, useState } from "react";

type Props = {
  defaultValues?: any;
  onSubmit: (values: any) => Promise<void>;
};

export default function CreateAgencyForm({ defaultValues = {}, onSubmit }: Props) {
  const [form, setForm] = useState({
    agencyName: defaultValues.agencyName || "",
    about: defaultValues.about || "",
    phone: defaultValues.phone || "",
    email: defaultValues.email || "",
    address: defaultValues.address || "",
    city: defaultValues.city || "",
    state: defaultValues.state || "",
    pincode: defaultValues.pincode || "",
    website: defaultValues.website || "",
    gstNumber: defaultValues.gstNumber || "",
    logoUrl: defaultValues.logoUrl || "",
    bannerUrl: defaultValues.bannerUrl || "",
    gpsLocation: defaultValues.gpsLocation || { lat: 0, lng: 0 },
  });
  const [submitting, setSubmitting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => setForm((s) => ({ ...s, [field]: value }));

  const handleLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((s) => ({ ...s, gpsLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
      },
      () => setGeoError("Unable to access location."),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    // client-side validation
    const required = ["agencyName", "phone", "email", "address", "city", "state"];
    const errors: Record<string, string> = {};
    required.forEach((k) => {
      // @ts-ignore
      if (!form[k] || String(form[k]).trim() === "") errors[k] = "Please fill this field";
    });
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      console.error(err);
      setServerError(err?.message || "Unable to create agency.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-lg backdrop-blur-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-300">Agency name</label>
          <input value={form.agencyName} onChange={(e) => handleChange("agencyName", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
          {formErrors.agencyName ? <p className="mt-1 text-sm text-rose-300">{formErrors.agencyName}</p> : null}
        </div>
        <div>
          <label className="block text-sm text-slate-300">Phone</label>
          <input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
          {formErrors.phone ? <p className="mt-1 text-sm text-rose-300">{formErrors.phone}</p> : null}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-slate-300">About</label>
          <textarea value={form.about} onChange={(e) => handleChange("about", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
        </div>
        <div>
          <label className="block text-sm text-slate-300">Email</label>
          <input value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
          {formErrors.email ? <p className="mt-1 text-sm text-rose-300">{formErrors.email}</p> : null}
        </div>
        <div>
          <label className="block text-sm text-slate-300">Website</label>
          <input value={form.website} onChange={(e) => handleChange("website", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
        </div>
        <div>
          <label className="block text-sm text-slate-300">GST Number</label>
          <input value={form.gstNumber} onChange={(e) => handleChange("gstNumber", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
        </div>
        <div>
          <label className="block text-sm text-slate-300">Address</label>
          <input value={form.address} onChange={(e) => handleChange("address", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
          {formErrors.address ? <p className="mt-1 text-sm text-rose-300">{formErrors.address}</p> : null}
        </div>
        <div>
          <label className="block text-sm text-slate-300">City</label>
          <input value={form.city} onChange={(e) => handleChange("city", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
          {formErrors.city ? <p className="mt-1 text-sm text-rose-300">{formErrors.city}</p> : null}
        </div>
        <div>
          <label className="block text-sm text-slate-300">State</label>
          <input value={form.state} onChange={(e) => handleChange("state", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
          {formErrors.state ? <p className="mt-1 text-sm text-rose-300">{formErrors.state}</p> : null}
        </div>
        <div>
          <label className="block text-sm text-slate-300">Pincode</label>
          <input value={form.pincode} onChange={(e) => handleChange("pincode", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
        </div>
        <div>
          <label className="block text-sm text-slate-300">Logo URL</label>
          <input value={form.logoUrl} onChange={(e) => handleChange("logoUrl", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
        </div>
        <div>
          <label className="block text-sm text-slate-300">Banner URL</label>
          <input value={form.bannerUrl} onChange={(e) => handleChange("bannerUrl", e.target.value)} className="mt-2 w-full rounded-xl bg-slate-900/70 px-4 py-3 text-white" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 items-center">
        <div className="space-y-2">
          <p className="text-sm text-slate-400">GPS Location</p>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-950/70 px-3 py-2 text-sm text-slate-300">Lat: {form.gpsLocation.lat || "--"}</div>
            <div className="rounded-xl bg-slate-950/70 px-3 py-2 text-sm text-slate-300">Lng: {form.gpsLocation.lng || "--"}</div>
            <button type="button" onClick={handleLocation} className="ml-auto rounded-full bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#D4AF37]">Use Current Location</button>
          </div>
          {geoError ? <p className="text-sm text-rose-300">{geoError}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="submit" disabled={submitting} className="rounded-full bg-[#D4AF37]/10 px-6 py-3 text-sm font-semibold text-[#D4AF37]">{submitting ? "Creating…" : "Create Agency"}</button>
        </div>
      </div>
      {serverError ? <p className="mt-4 text-sm text-rose-300">{serverError}</p> : null}
    </form>
  );
}
