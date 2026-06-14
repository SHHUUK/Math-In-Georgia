import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { ChatMessage, ChatRole, QuizQuestion, ExamQuestion } from '../types';

// --- Configuration ---
const getAiClient = () => {
  // Always create a new instance to ensure the latest API key (if updated via UI) is used
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return null;
};

// --- Chat Service ---
export const chatWithGemini = async (
  history: ChatMessage[], 
  newMessage: string,
  images: { data: string, mimeType: string }[] = []
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key not configured.";

  try {
    const promptText = `
      System: You are 'MathMaster AI', a world-class, engaging, and highly capable mathematics tutor for Georgian students.

      **YOUR PERSONALITY:**
      - **Engaging & Visual:** Use Emojis (👋, ✨, 📐, 🚀) to make learning fun.
      - **Structured:** Use **Bold Text** for key steps and terms.
      - **Clear Hierarchy:** Use Markdown Headers (###) to create "Big Letters" / Titles for main sections.
      - **Language:** Georgian (ქართული).

      **CORE PROTOCOLS:**
      1. **THINK & VERIFY:** Before generating an answer, perform strict internal verification. Ensure all calculations, algebra, and logic are mathematically proven. Do not guess.
      2. **VISUALIZATION FIRST:** If a concept (geometry, graph, data) can be visualized, you MUST generate a precise visual representation.

      **VISUALIZATION GUIDELINES (MANDATORY):**
      
      **A. STATIC DIAGRAMS & GRAPHS (SVG):**
      - **Technique:** Generate accurate, scaled, and mathematically correct diagrams using **RAW SVG HTML**.
      - **Style:** Create **"Manim-style" aesthetics**: accurate geometry, clear labels (A, B, C, x, y), distinct colors (Indigo/Blue/Red for contrast), and elegant typography.
      - **Placement:** Put the SVG code on its own line, separated by blank lines.
      - **Code:** Write the \`<svg>...</svg>\` tag directly. DO NOT use markdown code blocks.
      - **Responsiveness:** Use \`viewBox\` (e.g., "0 0 400 300") and set \`width="100%"\` \`height="auto"\`.
      
      **B. INTERACTIVE EXPLORATION (DESMOS):**
      - If the user benefits from exploring variables (e.g. "how k affects y=x^2+k"), provide the specific equation in LaTeX format clearly labeled for graphing calculators.

      **FORMATTING RULES (STRICT):**
      1. **Math:** Use LaTeX for ALL math. Inline: $x^2$, Display: $$ \\frac{a}{b} $$.
      2. **Headings:** Use '### ' for major steps.
      3. **Emphasis:** Use '**' for bolding important words.

      **RESPONSE STRUCTURE:**
      1. **Greeting/Intro:** Friendly opening.
      2. **### Visual:** (If applicable) The SVG diagram on a new line.
      3. **### Step-by-Step Explanation:**
         - **Analyze:** Explain *why* we do this.
         - **Solve:** Show the math with LaTeX.
      4. **### Final Answer:** Clearly state the result.

      Conversation History:
      ${history.map(h => `${h.role === ChatRole.USER ? 'User' : 'Model'}: ${h.text}`).join('\n')}
      
      User: ${newMessage}
    `;

    // Prepare contents array
    const contents = [];
    
    // If images are provided, add them first
    if (images && images.length > 0) {
      images.forEach(img => {
        contents.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data
          }
        });
      });
    }
    
    // Add text prompt
    contents.push({ text: promptText });

    // Using gemini-3.5-flash for faster response time while maintaining high quality for tutoring
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
    // Using gemini-3.5-flash for faster visual analysis
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
              CRITICAL INSTRUCTION: You are a strict mathematics tutor.
              
              **VISUAL SCANNING PROTOCOL (IMPORTANT):**
              1. **Scan the Entire Image:** Do not focus only on the text. Look for geometric figures, graphs, tables, or diagrams located next to, below, or around the text/problem number.
              2. **Integrate Visual Data:** Often the text refers to a drawing (e.g., "See Figure" or implied). You MUST extract values, angles, side lengths, and labels from these side drawings.
              3. **Contextual Link:** If a problem number (e.g., "№5") is visible, look for a corresponding drawing nearby. The drawing is part of the problem condition!

              **STEP 1: TRANSCRIPTION (MANDATORY)**
              Before solving, you MUST transcribe the exact text, numbers, and formulas visible in the image. 
              - If the text is Georgian, write it in Georgian.
              - If English, write in English.
              - Do not paraphrase yet. Read exactly what is written to ensure you understand the condition.

              **STEP 2: ANALYSIS**
              - Identify what is asked.
              - Look for "trick" conditions (e.g., limits, units of measurement, geometry labels).
              - **Combine Text & Visuals:** Merge the text condition with the data extracted from the drawing.

              **STEP 3: SOLUTION (in Georgian)**
              - Explain step-by-step.
              - Use **LaTeX** for all math expressions ($...$).
              - Use Markdown Headers (###) for structure.

              **STRUCTURE:**
                 • **### პირობა (Transcription):** (Write exactly what you see in the image here)
                 • **### ვიზუალური მონაცემები:** (Describe what you see in the side drawing/graph if present)
                 • **### ამოხსნა** (Step-by-step logic)
                 • **### პასუხი** (Final Result)
              
              Output Language: Georgian.
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
      1. **### ახალი ამოცანა**: State a similar problem with different numbers. Use LaTeX ($...$).
      2. **მინიშნება**: A small hint.
      3. **სწორი პასუხი**: Provide the answer hidden or at the end.
      
      Use Markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
      
      Strictly Output JSON format ONLY.
      
      **FORMATTING:**
      - Use **LaTeX** for all math expressions.
      
      Structure:
      [
        {
          "id": "q1",
          "question": "Question text with $LaTeX$",
          "options": ["Option $A$", "Option $B$", "Option $C$", "Option $D$"],
          "correctAnswerIndex": 0,
          "explanation": "Brief explanation",
          "hint": "Small hint" 
        }
      ]
    `;

    // Using gemini-3.5-flash for rapid quiz generation
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
      - Use **LaTeX** for all math expressions.
      - Escape backslashes for JSON (e.g. "\\\\sqrt{x}").
      
      JSON Schema:
      [
        {
          "id": 1,
          "type": "mc",
          "points": 1,
          "text": "Question text with $LaTeX$",
          "options": ["$A$", "$B$", "$C$", "$D$"],
          "correctAnswer": "Index (0-3) as STRING"
        },
        ...
        {
          "id": 36,
          "type": "open",
          "points": 3,
          "text": "Problem text with $LaTeX$",
          "rubric": "Grading criteria"
        }
      ]
    `;

    // Keep gemini-3.1-pro-preview for Exams to ensure complexity and quality
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
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
      - Use **LaTeX** for math notation in feedback.
      
      Output JSON ONLY:
      {
        "score": number,
        "feedback": "Short feedback in Georgian"
      }
    `;

    // Keep gemini-3.1-pro-preview for Grading to ensure fairness and reasoning depth
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
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
  viewBox?: string;
  shapes: GeoShape[];
  arcs?: { d: string, color: string }[]; // For angles
  measurements?: { x: number, y: number, text: string, type: 'side' | 'angle' }[]; // For side/angle labels
  steps: string[];
  explanation: string;
}

export const solveGeometryProblem = async (problemText: string, base64Image?: string): Promise<GeoSolution | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const prompt = `
      You are a specialized SVG Geometry Coordinate Generator.
      Your goal is to generate accurate drawing instructions for a math geometry problem.
      
      Input:
      ${problemText ? `Problem Text: "${problemText}"` : `Task: Reconstruct the geometric figure seen in the image EXACTLY.`}
      ${base64Image ? "An image is provided. Extract ALL geometric shapes, labels, angles, and side lengths shown." : ""}
      
      **CRITICAL INSTRUCTIONS:**
      1. **Calculate Coordinates:** Do not approximate. If AB=5 and BC=5, their pixel distances must be equal. Use standard SVG coordinate system (0,0 is top-left).
      2. **Draw Everything:** If the problem mentions a triangle ABC with angle B=60°, YOU MUST DRAW Triangle ABC and visual indicator for 60°.
      3. **Labels:** Every point (A, B, C) must be labeled. Every known side length (e.g., "5cm") must be placed near the midpoint of the line. Every known angle (e.g., "90°") must have a visual arc and text.
      4. **Canvas:** Assume a 800x600 canvas. Center the figure.
      
      Output JSON ONLY. Structure:
      {
        "viewBox": "0 0 800 600",
        "shapes": [
           { 
             "id": "s1", 
             "type": "polygon", 
             "points": [{"x": 100, "y": 200, "label": "A"}, {"x": 300, "y": 200, "label": "B"}, ...],
             "properties": { "stroke": "blue", "fill": "none" }
           }
        ],
        "arcs": [
           { "d": "M 120 200 Q 120 180 140 180", "color": "red" } // SVG Path 'd' for angle arcs
        ],
        "measurements": [
           { "x": 200, "y": 220, "text": "10 cm", "type": "side" }, // Side label position
           { "x": 130, "y": 190, "text": "60°", "type": "angle" } // Angle label position
        ],
        "steps": ["Step 1...", "Step 2..."],
        "explanation": "Brief explanation with LaTeX."
      }
      
      Language: Georgian for text fields.
    `;

    // Prepare contents
    const contents: any[] = [{ text: prompt }];
    if (base64Image) {
      contents.unshift({
        inlineData: {
          mimeType: 'image/png', 
          data: base64Image
        }
      });
    }

    // Using gemini-3.5-flash for faster geometry solving
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts: contents },
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) return null;
    const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    
    // Safety check for arrays
    if (!parsed.shapes) parsed.shapes = [];
    if (!parsed.steps) parsed.steps = [];
    if (!parsed.arcs) parsed.arcs = [];
    if (!parsed.measurements) parsed.measurements = [];
    if (!parsed.viewBox) parsed.viewBox = "0 0 800 600";
    
    return parsed;
  } catch (error) {
    console.error("Geometry Error:", error);
    return null;
  }
};

// --- Function Machine Service ---
export const processFunctionStepByStep = async (func: string, val: string): Promise<{result: string, steps: string[]}> => {
  const ai = getAiClient();
  if (!ai) return { result: "Error", steps: [] };

  try {
    // UPDATED PROMPT: More explicit about substitution
    const prompt = `
      Goal: Perform algebraic substitution and simplification.
      
      1. Function: f(x) = ${func}
      2. Input: Substitute x = (${val}) into the function.
      
      Provide a step-by-step breakdown.
      Language: Georgian.
      
      **FORMATTING RULES:**
      - Use **LaTeX** for math expressions.
      - Handle both numeric inputs (e.g. 5) and algebraic inputs (e.g. a+1, y^2).
      
      Output JSON ONLY:
      {
        "result": "Final Answer (string with LaTeX if needed)",
        "steps": ["Step 1 with $LaTeX$", "Step 2..."]
      }
    `;

    // Using gemini-3.5-flash for immediate step-by-step output
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) return { result: "Error", steps: [] };
    return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    console.error("Function Machine Error:", error);
    return { result: "Error", steps: ["ვერ მოხერხდა გამოთვლა."] };
  }
};

// New Service: Generate Function Problem
export const generateFunctionProblem = async (difficulty: 'easy' | 'medium' | 'advanced' | 'expert'): Promise<{func: string, input: string}> => {
  const ai = getAiClient();
  if (!ai) return { func: 'x + 1', input: '1' };

  try {
    const prompt = `
      Generate a math function problem based on difficulty: "${difficulty}".
      
      Rules:
      - **Easy:** Linear functions (e.g. 2x+3), numeric integer input.
      - **Medium:** Quadratics, roots, or simple fractions (e.g. x^2 - 4), input can be negative or decimal.
      - **Advanced:** High-degree polynomials (e.g. x^3), complex rational functions (e.g. 1/(x+1)), or nested roots. Input MUST be algebraic (e.g. 2a+1 or y^2). **STRICTLY NO TRIGONOMETRY (sin, cos, tan).**
      - **Expert:** Any complex function including Trigonometry, Logarithms, or composite functions.
      
      Output JSON ONLY:
      {
        "func": "The function string (e.g. 3x - 5)",
        "input": "The value to substitute (e.g. 4 or y+1)"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) return { func: 'x', input: '0' };
    return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    console.error("Gen Problem Error:", error);
    return { func: '2x', input: '5' };
  }
};

// --- Podcast / AI Discussion Service ---

// Helper function to decode Base64 audio string to AudioBuffer
async function decodeAudioData(base64Str: string, audioContext: AudioContext): Promise<AudioBuffer> {
  const binaryString = atob(base64Str);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Gemini TTS returns raw PCM 16-bit Little Endian audio at 24kHz (Mono)
  const sampleRate = 24000;
  const numChannels = 1;
  
  const dataInt16 = new Int16Array(bytes.buffer);
  
  const frameCount = dataInt16.length / numChannels;
  const buffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generatePodcastAudio = async (topic: string, content: string): Promise<{ audioBuffer: AudioBuffer | null, script: string }> => {
  const ai = getAiClient();
  if (!ai) return { audioBuffer: null, script: '' };

  try {
    // 1. Generate the Script first (Text)
    const scriptPrompt = `
      Create a short, engaging 2-person podcast dialogue about the math topic: "${topic}".
      Context: ${content.substring(0, 500)}...
      
      Characters:
      - Alex: Enthusiastic host, asks questions.
      - Sarah: Expert professor, explains clearly with analogies.
      
      Format:
      Alex: [Text]
      Sarah: [Text]
      ...
      
      Keep it under 150 words total.
      **LANGUAGE: GEORGIAN (ქართული)**.
      The conversation MUST be in natural, conversational Georgian.
    `;
    
    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: scriptPrompt
    });
    const scriptText = scriptResponse.text || "Script generation failed.";

    // 2. Generate Audio from Script
    const audioResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: scriptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                    {
                        speaker: 'Alex',
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: 'Fenrir' } // Deep male
                        }
                    },
                    {
                        speaker: 'Sarah',
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: 'Kore' } // Soft female
                        }
                    }
              ]
            }
        }
      }
    });

    const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) return { audioBuffer: null, script: scriptText };

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const audioBuffer = await decodeAudioData(base64Audio, audioContext);
    
    return { audioBuffer, script: scriptText };

  } catch (error) {
    console.error("Podcast Generation Error:", error);
    return { audioBuffer: null, script: "Error generating podcast." };
  }
};

// --- Video Generation Service (Veo) ---
export const generateEducationalVideo = async (topic: string): Promise<string | null> => {
  // Create a fresh client to ensure any newly selected API key is used
  const ai = getAiClient();
  if (!ai) return null;

  try {
    // UPDATED PROMPT: Cinematic, highly detailed educational content with blackboard aesthetics
    const prompt = `
      Cinematic, highly detailed educational video close-up of a blackboard. 
      White chalk formulas, graphs, and equations about '${topic}' appearing dynamically.
      The writing is elegant and scientific. Dark green board texture.
      Realistic lighting, 4k quality, educational atmosphere.
    `;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9' 
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    // IMPORTANT: We need to fetch the video blob using the API key
    const videoUrlWithKey = `${downloadLink}&key=${process.env.API_KEY}`;
    return videoUrlWithKey;

  } catch (error) {
    // Log the error but return null so the UI can handle fallback
    console.error("Video Generation Error:", error);
    return null;
  }
};