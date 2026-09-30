"use client";

import { useActionState } from "react";
import { login } from "@/actions/admin";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-4xl">☕</p>
          <h1 className="mt-2 text-xl font-bold">Admin MK Coffee</h1>
        </div>
        <input
          name="password"
          type="password"
          required
          autoFocus
          placeholder="Password admin"
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          disabled={pending}
          className="w-full rounded-lg bg-amber-900 py-2.5 font-semibold text-white hover:bg-amber-950 disabled:opacity-60"
        >
          {pending ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}
