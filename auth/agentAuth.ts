"use client";

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
  googleProvider,
} from "../lib/firebase";

import { registerAgentDocAction } from "../lib/agents/agentAuthServer";

const checkUser =
  async (email: string) => {

    const userRef =
      doc(db, "users", email);

    const userSnap =
      await getDoc(userRef);

    return userSnap.exists();
  };

export const googleAgentLogin =
  async () => {

    const result =
      await signInWithPopup(
        auth,
        googleProvider
      );

    const user = result.user;

    const isUser =
      await checkUser(
        user.email || ""
      );

    if (isUser) {

      await signOut(auth);

      throw new Error(
        "Users are not allowed here"
      );
    }

    // Call the server action to save/sync agent document
    const syncRes = await registerAgentDocAction({
      uid: user.uid,
      email: user.email || "",
      fullname: user.displayName || "",
      countryCode: "",
      mobileNumber: "",
    });

    if (!syncRes.success) {
      throw new Error(syncRes.error || "Failed to create agent record on server.");
    }

    return result;
  };

export const agentLogin =
  async (
    email: string,
    password: string
  ) => {

    const isUser =
      await checkUser(email);

    if (isUser) {

      throw new Error(
        "Users are not allowed here"
      );
    }

    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    // Call the server action to sync agent document
    const syncRes = await registerAgentDocAction({
      uid: result.user.uid,
      email: result.user.email || "",
      fullname: "",
      countryCode: "",
      mobileNumber: "",
    });

    if (!syncRes.success) {
      throw new Error(syncRes.error || "Failed to sync agent record on server.");
    }

    return result;
  };

export const agentSignup =
  async (
    email: string,
    password: string
  ) => {

    const isUser =
      await checkUser(email);

    if (isUser) {

      throw new Error(
        "Users are not allowed here"
      );
    }

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    // Call the server action to register agent document
    const syncRes = await registerAgentDocAction({
      uid: result.user.uid,
      email: result.user.email || "",
      fullname: "",
      countryCode: "",
      mobileNumber: "",
    });

    if (!syncRes.success) {
      throw new Error(syncRes.error || "Failed to register agent record on server.");
    }

    return result;
  };

export const agentLogout =
  async () => {

    await signOut(auth);

  };