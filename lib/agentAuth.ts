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

const checkUser =
  async (email: string) => {

    const userRef =
      doc(db, "users", email);

    const userSnap =
      await getDoc(userRef);

    return userSnap.exists();
};

const createAgentDoc =
  async (
    uid: string,
    email: string
  ) => {

    const agentRef =
      doc(db, "agents", email);

    const agentSnap =
      await getDoc(agentRef);

    if (!agentSnap.exists()) {

      await setDoc(agentRef, {
        uid,
        email,
        role: "agent",
        createdAt: Date.now(),
      });

    }
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

    await createAgentDoc(
      user.uid,
      user.email || ""
    );

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

    await createAgentDoc(
      result.user.uid,
      result.user.email || ""
    );

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

    await createAgentDoc(
      result.user.uid,
      result.user.email || ""
    );

    return result;
};

export const agentLogout =
  async () => {

    await signOut(auth);

};