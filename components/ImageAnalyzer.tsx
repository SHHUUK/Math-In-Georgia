
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle, Bot, RefreshCcw, Lightbulb } from 'lucide-react';
import { analyzeImageWithGemini, generateSimilarProblem } from '../services/geminiService';

export const ImageAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [practiceProblem, setPracticeProblem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste Event Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Check if clipboard has items
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          // Find image item
          if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault(); // Prevent default paste behavior
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                setSelectedImage(result);
                setMimeType(blob.type);
                setAnalysis(null); // Reset previous analysis
                setPracticeProblem(null);
              };
              reader.readAsDataURL(blob);
            }
            break; // Only handle the first image found
          }
        }
      }
    };

    // Attach event listener to document to catch paste anywhere in the component
    document.addEventListener('paste', handlePaste);
    
    // Cleanup
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Split to get raw base64 for API and full data URI for display
        const base64Data = result.split(',')[1];
        setSelectedImage(result);
        setMimeType(file.type);
        setAnalysis(null);
        setPracticeProblem(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setPracticeProblem(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !mimeType) return;

    setIsLoading(true);
    setPracticeProblem(null);
    // Extract clean base64 string
    const base64Data = selectedImage.split(',')[1];
    
    const result = await analyzeImageWithGemini(base64Data, mimeType);
    setAnalysis(result);
    setIsLoading(false);
  };

  const handleGeneratePractice = async () => {
    if (!analysis) return;
    setIsGeneratingPractice(true);
    const problem = await generateSimilarProblem(analysis);
    setPracticeProblem(problem);
    setIsGeneratingPractice(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          ვიზუალური ანალიზი
        </h2>
        <p className="text-indigo-100 max-w-xl">
          ატვირთეთ ან <strong>ჩააკოპირეთ (Ctrl+V)</strong> მათემატიკური ამოცანის ფოტო. Gemini აგიხსნით მას მარტივად.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Upload Section */}
        <div className="flex flex-col gap-4">
          <div 
            className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 ${
              selectedImage 
                ? 'border-indigo-300 bg-indigo-50' 
                : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {selectedImage ? (
              <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                <img 
                  src={selectedImage} 
                  alt="Uploaded problem" 
                  className="max-w-full max-h-[400px] rounded-lg shadow-md object-contain"
                />
                <button 
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-700">ატვირთეთ ფოტო</p>
                  <p className="text-sm text-slate-500 mt-1">PNG, JPG ან Paste (Ctrl+V)</p>
                </div>
                <button 
                  onClick={triggerUpload}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  ფაილის არჩევა
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                ანალიზი მიმდინარეობს...
              </>
            ) : (
              <>
                <CheckCircle />
                გაანალიზება
              </>
            )}
          </button>
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-y-auto max-h-[600px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
            ანალიზის შედეგი
          </h3>
          
          {analysis ? (
            <div className="space-y-6">
               <div className="prose prose-indigo max-w-none">
                 <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{analysis}</p>
               </div>

               {/* Practice Generator Feature */}
               <div className="mt-6 border-t border-slate-100 pt-6">
                  {!practiceProblem ? (
                    <button 
                      onClick={handleGeneratePractice}
                      disabled={isGeneratingPractice}
                      className="w-full py-3 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                       {isGeneratingPractice ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
                       მსგავსი მაგალითის გენერირება (სავარჯიშო)
                    </button>
                  ) : (
                    <div className="bg-green-50 p-5 rounded-xl border border-green-200 animate-in fade-in slide-in-from-bottom-4">
                       <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                          <Lightbulb size={20} />
                          ივარჯიშე:
                       </h4>
                       <p className="whitespace-pre-wrap text-green-900 font-medium">{practiceProblem}</p>
                    </div>
                  )}
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 min-h-[200px]">
              <Bot size={48} className="opacity-20" />
              <p>შედეგი გამოჩნდება აქ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
