
import React, { useState, useEffect } from 'react';
import { 
  Clock, AlertCircle, ChevronLeft, ChevronRight, 
  CheckCircle2, FileText, Loader2, Send
} from 'lucide-react';
import { generateMockExam, gradeOpenEndedQuestion } from '../services/geminiService';
import { ExamQuestion, ExamResult } from '../types';

export const NationalExam: React.FC = () => {
  // States
  const [gameState, setGameState] = useState<'intro' | 'loading' | 'active' | 'grading' | 'results'>('intro');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds
  const [result, setResult] = useState<ExamResult | null>(null);
  
  // Timer Logic
  useEffect(() => {
    let timer: number;
    if (gameState === 'active' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitExam(); // Auto submit on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Data Fetching
  const startExam = async () => {
    setGameState('loading');
    const qs = await generateMockExam();
    if (qs.length > 0) {
      setQuestions(qs);
      setGameState('active');
      setTimeLeft(180 * 60);
      setUserAnswers({});
    } else {
      setGameState('intro'); // Fallback if error
      alert("გამოცდის გენერირება ვერ მოხერხდა. სცადეთ თავიდან.");
    }
  };

  // Navigation & Input Handlers
  const handleAnswerChange = (val: string) => {
    setUserAnswers(prev => ({ ...prev, [questions[currentQIndex].id]: val }));
  };

  const navigate = (idx: number) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentQIndex(idx);
    }
  };

  // Submission & Grading
  const handleSubmitExam = async () => {
    if (gameState !== 'active') return;
    if (!window.confirm("დარწმუნებული ხართ რომ გსურთ გამოცდის დასრულება?")) return;

    setGameState('grading');
    
    let totalScore = 0;
    let maxScore = 0;
    const details = [];

    // 1. Grade MCs locally
    for (const q of questions) {
      maxScore += q.points;
      const answer = userAnswers[q.id] || "";
      let score = 0;
      let feedback = "";

      if (q.type === 'mc') {
        // Note: userAnswers store value "0", "1", etc as string index
        if (answer === String(q.correctAnswer)) {
          score = q.points;
          feedback = "სწორია";
        } else {
          feedback = `არასწორია. სწორი პასუხი: ${q.options?.[parseInt(q.correctAnswer!)]}`;
        }
        totalScore += score;
        details.push({ questionId: q.id, userAnswer: answer, score, maxPoints: q.points, feedback });
      } 
      else if (q.type === 'open') {
        // 2. Grade Open questions via AI
        if (answer.trim().length > 0) {
           const grade = await gradeOpenEndedQuestion(q.text, q.rubric || "Correct math logic", answer, q.points);
           score = grade.score;
           feedback = grade.feedback;
        } else {
           score = 0;
           feedback = "პასუხი გაცემული არ არის";
        }
        totalScore += score;
        details.push({ questionId: q.id, userAnswer: answer, score, maxPoints: q.points, feedback });
      }
    }

    setResult({ totalScore, maxScore, details });
    setGameState('results');
  };

  // --- RENDERS ---

  if (gameState === 'intro') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-fadeIn text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 max-w-2xl w-full">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <FileText size={48} className="text-slate-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">ეროვნული გამოცდების სიმულაცია</h1>
          <div className="text-slate-600 text-lg space-y-4 mb-8 text-left bg-slate-50 p-6 rounded-2xl">
             <p>🎓 <strong>ფორმატი:</strong> NAEC-ის სტილის მათემატიკის გამოცდა.</p>
             <p>⏱️ <strong>დრო:</strong> 3 საათი (180 წუთი).</p>
             <p>📝 <strong>სტრუქტურა:</strong> 
               <ul className="list-disc pl-5 mt-1">
                 <li>ტესტური დავალებები (1 ქულა) - 4 სავარაუდო პასუხი.</li>
                 <li>ღია დავალებები (3-4 ქულა) - საჭიროებს წერილობით პასუხს.</li>
               </ul>
             </p>
             <p className="text-sm text-slate-400 mt-4 italic">* შენიშვნა: სისტემა ავტომატურად აგენერებს ვარიანტს ხელოვნური ინტელექტის დახმარებით.</p>
          </div>
          <button 
            onClick={startExam}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]"
          >
            გამოცდის დაწყება
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fadeIn gap-4">
         <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
         <h2 className="text-xl font-bold text-slate-700">საგამოცდო ვარიანტი მზადდება...</h2>
         <p className="text-slate-400">გთხოვთ დაელოდოთ</p>
      </div>
    );
  }

  if (gameState === 'grading') {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fadeIn gap-4">
         <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
         <h2 className="text-xl font-bold text-slate-700">ნაშრომი სწორდება...</h2>
         <p className="text-slate-400">AI ამოწმებს ღია დავალებებს</p>
      </div>
    );
  }

  if (gameState === 'results' && result) {
     const percentage = Math.round((result.totalScore / result.maxScore) * 100);
     return (
       <div className="max-w-4xl mx-auto p-6 animate-fadeIn pb-20">
         <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">გამოცდა დასრულებულია</h2>
            <div className="flex justify-center gap-8 mt-6">
               <div>
                 <div className="text-5xl font-bold text-indigo-600">{result.totalScore}</div>
                 <div className="text-sm text-slate-400 font-bold uppercase mt-1">მიღებული ქულა</div>
               </div>
               <div className="w-px bg-slate-200"></div>
               <div>
                 <div className="text-5xl font-bold text-slate-400">{result.maxScore}</div>
                 <div className="text-sm text-slate-400 font-bold uppercase mt-1">მაქსიმალური</div>
               </div>
            </div>
            <div className={`mt-4 inline-block px-4 py-1 rounded-full text-sm font-bold ${percentage >= 51 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {percentage >= 51 ? 'ბარიერი გადალახულია' : 'ბარიერი ვერ გადაილახა'} ({percentage}%)
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="font-bold text-xl text-slate-800 ml-2">დეტალური ანალიზი</h3>
            {questions.map((q, idx) => {
               const det = result.details.find(d => d.questionId === q.id);
               if (!det) return null;
               const isFullScore = det.score === det.maxPoints;
               
               return (
                 <div key={q.id} className={`p-6 rounded-2xl border ${isFullScore ? 'bg-white border-slate-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between mb-2">
                       <span className="font-bold text-slate-500">დავალება #{idx + 1} ({q.points} ქულა)</span>
                       <span className={`font-bold ${isFullScore ? 'text-green-600' : 'text-red-600'}`}>{det.score} ქულა</span>
                    </div>
                    <p className="text-slate-800 font-medium mb-3">{q.text}</p>
                    
                    <div className="text-sm text-slate-600 mb-2">
                       <strong>თქვენი პასუხი: </strong> 
                       {q.type === 'mc' 
                         ? (q.options ? q.options[parseInt(det.userAnswer)] : '-') 
                         : det.userAnswer}
                    </div>
                    
                    {!isFullScore && (
                       <div className="bg-white/50 p-3 rounded-lg text-sm text-slate-700 border border-slate-200 mt-2">
                          <strong>Feedback:</strong> {det.feedback}
                       </div>
                    )}
                 </div>
               );
            })}
         </div>
         
         <div className="mt-8 text-center">
            <button 
               onClick={() => setGameState('intro')}
               className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
            >
               მთავარზე დაბრუნება
            </button>
         </div>
       </div>
     );
  }

  // ACTIVE EXAM RENDER
  const currentQ = questions[currentQIndex];

  return (
    <div className="h-full flex flex-col bg-slate-50">
       {/* Top Bar */}
       <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-2 text-slate-700 font-mono font-bold text-xl">
             <Clock size={24} className={timeLeft < 600 ? 'text-red-500 animate-pulse' : 'text-indigo-600'} />
             {formatTime(timeLeft)}
          </div>
          <button 
            onClick={handleSubmitExam}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all"
          >
             დასრულება
          </button>
       </div>

       <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Grid */}
          <div className="w-20 md:w-64 bg-white border-r border-slate-200 overflow-y-auto p-4 hidden md:block">
             <h3 className="font-bold text-slate-400 text-xs uppercase mb-4">ნავიგაცია</h3>
             <div className="grid grid-cols-4 gap-2">
                {questions.map((q, idx) => {
                   const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                   const isActive = idx === currentQIndex;
                   return (
                     <button 
                       key={q.id}
                       onClick={() => navigate(idx)}
                       className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all
                          ${isActive ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' 
                            : isAnswered ? 'bg-indigo-100 text-indigo-700' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                     >
                        {idx + 1}
                     </button>
                   );
                })}
             </div>
          </div>

          {/* Question Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
             <div className="mb-6 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">დავალება {currentQIndex + 1} / {questions.length}</span>
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                   {currentQ.points} ქულა
                </span>
             </div>

             <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-relaxed">
                {currentQ.text}
             </h2>

             {currentQ.type === 'mc' && currentQ.options ? (
                <div className="space-y-4">
                   {currentQ.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerChange(idx.toString())}
                        className={`w-full p-5 rounded-xl border-2 text-left flex items-center gap-4 transition-all
                           ${userAnswers[currentQ.id] === idx.toString() 
                             ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                             : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                      >
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                            ${userAnswers[currentQ.id] === idx.toString() ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                            {userAnswers[currentQ.id] === idx.toString() && <div className="w-2 h-2 bg-white rounded-full" />}
                         </div>
                         <span className="text-lg text-slate-700 font-medium">{opt}</span>
                      </button>
                   ))}
                </div>
             ) : (
                <div className="space-y-4">
                   <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start text-amber-800 text-sm mb-4">
                      <AlertCircle size={20} className="shrink-0 mt-0.5" />
                      <p>ეს არის ღია დავალება. ჩაწერეთ თქვენი პასუხი და მსჯელობა. AI შეამოწმებს მას გამოცდის დასრულების შემდეგ.</p>
                   </div>
                   <textarea
                     value={userAnswers[currentQ.id] || ''}
                     onChange={(e) => handleAnswerChange(e.target.value)}
                     placeholder="ჩაწერეთ პასუხი..."
                     className="w-full h-48 p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                   />
                </div>
             )}

             <div className="mt-10 flex justify-between pt-6 border-t border-slate-100">
                <button 
                  onClick={() => navigate(currentQIndex - 1)}
                  disabled={currentQIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                >
                   <ChevronLeft size={20} /> წინა
                </button>
                <button 
                  onClick={() => navigate(currentQIndex + 1)}
                  disabled={currentQIndex === questions.length - 1}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md disabled:opacity-30 disabled:bg-slate-300"
                >
                   შემდეგი <ChevronRight size={20} />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};
