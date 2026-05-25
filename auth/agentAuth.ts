"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const agentLogout = async () => {
  await signOut(auth);
};