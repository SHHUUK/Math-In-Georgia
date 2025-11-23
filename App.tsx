
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, MessageCircle, Camera, Menu, X, 
  Calculator as CalculatorIcon, Layers, Triangle, Grid, Activity, 
  TrendingUp, ArrowUpRight, List, BarChart, Zap,
  Infinity as InfinityIcon, ArrowLeft, ChevronRight, Lightbulb, Brain, PenTool,
  Divide, ClipboardList, Presentation, Smartphone, FileText
} from 'lucide-react';
import { AppView, MathSubTopic } from './types';
import { mathTopics } from './data/mathContent';
import { MathCard } from './components/MathCard';
import { ChatInterface } from './components/ChatInterface';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { QuizInterface } from './components/QuizInterface';
import { Whiteboard } from './components/Whiteboard';
import { Calculator } from './components/Calculator';
import { MobileConnect } from './components/MobileConnect';
import { NationalExam } from './components/NationalExam';

const iconMap: Record<string, React.ElementType> = {
  Calculator: CalculatorIcon, Layers, Triangle, Grid, Activity,
  TrendingUp, ArrowUpRight, List, BarChart, Zap,
  BookOpen, Infinity: InfinityIcon, Divide
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SYNOPSIS);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Shared State for Mobile Connect Simulation
  const [mobileImage, setMobileImage] = useState<string | null>(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Reset selection when changing main views
  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  // Handle simulation of mobile upload
  const handleMobileScan = (imageUrl: string) => {
    setMobileImage(imageUrl);
    setCurrentView(AppView.VISION);
  };

  // Navigation helpers
  const goBackToTopics = () => {
    setSelectedTopicId(null);
    setSelectedSubTopicId(null);
  };

  const goBackToSubTopics = () => {
    setSelectedSubTopicId(null);
  };

  const renderSynopsisContent = () => {
    // LEVEL 3: Full Detail View (Specific Subtopic)
    if (selectedTopicId && selectedSubTopicId) {
      const topic = mathTopics.find(t => t.id === selectedTopicId);
      const subTopic = topic?.content.find(s => s.id === selectedSubTopicId);
      
      if (!topic || !subTopic) return null;

      return (
        <div className="animate-fadeIn pb-20 max-w-4xl mx-auto">
          {/* Navigation Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={goBackToSubTopics}
              className="p-2 md:p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{topic.title}</span>
               <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{subTopic.title}</h2>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-8">
            
            {/* Formula Hero Section */}
            {subTopic.formula && (
               <div className="bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl text-center overflow-x-auto relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 math-formula bg-white pointer-events-none"></div>
                  <pre className="font-mono text-xl md:text-3xl text-indigo-300 font-bold whitespace-pre-wrap relative z-10">
                    {subTopic.formula}
                  </pre>
                  <p className="text-slate-400 mt-4 text-sm font-mono">ძირითადი ფორმულა</p>
               </div>
            )}

            {/* Analogy Section (Feynman Style) */}
            {subTopic.realWorldAnalogy && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-400 p-6 rounded-r-xl shadow-sm">
                <div className="flex items-start gap-3">
                  <Lightbulb className="text-amber-500 shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-amber-900 mb-2">მარტივი ანალოგია</h3>
                    <p className="text-amber-800 leading-relaxed text-lg">{subTopic.realWorldAnalogy}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Deep Explanation */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4 text-indigo-700">
                <Brain size={24} />
                <h3 className="text-xl font-bold">სიღრმისეული ახსნა</h3>
              </div>
              <div className="prose prose-lg prose-slate text-slate-700 max-w-none leading-loose">
                <p className="whitespace-pre-line">{subTopic.fullExplanation || subTopic.explanation}</p>
              </div>
            </div>

            {/* Example Problem */}
            {subTopic.exampleProblem && (
              <div className="bg-indigo-50 rounded-2xl p-6 md:p-8 border border-indigo-100">
                <div className="flex items-center gap-3 mb-6 text-indigo-800">
                  <PenTool size={24} />
                  <h3 className="text-xl font-bold">პრაქტიკული მაგალითი</h3>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
                  <p className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-3">
                    ამოცანა: <span className="font-mono text-indigo-600">{subTopic.exampleProblem.problem}</span>
                  </p>
                  
                  <div className="space-y-3">
                    {subTopic.exampleProblem.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="bg-indigo-100 text-indigo-700 font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-slate-600">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-green-50 text-green-800 p-4 rounded-lg font-bold text-center border border-green-100">
                    პასუხი: {subTopic.exampleProblem.solution}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      );
    }

    // LEVEL 2: Subtopic List (Intermediate View)
    if (selectedTopicId) {
      const topic = mathTopics.find(t => t.id === selectedTopicId);
      if (!topic) return null;
      
      const Icon = iconMap[topic.icon] || BookOpen;

      return (
        <div className="animate-fadeIn pb-10 space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={goBackToTopics}
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Icon size={24} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{topic.title}</h2>
            </div>
          </div>

          <p className="text-slate-600 text-lg mb-4">აირჩიეთ კონკრეტული საკითხი დეტალური განხილვისთვის:</p>

          {/* Subtopics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {topic.content.map((subTopic) => (
              <MathCard 
                key={subTopic.id} 
                topic={subTopic} 
                onClick={() => setSelectedSubTopicId(subTopic.id)}
              />
            ))}
          </div>
        </div>
      );
    }

    // LEVEL 1: Topic Dashboard (Main View)
    return (
      <div className="space-y-8 animate-fadeIn pb-10">
         <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-8 md:p-10 rounded-3xl shadow-xl mb-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">მათემატიკის სრული კონსპექტი</h1>
              <p className="text-indigo-100 text-lg md:text-xl opacity-90 max-w-2xl">
                აირჩიეთ თემა, რათა ნახოთ დეტალური ფორმულები და განმარტებები ფეინმანის მეთოდით.
              </p>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 transform skew-x-12"></div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {mathTopics.map((topic) => {
             const Icon = iconMap[topic.icon] || BookOpen;
             const subtopicCount = topic.content.length;
             const previewText = topic.content.slice(0, 2).map(c => c.title).join(', ') + (subtopicCount > 2 ? '...' : '');

             return (
               <button
                 key={topic.id}
                 onClick={() => setSelectedTopicId(topic.id)}
                 className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 group text-left flex flex-col h-full"
               >
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                     <Icon size={28} />
                   </div>
                   <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                     {subtopicCount} საკითხი
                   </span>
                 </div>
                 
                 <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">
                   {topic.title}
                 </h3>
                 
                 <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">
                   {previewText}
                 </p>

                 <div className="flex items-center text-indigo-600 font-medium text-sm mt-auto group-hover:translate-x-1 transition-transform">
                   ნახვა
                   <ChevronRight size={16} className="ml-1" />
                 </div>
               </button>
             );
           })}
         </div>
      </div>
    );
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => handleViewChange(view)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all w-full md:w-auto ${
        currentView === view
          ? 'bg-indigo-100 text-indigo-700 font-bold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} className="shrink-0" />
      <span className="truncate text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm z-50 relative">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <BookOpen size={20} />
          </div>
          <span className="font-bold text-lg text-slate-800">MathMaster</span>
        </div>
        <button onClick={toggleMobileMenu} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar / Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="hidden md:flex items-center gap-3 mb-10 px-2">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-900">MathMaster</h1>
              <p className="text-xs text-slate-500">AI Tutor & Synopsis</p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4">მენიუ</div>
            <NavItem view={AppView.SYNOPSIS} icon={BookOpen} label="კონსპექტი" />
            <NavItem view={AppView.CHAT} icon={MessageCircle} label="AI ჩატი" />
            <NavItem view={AppView.VISION} icon={Camera} label="ვიზუალური ანალიზი" />
            <NavItem view={AppView.QUIZ} icon={ClipboardList} label="ტესტირება" />
            <NavItem view={AppView.NATIONAL_EXAM} icon={FileText} label="ეროვნული გამოცდები" />
            <NavItem view={AppView.BOARD} icon={Presentation} label="სამუშაო დაფა" />
            <NavItem view={AppView.CALCULATOR} icon={CalculatorIcon} label="კალკულატორი" />
            <NavItem view={AppView.MOBILE_CONNECT} icon={Smartphone} label="Mobile Connect" />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-slate-600">სისტემა აქტიურია</span>
              </div>
              <p className="text-[10px] text-slate-400">Powered by Google Gemini</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-64px)] md:h-screen overflow-hidden relative">
        {/* 
           Render Strategy: "KEEP-ALIVE"
           We render ALL major components simultaneously but toggle their visibility using CSS classes.
           This ensures React State (chat history, quiz progress, exam timer) is preserved when switching tabs.
        */}
        
        {/* Persistent Whiteboard (Z-Index managed) */}
        <div className={`absolute inset-0 p-4 md:p-8 ${currentView === AppView.BOARD ? 'z-10 block' : 'z-0 invisible pointer-events-none'}`}>
           <Whiteboard />
        </div>

        {/* Persistent Calculator (Z-Index managed) */}
        <div className={`absolute inset-0 p-4 md:p-8 ${currentView === AppView.CALCULATOR ? 'z-10 block' : 'z-0 invisible pointer-events-none'}`}>
           <Calculator />
        </div>

        {/* Persistent View Container for Standard Components */}
        <div className={`h-full w-full overflow-y-auto p-4 md:p-8 ${[AppView.BOARD, AppView.CALCULATOR].includes(currentView) ? 'hidden' : 'block'}`}>
          <div className="max-w-7xl mx-auto h-full flex flex-col relative">
            
            {/* Synopsis */}
            <div className={currentView === AppView.SYNOPSIS ? 'block' : 'hidden'}>
              {renderSynopsisContent()}
            </div>

            {/* Chat Interface */}
            <div className={currentView === AppView.CHAT ? 'block h-full' : 'hidden'}>
              <ChatInterface />
            </div>

            {/* Vision/Image Analyzer */}
            <div className={currentView === AppView.VISION ? 'block h-full' : 'hidden'}>
              <ImageAnalyzer />
            </div>

            {/* Quiz Interface */}
            <div className={currentView === AppView.QUIZ ? 'block h-full' : 'hidden'}>
              <QuizInterface />
            </div>

            {/* National Exam */}
            <div className={currentView === AppView.NATIONAL_EXAM ? 'block h-full' : 'hidden'}>
              <NationalExam />
            </div>

            {/* Mobile Connect */}
            <div className={currentView === AppView.MOBILE_CONNECT ? 'block h-full' : 'hidden'}>
              <MobileConnect onSimulateScan={handleMobileScan} />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
