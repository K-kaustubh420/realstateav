import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { sendOtpAction, verifyOtpAction, registerAgentDocAction } from "../lib/agents/agentAuthServer";

// 1. IMPORT YOUR INTERFACE HERE
import { AgentRegisterPayload } from "@/utils/user";

export const useAgentRegister = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        fullname: "",
        countryCode: "+977",
        mobileNumber: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]); 
    const [timer, setTimer] = useState(45);
    const [isVerified, setIsVerified] = useState(false);

    // Password Validation Logic
    const hasCapital = /(?=.*[A-Z])/.test(formData.password);
    const hasNumber = /(?=.*[0-9])/.test(formData.password);
    const hasSpecial = /(?=.*[!@#$%^&*])/.test(formData.password);
    const hasMinLength = formData.password.length >= 8;
    const isPasswordStrong = hasCapital && hasNumber && hasSpecial && hasMinLength;
    const isPasswordMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showOtpModal && timer > 0 && !isVerified) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showOtpModal, timer, isVerified]);

    // Handlers
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const checkIfEmailIsUser = async (email: string) => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking user database:", error);
            throw new Error("Unable to verify email availability.");
        }
    };

    const handleRegisterClick = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!isPasswordStrong) {
            toast.error("Please meet all password security requirements.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Checking details...");

        try {
             const isClient = await checkIfEmailIsUser(formData.email);
             
             if (isClient) {
                 toast.error("This email is registered as a Client/Buyer. Please use a different email.", { 
                     id: toastId,
                     duration: 5000 
                 });
                 return;
             }

             const res = await sendOtpAction(formData.email);
             
             if (!res.success) throw new Error(res.error || "Failed to send OTP");

             toast.success("Verification code sent!", { id: toastId });
             setShowOtpModal(true);
             setTimer(45);

        } catch (err: any) {
             toast.error(err.message || "Failed to initiate verification", { id: toastId });
        } finally {
             setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.some(digit => digit === "")) {
            toast.error("Please enter the full 4-digit code");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Verifying code...");

        try {
             const otpCode = otp.join("");
             const resOtp = await verifyOtpAction(formData.email, otpCode);

             if (!resOtp.success) {
                  if (resOtp.error?.toLowerCase().includes("expired")) {
                      throw new Error("OTP has expired. Please resend.");
                  }
                  throw new Error(resOtp.error || "Invalid OTP Code.");
             }

             const isClient = await checkIfEmailIsUser(formData.email);
             if (isClient) throw new Error("This email is registered as a Client.");

             toast.loading("Creating account...", { id: toastId });
             const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
             const user = userCredential.user;

             const nameParts = formData.fullname.trim().split(" ");
             const firstname = nameParts[0] || "";
             const lastname = nameParts.slice(1).join(" ") || "";

             // 2. USE THE AGENT INTERFACE HERE
             const newAgentPayload: AgentRegisterPayload = {
                 uid: user.uid,
                 email: formData.email,
                 name: {
                     firstname: firstname,
                     lastname: lastname
                 },
                 number: {
                     countrycode: formData.countryCode,
                     mobilenumber: formData.mobileNumber
                 },
                 role: "agent",
                 agency: "Null",
                 preferredLocations: [],
                 
                 // UPDATED: Now an object matching your new interface
                 location: {
                     longitute: "",
                     latitute: ""
                 },
                 
                 id_verify: "unverified",
                 properties: [],
                 ratings: [],
                 about: "",
                 
                 // UPDATED: Now a string (empty) instead of null
                 photoURL: "", 
                 
                 canaddproperty: false,
                 canaddagents: false,
                 onboardingCompleted: false,
                 membership: {
                     transaction_id: "none",
                     status: "pending",
                     start_date: new Date().toISOString(), 
                     end_date: new Date().toISOString(),
                 }
             };

             const apiRes = await registerAgentDocAction(newAgentPayload);

             if (!apiRes.success) {
                 throw new Error(apiRes.error || "Failed to save account details");
             }

             toast.success("Account created successfully!", { id: toastId });
             setIsVerified(true);
             setTimeout(() => {
                 setShowOtpModal(false);
                 router.push("/agentportal/login"); 
             }, 2000);

        } catch (err: any) {
             if (err.code === 'auth/email-already-in-use') {
                 toast.error("This email is already in use. Please login.", { id: toastId });
             } else {
                 toast.error(err.message || "Something went wrong", { id: toastId });
             }
        } finally {
             setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setTimer(45);
        const toastId = toast.loading("Sending new code...");
        try {
             const res = await sendOtpAction(formData.email);
             
             if (res.success) {
                 toast.success("New code sent", { id: toastId });
             } else {
                 throw new Error(res.error || "Failed to resend");
             }
        } catch (err: any) {
             toast.error(err.message || "Could not resend OTP.", { id: toastId });  
        }
    };

    return {
        formData,
        handleInputChange,
        loading,
        showOtpModal,
        setShowOtpModal,
        otp,
        handleOtpChange,
        timer,
        isVerified,
        handleRegisterClick,
        handleVerifyOtp,
        handleResendOtp,
        passwordValidation: {
            hasCapital,
            hasNumber,
            hasSpecial,
            hasMinLength,
            isPasswordStrong,
            isPasswordMatch,
            isConfirming: formData.confirmPassword.length > 0
        }
    };
}; 