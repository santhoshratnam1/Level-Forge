import { Type } from "@google/genai";
import { getAiInstance } from '../../services/geminiService';
import type { ExtractedFrame, TimelineEvent, PacingAnalysis } from '../../types/portfolio';

const timelineAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A high-level summary of the player's journey, their successes, and where they struggled."
        },
        pacing: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "Overall pacing score from 1 (poor/boring) to 10 (perfect flow)." },
                critique: { type: Type.STRING, description: "Detailed critique of the level's pacing. Discuss rhythm, tension, and downtime." },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific, actionable suggestions to improve flow and pacing." },
                breakdown: {
                    type: Type.OBJECT,
                    properties: {
                        combat: { type: Type.INTEGER, description: "Estimated percentage of playtime spent in combat/action (0-100)." },
                        exploration: { type: Type.INTEGER, description: "Estimated percentage of playtime spent navigating/exploring (0-100)." },
                        puzzle: { type: Type.INTEGER, description: "Estimated percentage of time spent solving puzzles (0-100)." },
                        narrative: { type: Type.INTEGER, description: "Estimated percentage of time in dialogue/cutscenes (0-100)." },
                        idle: { type: Type.INTEGER, description: "Estimated percentage of time in menus, inventory, or AFK (0-100)." }
                    },
                    required: ['combat', 'exploration', 'puzzle', 'narrative', 'idle']
                }
            },
            required: ['score', 'critique', 'improvements', 'breakdown']
        },
        events: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    timestamp: { type: Type.INTEGER, description: 'The timestamp (in seconds) of the frame where this event occurs.'},
                    type: { 
                        type: Type.STRING, 
                        enum: [
                            'Combat', 'Boss_Fight', 'Exploration', 'Puzzle', 'Narrative', 
                            'Player_Stuck', 'Key_Moment', 'Stealth', 'Traversal', 
                            'Backtracking', 'Looting', 'Menu_UI', 'Death'
                        ], 
                        description: 'The category of the event.'
                    },
                    title: { type: Type.STRING, description: 'A short, concise title for the event (3-5 words).'},
                    description: { type: Type.STRING, description: 'A 1-2 sentence analysis of what is happening at this moment.'},
                    intensity: { type: Type.INTEGER, description: 'Player intensity/engagement level from 0 (calm) to 10 (intense action).'}
                },
                required: ['timestamp', 'type', 'title', 'description', 'intensity']
            },
            description: 'A chronological list of significant events observed in the gameplay.'
        }
    },
    required: ['summary', 'pacing', 'events']
};


export async function analyzeVideoTimeline(frames: ExtractedFrame[]): Promise<{ summary: string, pacing: PacingAnalysis, events: TimelineEvent[] }> {
    const prompt = `You are an expert game playtester and level design analyst.
    I will provide you with a sequence of frames from a gameplay video, each with a timestamp.
    Your task is to analyze this sequence to understand the player's journey and the level's pacing.
    
    Analyze the frames to identify events granularly. Look for:
    - Combat: Standard fights.
    - Boss_Fight: Major encounters with boss-level enemies.
    - Exploration: Walking through new areas, looking around.
    - Traversal: Specific platforming or movement challenges.
    - Backtracking: Moving through previously visited areas.
    - Looting: Picking up items or opening chests.
    - Player_Stuck: Wandering confusedly or failing repeatedly.
    - Menu_UI: Spending time in menus/inventory.
    - Death: Player dying and respawning.
    - Key_Moment: Major discoveries or setpieces.
    - Narrative: Cutscenes, dialogue, or reading lore.
    - Stealth: Sneaking or avoiding detection.
    
    Based on your analysis, generate a timeline of events and a detailed PACING ANALYSIS.
    Evaluate the rhythm of the level. Is there too much downtime? Is the combat too chaotic?
    Estimate the percentage breakdown of playtime (combat vs exploration, etc.).
    
    For each event, provide an intensity score from 0 (calm) to 10 (peak tension).
    The timestamp for each event MUST correspond to one of the provided frame timestamps.
    
    Respond ONLY with a valid JSON object matching the provided schema.`;

    const imageParts = frames.map(frame => ({
        inlineData: {
            mimeType: 'image/jpeg',
            data: frame.base64,
        },
    }));

    // Add text parts with timestamps
    const textParts = frames.map(frame => `Frame at ${frame.timestamp}s.`);
    const combinedText = `Timestamps for the following frames:\n${textParts.join('\n')}`;

    try {
        const ai = getAiInstance();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: prompt },
                    ...imageParts,
                    { text: combinedText }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: timelineAnalysisSchema,
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        
        const responseText = response.text;
        if (!responseText?.trim()) {
            throw new Error('AI returned an empty response for timeline analysis.');
        }

        const analysis = JSON.parse(responseText);
        return analysis;

    } catch (error) {
        console.error("Video timeline analysis error:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini timeline analysis error: ${error.message}`);
        }
        throw new Error("An unknown error occurred during video timeline analysis.");
    }
}
