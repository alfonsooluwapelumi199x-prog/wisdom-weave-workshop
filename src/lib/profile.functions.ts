import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const OnboardingSchema = z.object({
  full_name: z.string().min(1).max(120),
  age: z.number().int().min(13).max(100),
  nationality: z.string().min(1).max(80),
  country_of_residence: z.string().min(1).max(80),
  qualification: z.string().min(1).max(120),
  occupation: z.string().min(1).max(120),
  years_experience: z.number().int().min(0).max(60),
  marital_status: z.string().min(1).max(40),
  countries_of_interest: z.array(z.string()).min(1).max(10),
});

export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: z.infer<typeof OnboardingSchema>) => OnboardingSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, onboarding_complete: true })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const generateInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!profile || !profile.onboarding_complete) throw new Error("Complete onboarding first");

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");

    const prompt = `Build a personalized international-opportunity briefing for this person.

Profile:
- Name: ${profile.full_name}
- Age: ${profile.age}
- Nationality: ${profile.nationality}
- Country of residence: ${profile.country_of_residence}
- Highest qualification: ${profile.qualification}
- Occupation: ${profile.occupation}
- Years of experience: ${profile.years_experience}
- Marital status: ${profile.marital_status}
- Countries of interest: ${(profile.countries_of_interest ?? []).join(", ")}

Return STRICT JSON matching this TypeScript type (no markdown, no prose outside JSON):
{
  "summary": string, // 3-5 sentence profile summary
  "opportunities": Array<{
    "title": string,
    "type": "Scholarship" | "Sponsored Job" | "Skilled Worker Visa" | "Study Pathway",
    "country": string,
    "why_fits": string,
    "next_steps": string[],
    "official_resources": Array<{ "label": string, "url": string }>
  }> // 5-8 items
}

Rules: NEVER guarantee eligibility. Only include real, well-known programs (Chevening, DAAD, Fulbright, MEXT, Erasmus Mundus, UK Skilled Worker, Canada Express Entry, Australia Skilled Migration, US H-1B sponsors, etc.). Provide official government/program URLs only.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are Pelumi, an international opportunity advisor. Always include the educational disclaimer and never guarantee eligibility." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error: ${res.status} ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { summary?: string; opportunities?: unknown[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { summary: content, opportunities: [] };
    }

    const { error: uErr } = await supabase
      .from("profiles")
      .update({
        ai_summary: parsed.summary ?? null,
        ai_opportunities: parsed.opportunities ?? [],
        ai_generated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (uErr) throw new Error(uErr.message);

    return parsed;
  });