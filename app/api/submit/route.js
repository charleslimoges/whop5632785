import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const gasUrl = process.env.GAS_WEB_APP_URL;
    if (!gasUrl) {
      return new NextResponse(
        JSON.stringify({ error: "Missing GAS_WEB_APP_URL environment variable" }),
        {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const payload = await req.json();

    const {
      instagram,
      tiktok,
      email,
      location,
      persona,
      businessStage,
      struggle,
      goals,
      consent,
    } = payload || {};

    const missing = [];
    if (!instagram) missing.push("instagram");
    if (!email) missing.push("email");
    if (!location) missing.push("location");
    if (!tiktok) missing.push("tiktok");
    if (
      (Array.isArray(persona) && persona.length === 0) ||
      (!Array.isArray(persona) && !persona)
    )
      missing.push("persona");
    if (!struggle) missing.push("struggle");
    if (!goals || (Array.isArray(goals) && goals.length === 0)) missing.push("goals");
    if (consent !== "Yes" && consent !== "No") missing.push("consent");

    if (missing.length) {
      return new NextResponse(
        JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }),
        {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const normalized = {
      Instagram: String(instagram || "").trim(),
      TikTok: String(tiktok || "").trim(),
      Email: String(email || "").trim(),
      Location: String(location || "").trim(),
      Persona: Array.isArray(persona)
        ? persona.filter(Boolean).join(", ")
        : String(persona || "").trim(),
      "Business Stage": String(businessStage || "").trim(),
      Struggle: String(struggle || "").trim(),
      Goals: Array.isArray(goals) ? goals.join(", ") : String(goals || "").trim(),
      Consent: String(consent || "").trim(),
      source: "whop-form",
    };

    const res = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return new NextResponse(
        JSON.stringify({
          error: `GAS request failed (${res.status}): ${text?.slice(0, 300)}`,
        }),
        {
          status: 502,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    let data;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      data = { ok: true, message: text };
    }

    return new NextResponse(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // 👈 allow calls from Whop (or any site)
      },
    });
  } catch (e) {
    return new NextResponse(
      JSON.stringify({ error: e?.message || "Unknown error" }),
      {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
