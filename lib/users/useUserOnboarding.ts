import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { completeUserOnboardingAction } from "./onboardingActions";

export interface UserOnboardingData {
  name: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  about: string;
  photoURL: string;
  intent: "buyer" | "seller" | "renter" | "researcher" | "homeowner" | "";
  exploreintent: string[];
  location: {
    longitute: string;
    latitute: string;
  };
  Address: {
    AddressLine1: string;
    AddressLine2: string;
    City: string;
    State: string;
    PostalCode: string;
    Country: string;
  };
}

export const useUserOnboarding = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("details");

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<UserOnboardingData>({
    name: "",
    email: "",
    countryCode: "",
    mobileNumber: "",
    about: "",
    photoURL: "",
    intent: "",
    exploreintent: [],
    location: { longitute: "", latitute: "" },
    Address: {
      AddressLine1: "",
      AddressLine2: "",
      City: "",
      State: "",
      PostalCode: "",
      Country: "",
    },
  });

  // Fetch initial data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) {
        toast.error("Invalid onboarding session.");
        router.push("/");
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          if (data.onboardingCompleted) {
            router.push(`/user/dashboard?id=${uid}`);
            return;
          }

          setFormData((prev) => ({
            ...prev,
            name: data.name || data.fullName || "",
            email: data.email || "",
            countryCode: data.number?.countrycode || "+1",
            mobileNumber: data.number?.mobilenumber || "",
            about: data.about || "",
            photoURL: data.photoURL || prev.photoURL,
            intent: data.intent || "",
            exploreintent: data.exploreintent || [],
            location: {
              longitute: data.location?.longitute || "",
              latitute: data.location?.latitute || "",
            },
            Address: {
              AddressLine1: data.Address?.AddressLine1 || "",
              AddressLine2: data.Address?.AddressLine2 || "",
              City: data.Address?.City || "",
              State: data.Address?.State || "",
              PostalCode: data.Address?.PostalCode || "",
              Country: data.Address?.Country || "",
            },
          }));
        } else {
          // It's possible the doc is created on auth but not fully populated
          // Let's not throw error, just continue with empty
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load your profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [uid, router]);

  const updateForm = (key: keyof UserOnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddress = (field: keyof UserOnboardingData["Address"], value: string) => {
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
      // First letter of name if photo is empty
      let finalPhotoURL = formData.photoURL;
      if (!finalPhotoURL && formData.name) {
        const firstLetter = formData.name.charAt(0).toUpperCase();
        finalPhotoURL = `https://ui-avatars.com/api/?name=${firstLetter}&background=random`;
      }

      const payload = {
        name: formData.name,
        about: formData.about,
        photoURL: finalPhotoURL,
        location: formData.location,
        Address: formData.Address,
        intent: formData.intent,
        exploreintent: formData.exploreintent,
        number: {
          countrycode: formData.countryCode,
          mobilenumber: formData.mobileNumber
        }
      };

      const res = await completeUserOnboardingAction(uid, payload);
      
      if (!res.success) {
        throw new Error(res.error || "Failed to complete onboarding.");
      }

      toast.success("Profile saved successfully!", { id: toastId });
      
      router.push(`/user/dashboard?id=${uid}`);
      
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
                AddressLine1: addr.road || addr.suburb || "",
                AddressLine2: "",
                City: addr.city || addr.town || addr.village || "",
                State: addr.state || "",
                PostalCode: addr.postcode || "",
                Country: addr.country || "",
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
