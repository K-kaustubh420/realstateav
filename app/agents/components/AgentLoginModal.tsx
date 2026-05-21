"use client";

import { useState } from "react";

import {
  agentLogin,
  agentSignup,
  googleAgentLogin,
} from "@/lib/agentAuth";

export default function AgentLoginModal({
  isOpen,
  onClose,
}: any) {

  const [isLogin, setIsLogin] =
    useState(true);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleSubmit =
    async () => {

      try {

        if (isLogin) {

          await agentLogin(
            email,
            password
          );

        } else {

          await agentSignup(
            email,
            password
          );

        }

        onClose();

      } catch (err: any) {

        alert(err.message);

      }

    };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">

      <div className="modal-box bg-black text-white border border-zinc-800">

        <h1 className="text-3xl font-bold mb-6">

          {isLogin
            ? "Agent Login"
            : "Agent Sign Up"}

        </h1>

        <div className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Email"
            className="input input-bordered bg-transparent"
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="input input-bordered bg-transparent"
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            onClick={handleSubmit}
            className="btn btn-warning"
          >

            {isLogin
              ? "Login"
              : "Create Account"}

          </button>

          <button
            onClick={googleAgentLogin}
            className="btn"
          >
            Continue with Google
          </button>

          <button
            className="text-yellow-400 mt-2"
            onClick={() =>
              setIsLogin(!isLogin)
            }
          >

            {isLogin
              ? "Need account? Sign Up"
              : "Already have account? Login"}

          </button>

        </div>

        <div className="modal-action">

          <button
            className="btn"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>

    </dialog>
  );
}