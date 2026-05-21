import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
  googleProvider,
} from "./firebase";

const checkAgent =
  async (email: string) => {

    const agentRef =
      doc(db, "agents", email);

    const agentSnap =
      await getDoc(agentRef);

    return agentSnap.exists();
};

const createUserDoc =
  async (
    uid: string,
    email: string
  ) => {

    const userRef =
      doc(db, "users", email);

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {

      await setDoc(userRef, {
        uid,
        email,
        role: "user",
        createdAt: Date.now(),
      });

    }
};

export const googleLogin =
  async () => {

    const result =
      await signInWithPopup(
        auth,
        googleProvider
      );

    const user = result.user;

    const isAgent =
      await checkAgent(
        user.email || ""
      );

    if (isAgent) {

      await signOut(auth);

      throw new Error(
        "Agents not allowed here"
      );
    }

    await createUserDoc(
      user.uid,
      user.email || ""
    );

    return result;
};

export const login =
  async (
    email: string,
    password: string
  ) => {

    const isAgent =
      await checkAgent(email);

    if (isAgent) {

      throw new Error(
        "Agents not allowed here"
      );
    }

    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    await createUserDoc(
      result.user.uid,
      result.user.email || ""
    );

    return result;
};

export const signup =
  async (
    email: string,
    password: string
  ) => {

    const isAgent =
      await checkAgent(email);

    if (isAgent) {

      throw new Error(
        "Agents not allowed here"
      );
    }

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await createUserDoc(
      result.user.uid,
      result.user.email || ""
    );

    return result;
};

export const logout =
  async () => {

    await signOut(auth);

};