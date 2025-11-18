import { Type } from "@google/genai";
import { getAiInstance } from '../../services/geminiService';
import type { DesignChallenge } from '../../types/portfolio';

const challengeSchema = {
  type: Type.OBJECT,
  properties: {
    challenges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'A short, actionable title for the challenge. E.g., "Add a Landmark Visible from the Start".' },
          description: { type: Type.STRING, description: 'A one or two-sentence description of what the user should do to complete the challenge.' },
          category: { type: Type.STRING, enum: ['Navigation', 'Pacing', 'Combat', 'Atmosphere', 'General'], description: 'The design category this challenge falls into.' },
        },
        required: ['title', 'description', 'category'],
      },
      description: 'An array of 3 to 5 design challenges.'
    }
  },
  required: ['challenges'],
};

export async function generateDesignChallenges(analysisJson: any): Promise<Omit<DesignChallenge, 'id' | 'status'>[]> {
  const improvementAreas = analysisJson?.strengths_opportunities?.improvement_areas;
  if (!improvementAreas || improvementAreas.length === 0) {
    console.log("No improvement areas found, skipping challenge generation.");
    return [];
  }

  const context = `
    Based on the following "Opportunities for Improvement" from a level design analysis, generate 3-5 specific, actionable design challenges.
    These challenges should be concrete tasks a designer can undertake to directly address the identified weaknesses.
    
    Weaknesses Identified:
    - ${improvementAreas.join('\n- ')}

    Example Challenge:
    - Title: "Improve Signposting at First Junction"
    - Description: "Use lighting and environmental composition to more clearly guide the player towards the intended path at the first major decision point."
    - Category: "Navigation"
    
    Now, generate the challenges for the weaknesses provided.
  `;

  try {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: context }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: challengeSchema,
      }
    });

    const result = JSON.parse(response.text);
    return result.challenges || [];

  } catch (error) {
    console.error("Error generating design challenges:", error);
    // Return an empty array or a default challenge on error
    return [];
  }
}