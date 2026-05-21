"use client";

import { useState } from "react";

import {
  agentLogin,
  agentSignup,
  googleAgentLogin,
} from "@/lib/agentAuth";

export default function AgentAuthForm({
  mode,
}: {
  mode: "login" | "signup";
}) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleSubmit =
    async () => {

      try {

        if (mode === "login") {

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

        window.location.href =
          "/agents/dashboard";

      } catch (err: any) {

        alert(err.message);

      }

    };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">

      <div className="w-[420px] border border-zinc-800 rounded-3xl p-8">

        <h1 className="text-4xl font-bold mb-2">

          {mode === "login"
            ? "Agent Login"
            : "Agent Signup"}

        </h1>

        <p className="text-zinc-400 mb-6">

          Access the agent dashboard

        </p>

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

            {mode === "login"
              ? "Login"
              : "Create Agent Account"}

          </button>

          <button
            onClick={googleAgentLogin}
            className="btn"
          >
            Continue with Google
          </button>

        </div>

      </div>

    </div>
  );
}