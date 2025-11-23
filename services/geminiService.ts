
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, ChatRole, QuizQuestion, ExamQuestion } from '../types';

// --- Configuration ---
const getAiClient = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return null;
};

// --- Chat Service ---
export const chatWithGemini = async (
  history: ChatMessage[], 
  newMessage: string,
  base64Image?: string,
  mimeType: string = 'image/png'
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key not configured.";

  try {
    const promptText = `
      System: You are an expert mathematics tutor for Georgian students. 
      
      **EXPLANATION STYLE:**
      - Explain the logic fundamentally and simply.
      - **Tone:** Mature, professional, encouraging, and clear.
      - Focus on the "Why" and "How".
      
      **CRITICAL FORMATTING RULES (STRICTLY NO LATEX):**
      Do not use LaTeX formatting, TeX commands, or anything inside dollar signs.
      Write all mathematical expressions in normal everyday math notation.

      Use:
      - Normal fraction format like 3/7, 12/5, a/b — no \\frac{}.
      - Exponents written normally like x², a³, 10⁵ — no ^ symbols unless absolutely necessary.
      - Square roots written as √x, √(x+4) — no \\sqrt{}.
      
      Do not output any LaTeX commands such as \\cdot, \\times, \\dot{x}, \\sum, or \\sqrt.
      Do not wrap anything in $ $ or $$ $$.
      
      Always write clean, readable, non-LaTeX math, similar to how it appears in a textbook for students.
      
      **Structure:** Use • Bullet points (black dots) for lists. Do NOT use Markdown headers (###).
      
      **REQUIRED OUTPUT STRUCTURE:**
      1. **Explanation:** The answer to the user's question (in Georgian).
      2. **Similar Practice Problem:** At the very end, generate a similar math problem labeled "**მსგავსი სავარჯიშო:**".
      
      Conversation History:
      ${history.map(h => `${h.role === ChatRole.USER ? 'User' : 'Model'}: ${h.text}`).join('\n')}
      
      User: ${newMessage}
    `;

    // Prepare contents array
    const contents = [];
    
    // If image is provided, add it as the first part
    if (base64Image) {
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      });
    }
    
    // Add text prompt
    contents.push({ text: promptText });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: contents },
    });

    return response.text || "სამწუხაროდ, პასუხის გაცემა ვერ მოხერხდა.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "დაფიქსირდა შეცდომა კავშირის დროს. გთხოვთ სცადოთ მოგვიანებით.";
  }
};

// --- Vision Service ---
export const analyzeImageWithGemini = async (
  base64Image: string,
  mimeType: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key not configured.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `
              თქვენ ხართ გამოცდილი მათემატიკის მასწავლებელი.
              გააანალიზეთ ფოტო და აუხსენით ამოცანა.

              **FORMATTING RULES (STRICTLY NO LATEX):**
              Do not use LaTeX formatting, TeX commands, or anything inside dollar signs.
              Write all mathematical expressions in normal everyday math notation (e.g., 1/2, x², √x).
              Do not output any LaTeX commands such as \\frac, \\sqrt, etc.
              Do not wrap anything in $ $ or $$ $$.

              **სტრუქტურა:**
                 • **რა არის სურათზე?** (მოკლე აღწერა)
                 • **საჭირო ფორმულა** (Clean math notation)
                 • **ნაბიჯ-ნაბიჯ ამოხსნა**
                 • **ანალოგია** (მარტივი ცხოვრებისეული მაგალითი)
                 • **საბოლოო პასუხი**
              
              ენა: ქართული.
            `
          }
        ]
      }
    });

    return response.text || "სურათის გაანალიზება ვერ მოხერხდა.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "შეცდომა სურათის დამუშავებისას.";
  }
};

// --- Practice Problem Service ---
export const generateSimilarProblem = async (
  originalContext: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing.";

  try {
    const prompt = `
      Based on the previous math analysis provided below, generate a **similar practice problem** for the student to solve.
      
      Original Context:
      ${originalContext.substring(0, 1000)}...
      
      Output Format (in Georgian):
      1. **New Problem**: State a similar problem with different numbers but the same logic.
      2. **Hint**: A small hint on which formula to use.
      3. **Answer (Hidden)**: Provide the correct answer at the very end, labeled "**სწორი პასუხი:**".
      
      **FORMATTING:** 
      - Do not use LaTeX formatting, TeX commands, or anything inside dollar signs.
      - Write all mathematical expressions in normal everyday math notation (1/2, x², √x).
      - No markdown headers.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "ვერ მოხერხდა მსგავსი მაგალითის შექმნა.";
  } catch (error) {
    console.error("Gen Similar Problem Error:", error);
    return "შეცდომა ახალი მაგალითის გენერირებისას.";
  }
};

// --- Illustration Service ---
export const generateMathIllustration = async (
  topicTitle: string, 
  topicExplanation: string
): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    // Refined prompt for abstract, flat math illustrations
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{
          text: `Generate a high-quality, abstract, flat-design educational illustration for the math concept: "${topicTitle}". 
                 Description: ${topicExplanation}. 
                 Style: Modern minimalist, geometric shapes, isometric view, using a palette of Indigo, Violet, and White. 
                 Constraint: No text, no numbers, no letters inside the image. Clean background.`
        }]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

// --- Quiz Service ---
export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const prompt = `
      Generate 5 multiple-choice mathematics questions about "${topic}" in Georgian language.
      
      Strictly Output JSON format ONLY. Do not add markdown code blocks.
      
      **FORMATTING RULES:**
      - Do not use LaTeX formatting, TeX commands, or anything inside dollar signs.
      - Write all mathematical expressions in normal everyday math notation (1/2, x², √x).
      - Normal fraction format like 3/7, a/b.
      
      Structure:
      [
        {
          "id": "q1",
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswerIndex": 0,
          "explanation": "Brief explanation",
          "hint": "Small hint" 
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];

    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as QuizQuestion[];
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return [];
  }
};

// --- National Exam Service ---

export const generateMockExam = async (): Promise<ExamQuestion[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const prompt = `
      Generate a Mock Georgian National Mathematics Exam (NAEC style).
      Language: Georgian.
      Format: JSON ONLY.
      
      The exam MUST contain exactly 40 QUESTIONS total.
      
      Structure:
      - Questions 1-35: Multiple Choice (1 Point each). 4 Options.
      - Questions 36-40: Open-Ended (3 or 4 Points each). No options.
      
      **FORMATTING RULES:**
      - Do not use LaTeX formatting, TeX commands, or anything inside dollar signs.
      - Write all mathematical expressions in normal everyday math notation (1/2, x², √x).
      - No \\frac, \\sqrt, etc.
      
      JSON Schema:
      [
        {
          "id": 1,
          "type": "mc",
          "points": 1,
          "text": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "Index (0-3) as STRING"
        },
        ...
        {
          "id": 36,
          "type": "open",
          "points": 3,
          "text": "Problem text",
          "rubric": "Grading criteria"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as ExamQuestion[];

  } catch (error) {
    console.error("Exam Gen Error:", error);
    return [];
  }
};

export const gradeOpenEndedQuestion = async (
  questionText: string,
  rubric: string,
  userAnswer: string,
  maxPoints: number
): Promise<{score: number, feedback: string}> => {
  const ai = getAiClient();
  if (!ai) return { score: 0, feedback: "Error: API Key missing" };

  try {
    const prompt = `
      You are a strict math exam grader.
      
      Question: "${questionText}"
      Rubric: "${rubric}"
      Student Answer: "${userAnswer}"
      Max Points: ${maxPoints}
      
      Evaluate the answer.
      - Feedback MUST be in Georgian.
      - **NO LaTeX in feedback**. Use standard text math notation (x², 1/2).
      
      Output JSON ONLY:
      {
        "score": number,
        "feedback": "Short feedback in Georgian"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) return { score: 0, feedback: "Error: No response" };
    const result = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    
    if (typeof result.score !== 'number') result.score = 0;
    if (result.score > maxPoints) result.score = maxPoints;
    
    return result;
  } catch (error) {
    console.error("Grading Error:", error);
    return { score: 0, feedback: "შეფასების შეცდომა (სისტემური)" };
  }
};

// --- Geometry Visualizer Service ---
export interface GeoShape {
  id: string;
  type: 'point' | 'line' | 'polygon' | 'circle';
  points: {x: number, y: number, label: string}[];
  properties?: any;
}

export interface GeoSolution {
  shapes: GeoShape[];
  steps: string[];
  explanation: string;
}

export const solveGeometryProblem = async (problemText: string, base64Image?: string): Promise<GeoSolution | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const prompt = `
      You are a Geometry Engine. Convert the user's geometry problem into a structured coordinate system drawing and step-by-step solution.
      
      Problem: "${problemText}"
      ${base64Image ? "An image is also provided for context. Analyze it carefully." : ""}
      
      Output JSON ONLY.
      
      **CRITICAL DIAGRAM RULES:**
      1. **Completeness:** DRAW EVERYTHING described. If it says "Triangle with height", draw the height line.
      2. **Coordinates:**
         - Use a canvas size of 800x600.
         - **SAFE ZONE:** Keep X between 50 and 750. Keep Y between 50 and 550.
         - **Scaling:** Ensure the shape fills the center of the canvas. Do NOT draw tiny shapes.
         - y-axis increases downwards (SVG style).
      3. **Labeling (UNICODE ONLY):**
         - Label ALL vertices (A, B, C...).
         - Label angles using '°' (e.g., "30°", "90°") near vertices.
         - Label side lengths using 'cm' (e.g., "5cm", "10cm") near the middle of lines.
         - **Use Unicode '∠'** for angle text in explanations (e.g. "∠ABC").
         - **Use Unicode '△'** for triangles (e.g. "△ABC").
         - **NO LaTeX** (No \\angle, No $, No words like "Angle A").
      
      JSON Structure:
      {
        "shapes": [
           { 
             "id": "s1", 
             "type": "polygon", 
             "points": [{"x": 100, "y": 300, "label": "A"}, {"x": 300, "y": 300, "label": "B 60°"}, {"x": 200, "y": 126, "label": "C"}],
             "properties": { "label": "△ABC" }
           },
           {
             "id": "l1",
             "type": "line",
             "points": [{"x": 100, "y": 300, "label": ""}, {"x": 200, "y": 126, "label": "5cm"}], // Label on 2nd point approximates midpoint label
             "properties": {}
           }
        ],
        "steps": ["Step 1: Find ∠B...", "Step 2: Use sine rule..."],
        "explanation": "Brief explanation using ∠ notation."
      }
      
      Language: Georgian for text fields.
    `;

    // Prepare contents
    const contents: any[] = [{ text: prompt }];
    if (base64Image) {
      contents.unshift({
        inlineData: {
          mimeType: 'image/png', // Assuming PNG or similar logic
          data: base64Image
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: contents },
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) return null;
    const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    
    // Safety check for arrays
    if (!parsed.shapes) parsed.shapes = [];
    if (!parsed.steps) parsed.steps = [];
    
    return parsed;
  } catch (error) {
    console.error("Geometry Error:", error);
    return null;
  }
};
