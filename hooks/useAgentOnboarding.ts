import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { completeAgentOnboardingAction } from "@/lib/agents/onboarding/onboardingActions";

export interface OnboardingData {
  firstname: string;
  lastname: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  about: string;
  photoURL: string;
  location: {
    longitute: string;
    latitute: string;
  };
  Address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export const useAgentOnboarding = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("details");

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    firstname: "",
    lastname: "",
    email: "",
    countryCode: "",
    mobileNumber: "",
    about: "",
    photoURL: "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
    location: { longitute: "", latitute: "" },
    Address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  // Fetch initial data
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!uid) {
        toast.error("Invalid onboarding session.");
        router.push("/");
        return;
      }
      try {
        const agentDoc = await getDoc(doc(db, "agents", uid));
        if (agentDoc.exists()) {
          const data = agentDoc.data();
          
          if (data.onboardingCompleted) {
            router.push(`/agentportal/dashboard_agentdetails?id=${uid}`);
            return;
          }

          setFormData((prev) => ({
            ...prev,
            firstname: data.name?.firstname || "",
            lastname: data.name?.lastname || "",
            email: data.email || "",
            countryCode: data.number?.countrycode || "",
            mobileNumber: data.number?.mobilenumber || "",
            about: data.about || "",
            photoURL: data.photoURL || prev.photoURL,
            location: {
              longitute: data.location?.longitute || "",
              latitute: data.location?.latitute || "",
            },
            Address: {
              addressLine1: data.Address?.addressLine1 || "",
              addressLine2: data.Address?.addressLine2 || "",
              city: data.Address?.city || "",
              state: data.Address?.state || "",
              postalCode: data.Address?.postalCode || "",
              country: data.Address?.country || "",
            },
          }));
        } else {
          toast.error("Agent profile not found.");
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Error fetching agent:", error);
        toast.error("Failed to load your profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [uid, router]);

  const updateForm = (key: keyof OnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddress = (field: keyof OnboardingData["Address"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      Address: { ...prev.Address, [field]: value },
    }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!uid) return;
    setSubmitting(true);
    const toastId = toast.loading("Saving your profile...");

    try {
      const payload = {
        name: {
          firstname: formData.firstname,
          lastname: formData.lastname,
        },
        about: formData.about,
        photoURL: formData.photoURL,
        location: formData.location,
        Address: formData.Address,
      };

      const res = await completeAgentOnboardingAction(uid, payload);
      
      if (!res.success) {
        throw new Error(res.error || "Failed to complete onboarding.");
      }

      toast.success("Welcome aboard!", { id: toastId });
      router.push("/agentportal/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for OpenStreetMap Geolocation
  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    const toastId = toast.loading("Detecting location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        updateForm("location", {
          latitute: latitude.toString(),
          longitute: longitude.toString(),
        });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            setFormData((prev) => ({
              ...prev,
              Address: {
                addressLine1: addr.road || addr.suburb || "",
                addressLine2: "",
                city: addr.city || addr.town || addr.village || "",
                state: addr.state || "",
                postalCode: addr.postcode || "",
                country: addr.country || "",
              },
            }));
            toast.success("Location detected successfully!", { id: toastId });
          } else {
            toast.success("Coordinates found, but address auto-fill failed.", { id: toastId });
          }
        } catch (error) {
          toast.success("Coordinates found, but address auto-fill failed.", { id: toastId });
        }
      },
      (error) => {
        toast.error("Failed to detect location. Please type manually.", { id: toastId });
      }
    );
  };

  return {
    uid,
    formData,
    loading,
    submitting,
    currentStep,
    updateForm,
    updateAddress,
    nextStep,
    prevStep,
    handleSubmit,
    locateMe,
  };
};
