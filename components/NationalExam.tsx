
import React, { useState, useEffect } from 'react';
import { 
  Clock, AlertCircle, ChevronLeft, ChevronRight, 
  CheckCircle2, FileText, Loader2, Trophy, XCircle, Play
} from 'lucide-react';
import { generateMockExam, gradeOpenEndedQuestion } from '../services/geminiService';
import { ExamQuestion, ExamResult } from '../types';

export const NationalExam: React.FC = () => {
  // States
  const [gameState, setGameState] = useState<'intro' | 'loading' | 'active' | 'submitting' | 'results'>('intro');
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
    try {
      const qs = await generateMockExam();
      if (qs && qs.length > 0) {
        setQuestions(qs);
        setGameState('active');
        setTimeLeft(180 * 60);
        setUserAnswers({});
        setCurrentQIndex(0);
      } else {
        setGameState('intro');
        alert("გამოცდის გენერირება ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან.");
      }
    } catch (e) {
      console.error(e);
      setGameState('intro');
      alert("შეცდომა კავშირისას.");
    }
  };

  // Navigation & Input Handlers
  const handleAnswerChange = (val: string) => {
    if (questions[currentQIndex]) {
      setUserAnswers(prev => ({ ...prev, [questions[currentQIndex].id]: val }));
    }
  };

  const navigate = (idx: number) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentQIndex(idx);
    }
  };

  // Submission & Grading
  const handleSubmitExam = async () => {
    // Prevent double submission
    if (gameState === 'submitting' || gameState === 'results') return;
    
    if (gameState === 'active' && timeLeft > 0) {
      if (!window.confirm("დარწმუნებული ხართ რომ გსურთ გამოცდის დასრულება?")) return;
    }

    setGameState('submitting');
    
    try {
      let totalScore = 0;
      let maxScore = 0;
      const details: any[] = [];

      // Separate questions by type to optimize grading
      const mcQuestions = questions.filter(q => q.type === 'mc');
      const openQuestions = questions.filter(q => q.type === 'open');

      // 1. Grade MCs locally (Instant)
      mcQuestions.forEach(q => {
        maxScore += q.points;
        const answer = userAnswers[q.id] || "";
        let score = 0;
        let feedback = "";

        // Check if answer matches correct answer index
        if (answer === String(q.correctAnswer)) {
          score = q.points;
          feedback = "სწორია";
        } else {
          const correctOpt = q.options ? q.options[parseInt(String(q.correctAnswer))] : '?';
          feedback = `არასწორია. სწორი პასუხი: ${correctOpt}`;
        }
        totalScore += score;
        details.push({ questionId: q.id, userAnswer: answer, score, maxPoints: q.points, feedback });
      });

      // 2. Grade Open questions via AI (Parallel)
      const openGradingPromises = openQuestions.map(async (q) => {
        maxScore += q.points;
        const answer = userAnswers[q.id] || "";
        let score = 0;
        let feedback = "";

        if (answer.trim().length > 0) {
           try {
             const grade = await gradeOpenEndedQuestion(q.text, q.rubric || "Correct math logic", answer, q.points);
             score = grade.score;
             feedback = grade.feedback;
           } catch (error) {
             console.error("Error grading question", q.id, error);
             score = 0;
             feedback = "შეფასების შეცდომა (AI)";
           }
        } else {
           score = 0;
           feedback = "პასუხი გაცემული არ არის";
        }
        
        return { questionId: q.id, userAnswer: answer, score, maxPoints: q.points, feedback };
      });

      const openResults = await Promise.all(openGradingPromises);
      
      // Combine results
      openResults.forEach(r => {
        totalScore += r.score;
        details.push(r);
      });

      // Sort details by question ID to match display order
      details.sort((a, b) => {
        const idxA = questions.findIndex(q => q.id === a.questionId);
        const idxB = questions.findIndex(q => q.id === b.questionId);
        return idxA - idxB;
      });

      setResult({ totalScore, maxScore, details });
      setGameState('results');

    } catch (error) {
      console.error("Exam submission failed", error);
      alert("დაფიქსირდა შეცდომა შედეგების დათვლისას. გთხოვთ სცადოთ თავიდან.");
      setGameState('active');
    }
  };

  // --- RENDERS ---

  if (gameState === 'intro') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-fadeIn text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 max-w-2xl w-full">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
             <FileText size={48} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">ეროვნული გამოცდების სიმულაცია</h1>
          <div className="text-slate-700 text-lg space-y-4 mb-8 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
             <p>🎓 <strong>ფორმატი:</strong> NAEC-ის სტილის მათემატიკის გამოცდა.</p>
             <p>⏱️ <strong>დრო:</strong> 3 საათი (180 წუთი).</p>
             <p>📝 <strong>სტრუქტურა:</strong> 
               <ul className="list-disc pl-5 mt-1 space-y-1">
                 <li>35 ტესტური დავალება (1 ქულა).</li>
                 <li>5 ღია დავალება (3-4 ქულა).</li>
                 <li>სულ 40 საკითხი.</li>
               </ul>
             </p>
             <p className="text-sm text-slate-500 mt-4 italic border-t border-slate-200 pt-3">
               * სისტემა ავტომატურად აგენერებს ვარიანტს AI-ს დახმარებით. ღია კითხვები სწორდება ხელოვნური ინტელექტის მიერ.
             </p>
          </div>
          <button 
            type="button"
            onClick={startExam}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Play size={24} fill="currentColor" />
            გამოცდის დაწყება
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fadeIn gap-6">
         <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
         </div>
         <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">საგამოცდო ვარიანტი მზადდება...</h2>
            <p className="text-slate-500 mt-2">იქმნება 40 უნიკალური საკითხი</p>
         </div>
      </div>
    );
  }

  if (gameState === 'submitting') {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fadeIn gap-6">
         <div className="relative">
            <div className="w-20 h-20 border-4 border-green-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            </div>
         </div>
         <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">ნაშრომი სწორდება...</h2>
            <p className="text-slate-500 mt-2">AI ამოწმებს ღია დავალებებს და ითვლის ქულებს</p>
         </div>
      </div>
    );
  }

  if (gameState === 'results' && result) {
     const score = result.totalScore;
     // Pass threshold logic
     const PASS_THRESHOLD = 11;
     const isPassed = score > PASS_THRESHOLD; // Strictly greater than 11 based on prompt "zghvari aris 11" (usually implies > 11 or >= 11, NAEC is > 15 usually, let's assume >= 11 for safety or > 11. Let's stick to >= 11)
     const passStatus = score >= PASS_THRESHOLD;
     
     const timeTaken = (180 * 60) - timeLeft;

     // Calculate stats
     const correctCount = result.details.filter(d => d.score === d.maxPoints).length;
     const wrongCount = result.details.filter(d => d.score === 0).length;
     const partialCount = result.details.filter(d => d.score > 0 && d.score < d.maxPoints).length;

     return (
       <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fadeIn pb-20 font-sans">
         <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 mb-8 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-3 ${passStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
               <div className="bg-slate-100 px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-slate-600 font-bold">
                  <Clock size={20} />
                  {formatTime(timeTaken)}
               </div>
               <div className={`px-6 py-2 rounded-xl font-bold uppercase tracking-wider shadow-sm ${passStatus ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                  {passStatus ? 'ბარიერი გადალახულია' : 'ბარიერი ვერ გადაილახა'}
               </div>
            </div>

            <div className="mb-2">
               <h2 className="text-3xl font-bold text-slate-900">გამოცდის შედეგები</h2>
               <p className="text-slate-500 mt-1">მინიმალური გამსვლელი ქულა: <span className="font-bold text-slate-700">11</span></p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-8">
               <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="text-4xl font-bold text-indigo-600">{result.totalScore}</div>
                  <div className="text-xs text-indigo-400 font-bold uppercase mt-1">ჯამური ქულა</div>
               </div>
               <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                  <div className="text-4xl font-bold text-green-600">{correctCount}</div>
                  <div className="text-xs text-green-500 font-bold uppercase mt-1">სწორი</div>
               </div>
               <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
                  <div className="text-4xl font-bold text-yellow-600">{partialCount}</div>
                  <div className="text-xs text-yellow-600 font-bold uppercase mt-1">ნაწილობრივ</div>
               </div>
               <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                  <div className="text-4xl font-bold text-red-600">{wrongCount}</div>
                  <div className="text-xs text-red-400 font-bold uppercase mt-1">არასწორი</div>
               </div>
            </div>

            <div className="flex flex-col gap-2 max-w-lg mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>პროგრესი</span>
                  <span>{result.totalScore} / {result.maxScore} ({Math.round(result.totalScore/result.maxScore*100)}%)</span>
               </div>
               <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                     className={`h-full transition-all duration-1000 ease-out ${passStatus ? 'bg-green-500' : 'bg-red-500'}`} 
                     style={{ width: `${(result.totalScore / result.maxScore) * 100}%` }}
                  ></div>
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="font-bold text-xl text-slate-800 ml-2 flex items-center gap-2 mb-6">
               <FileText size={24} className="text-indigo-600" />
               დეტალური გარჩევა
            </h3>
            {questions.map((q, idx) => {
               const det = result.details.find(d => d.questionId === q.id);
               if (!det) return null;
               const isFullScore = det.score === det.maxPoints;
               const isZero = det.score === 0;
               
               return (
                 <div key={q.id} className={`p-6 rounded-2xl border transition-all ${isFullScore ? 'bg-white border-green-200 shadow-sm' : isZero ? 'bg-white border-red-200 shadow-sm' : 'bg-white border-yellow-200 shadow-sm'}`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 border-b border-slate-100 pb-3 gap-2">
                       <span className="font-bold text-slate-500 flex items-center gap-2">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 text-sm">#{idx + 1}</span>
                          <span className="text-xs uppercase tracking-wide">({q.points} ქულა)</span>
                       </span>
                       <span className={`font-bold flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${isFullScore ? 'bg-green-50 text-green-700' : isZero ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {isFullScore ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                          მიღებული: {det.score} ქულა
                       </span>
                    </div>
                    
                    <p className="text-slate-800 font-medium mb-6 text-lg leading-relaxed">{q.text}</p>
                    
                    <div className="bg-slate-50 p-5 rounded-xl text-sm border border-slate-100">
                       <div className="mb-4">
                          <strong className="text-slate-400 uppercase text-xs tracking-wider block mb-2">თქვენი პასუხი:</strong>
                          <div className={`p-3 rounded-lg bg-white border border-slate-200 text-slate-800 ${q.type === 'mc' ? 'font-bold' : 'font-mono whitespace-pre-wrap'}`}>
                             {q.type === 'mc' 
                               ? (q.options ? q.options[parseInt(det.userAnswer)] || <span className="text-red-400 italic">პასუხი არ არის</span> : '-') 
                               : det.userAnswer || <span className="text-red-400 italic">პასუხი არ არის</span>}
                          </div>
                       </div>
                       
                       {!isFullScore && (
                          <div className="pt-3 border-t border-slate-200">
                             <strong className="text-slate-400 uppercase text-xs tracking-wider block mb-2">სწორი პასუხი / კომენტარი:</strong>
                             <div className="text-slate-700 bg-green-50/50 p-3 rounded-lg border border-green-100">
                                {det.feedback}
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
               );
            })}
         </div>
         
         <div className="mt-12 text-center pb-10">
            <button 
               type="button"
               onClick={() => setGameState('intro')}
               className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all"
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
    <div className="h-full flex flex-col bg-slate-50 font-sans">
       {/* Top Bar - Timer Only */}
       <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
          <div className="flex items-center gap-3 text-slate-700 font-mono font-bold text-xl bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
             <Clock size={24} className={timeLeft < 600 ? 'text-red-500 animate-pulse' : 'text-indigo-600'} />
             {formatTime(timeLeft)}
          </div>
          <div className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-widest">
            NAEC მათემატიკის სიმულაცია
          </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Grid */}
          <div className="w-20 md:w-72 bg-white border-r border-slate-200 overflow-y-auto p-4 hidden md:block custom-scrollbar">
             <h3 className="font-bold text-slate-400 text-xs uppercase mb-4 px-1">ნავიგაცია ({questions.length})</h3>
             <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                   const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                   const isActive = idx === currentQIndex;
                   return (
                     <button 
                       key={q.id}
                       type="button"
                       onClick={() => navigate(idx)}
                       className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all
                          ${isActive ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 scale-110 z-10 shadow-md' 
                            : isAnswered ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}`}
                     >
                        {idx + 1}
                     </button>
                   );
                })}
             </div>
          </div>

          {/* Question Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-12 w-full bg-slate-50/50">
             <div className="max-w-3xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
                
                <div className="mb-8 flex justify-between items-center border-b border-slate-100 pb-4">
                   <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">დავალება {currentQIndex + 1} / {questions.length}</span>
                   <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-100 shadow-sm">
                      {currentQ.points} ქულა
                   </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-10 leading-snug">
                   {currentQ.text}
                </h2>

                <div className="flex-1">
                   {currentQ.type === 'mc' && currentQ.options ? (
                      <div className="space-y-4">
                         {currentQ.options.map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAnswerChange(idx.toString())}
                              className={`w-full p-5 rounded-2xl border-2 text-left flex items-center gap-5 transition-all group
                                 ${userAnswers[currentQ.id] === idx.toString() 
                                   ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                                   : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50'}`}
                            >
                               <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                                  ${userAnswers[currentQ.id] === idx.toString() ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-300'}`}>
                                  {userAnswers[currentQ.id] === idx.toString() && <div className="w-3 h-3 bg-white rounded-full" />}
                               </div>
                               <span className={`text-lg font-medium ${userAnswers[currentQ.id] === idx.toString() ? 'text-indigo-900' : 'text-slate-700'}`}>{opt}</span>
                            </button>
                         ))}
                      </div>
                   ) : (
                      <div className="space-y-4 h-full flex flex-col">
                         <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 items-start text-amber-800 text-sm mb-2">
                            <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600" />
                            <p>ეს არის ღია დავალება. ჩაწერეთ თქვენი პასუხი და მსჯელობა ვრცლად. AI შეამოწმებს მას გამოცდის დასრულების შემდეგ.</p>
                         </div>
                         <textarea
                           value={userAnswers[currentQ.id] || ''}
                           onChange={(e) => handleAnswerChange(e.target.value)}
                           placeholder="ჩაწერეთ პასუხი..."
                           className="flex-1 w-full min-h-[200px] p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg text-slate-900 placeholder:text-slate-400 resize-y transition-shadow focus:bg-white"
                         />
                      </div>
                   )}
                </div>

                <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
                   <button 
                     type="button"
                     onClick={() => navigate(currentQIndex - 1)}
                     disabled={currentQIndex === 0}
                     className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                   >
                      <ChevronLeft size={22} /> წინა
                   </button>

                   {currentQIndex === questions.length - 1 ? (
                      <button 
                        type="button"
                        onClick={handleSubmitExam}
                        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all transform hover:scale-105"
                      >
                         დასრულება და შეფასება <CheckCircle2 size={22} />
                      </button>
                   ) : (
                      <button 
                        type="button"
                        onClick={() => navigate(currentQIndex + 1)}
                        className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all transform hover:scale-105"
                      >
                         შემდეგი <ChevronRight size={22} />
                      </button>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
