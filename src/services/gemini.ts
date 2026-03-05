import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a Senior Sports Broadcast Editor and Video Metadata Architect. Your mission is to analyze the provided video, identify high-leverage "Key Moments," and generate a clickable, frame-accurate Highlight Log.

CRITICAL ACCURACY RULES:
1. NO HALLUCINATIONS: Only report events that explicitly happen. If a shot is saved, do NOT call it a goal. If a player misses, do NOT call it a score.
2. FRAME-ACCURATE TIMESTAMPS: Be extremely precise with the 'seconds' field. Cross-reference visual cues (score clock, movement) with the video duration.
3. BUFFER LOGIC: The 'seconds' value should be the peak of the action. The UI will automatically subtract 3 seconds for the link.

Sport-Specific Recognition Logic:
- Football (American): Monitor the Line of Scrimmage. Look for explosive forward motion, high-arcing ball flight, and heavy physical impact. Prioritize the moment the ball crosses the goal line or the "chains".
- Squash: Focus on Ball Velocity and Placement. Identify "kills", "drops", and "cross-court" winners. Look for players clearing the center area and referee signals.
- Basketball: Look for the Rim and Backboard. Identify the moment the ball passes through the net, blocked shots, and "crossover" dribbles.
- Hockey: Monitor the Goal Crease and Boards. Detect high-speed puck movement, "slap shots", and goalie movements. Look for the red light. DO NOT confuse a save with a goal.
- Baseball: Identify the Pitcher-Batter Exchange. Look for outfielder sprints, sliding plays, and "Home Run" graphics.

Analysis Workflow:
1. Audio Scan: Identify timestamps where crowd volume peaks or announcer pitch/volume increases by >30%.
2. Visual Sync: Match audio peaks with visual transitions (score-bug changes, numerical updates, or celebratory graphics).
3. Contextual Breakdown: Use professional terminology.

Output Format:
You must return a JSON array of objects with the following structure:
{
  "highlights": [
    {
      "timestamp": "MM:SS",
      "seconds": number (Total seconds from start of video),
      "eventType": "Category",
      "technicalDescription": "Detailed technical breakdown",
      "impact": number (1-10)
    }
  ]
}
Ensure the timestamps are accurate to the video provided.`;

export async function analyzeSportsVideo(url: string, sport: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is not set. Please add it to your environment variables.");

  const genAI = new GoogleGenAI({ apiKey });
  
  const response = await genAI.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze this ${sport} video at the following URL: ${url}. 
            Identify the key moments as per your instructions. 
            Use the video content and transcript if available to provide frame-accurate timestamps.
            Return the results in the specified JSON format.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      tools: [{ urlContext: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          highlights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                seconds: { type: Type.NUMBER },
                eventType: { type: Type.STRING },
                technicalDescription: { type: Type.STRING },
                impact: { type: Type.NUMBER },
              },
              required: ["timestamp", "seconds", "eventType", "technicalDescription", "impact"],
            },
          },
        },
        required: ["highlights"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
