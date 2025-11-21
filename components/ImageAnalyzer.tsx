import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle, Bot } from 'lucide-react';
import { analyzeImageWithGemini } from '../services/geminiService';

export const ImageAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !mimeType) return;

    setIsLoading(true);
    // Extract clean base64 string
    const base64Data = selectedImage.split(',')[1];
    
    const result = await analyzeImageWithGemini(base64Data, mimeType);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          ვიზუალური ანალიზი
        </h2>
        <p className="text-indigo-100 max-w-xl">
          ატვირთეთ მათემატიკური ამოცანის ან ფორმულის ფოტო. Gemini დაგეხმარებათ მის ამოხსნაში და გაანალიზებაში.
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
                  <p className="text-sm text-slate-500 mt-1">PNG, JPG</p>
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-y-auto max-h-[600px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
            ანალიზის შედეგი
          </h3>
          {analysis ? (
            <div className="prose prose-indigo max-w-none">
               <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{analysis}</p>
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