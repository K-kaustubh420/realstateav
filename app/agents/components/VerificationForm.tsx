"use client";

import { FormEvent, useEffect, useState } from "react";
import { AgentData } from "@/lib/agents";

type VerificationFormProps = {
  defaultValues?: Partial<AgentData>;
  onSubmit: (values: VerificationFormValues) => Promise<void>;
  onClose: () => void;
};

type VerificationFormValues = {
  fullName: string;
  dob: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  idType: string;
  idNumber: string;
  idPhotoUrl: string;
  selfieWithIdUrl: string;
  profilePhotoUrl: string;
  gpsLocation: {
    lat: number;
    lng: number;
  };
};

const initialState: VerificationFormValues = {
  fullName: "",
  dob: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  idType: "",
  idNumber: "",
  idPhotoUrl: "",
  selfieWithIdUrl: "",
  profilePhotoUrl: "",
  gpsLocation: {
    lat: 0,
    lng: 0,
  },
};

export default function VerificationForm({ defaultValues, onSubmit, onClose }: VerificationFormProps) {
  const [form, setForm] = useState<VerificationFormValues>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!defaultValues) return;

    setForm((current) => ({
      ...current,
      fullName: defaultValues.fullName || "",
      dob: defaultValues.dob || "",
      phone: defaultValues.phone || "",
      address: defaultValues.address || "",
      city: defaultValues.city || "",
      state: defaultValues.state || "",
      pincode: defaultValues.pincode || "",
      idType: defaultValues.idType || "",
      idNumber: defaultValues.idNumber || "",
      idPhotoUrl: defaultValues.idPhotoUrl || "",
      selfieWithIdUrl: defaultValues.selfieWithIdUrl || "",
      profilePhotoUrl: defaultValues.profilePhotoUrl || "",
      gpsLocation: defaultValues.gpsLocation || { lat: 0, lng: 0 },
    }));
  }, [defaultValues]);

  const handleChange = (field: keyof VerificationFormValues, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLocation = () => {
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          gpsLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        }));
      },
      () => {
        setGeoError("Unable to access your location. Please allow location access and try again.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setGeoError(null);

    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-300/80">Verification Form</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Complete your profile for review</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 bg-slate-900/80 px-5 py-3 text-sm text-slate-300 transition hover:border-violet-300/40"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Personal</label>
          </div>
          <div>
            <label className="block text-sm text-slate-300">Full name</label>
            <input
              value={form.fullName}
              onChange={(event) => handleChange("fullName", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">DOB</label>
            <input
              type="date"
              value={form.dob}
              onChange={(event) => handleChange("dob", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">Phone</label>
            <input
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="(555) 123-4567"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Address</label>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm text-slate-300">Address</label>
            <input
              value={form.address}
              onChange={(event) => handleChange("address", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="123 Prime Street"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">City</label>
            <input
              value={form.city}
              onChange={(event) => handleChange("city", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Austin"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">State</label>
            <input
              value={form.state}
              onChange={(event) => handleChange("state", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Texas"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">Pincode</label>
            <input
              value={form.pincode}
              onChange={(event) => handleChange("pincode", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="78613"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Government Verification</label>
          </div>
          <div>
            <label className="block text-sm text-slate-300">ID type</label>
            <select
              value={form.idType}
              onChange={(event) => handleChange("idType", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            >
              <option value="">Select ID type</option>
              <option value="passport">Passport</option>
              <option value="driver_license">Driver License</option>
              <option value="national_id">National ID</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300">ID number</label>
            <input
              value={form.idNumber}
              onChange={(event) => handleChange("idNumber", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="A12345678"
              required
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm text-slate-300">ID photo URL</label>
            <input
              value={form.idPhotoUrl}
              onChange={(event) => handleChange("idPhotoUrl", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="https://example.com/id.jpg"
              required
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm text-slate-300">Selfie with ID URL</label>
            <input
              value={form.selfieWithIdUrl}
              onChange={(event) => handleChange("selfieWithIdUrl", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="https://example.com/selfie.jpg"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Profile</label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-300">Profile photo URL</label>
            <input
              value={form.profilePhotoUrl}
              onChange={(event) => handleChange("profilePhotoUrl", event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="https://example.com/profile.jpg"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">GPS Location</p>
                <p className="mt-1 text-sm text-slate-300">Capture your current coordinates.</p>
              </div>
              <button
                type="button"
                onClick={handleLocation}
                className="rounded-full bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Use Current Location
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/90 p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latitude</p>
                <p className="mt-2">{form.gpsLocation.lat || "--"}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/90 p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Longitude</p>
                <p className="mt-2">{form.gpsLocation.lng || "--"}</p>
              </div>
            </div>
            {geoError ? <p className="text-sm text-rose-300">{geoError}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-slate-400">
            Make sure all fields are accurate before submitting. Our team will review your profile and documents.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit For Review"}
          </button>
        </div>
      </form>
    </section>
  );
}
