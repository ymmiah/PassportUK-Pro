
import { GoogleGenAI } from "@google/genai";

const UK_PASSPORT_BASE_PROMPT = `
You are a high-end AI Portrait Architect specializing in UK Government compliance. Your task is to perform a professional "Demographic-Aware Anatomical Fulfillment" on the provided subject.

PHASE 1: SUBJECT ANALYSIS & SHADOW DETECTION
- Analyze the source image to determine the demographic: INFANT, CHILD, ADULT, or ELDERLY.
- Identify the exact facial features, skin tone, and head orientation.
- SHADOW AUDIT: Detect all "unnecessary shadows" including harsh side-lighting, shadows behind ears, shadows under the nose, and "double shadows" on the background.
- DISCARD ALL CLUTTER: Ignore background objects, hands of other people, furniture, or props. Extract ONLY the facial seed and neck.

PHASE 2: CONTEXTUAL CLOTHING SYNTHESIS
Based on the demographic identified in Phase 1, synthesize a brand new, high-quality torso with appropriate attire:
- FOR INFANTS (0-2): Neat, plain everyday clothing (e.g., a simple light-colored baby grow or plain crew-neck) in soft fabrics. NO formal wear.
- FOR CHILDREN (3-12): Clean, neat, age-appropriate smart-casual clothing (e.g., a plain polo shirt, a simple sweater, or a clean blouse). Avoid suits or "mini-adult" looks unless requested.
- FOR ADULTS (13-64): Sharp, professional formal attire (dark blazer/suit jacket over a white or light-colored button-down shirt).
- FOR ELDERLY (65+): Dignified, neat attire such as a professional cardigan, blazer, or formal shirt/blouse.

PHASE 3: ANATOMICAL FULFILLMENT & ALIGNMENT
- If the image is a partial head or half-body, you MUST fulfill the anatomy to create a complete mid-chest-up portrait.
- Reconstruct wide, symmetrical shoulders that match the identified demographic's frame.
- Ensure the neck connection is physiologically accurate and the skin tone matches the face perfectly.

PHASE 4: BACKGROUND, LIGHTING & COMPLIANCE
- SHADOW NEUTRALIZATION: Neutralize all detected unnecessary shadows. Apply a high-key lighting effect that fills in shadows across the face to ensure feature clarity.
- BACKGROUND: Solid, flat, shadowless Light Grey (hex: #D3D3D3) or Cream (hex: #FFFDD0). 
- POSITION: Subject must face dead-center, eyes open (unless infant under 1 year), mouth closed, neutral expression.
- LIGHTING: Even "Balanced Flat Lighting" across the face and the new torso. Zero shadows on the background.
- DIMENSIONS: Head (crown to chin) must occupy 70-80% of the 35mm x 45mm vertical space.

CRITICAL: The result must be hyper-realistic. The clothing must look like it belongs to the person's age group. Neutralize every shadow that could lead to a government rejection.
`;

export async function processPassportPhoto(base64Image: string, customPrompt?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = 'gemini-2.5-flash-image';

  // Combine the base compliance engine with user specific refinements
  const finalPrompt = customPrompt 
    ? `${UK_PASSPORT_BASE_PROMPT}\n\nREFINEMENT OVERRIDE: ${customPrompt}\n\nIMPORTANT: Maintain facial identity and demographic-appropriate clothing regardless of these refinements.`
    : `${UK_PASSPORT_BASE_PROMPT}\n\nExecute the full demographic analysis, shadow neutralization, anatomical fulfillment, and transformation now.`;

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
    });

    let processedImageBase64 = '';
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          processedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!processedImageBase64) {
      throw new Error("AI Synthesis failed. Please ensure the face is clearly visible.");
    }

    return processedImageBase64;
  } catch (error: any) {
    console.error("Gemini Engine Error:", error);
    throw new Error("Transformation failed. Please try a photo with clearer lighting and a visible head for the AI to analyze.");
  }
}
