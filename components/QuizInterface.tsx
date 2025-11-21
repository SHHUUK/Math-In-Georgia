
import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, XCircle, Loader2, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { mathTopics } from '../data/mathContent';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';

export const QuizInterface: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const startQuiz = async (topicId: string, topicTitle: string) => {
    setActiveTopic(topicTitle);
    setLoading(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);

    const generatedQuestions = await generateQuiz(topicTitle);
    setQuestions(generatedQuestions);
    setLoading(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(index);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswerChecked(true);
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setActiveTopic(null);
    setQuestions([]);
    setShowResults(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
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

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto animate-fadeIn text-center">
        <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-200 w-full">
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

          <button 
            onClick={resetQuiz}
            className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
          >
            <RotateCcw size={20} />
            სხვა ტესტის გავლა
          </button>
        </div>
      </div>
    );
  }

  if (questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto h-full flex flex-col animate-fadeIn">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">კითხვა {currentQuestionIndex + 1} / {questions.length}</span>
            <span className="text-xs text-slate-400 font-mono">{activeTopic}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 leading-snug">
            {currentQ.question}
          </h2>

          <div className="space-y-4 mb-8">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQ.correctAnswerIndex;
              const showCorrect = isAnswerChecked && isCorrect;
              const showWrong = isAnswerChecked && isSelected && !isCorrect;

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
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex justify-between items-center group ${borderClass} ${bgClass}`}
                >
                  <span className={`text-lg font-medium ${isAnswerChecked && isCorrect ? 'text-green-800' : 'text-slate-700'}`}>
                    {option}
                  </span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Feedback Section */}
          {isAnswerChecked && (
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-6 animate-fadeIn">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <div className="bg-indigo-100 p-1 rounded-md text-indigo-600">
                  <ClipboardList size={16} />
                </div>
                განმარტება
              </h4>
              <p className="text-slate-600 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Actions */}
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
              <button
                onClick={nextQuestion}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {currentQuestionIndex < questions.length - 1 ? 'შემდეგი კითხვა' : 'შედეგის ნახვა'}
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Topic Selection View
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
         <div className="relative z-10">
           <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
             <ClipboardList size={32} />
             ცოდნის შემოწმება
           </h1>
           <p className="text-violet-100 max-w-xl text-lg">
             აირჩიეთ თემა და გაიარეთ AI-ს მიერ შედგენილი ტესტი თქვენი ცოდნის გასამყარებლად.
           </p>
         </div>
         <div className="absolute right-0 bottom-0 text-white/10 transform translate-x-1/4 translate-y-1/4">
            <ClipboardList size={200} />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mathTopics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => startQuiz(topic.id, topic.title)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 hover:-translate-y-1 transition-all duration-300 text-left group"
          >
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-violet-700 transition-colors mb-1">
              {topic.title}
            </h3>
            <p className="text-sm text-slate-500">
              5 კითხვა
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
