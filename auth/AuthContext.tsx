"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface UserProfile {
  role?: string;
  onboardingCompleted?: boolean;
  isAgencyOwner?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Add all public unauthenticated routes here
    const PUBLIC_ROUTES = [
      "/",
      "/agentportal",
      "/agencyportal",
      "/agentportal/login",
      "/agentportal/register",
      "/agentportal/forgot-password",
      "/agencyportal/login",
      "/agencyportal/register",
      "/buy",
      "/sell",
      "/rent",
      "/property",
      "/test",
      "/share/agentprofile",
      "/mortgage-calculator"
    ];

    const fetchUserProfile = async (uid: string) => {
        // First check agents collection, then users collection
        try {
            let docSnap = await getDoc(doc(db, "agents", uid));
            if (docSnap.exists()) {
                return docSnap.data() as UserProfile;
            }
            docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
                return docSnap.data() as UserProfile;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
        return null;
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // If no user is logged in
      if (!currentUser) {
         setProfile(null);
         setLoading(false);
         // Redirect to home if on a protected route
         if (!PUBLIC_ROUTES.includes(pathname)) {
             router.push("/");
         }
         return;
      }

      // User is logged in, fetch profile for role verification
      const userProfile = await fetchUserProfile(currentUser.uid);
      setProfile(userProfile);
      setLoading(false);

      if (userProfile) {
          const role = userProfile.role || 'user'; // default to user
          const isAgency = userProfile.isAgencyOwner || role === 'agency';

          // 1. Enforce Onboarding
          if (!userProfile.onboardingCompleted && !pathname.includes('onboarding') && !PUBLIC_ROUTES.includes(pathname)) {
              if (role === 'agent') {
                  router.push(`/agentportal/onboarding?details=${currentUser.uid}`);
              } else if (isAgency) {
                  router.push(`/agencyportal/onboarding?details=${currentUser.uid}`);
              } else {
                  router.push(`/user/onboarding?details=${currentUser.uid}`);
              }
              return;
          }

          // 2. Strict Role-Based Guards
          const isAgencyRoute = pathname.startsWith('/agency') && !pathname.startsWith('/agentportal') && !pathname.includes('login') && !pathname.includes('register') && !pathname.includes('onboarding');
          const isAgentRoute = pathname.startsWith('/agentportal') && !pathname.includes('login') && !pathname.includes('register') && !pathname.includes('onboarding');
          
          if (isAgencyRoute && !isAgency && role !== 'agent') {
              // Block non-agencies and non-agents from agency portal
              router.push('/user/dashboard');
          } else if (isAgentRoute && role !== 'agent' && !isAgency) {
              // Block standard users from agent portal
              router.push('/user/dashboard');
          }
      } else {
          // Edge case: user is authenticated in Auth but has no Firestore document yet.
          // They should probably be routed to a registration or onboarding flow.
          // (Disabled redirect to /user/onboarding as it does not exist)
          /*
          if (!pathname.includes('onboarding') && !PUBLIC_ROUTES.includes(pathname)) {
              router.push('/user/onboarding'); 
          }
          */
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const handleLogout = async () => {
      await signOut(auth);
      router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
