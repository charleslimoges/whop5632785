"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PERSONA_OPTIONS = [
  "Bodybuilder posting content",
  "Online fitness coach",
  "Influencer wanting to monetize",
  "Other...",
];

const STAGE_OPTIONS = [
  "Just starting",
  "1-5 clients / $1-5k per month",
  "5-10 clients / $5-10k per month",
  "10+ clients / $10k+ per month",
  "Other...",
];

const GOAL_OPTIONS = [
  "Content strategies",
  "Sales training",
  "Branding / storytelling",
  "Networking with other coaches",
  "Other...",
];

export default function FormPage() {
  const router = useRouter();
  const [data, setData] = useState({
    instagram: "",
    tiktok: "",
    email: "",
    phone: "",
    location: "",
    persona: [],
    personaOther: "",
    businessStage: "",
    businessStageOther: "",
    struggle: "",
    goals: [], // string[]
    goalsOther: "",
    consent: "", // 'Yes' | 'No'
  });
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState();

  function toggleGoal(goal) {
    setData((prev) => {
      const set = new Set(prev.goals);
      if (set.has(goal)) set.delete(goal);
      else set.add(goal);
      return { ...prev, goals: Array.from(set) };
    });
  }

  function togglePersona(opt) {
    setData((prev) => {
      const set = new Set(prev.persona);
      if (set.has(opt)) set.delete(opt);
      else set.add(opt);
      return { ...prev, persona: Array.from(set) };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErr(undefined);
    try {
      // Prevent duplicate submissions by email in this browser
      const emailKey = (data.email || "").trim().toLowerCase();
      if (emailKey) {
        const lsKey = `whop-form:submitted:${emailKey}`;
        if (typeof window !== "undefined" && localStorage.getItem(lsKey)) {
          setStatus("error");
          throw new Error("Only one submission per email. You've already submitted.");
        }
      }

      // Normalize "Other..." text values before sending
      const personaList = Array.isArray(data.persona)
        ? data.persona
        : data.persona
        ? [data.persona]
        : [];
      const payload = {
        ...data,
        persona: personaList
          .map((p) => (p === "Other..." && data.personaOther ? data.personaOther : p))
          .filter(Boolean),
        businessStage:
          data.businessStage === "Other..." && data.businessStageOther
            ? data.businessStageOther
            : data.businessStage,
        goals: (Array.isArray(data.goals) ? data.goals : [])
          .map((g) => (g === "Other..." && data.goalsOther ? data.goalsOther : g))
          .filter(Boolean),
      };

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
      const res = await fetch(`${apiBase}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok !== true) {
        throw new Error(json?.error || "Submit failed. Please try again.");
      }
      // Mark as submitted in this browser to prevent duplicates
      if (emailKey && typeof window !== "undefined") {
        try {
          localStorage.setItem(`whop-form:submitted:${emailKey}`, String(Date.now()));
        } catch {}
      }
      setStatus("done");
      // Navigate to success page for confirmation
      router.push("/form/success");
    } catch (e) {
      setErr(e?.message || "Error");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-lg">
          <div className="h-2 bg-red-600" />
          <div className="p-5 sm:p-6">
            <h1 className="text-3xl font-extrabold tracking-tight">The Coach's Corner Form</h1>
            <p className="mt-1 text-white/70 text-xs">(One submission per person/email)</p>
            <p className="mt-2 text-white/80 text-sm">
              Please answer all questions below to continue.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Instagram */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <label className="block text-lg font-semibold mb-2">
              Instagram username <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-md bg-black text-white placeholder-white/40 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="@username"
              value={data.instagram}
              onChange={(e) => setData({ ...data, instagram: e.target.value })}
              required
            />
          </div>

          {/* TikTok */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <label className="block text-lg font-semibold mb-2">
              TikTok username <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-md bg-black text-white placeholder-white/40 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="@username"
              value={data.tiktok}
              onChange={(e) => setData({ ...data, tiktok: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <label className="block text-lg font-semibold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full rounded-md bg-black text-white placeholder-white/40 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="you@example.com"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
          </div>

          {/* Phone */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <label className="block text-lg font-semibold mb-2">
              Phone number? <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className="w-full rounded-md bg-black text-white placeholder-white/40 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="+1 555 123 4567"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              required
            />
          </div>

          {/* Location */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <label className="block text-lg font-semibold mb-2">
              Where are you based? <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-md bg-black text-white placeholder-white/40 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="City, Country"
              value={data.location}
              onChange={(e) => setData({ ...data, location: e.target.value })}
              required
            />
          </div>

          {/* Persona as checkboxes */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <label className="block text-lg font-semibold mb-3">
              What best describes you? <span className="text-sm font-normal text-white/80">(Select one or multiple)</span> <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PERSONA_OPTIONS.map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-red-600"
                    checked={data.persona.includes(opt)}
                    onChange={() => togglePersona(opt)}
                    required={data.persona.length === 0}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {data.persona.includes("Other...") && (
              <input
                className="mt-3 w-full rounded-md bg-black text-white placeholder-white/40 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Tell us more"
                value={data.personaOther}
                onChange={(e) => setData({ ...data, personaOther: e.target.value })}
                required
              />
            )}
          </div>

          {/* Business stage */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <label className="block text-lg font-semibold mb-2">
              Where's your business at right now? <span className="text-sm font-normal text-white/80">(Select one)</span>
            </label>
            <select
              className="w-full rounded-md bg-black text-white border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              value={data.businessStage}
              onChange={(e) => setData({ ...data, businessStage: e.target.value })}
            >
              <option value="" disabled className="bg-black">Select one</option>
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-black">
                  {opt}
                </option>
              ))}
            </select>
            {data.businessStage === "Other..." && (
              <input
                className="mt-3 w-full rounded-md bg-black text-white placeholder-white/40 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Describe your current stage"
                value={data.businessStageOther}
                onChange={(e) =>
                  setData({ ...data, businessStageOther: e.target.value })
                }
              />
            )}
          </div>

          {/* Struggle */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <label className="block text-lg font-semibold mb-2">
              What's your biggest struggle right now? <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-md bg-black text-white placeholder-white/40 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              rows={2}
              maxLength={240}
              placeholder="Keep it brief (1-2 sentences)"
              value={data.struggle}
              onChange={(e) => setData({ ...data, struggle: e.target.value })}
              required
            />
          </div>

          {/* Goals */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <div className="block text-lg font-semibold mb-2">
              What do you want to get out of the Coach's Corner? <span className="text-red-500">*</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-red-600"
                    checked={data.goals.includes(opt)}
                    onChange={() => toggleGoal(opt)}
                    required={data.goals.length === 0}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {data.goals.includes("Other...") && (
              <input
                className="mt-3 w-full rounded-md bg-black text-white placeholder-white/40 border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Tell us more"
                value={data.goalsOther}
                onChange={(e) => setData({ ...data, goalsOther: e.target.value })}
                required
              />
            )}
          </div>

          {/* Consent */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <div className="block text-lg font-semibold mb-2">
              Open to receiving occasional emails/DMs with free value & training updates? <span className="text-red-500">*</span>
            </div>
            <div className="flex items-center gap-6">
              {["Yes", "No"].map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="consent"
                    value={opt}
                    className="accent-red-600"
                    checked={data.consent === opt}
                    onChange={(e) => setData({ ...data, consent: e.target.value })}
                    required
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              disabled={status === "submitting"}
              className="bg-red-600 text-white px-5 py-2 rounded-md disabled:opacity-60 border border-red-600 hover:bg-red-500"
            >
              {status === "submitting" ? "Submitting..." : "Submit"}
            </button>
          </div>

          {err && <div className="text-red-400">{String(err)}</div>}
        </form>
      </div>
    </div>
  );
}
