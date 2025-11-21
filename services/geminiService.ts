
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, ChatRole, QuizQuestion, ExamQuestion } from '../types';

// --- Configuration ---
const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Chat Service ---
export const chatWithGemini = async (
  history: ChatMessage[], 
  newMessage: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key not configured.";

  try {
    const prompt = `
      System: You are an expert mathematics tutor for Georgian students. 
      
      **EXPLANATION STYLE (Feynman Technique):**
      - Explain the logic fundamentally and simply, as if clarifying the "core truth" of the concept.
      - **Tone:** Mature, professional, encouraging, and clear. DO NOT use a "baby voice" or talk down to the user. Avoid phrases like "Imagine you have 3 apples" unless it's a sophisticated analogy.
      - Focus on the "Why" and "How".
      
      **STRICT FORMATTING RULES:**
      1. **Language:** Georgian ONLY.
      2. **NO LaTeX:** Do NOT use symbols like $\\mathbb{N}$, $\\frac{a}{b}$, or latex code blocks. 
      3. **NO Markdown Headers:** Do NOT use ### or ##. Use **Bold Text** or • Bullet points (black dots) for structure.
      4. **Math Symbols:** Use standard Unicode: x², √, ∛, π, °, ×, ÷, ≈, ≠, ≤, ≥, ∞, ∫, ∑, ∆.
         - Instead of $\\mathbb{N}$, write "ნატურალური რიცხვები (N)".
         - Instead of $\\in$, write "ეკუთვნის".
      
      **REQUIRED OUTPUT STRUCTURE:**
      1. **Explanation:** The answer to the user's question.
      2. **Similar Practice Problem:** At the very end of your response, ALWAYS generate a similar math problem based on the context for the user to solve, labeled as "**მსგავსი სავარჯიშო:**".
      
      Conversation History:
      ${history.map(h => `${h.role === ChatRole.USER ? 'User' : 'Model'}: ${h.text}`).join('\n')}
      
      User: ${newMessage}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
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
              გააანალიზეთ ფოტო და აუხსენით ამოცანა მარტივად (Feynman Technique).

              **სტილი და ტონი:**
              - ახსენით საფუძვლიანად, მაგრამ არა ბავშვური ენით. იყავით სერიოზული დამხმარე.
              - არ გამოიყენოთ "###" ჰედერები. გამოიყენეთ მუქი ტექსტი (**სათაური**).
              - არ გამოიყენოთ LaTeX ($\frac{a}{b}$). გამოიყენეთ უნიკოდი (a/b, x²).
              
              **სტრუქტურა:**
              1. **რა არის სურათზე?** (მოკლე აღწერა)
              2. **საჭირო ფორმულა** (დაასახელეთ და ახსენით რატომ ვიყენებთ მას)
              3. **ნაბიჯ-ნაბიჯ ამოხსნა** (გამოიყენეთ • ბულეტები)
              4. **მარტივი ანალოგია** (რეალური ცხოვრების მაგალითი, სერიოზული კონტექსტით)
              5. **საბოლოო პასუხი** (გამოყავით მკაფიოდ)
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
      
      Formatting: No LaTeX, No ### headers. Use Unicode.
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{
          text: `Create a flat-style, minimalist, educational vector illustration representing the mathematical concept of "${topicTitle}". Context: ${topicExplanation}. Use vibrant, clean colors suitable for a modern study app. Do not include text in the image.`
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
      
      Rules:
      - No LaTeX code (use x², √).
      - No markdown headers (###).
      - Explanations should be clear and mature.
      
      Structure:
      [
        {
          "id": "q1",
          "question": "Question text in Georgian",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswerIndex": 0, // 0-3
          "explanation": "Brief explanation in Georgian why this is correct",
          "hint": "A small, subtle hint that guides the user without giving the answer" 
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
      
      Rules:
      - NO Latex. Use Unicode for math (x², √, etc).
      - Covers Algebra, Geometry, Statistics, Trigonometry.
      - Keep text concise to ensure the JSON fits in the response.
      - DO NOT return empty arrays.
      
      JSON Schema:
      [
        {
          "id": 1,
          "type": "mc",
          "points": 1,
          "text": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "Index of correct option (0-3) as STRING"
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
      Rubric/Correct Logic: "${rubric}"
      Student Answer: "${userAnswer}"
      Max Points: ${maxPoints}
      
      Evaluate the student's answer.
      - If correct, give full points.
      - If partially correct, give partial points.
      - If wrong, give 0.
      - Feedback MUST be in Georgian.
      
      Output JSON ONLY:
      {
        "score": number,
        "feedback": "Short feedback in Georgian explaining the grade"
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
    
    // Validate response
    if (typeof result.score !== 'number') result.score = 0;
    if (result.score > maxPoints) result.score = maxPoints;
    
    return result;
  } catch (error) {
    console.error("Grading Error:", error);
    return { score: 0, feedback: "შეფასების შეცდომა (სისტემური)" };
  }
};
