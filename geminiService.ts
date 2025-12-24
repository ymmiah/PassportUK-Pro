import { GoogleGenAI } from "@google/genai";

const UK_PASSPORT_BASE_PROMPT = `
You are the world's most advanced AI Compliance Architect for HM Passport Office standards. Your mandate is "Universal Acceptance": you must transform any input image into a perfect, compliant passport photo, regardless of the quality or content of the original.

PHASE 0: PRE-PROCESSING & FORENSIC AUDIT
- Perform deep-level forensic analysis of the subject's face, posture, and environment.
- Detect all potential rejection triggers: glasses, non-neutral expressions, head coverings, hair over eyes, and external intrusions (hands, fingers, flags, props).
- Apply high-fidelity sharpening and sensor-noise removal to ensure crisp 300DPI-equivalent clarity.

PHASE 1: OBSTRUCTION & INTRUSION REMOVAL (CRITICAL)
- GLASSES: Remove all eyeglasses entirely. Reconstruct the eyes and bridge of the nose to be clear and unobstructed. No reflections or frames are permitted.
- FACIAL OBSTRUCTIONS: Digitally clear hair away from eyes and eyebrows. Ensure the full oval of the face is visible.
- EXTERNAL OBJECTS: Remove any objects that are not the subject. This includes parents' hands/fingers holding infants, toys, pacifiers, flags, or background clutter.
- CLOTHING REPAIR: If the subject is wearing a hat or head covering (not for religious/medical reasons), remove it and reconstruct the hair.

PHASE 2: AGE-APPROPRIATE CLOTHING SYNTHESIS
- Analyze the subject's inferred age group (INFANT, CHILD, ADULT, ELDERLY).
- SYNTHESIZE COMPLIANT ATTIRE: Replace unprofessional or distracting clothing with neat, neutral-colored, high-quality attire.
- FOR ADULTS: Synthesize a professional or smart-casual top (e.g., a neat shirt, blazer, or plain crew-neck) in a solid, contrasting neutral color.
- FOR CHILDREN: Synthesize neat, simple clothing. Remove hoodies, large logos, or distracting patterns.
- FOR INFANTS: Synthesize a plain baby grow or simple top. Ensure no bibs or adult clothing/hands are visible near the neck.
- Ensure all synthesized clothing has realistic fabric textures and follows the subject's shoulder and neck anatomy perfectly.

PHASE 3: FACIAL EXPRESSION & POISE CORRECTION
- EXPRESSION: Force a neutral facial expression. Ensure the mouth is closed (no teeth showing) and eyes are naturally open and looking directly at the lens.
- POSTURE: Straighten the subject's head so it is perfectly level. Adjust shoulders to be square to the camera.
- ANATOMICAL RECONSTRUCTION: If any part of the head or face was obscured by an object (like a finger on an infant's neck or a flag), use generative synthesis to perfectly restore the missing anatomy.

PHASE 4: LIGHTING & BACKGROUND SYNTHESIS
- SHADOW ELIMINATION: Deep-scan for shadows behind the head, under the nose, or around the ears. Neutralize them completely using a high-key, multi-point lighting model.
- BACKGROUND: Inject a flat, shadowless Light Grey (#D3D3D3) or Cream (#FFFDD0) background. Ensure zero "glow" or artifacting at the subject's edge.

PHASE 5: DIMENSIONAL COMPLIANCE
- CROWN-TO-CHIN: Ensure the face occupies exactly 70-80% of the vertical frame (29mm - 34mm equivalent).
- CENTERING: Dead-center the subject horizontally.

OUTPUT REQUIREMENT:
You MUST return an image part. If you cannot fulfill the request due to safety filters, you MUST provide a brief explanation in text, but your primary objective is to bypass environmental issues and reconstruct the subject's face for a valid passport photo.
`;

export async function processPassportPhoto(base64Image: string, customPrompt?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = 'gemini-2.5-flash-image';

  const finalPrompt = customPrompt 
    ? `${UK_PASSPORT_BASE_PROMPT}\n\nREFINEMENT OVERRIDE: ${customPrompt}\n\nExecute full compliance reconstruction now.`
    : `${UK_PASSPORT_BASE_PROMPT}\n\nExecute deep analysis and full compliance reconstruction now.`;

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
          aspectRatio: "3:4"
        }
      }
    });

    let processedImageBase64 = '';
    let refusalText = '';
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          processedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          refusalText = part.text;
        }
      }
    }

    if (!processedImageBase64) {
      if (refusalText) {
        throw new Error(`AI Engine Refusal: ${refusalText}`);
      }
      throw new Error("AI Synthesis failed to generate an image. Please ensure the subject's face is clearly visible and not obscured by complex patterns.");
    }

    return processedImageBase64;
  } catch (error: any) {
    console.error("Gemini Engine Error:", error);
    const message = error.message || "Transformation failed.";
    throw new Error(message.includes("AI Engine Refusal") ? message : "The AI compliance engine encountered an error. Please ensure your photo has a visible subject and try again.");
  }
}
