"use server";

import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function completeUserOnboardingAction(uid: string, payload: any) {
  try {
    const userRef = doc(db, "users", uid);
    
    // We update the doc with onboarding details
    await updateDoc(userRef, {
      ...payload,
      onboardingCompleted: true,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error completing user onboarding:", error);
    
    // If document doesn't exist, we might need to set it
    if (error.code === 'not-found') {
        try {
            const userRef = doc(db, "users", uid);
            await setDoc(userRef, {
                ...payload,
                uid,
                role: "user",
                createdAt: new Date(),
                onboardingCompleted: true,
                collection: [],
                PropertiesVisited: []
            });
            return { success: true };
        } catch(e: any) {
            return { success: false, error: e.message };
        }
    }

    return { success: false, error: error.message };
  }
}
