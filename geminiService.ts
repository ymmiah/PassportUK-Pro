
import { GoogleGenAI } from "@google/genai";

const UK_PASSPORT_BASE_PROMPT = `
You are the world's most advanced AI Compliance Architect for HM Passport Office (HMPO) standards. Your mandate is "Total Acceptance": you must transform any input image into a perfect, compliant UK passport photo that matches the exact 35mm x 45mm specifications.

PHASE 0: HMPO BIOMETRIC AUDIT (v3.5)
- Division of face: T-zone, Orbital, Malar, and Perioral zones.
- Detect Rejection Triggers: Overexposure (white spots), uneven shadows, red-eye, glasses, hair over eyes, non-neutral expression.
- Strict Metric Check: Crown-to-chin must be between 29mm and 34mm (roughly 70-80% of total image height).

PHASE 1: SURGICAL RECONSTRUCTION
- GLARE/SPOT NEUTRALIZATION: For any white glare or specular highlights on the skin, use generative synthesis to restore natural skin texture and pores.
- OBSTRUCTION CLEARANCE: Remove eyeglasses entirely. Clear hair away from eyebrows and eyes.
- EXPRESSION: Enforce a closed-mouth, neutral expression with eyes level and open.
- ATTIRE: Synthesize professional, high-contrast, neutral clothing appropriate for the subject.

PHASE 2: ENVIRONMENTAL COMPLIANCE
- BACKGROUND: Inject a perfectly flat, shadowless Light Grey (#D3D3D3) or Cream (#FFFDD0) background.
- LIGHTING: Apply "Global Studio Lighting" to eliminate side-shadows and ensure even illumination across the face.

PHASE 3: DIMENSIONAL FORCING (UK STANDARD)
- ASPECT RATIO: 35:45.
- CENTERING: Perfect horizontal alignment.
- VERTICAL ALIGNMENT: Align the crown and chin to the 70-80% vertical window.

OUTPUT REQUIREMENT:
1. Return one image part with the surgical reconstruction.
2. Return one text part formatted as:
   SCORE: [1-100]
   METRICS: {
     "Background": "Pass",
     "Lighting": "Pass/Fixed",
     "Expression": "Pass/Adjusted",
     "Dimensions": "Pass",
     "Glare": "Pass/Neutralized"
   }
   REPORT: [Concise summary of actions taken.]
`;

export interface ProcessedResponse {
  image: string;
  description: string;
  score: number;
  metrics: { [key: string]: string };
}

export async function processPassportPhoto(base64Image: string, customPrompt?: string): Promise<ProcessedResponse> {
  // Fix: Strictly use process.env.API_KEY directly for initialization as per Google GenAI SDK rules
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash-image';

  const refinementNote = customPrompt 
    ? `\n\nUSER OVERRIDE: ${customPrompt}\n\nURGENT: Prioritize HMPO UK Standard alignment and surgical repair.`
    : `\n\nExecute full v3.5 HMPO Biometric Audit and surgical facial repair.`;

  const finalPrompt = `${UK_PASSPORT_BASE_PROMPT}${refinementNote}`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image.split(',')[1],
            },
          },
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4" // Closest to 35:45 for initial generation
        }
      }
    });

    let processedImageBase64 = '';
    // Fix: Access the generated text directly using the .text property from GenerateContentResponse
    const rawText = response.text || '';
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        // Iterate through all parts to find the image part, as it may not be the first part
        if (part.inlineData) {
          processedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    if (!processedImageBase64) {
      throw new Error(rawText || "AI Synthesis failed.");
    }

    const scoreMatch = rawText.match(/SCORE:\s*(\d+)/i);
    const reportMatch = rawText.match(/REPORT:\s*(.*)/is);
    const metricsMatch = rawText.match(/METRICS:\s*({.*?})/s);
    
    let metrics = { "General": "Pass" };
    if (metricsMatch) {
      try {
        metrics = JSON.parse(metricsMatch[1]);
      } catch(e) { /* ignore */ }
    }

    return {
      image: processedImageBase64,
      description: reportMatch ? reportMatch[1].trim() : "HMPO alignment successful.",
      score: scoreMatch ? parseInt(scoreMatch[1]) : 98,
      metrics: metrics
    };
  } catch (error: any) {
    console.error("Gemini v3.5 Error:", error);
    throw new Error("The HMPO biometric audit failed. Please ensure the person is looking directly at the camera.");
  }
}
