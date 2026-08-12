import { createServerFn } from "@tanstack/react-start";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

const RecommendInput = z.object({
  level: z.enum(["10", "12"]),
  scorePercent: z.number(),
  answers: z.array(z.object({ question: z.string(), answer: z.string() })),
  topTrack: z.string(),
});

const RecommendSchema = z.object({
  primary: z.string(),
  primaryKey: z.string(),
  confidence: z.number(),
  summary: z.string(),
  strengths: z.array(z.string()),
  watchOuts: z.array(z.string()),
  alternatives: z.array(z.object({ name: z.string(), why: z.string() })),
});

export type Recommendation = z.infer<typeof RecommendSchema>;

const RoadmapInput = z.object({
  level: z.enum(["10", "12"]),
  path: z.string(),
  department: z.string(),
});

const RoadmapSchema = z.object({
  overview: z.string(),
  courses: z.array(z.object({ name: z.string(), detail: z.string() })),
  certifications: z.array(z.object({ name: z.string(), detail: z.string() })),
  internships: z.array(z.object({ name: z.string(), detail: z.string() })),
  placementTraining: z.array(z.object({ name: z.string(), detail: z.string() })),
  careers: z.array(z.object({ name: z.string(), detail: z.string() })),
  yearPlan: z.array(z.object({ name: z.string(), detail: z.string() })),
});

export type Roadmap = z.infer<typeof RoadmapSchema>;

async function model() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet. Missing LOVABLE_API_KEY.");
  const { createLovableResponsesProvider } = await import("./ai-gateway.server");
  return createLovableResponsesProvider(key)("openai/gpt-5.6-sol");
}

export const getRecommendation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RecommendInput.parse(input))
  .handler(async ({ data }): Promise<Recommendation> => {
    const streamKeys =
      data.level === "10"
        ? "science-bio (Science with Biology), science-cs (Science with Computer Science), commerce (Commerce), arts (Arts & Humanities)"
        : "engineering (Engineering), medical (Medical & Allied Health), other (Other professional fields)";

    const prompt = [
      `You are an Indian school career counsellor advising a class ${data.level} student.`,
      `Assessment aptitude score: ${data.scorePercent}%.`,
      `Heuristic leading track from their answers: ${data.topTrack}.`,
      "Their answers:",
      ...data.answers.map((a, i) => `${i + 1}. ${a.question} -> ${a.answer}`),
      "",
      `Choose exactly one primary recommendation. primaryKey MUST be one of these keys: ${streamKeys}. primary is the human readable name.`,
      "confidence is 0-100. summary is 2-3 warm, plain sentences addressed to the student.",
      "Give 3 strengths, 2 watch-outs and 2 alternative options with a one-line reason each. Keep every bullet under 22 words.",
    ].join("\n");

    try {
      const result = streamText({
        model: await model(),
        prompt,
        output: Output.object({ schema: RecommendSchema }),
      });
      return await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The AI response could not be read. Please try again.");
      }
      throw error;
    }
  });

export const getRoadmap = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RoadmapInput.parse(input))
  .handler(async ({ data }): Promise<Roadmap> => {
    const prompt = [
      `You are an Indian career counsellor. A class ${data.level} student has chosen the path "${data.path}" with the specialisation "${data.department}".`,
      "Build a practical, India-focused plan for them.",
      "Return: overview (2-3 sentences), and for each list 4 items with a short 'name' and a 'detail' under 25 words.",
      "courses = core subjects/degrees to take. certifications = online or professional certificates worth doing.",
      "internships = realistic internship types and where to find them. placementTraining = skills, mock rounds, aptitude prep for placements.",
      "careers = job roles with rough Indian salary range. yearPlan = what to do in year 1, 2, 3 and 4 (name = the year).",
      "Be specific and actionable, no filler.",
    ].join("\n");

    try {
      const result = streamText({
        model: await model(),
        prompt,
        output: Output.object({ schema: RoadmapSchema }),
      });
      return await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The AI response could not be read. Please try again.");
      }
      throw error;
    }
  });
