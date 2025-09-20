import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function base64ToGenerativePart(base64Data: string, mimeType: string) {
    return {
        inlineData: {
            data: base64Data,
            mimeType,
        },
    };
}

export async function getArtDescription(imageDataUrl: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    
    const match = imageDataUrl.match(/^data:(image\/(.+));base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid image data URL format. Please capture the image again.");
    }
    const mimeType = match[1];
    const base64Data = match[3];

    const imagePart = base64ToGenerativePart(base64Data, mimeType);
    const textPart = { text: "Please identify and describe this artwork or monument based on your instructions." };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction: SYSTEM_PROMPT,
            }
        });

        const text = response.text;
        if (text) {
            return text;
        } else {
             throw new Error("The AI guide couldn't identify the item. It might be too obscure or the image is unclear. Please try a different angle or item.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('fetch')) {
             throw new Error("Network connection failed. Please check your internet and try again.");
        }
        throw new Error("The AI service is currently unavailable. Please try again in a moment.");
    }
}

export async function getNearbySuggestions(lat: number, lon: number): Promise<string[]> {
    const model = 'gemini-2.5-flash';
    const prompt = `List up to 5 famous landmarks, monuments, or public artworks near latitude ${lat}, longitude ${lon}. Provide only the names, separated by newlines. If you cannot find any, respond with "No suggestions found."`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt
        });
        
        const text = response.text;

        if (text && !text.includes("No suggestions found.")) {
            // Split by newline and filter out any empty strings
            return text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error calling Gemini API for suggestions:", error);
        throw new Error("Failed to get nearby suggestions from the AI service.");
    }
}