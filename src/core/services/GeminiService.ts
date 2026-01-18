
import { GoogleGenAI, Type } from "@google/genai";

// Use Vite's env variable convention
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// --- Types ported from SampleApp ---
export interface OrderList {
    ORDER_INFO: {
        ORDER_DATE: string;
        TYPE: string;
        STATUS: string;
    };
    CHARACTERS: {
        ID: string;
        NAME: string;
        DESCRIPTION: string;
        VISUAL_REFERENCE: {
            AGE: string;
            HAIR: string;
            EYES: string;
            BUILD: string;
            OUTFIT: string;
            PERSONALITY: string;
        };
        ASSETS: {
            STANDING: {
                ID: string;
                POSE: string;
                FILENAME: string;
            }[];
            FACES: {
                ID: string;
                EXPRESSION: string;
                FILENAME: string;
            }[];
            CGS: {
                ID: string;
                SCENE: string;
                FILENAME: string;
            }[];
        };
    }[];
    TECHNICAL_SPECS: {
        STANDING_SIZE: string;
        FACE_SIZE: string;
        CG_SIZE: string;
        FORMAT: string;
    };
}

export interface AnalysisResult {
    id: string;
    name: string;
    description: string;
    tags: string[];
    visualStyle: string;
    keyFeatures: string[];
    assets: GeneratedAsset[];
}

export interface GeneratedAsset {
    id: number;
    filename: string;
    type: 'STANDING' | 'FACE' | 'CG';
    description: string;
    prompt: string;
    imageUrl?: string;
}

const SYSTEM_INSTRUCTION = `
# Role
You are "NANOBANANAPRO", an expert AI character design director and asset generator for game development.

# Objective
Your task is to analyze a provided "Reference Character Image" and a "JSON Order List". Based on these inputs, you must define the precise visual details to generate consistent game assets (Standing art, Expressions, Event CGs).

# Rules & Constraints
1. **Character Consistency**: The physical features (hair style, eye color, face shape, accessories) and costume design must strictly match the "Reference Character Image". Do not hallucinate new features unless specified by the order.
2. **Metadata Generation**: You must generate a concise character ID (snake_case), localized Name (Japanese if possible), a brief background Description, and relevant Tags (e.g., ADVENTURER, MAGE, ALLY).
3. **Asset Types**:
   - **Standing**: Full body or knee-up, neutral or specific pose, transparent or simple background.
   - **Expression**: Close-up on the face, preserving the exact angle/lighting of the standing art but changing facial features.
   - **CG**: Cinematic composition, specific lighting, background included.
4. **Output Format**: You must output the result in a valid JSON format as defined by the responseSchema.
`;

// Helper for retry logic
const generateContentWithRetry = async (
    ai: GoogleGenAI,
    modelName: string,
    params: any,
    retries = 3
): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent({
                model: modelName,
                ...params
            });
        } catch (error: any) {
            // Check for 429 (Resource Exhausted) or 503 (Service Unavailable)
            if (error?.status === 429 || error?.code === 429 || error?.status === 503) {
                if (i === retries - 1) throw error;
                const delay = Math.pow(2, i) * 2000 + Math.random() * 1000; // 2s, 4s, 8s + jitter
                console.warn(`Gemini API 429/503. Retrying in ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
};

export const GeminiService = {
    analyzeCharacterAndOrders: async (
        base64Image: string,
        orderList: OrderList
    ): Promise<AnalysisResult> => {
        if (!API_KEY) {
            throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env");
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const response = await generateContentWithRetry(ai, 'gemini-2.0-flash', {
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: base64Image.split(',')[1] || base64Image,
                            },
                        },
                        {
                            text: `Analyze this character and process the order: ${JSON.stringify(orderList)}. 
                    Provide metadata for a 'data.json' file including a unique snake_case ID, name in Japanese, description, and tags.`,
                        },
                    ]
                }
            ],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "snake_case id" },
                        name: { type: Type.STRING, description: "Display name in Japanese" },
                        description: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        visualStyle: { type: Type.STRING },
                        keyFeatures: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        assets: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    filename: { type: Type.STRING },
                                    type: { type: Type.STRING },
                                    description: { type: Type.STRING }, // Description of the asset content
                                    prompt: { type: Type.STRING }, // Generation prompt
                                },
                                required: ["id", "filename", "type", "description", "prompt"]
                            }
                        }
                    },
                    required: ["id", "name", "description", "tags", "visualStyle", "keyFeatures", "assets"]
                },
            },
        });

        try {
            // @ts-ignore
            const text = response.text; // Access as property per SDK 0.2.1
            if (typeof text === 'function') {
                // Fallback if it is a function in newer/older versions
                // @ts-ignore
                return JSON.parse(text() || '{}');
            }
            return JSON.parse(text || '{}');
        } catch (e) {
            console.error("Failed to parse analysis result", e);
            throw new Error("Invalid response from Gemini");
        }
    },

    generateAssetImage: async (
        prompt: string,
        base64Reference?: string
    ): Promise<string> => {
        if (!API_KEY) {
            throw new Error("Gemini API Key is missing.");
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const parts: any[] = [{ text: prompt }];
        if (base64Reference) {
            parts.unshift({
                inlineData: {
                    mimeType: 'image/png',
                    data: base64Reference.split(',')[1] || base64Reference,
                },
            });
        }

        const response = await generateContentWithRetry(ai, 'gemini-2.0-flash', {
            contents: [
                { role: 'user', parts }
            ],
        });

        const candidates = response.candidates;
        if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }

        throw new Error("No image generated");
    }
};
