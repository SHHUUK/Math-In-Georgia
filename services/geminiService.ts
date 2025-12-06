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
  base64Image?: string,
  mimeType: string = 'image/png'
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

      **VISUALIZATION MANDATE (CRITICAL):**
      Whenever a math/physics/geometry problem requires a graph, coordinate plane, diagram, geometric figure, construction, sketch, or visual explanation — or if the student directly asks for one — you must automatically generate it as an image and include it in your answer.
      Generate visuals ONLY for educational purposes (graphs, shapes, charts, number lines, diagrams).
      
      **TECHNICAL HOW-TO FOR VISUALS:**
      - To generate a visual, output **RAW SVG HTML CODE** directly in your response.
      - **DO NOT** use markdown code blocks (like \`\`\`xml or \`\`\`svg) for the SVG. Just write the \`<svg>...</svg>\` tag directly in the text.
      - **Style:** Use a \`viewBox\` (e.g., "0 0 400 300"). Use styling compatible with a light theme (Stroke: #4f46e5 (Indigo), Fill: rgba(79, 70, 229, 0.1), Text: #1e293b (Slate)). 
      - Keep diagrams simple, clear, and educational.

      **SPECIFIC RULES FOR NUMBER LINES / INTERVALS:**
      When drawing number lines, intervals, or segments, use these strict rules:
      - **Dimensions:** Width: 300–500 px, Height: 60–90 px.
      - **Stroke:** Thickness 2–3 px. Thin baseline (solid black or dark grey).
      - **Labels:** Place numbers above the line, small and centered (font-size 14-16).
      - **Points:** Solid small circles (6–10 px diameter). Consistent color.
      - **Arrows:** Draw a proper arrowhead at ends if infinite. Keep proportional.
      - **Spacing:** Leave small margins on left/right. Never stretch visuals unnaturally.
      - **Content:** Always include relevant numbers (0, 1, 2, etc).
      - **Code:** Output ONLY raw SVG for the image part.

      **FORMATTING RULES (STRICT):**
      1. **Math:** Use LaTeX for ALL math. Inline: $x^2$, Display: $$ \\frac{a}{b} $$.
      2. **Headings:** Use '### ' for major steps (This creates big, bold text).
      3. **Emphasis:** Use '**' for bolding important words or results.
      4. **Lists:** Use '-' or '*' for bullet points.

      **RESPONSE STRUCTURE:**
      1. **Greeting/Intro:** Friendly opening with an emoji.
      2. **### Visual:** (If applicable) The SVG diagram.
      3. **### Step-by-Step Explanation:**
         - Break down the logic.
         - **Analyze:** Explain *why* we do this.
         - **Solve:** Show the math with LaTeX.
      4. **### Final Answer:** Clearly state the result.
      5. **Challenge:** Ask a follow-up question or give a mini-task.

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

    // Using gemini-2.5-flash for faster response time while maintaining high quality for tutoring
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    // Using gemini-2.5-flash for faster visual analysis
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

              **FORMATTING RULES:**
              - Use **LaTeX** for ALL mathematical expressions ($...$ or $$...$$).
              - Use **Markdown Headers (###)** for steps.
              - Use **Bold** for emphasis.

              **სტრუქტურა:**
                 • **### რა არის სურათზე?** (მოკლე აღწერა)
                 • **### ფორმულა** (LaTeX notation)
                 • **### ამოხსნა** (ნაბიჯ-ნაბიჯ)
                 • **### პასუხი**
              
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
      1. **### ახალი ამოცანა**: State a similar problem with different numbers. Use LaTeX ($...$).
      2. **მინიშნება**: A small hint.
      3. **სწორი პასუხი**: Provide the answer hidden or at the end.
      
      Use Markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    // Using gemini-2.5-flash for rapid quiz generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    // Keep gemini-3-pro-preview for Exams to ensure complexity and quality
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
      - Use **LaTeX** for math notation in feedback.
      
      Output JSON ONLY:
      {
        "score": number,
        "feedback": "Short feedback in Georgian"
      }
    `;

    // Keep gemini-3-pro-preview for Grading to ensure fairness and reasoning depth
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
      1. **Completeness:** DRAW EVERYTHING described.
      2. **Coordinates:** 800x600 canvas. SAFE ZONE: X[50-750], Y[50-550].
      3. **Labeling:** Label all vertices.
      
      **TEXT RULES:**
      - Use **LaTeX** for math in explanation and steps (e.g. $\\angle ABC = 90^\\circ$).
      
      JSON Structure:
      {
        "shapes": [ ... ],
        "steps": ["Step 1 with $LaTeX$...", "Step 2..."],
        "explanation": "Brief explanation with $LaTeX$."
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

    // Using gemini-2.5-flash for faster geometry solving
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

// --- Function Machine Service ---
export const processFunctionStepByStep = async (func: string, val: string): Promise<{result: string, steps: string[]}> => {
  const ai = getAiClient();
  if (!ai) return { result: "Error", steps: [] };

  try {
    const prompt = `
      Evaluate the function "${func}" for x = ${val}.
      
      Provide a step-by-step breakdown.
      Language: Georgian.
      
      **FORMATTING RULES:**
      - Use **LaTeX** for math expressions.
      
      Output JSON ONLY:
      {
        "result": "Final Answer (string with LaTeX if needed)",
        "steps": ["Step 1 with $LaTeX$", "Step 2..."]
      }
    `;

    // Using gemini-2.5-flash for immediate step-by-step output
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
      contents: scriptPrompt
    });
    const scriptText = scriptResponse.text || "Script generation failed.";

    // 2. Generate Audio from Script
    const audioResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
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
      model: 'veo-3.1-fast-generate-preview',
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