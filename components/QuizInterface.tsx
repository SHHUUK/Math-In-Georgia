import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, XCircle, Loader2, ArrowRight, RotateCcw, Trophy, History, Clock, Lightbulb, Star, PlusCircle } from 'lucide-react';
import { mathTopics } from '../data/mathContent';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion, QuizResult } from '../types';
import { MathRenderer } from './MathRenderer';

export const QuizInterface: React.FC = () => {
  const [viewMode, setViewMode] = useState<'topic_select' | 'quiz' | 'results' | 'history'>('topic_select');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('mathmaster_quiz_history');
    if (savedHistory) {
      try {
        setQuizHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    if (quizHistory.length > 0) {
      localStorage.setItem('mathmaster_quiz_history', JSON.stringify(quizHistory));
    }
  }, [quizHistory]);

  const startQuiz = async (topicId: string, topicTitle: string) => {
    setActiveTopic(topicTitle);
    setLoading(true);
    setViewMode('quiz');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setShowHint(false);

    const generatedQuestions = await generateQuiz(topicTitle);
    setQuestions(generatedQuestions);
    setLoading(false);
  };

  const loadMoreQuestions = async () => {
    if (!activeTopic) return;
    setLoadingMore(true);
    const newQuestions = await generateQuiz(activeTopic);
    setQuestions(prev => [...prev, ...newQuestions]);
    setCurrentQuestionIndex(questions.length);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setShowHint(false);
    setViewMode('quiz');
    setLoadingMore(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(index);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerChecked(true);
    setShowHint(false);
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setShowHint(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setViewMode('results');
    const newResult: QuizResult = {
      id: Date.now().toString(),
      topic: activeTopic || 'Unknown',
      score: score, 
      total: questions.length,
      date: new Date().toLocaleString('ka-GE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    setQuizHistory(prev => [newResult, ...prev]);
  };

  const resetQuiz = () => {
    setViewMode('topic_select');
    setActiveTopic(null);
    setQuestions([]);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setShowHint(false);
  };

  const getBestScoreForTopic = (topicTitle: string) => {
    const attempts = quizHistory.filter(h => h.topic === topicTitle);
    if (attempts.length === 0) return null;
    return attempts.reduce((best, current) => {
      const currentPct = current.score / current.total;
      const bestPct = best.score / best.total;
      return currentPct > bestPct ? current : best;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fadeIn">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-100 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-700">ტესტი მზადდება...</h3>
        <p className="text-slate-500">Gemini ადგენს კითხვებს თემაზე: {activeTopic}</p>
      </div>
    );
  }

  if (viewMode === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto animate-fadeIn text-center p-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-slate-200 w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={48} className="text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">შედეგი</h2>
          <p className="text-slate-500 mb-8">თქვენ დაასრულეთ ტესტი თემაზე: {activeTopic}</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-indigo-50 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-indigo-600">{score} / {questions.length}</div>
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-1">სწორი პასუხი</div>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-green-600">{percentage}%</div>
              <div className="text-xs text-green-400 font-semibold uppercase tracking-wider mt-1">ეფექტურობა</div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
             <button onClick={loadMoreQuestions} disabled={loadingMore} className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-2">
                {loadingMore ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />} კიდევ 5 კითხვის დამატება
             </button>
             <div className="flex gap-3">
               <button onClick={() => setViewMode('history')} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">ისტორია</button>
               <button onClick={resetQuiz} className="flex-[2] flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"><RotateCcw size={20} /> სხვა ტესტის გავლა</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'quiz' && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto h-full flex flex-col animate-fadeIn p-4">
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">კითხვა {currentQuestionIndex + 1} / {questions.length}</span>
            <span className="text-xs text-slate-400 font-mono">{activeTopic}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto pb-4 custom-scrollbar">
          <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-4 leading-snug">
            <MathRenderer text={currentQ.question} />
          </h2>

          <div className="mb-6 min-h-[40px]">
            {!isAnswerChecked && currentQ.hint && (
              <div className="flex items-center">
                {!showHint ? (
                  <button onClick={() => setShowHint(true)} className="flex items-center gap-2 text-amber-600 text-sm font-bold bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                    <Lightbulb size={16} /> მინიშნება (HINT)
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 animate-fadeIn">
                    <Lightbulb size={16} className="shrink-0" />
                    <span><MathRenderer text={currentQ.hint} /></span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQ.correctAnswerIndex;
              let borderClass = "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
              let bgClass = "bg-white";
              let icon = null;

              if (isSelected) {
                borderClass = "border-indigo-500 ring-2 ring-indigo-500/20";
                bgClass = "bg-indigo-50";
              }

              if (isAnswerChecked) {
                if (isCorrect) {
                  borderClass = "border-green-500 bg-green-50";
                  icon = <CheckCircle2 className="text-green-600" size={20} />;
                } else if (isSelected) {
                  borderClass = "border-red-500 bg-red-50";
                  icon = <XCircle className="text-red-600" size={20} />;
                } else {
                  borderClass = "border-slate-100 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={isAnswerChecked}
                  className={`w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200 flex justify-between items-center group ${borderClass} ${bgClass}`}
                >
                  <span className={`text-lg font-medium ${isAnswerChecked && isCorrect ? 'text-green-800' : 'text-slate-700'}`}>
                    <MathRenderer text={option} />
                  </span>
                  {icon}
                </button>
              );
            })}
          </div>

          {isAnswerChecked && (
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-6 animate-fadeIn">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <div className="bg-indigo-100 p-1 rounded-md text-indigo-600"><ClipboardList size={16} /></div> განმარტება
              </h4>
              <div className="text-slate-600 leading-relaxed">
                <MathRenderer text={currentQ.explanation} />
              </div>
            </div>
          )}

          <div className="mt-auto pt-4">
            {!isAnswerChecked ? (
              <button
                onClick={checkAnswer}
                disabled={selectedAnswer === null}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99]"
              >
                შემოწმება
              </button>
            ) : (
              <button onClick={nextQuestion} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                {currentQuestionIndex < questions.length - 1 ? 'შემდეგი კითხვა' : 'შედეგის ნახვა'} <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'history') {
    return (
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto p-4">
         <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><History className="text-indigo-600" /> ტესტირების ისტორია</h2>
            <button onClick={() => setViewMode('topic_select')} className="text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors">უკან დაბრუნება</button>
         </div>
         {quizHistory.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><History size={32} /></div>
               <h3 className="text-xl font-bold text-slate-700 mb-2">ისტორია ცარიელია</h3>
               <p className="text-slate-500">ჯერ არ გაგივლიათ არცერთი ტესტი.</p>
            </div>
         ) : (
            <div className="grid gap-4">
               {quizHistory.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                     <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-lg text-slate-800">{item.topic}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500"><Clock size={14} /> {item.date}</div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="text-right">
                           <span className="block text-2xl font-bold text-indigo-600">{item.score}/{item.total}</span>
                           <span className="text-xs text-slate-400 font-bold uppercase">ქულა</span>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${(item.score / item.total) >= 0.8 ? 'bg-green-500' : (item.score / item.total) >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                           {Math.round((item.score / item.total) * 100)}%
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn p-4">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
         <div className="relative z-10 flex justify-between items-center">
           <div>
             <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><ClipboardList size={32} /> ცოდნის შემოწმება</h1>
             <p className="text-violet-100 max-w-xl text-lg">აირჩიეთ თემა და გაიარეთ AI-ს მიერ შედგენილი ტესტი.</p>
           </div>
           {quizHistory.length > 0 && (
              <button onClick={() => setViewMode('history')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all font-bold shadow-lg">
                 <History size={18} /> ისტორია
              </button>
           )}
         </div>
      </div>
      {quizHistory.length > 0 && (
         <button onClick={() => setViewMode('history')} className="md:hidden w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2">
            <History size={18} /> ნახე ტესტების ისტორია
         </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mathTopics.map((topic) => {
          const best = getBestScoreForTopic(topic.title);
          return (
            <button key={topic.id} onClick={() => startQuiz(topic.id, topic.title)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 hover:-translate-y-1 transition-all duration-300 text-left group relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                   <h3 className="text-lg font-bold text-slate-800 group-hover:text-violet-700 transition-colors mb-1">{topic.title}</h3>
                   {best && <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-md text-xs font-bold border border-green-100"><Star size={12} fill="currentColor" /> {best.score}/{best.total}</div>}
                </div>
                <p className="text-sm text-slate-500">5 კითხვა • AI გენერაცია</p>
              </div>
              {best && <div className="absolute bottom-0 left-0 h-1 bg-green-500" style={{ width: `${(best.score/best.total)*100}%` }}></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};