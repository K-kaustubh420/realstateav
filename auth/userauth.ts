// @/auth/userauth.ts
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

// Import your user interface
import { User as DBUser } from "@/utils/user"; 

const checkAgent = async (email: string) => {
  // Note: agents are currently being checked by email here.
  const agentRef = doc(db, "agents", email);
  const agentSnap = await getDoc(agentRef);
  return agentSnap.exists();
};

// Added photoURL to capture Google profile pictures
const createUserDoc = async (
  uid: string, 
  email: string, 
  name?: string | null, 
  photoURL?: string | null
) => {
  const userRef = doc(db, "users", uid); 
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Construct the user object matching your User interface exactly
    const newUser: DBUser = {
      uid: uid, // Note: interface uses 'id' instead of 'uid'
      name: name || "User", // interface uses 'name' instead of 'fullName'
      email: email,
      number: {
        countrycode: "",
        mobilenumber: "",
      },
      intent: "researcher", // Safe default from your literal types
      exploreintent: [],
      role: "user",
      Address : {
        AddressLine1 : "",
        AddressLine2 : "",
        City : "",
        State : "",
        PostalCode : "",
        Country : "",
      },
      location : {
        longitute: "", 
        latitute : "",
      },
      about: "",
      createdAt: Timestamp.now(), // Uses Firebase Timestamp to match interface
      collection: [],
      PropertiesVisited: [],
      photoURL: photoURL ||"",
      onboardingCompleted: false, // Flag to force them to fill out missing details later
    };

    await setDoc(userRef, newUser);
  }
};

export const googleLogin = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const isAgent = await checkAgent(user.email || "");
  if (isAgent) {
    await signOut(auth);
    throw new Error("Agents not allowed here");
  }

  // Pass Google displayName and photoURL if available
  await createUserDoc(
    user.uid, 
    user.email || "", 
    user.displayName, 
    user.photoURL
  );

  return result;
};

export const login = async (email: string, password: string) => {
  const isAgent = await checkAgent(email);
  if (isAgent) {
    throw new Error("Agents not allowed here");
  }

  const result = await signInWithEmailAndPassword(auth, email, password);

  // Fallback check to ensure the doc exists
  await createUserDoc(
    result.user.uid, 
    result.user.email || "", 
    result.user.displayName, 
    result.user.photoURL
  );

  return result;
};

export const signup = async (email: string, password: string, fullName: string) => {
  const isAgent = await checkAgent(email);
  if (isAgent) {
    throw new Error("Agents not allowed here");
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);

  // Attach the full name to the Firebase Auth object
  if (fullName) {
    await updateProfile(result.user, { displayName: fullName });
  }

  // Pass the fullName to be saved in Firestore. No photoURL on manual signup yet.
  await createUserDoc(result.user.uid, result.user.email || "", fullName, null);

  return result;
};

export const logout = async () => {
  await signOut(auth);
};