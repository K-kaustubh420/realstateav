import { useState } from "react";
import { toast } from "react-hot-toast";

export interface AgencyOnboardingData {
  agencyName: string;
  agencyType: string;
  about: string;
  phone: string;
  email: string;
  Address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  website: string;
  panNumber: string;
  panImageUrl: string;
  registrationDate: string;
  gstNumber: string;
  logoUrl: string;
  bannerUrl: string;
  gpsLocation: { lat: number; lng: number };
  kycStatus: "verify_now" | "verify_later";
  otpSent: boolean;
  otpVerified: boolean;
}

export const useAgencyOnboarding = (onSubmitCallback: (values: any) => Promise<void>, defaultValues: any = {}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AgencyOnboardingData>({
    agencyName: defaultValues.agencyName || "",
    agencyType: defaultValues.agencyType || "",
    about: defaultValues.about || "",
    phone: defaultValues.phone || "",
    email: defaultValues.email || "",
    Address: defaultValues.Address || {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    website: defaultValues.website || "",
    panNumber: defaultValues.panNumber || "",
    panImageUrl: defaultValues.panImageUrl || "",
    registrationDate: defaultValues.registrationDate || "",
    gstNumber: defaultValues.gstNumber || "",
    logoUrl: defaultValues.logoUrl || "",
    bannerUrl: defaultValues.bannerUrl || "",
    gpsLocation: defaultValues.gpsLocation || { lat: 0, lng: 0 },
    kycStatus: defaultValues.kycStatus || "verify_later",
    otpSent: false,
    otpVerified: false,
  });

  const updateForm = (key: keyof AgencyOnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddress = (field: keyof AgencyOnboardingData["Address"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      Address: { ...prev.Address, [field]: value },
    }));
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
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        updateForm("gpsLocation", { lat: latitude, lng: longitude });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            setFormData((prev) => ({
              ...prev,
              Address: {
                ...prev.Address,
                addressLine1: addr.road || addr.suburb || prev.Address.addressLine1,
                city: addr.city || addr.town || addr.village || prev.Address.city,
                state: addr.state || prev.Address.state,
                postalCode: addr.postcode || prev.Address.postalCode,
                country: addr.country || prev.Address.country,
              }
            }));
            toast.success("Location and address detected successfully!", { id: toastId });
          } else {
            toast.success("Coordinates found, but address auto-fill failed.", { id: toastId });
          }
        } catch (error) {
          toast.success("Coordinates found, but address auto-fill failed.", { id: toastId });
        }
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
    updateAddress,
    nextStep,
    prevStep,
    handleSubmit,
    locateMe,
  };
};
