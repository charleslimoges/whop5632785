import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  // NOTE: Final allowed headers may be echoed dynamically per-request
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

function buildCorsHeaders(req) {
  const origin = req?.headers?.get?.("origin") || "*";
  const requested = req?.headers?.get?.("access-control-request-headers");
  return {
    ...corsHeaders,
    "Access-Control-Allow-Origin": origin !== "null" ? origin : "*",
    ...(requested ? { "Access-Control-Allow-Headers": requested } : {}),
  };
}

export async function OPTIONS(req) {
  return new Response(null, { status: 204, headers: buildCorsHeaders(req) });
}

export async function POST(req) {
  try {
    const headers = buildCorsHeaders(req);
    const gasUrl = process.env.GAS_WEB_APP_URL;
    if (!gasUrl) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing GAS_WEB_APP_URL environment variable.",
        }),
        { status: 500, headers }
      );
    }

    // Safely parse incoming body regardless of content type
    let payload = {};
    try {
      const contentType = (req.headers?.get?.("content-type") || "").toLowerCase();
      if (contentType.includes("application/json")) {
        payload = await req.json();
      } else if (
        contentType.includes("application/x-www-form-urlencoded") ||
        contentType.includes("multipart/form-data")
      ) {
        const form = await req.formData();
        payload = Object.fromEntries(form.entries());
      } else {
        // Try to parse text as JSON if possible
        const text = await req.text();
        try {
          payload = text ? JSON.parse(text) : {};
        } catch {
          payload = {};
        }
      }
    } catch {
      payload = {};
    }

    console.log("/api/submit received payload:", payload);

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
    if ((Array.isArray(persona) && persona.length === 0) || (!Array.isArray(persona) && !persona))
      missing.push("persona");
    if (!struggle) missing.push("struggle");
    if (!goals || (Array.isArray(goals) && goals.length === 0)) missing.push("goals");
    if (consent !== "Yes" && consent !== "No") missing.push("consent");

    if (missing.length) {
      return new NextResponse(
        JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }),
        { status: 400, headers }
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

    try {
      const targetHost = new URL(gasUrl).host;
      console.log("/api/submit forwarding to GAS:", targetHost);
    } catch {}
    console.log("/api/submit normalized payload keys:", Object.keys(normalized));

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
        { status: 502, headers: headers }
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
      headers,
    });
  } catch (e) {
    return new NextResponse(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 400,
      headers: corsHeaders,
    });
  }
}
