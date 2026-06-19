import { useState } from "react";
import { toast } from "react-hot-toast";

export interface AgencyOnboardingData {
  agencyName: string;
  about: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
  gstNumber: string;
  logoUrl: string;
  bannerUrl: string;
  gpsLocation: { lat: number; lng: number };
}

export const useAgencyOnboarding = (onSubmitCallback: (values: any) => Promise<void>, defaultValues: any = {}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AgencyOnboardingData>({
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

  const updateForm = (key: keyof AgencyOnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const locateMe = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      const err = "Geolocation not supported by your browser.";
      setGeoError(err);
      toast.error(err);
      return;
    }
    const toastId = toast.loading("Detecting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateForm("gpsLocation", { lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Location detected successfully!", { id: toastId });
      },
      () => {
        const err = "Unable to access location. Please enable location services.";
        setGeoError(err);
        toast.error(err, { id: toastId });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const toastId = toast.loading("Creating your agency...");
    try {
      await onSubmitCallback(formData);
      toast.success("Agency created successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Unable to create agency.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    submitting,
    currentStep,
    geoError,
    updateForm,
    nextStep,
    prevStep,
    handleSubmit,
    locateMe,
  };
};
