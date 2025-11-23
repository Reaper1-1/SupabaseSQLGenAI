a// supabase/functions/agent-router/index.ts
// Better Man Project — Agent Router Edge Function
// - Receives: { user_id, agent_id, message, context? }
// - Calls external AI agent (Base44 / OpenAI / etc.)
// - Logs to: conversation_history & agent_memory

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------- Env + Supabase client ----------

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  throw new Error("Supabase environment not configured for edge function");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// OPTIONAL: Base44 or other agent service
const BASE44_AGENT_API_URL = Deno.env.get("BASE44_AGENT_API_URL"); // e.g. your Base44 endpoint
const BASE44_API_KEY = Deno.env.get("BASE44_API_KEY"); // stored as edge secret

// ---------- Types ----------

type AgentId =
  | "devotional_guide"
  | "journal_coach"
  | "breakup_coach"
  | "habits_coach"
  | "breakthrough_coach"
  | "bible_study_agent"
  | "prayer_coach"
  | "leadership_mentor"
  | "emotional_intelligence_coach"
  | "workflow_meta_agent";

interface AgentRequestBody {
  user_id: string;
  agent_id: AgentId;
  message: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface AgentResponse {
  reply: string;
  agent_id: AgentId;
  debug?: Record<string, unknown>;
}

// ---------- Helpers ----------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    },
  });
}

// CORS preflight handler
function corsResponse(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    },
  });
}

// Log conversation to conversation_history
async function logConversation(
  payload: AgentRequestBody,
  agentResponse: AgentResponse,
) {
  try {
    const { user_id, agent_id, message, metadata } = payload;

    const { error } = await supabase.from("conversation_history").insert({
      user_id,
      agent_id,
      user_message: message,
      agent_reply: agentResponse.reply,
      agent_debug: agentResponse.debug ?? null,
      metadata: metadata ?? null,
    });

    if (error) {
      console.error("Error inserting into conversation_history:", error);
    }
  } catch (err) {
    console.error("logConversation exception:", err);
  }
}

// Update agent_memory
async function updateAgentMemory(
  payload: AgentRequestBody,
  agentResponse: AgentResponse,
) {
  try {
    const { user_id, agent_id, context, metadata } = payload;

    // Example strategy: upsert a single row per user+agent
    // containing last_reply and merged memory_context
    const memoryPayload = {
      user_id,
      agent_id,
      last_message: payload.message,
      last_reply: agentResponse.reply,
      last_used_at: new Date().toISOString(),
      memory_context: context ?? null,
      metadata: metadata ?? null,
    };

    const { error } = await supabase
      .from("agent_memory")
      .upsert(memoryPayload, {
        onConflict: "user_id,agent_id",
      });

    if (error) {
      console.error("Error upserting into agent_memory:", error);
    }
  } catch (err) {
    console.error("updateAgentMemory exception:", err);
  }
}

// ---------- Agent call (Base44 / external AI) ----------

async function callExternalAgent(
  payload: AgentRequestBody,
): Promise<AgentResponse> {
  // You can wire this to:
  // - Base44 custom function/agent endpoint
  // - OpenAI Responses API
  // - Your own Next.js API route
  //
  // For now, we assume a Base44-style JSON HTTP endpoint.
  if (!BASE44_AGENT_API_URL || !BASE44_API_KEY) {
    // fallback stub so you can test the function without external wiring
    return {
      reply:
        "Stubbed agent response. External agent API not configured yet (BASE44_AGENT_API_URL / BASE44_API_KEY).",
      agent_id: payload.agent_id,
      debug: { stub: true },
    };
  }

  const res = await fetch(BASE44_AGENT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      api_key: BASE44_API_KEY,
    },
    body: JSON.stringify({
      agent_id: payload.agent_id,
      user_id: payload.user_id,
      message: payload.message,
      context: payload.context ?? {},
      metadata: payload.metadata ?? {},
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("External agent API error:", res.status, text);
    throw new Error(
      `External agent call failed: ${res.status} ${text || res.statusText}`,
    );
  }

  const data = await res.json();

  // Normalize whatever Base44 returns into AgentResponse shape.
  return {
    reply: data.reply ?? data.answer ?? JSON.stringify(data),
    agent_id: payload.agent_id,
    debug: data.debug ?? null,
  };
}

// ---------- HTTP handler ----------

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return corsResponse();
  }

  // Health check
  if (req.method === "GET") {
    return jsonResponse({ status: "ok", function: "agent-router" }, 200);
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: AgentRequestBody;
  try {
    const raw = await req.json();
    body = raw as AgentRequestBody;
  } catch (err) {
    console.error("Invalid JSON:", err);
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.user_id || !body.agent_id || !body.message) {
    return jsonResponse(
      { error: "Missing required fields: user_id, agent_id, message" },
      400,
    );
  }

  try {
    // 1) Route to external agent
    const agentResponse = await callExternalAgent(body);

    // 2) Fire-and-forget: log to Supabase (don't block response on success)
    // If you want strict behavior, await Promise.all instead.34.111.179.208
    logConversation(body, agentResponse);
    updateAgentMemory(body, agentResponse);

    // 3) Return to caller (mobile app, Base44, etc.)
    return jsonResponse(
      {
        ok: true,
        agent_id: agentResponse.agent_id,
        reply: agentResponse.reply,
      },
      200,
    );
  } catch (err) {
    console.error("Agent router error:", err);
    return jsonResponse(
      { ok: false, error: "Agent router failed", details: String(err) },
      500,
    );
  }
});
