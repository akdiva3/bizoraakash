import OpenAI from "openai";

export default async (req) => {
  if (req.httpMethod !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { idea, prompt, message } = await req.json();

    const userIdea = idea || prompt || message;

    if (!userIdea) {
      return new Response(
        JSON.stringify({ error: "Business idea is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: `
You are BIZORA AI, an expert business launch strategist.

Create a practical business blueprint for this idea:

${userIdea}

Return a clear blueprint containing:
1. Business Name
2. One-line Concept
3. Target Customer
4. Problem
5. Solution
6. Revenue Model
7. Startup Cost
8. Marketing Strategy
9. First 7 Days Action Plan
10. Growth Strategy

Keep it practical, concise and realistic.
`
    });

    return new Response(
      JSON.stringify({
        success: true,
        blueprint: response.output_text
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error?.message || "AI generation failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
