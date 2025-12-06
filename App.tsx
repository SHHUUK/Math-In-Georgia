import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, MessageCircle, Camera, Menu, X, 
  Calculator as CalculatorIcon, Layers, Triangle, Grid, Activity, 
  TrendingUp, ArrowUpRight, List, BarChart, Zap,
  Infinity as InfinityIcon, ArrowLeft, ChevronRight, Lightbulb, Brain, PenTool,
  Divide, ClipboardList, Presentation, Smartphone, FileText, Sparkles, Rocket,
  PencilRuler, Award, Crown, Flame, Bell, Cog, BoxSelect, Circle, Triangle as TriangleIcon,
  Hash, Quote, Dices, Target, Calendar, Clock, Library, Mic, PlayCircle, FileDown
} from 'lucide-react';
import { AppView, MathSubTopic, UserProfile, Achievement } from './types';
import { mathTopics } from './data/mathContent';
import { MathCard } from './components/MathCard';
import { ChatInterface } from './components/ChatInterface';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { QuizInterface } from './components/QuizInterface';
import { Whiteboard } from './components/Whiteboard';
import { Calculator } from './components/Calculator';
import { MobileConnect } from './components/MobileConnect';
import { NationalExam } from './components/NationalExam';
import { GeometryVisualizer } from './components/GeometryVisualizer';
import { FunctionMachine } from './components/FunctionMachine';
import { PythagorasMachine } from './components/PythagorasMachine';
import { UnitCircleMachine } from './components/UnitCircleMachine';
import { TriangleMachine } from './components/TriangleMachine';
import { NumberMachine } from './components/NumberMachine';
import { StatsMachine } from './components/StatsMachine';
import { ProbabilityMachine } from './components/ProbabilityMachine';
import { MatrixMachine } from './components/MatrixMachine';
import { QuotesGallery } from './components/QuotesGallery';
import { AIDiscussionPlayer } from './components/AIDiscussionPlayer';

const iconMap: Record<string, React.ElementType> = {
  Calculator: CalculatorIcon, Layers, Triangle, Grid, Activity,
  TrendingUp, ArrowUpRight, List, BarChart, Zap,
  BookOpen, Infinity: InfinityIcon, Divide
};

const INITIAL_PROFILE: UserProfile = {
  level: 1,
  currentXp: 0,
  nextLevelXp: 500,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  achievements: [
    { id: 'first_step', title: 'პირველი ნაბიჯი', description: 'დაიწყე სწავლა', icon: 'Flag', unlocked: true, unlockedAt: new Date().toISOString() },
    { id: 'quiz_master', title: 'ტესტების ოსტატი', description: 'დაასრულე 5 ტესტი', icon: 'Trophy', unlocked: false },
    { id: 'math_wizard', title: 'მათემატიკის ჯადოქარი', description: 'მიაღწიე მე-5 ლეველს', icon: 'Crown', unlocked: false },
  ]
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SYNOPSIS);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string | null>(null);
  const [viewAllTopics, setViewAllTopics] = useState(false); // NEW STATE FOR "SEE ALL"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileImage, setMobileImage] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // Gamification State
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [notification, setNotification] = useState<{title: string, message: string, type: 'xp' | 'achievement' | 'level'} | null>(null);

  // Load Profile & Set Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('დილა მშვიდობისა');
    else if (hour < 18) setGreeting('გამარჯობა');
    else setGreeting('საღამო მშვიდობისა');

    const savedProfile = localStorage.getItem('mathmaster_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        // Check streak
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastActiveDate !== today) {
           const lastDate = new Date(parsed.lastActiveDate);
           const currDate = new Date();
           const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
           
           if (diffDays <= 2) {
             parsed.streakDays += 1;
           } else {
             parsed.streakDays = 1;
           }
           parsed.lastActiveDate = today;
        }
        setUserProfile(parsed);
      } catch (e) {
        console.error("Profile parse error", e);
      }
    }
  }, []);

  // Save Profile
  useEffect(() => {
    localStorage.setItem('mathmaster_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Clear Notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addXp = useCallback((amount: number, reason?: string) => {
    setUserProfile(prev => {
      let newXp = prev.currentXp + amount;
      let newLevel = prev.level;
      let newNextLevelXp = prev.nextLevelXp;
      let leveledUp = false;

      // Level Up Logic
      if (newXp >= prev.nextLevelXp) {
        newLevel += 1;
        newXp = newXp - prev.nextLevelXp;
        newNextLevelXp = Math.floor(prev.nextLevelXp * 1.2); // Increase difficulty
        leveledUp = true;
      }

      // Check Achievements (Basic Example)
      const updatedAchievements = prev.achievements.map(a => {
        if (a.id === 'math_wizard' && !a.unlocked && newLevel >= 5) {
           setNotification({ title: 'მიღწევა განბლოკილია!', message: 'მათემატიკის ჯადოქარი', type: 'achievement' });
           return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return a;
      });

      if (leveledUp) {
        setNotification({ title: 'გილოცავთ! ლეველი მოიმატა', message: `თქვენ გადახვედით ლეველზე: ${newLevel}`, type: 'level' });
      } else {
        setNotification({ title: `+${amount} XP`, message: reason || 'კარგი ნამუშევარია!', type: 'xp' });
      }

      return {
        ...prev,
        level: newLevel,
        currentXp: newXp,
        nextLevelXp: newNextLevelXp,
        achievements: updatedAchievements
      };
    });
  }, []);

  // PDF Export Logic
  const handleExportPdf = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element || !(window as any).html2pdf) {
      alert("PDF ექსპორტი ვერ მოხერხდა. სცადეთ გვერდის გადატვირთვა.");
      return;
    }

    setIsExporting(true);
    
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    (window as any).html2pdf().set(opt).from(element).save().then(() => {
      setIsExporting(false);
      addXp(15, 'PDF შენახვა');
    }).catch((err: any) => {
      console.error(err);
      setIsExporting(false);
    });
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
    setViewAllTopics(false); // Reset expanded view
    setSelectedTopicId(null);
    setSelectedSubTopicId(null);
    setIsMobileMenuOpen(false);
  };

  const handleMobileScan = (imageUrl: string) => {
    setMobileImage(imageUrl);
    setCurrentView(AppView.VISION);
  };

  const goBackToTopics = () => {
    setSelectedTopicId(null);
    setSelectedSubTopicId(null);
  };

  const goBackToSubTopics = () => {
    setSelectedSubTopicId(null);
  };

  const handleBackFromAllTopics = () => {
     setViewAllTopics(false);
  };

  const renderSynopsisContent = () => {
    // LEVEL 3: Detail View
    if (selectedTopicId && selectedSubTopicId) {
      const topic = mathTopics.find(t => t.id === selectedTopicId);
      const subTopic = topic?.content.find(s => s.id === selectedSubTopicId);
      if (!topic || !subTopic) return null;

      return (
        <div className="animate-fadeIn pb-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={goBackToSubTopics} className="p-2 rounded-xl bg-white border hover:bg-indigo-50 transition-all"><ArrowLeft size={20} /></button>
              <div>
                 <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{topic.title}</span>
                 <h2 className="text-2xl font-bold text-slate-900">{subTopic.title}</h2>
              </div>
            </div>
            <button 
              onClick={() => handleExportPdf('export-detail-container', `${subTopic.title}.pdf`)}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition-all shadow-sm font-bold text-sm"
            >
              {isExporting ? <Rocket className="animate-spin" size={18} /> : <FileDown size={18} />}
              <span className="hidden sm:inline">შენახვა PDF</span>
            </button>
          </div>
          
          <div id="export-detail-container" className="bg-white/0"> {/* Container for PDF */}
            {/* AI Discussion Banner (Hide during export via CSS ideally, but here we just keep it) */}
            <div className="mb-8 bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between group cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => setCurrentView(AppView.AI_DISCUSSION)} data-html2canvas-ignore>
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                     <PlayCircle size={32} className="text-indigo-300" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">AI ვიდეო-დისკუსია</h3>
                     <p className="text-indigo-200 text-sm">მოუსმინე ორ AI ექსპერტს, როგორ განიხილავენ ამ თემას</p>
                  </div>
               </div>
               <div className="hidden md:block bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                  ჩართვა
               </div>
            </div>

            <div className="space-y-8">
              {subTopic.formula && (
                 <div className="bg-slate-900 rounded-2xl p-8 shadow-xl text-center overflow-x-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                    <pre className="font-mono text-2xl text-indigo-300 font-bold whitespace-pre-wrap relative z-10">{subTopic.formula}</pre>
                 </div>
              )}
              {subTopic.realWorldAnalogy && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl shadow-sm flex gap-3">
                  <Lightbulb className="text-amber-500 shrink-0 mt-1" size={24} />
                  <div><h3 className="font-bold text-amber-900 mb-2">ანალოგია</h3><p className="text-amber-800 text-lg">{subTopic.realWorldAnalogy}</p></div>
                </div>
              )}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4 text-indigo-700"><Brain size={24} /><h3 className="text-xl font-bold">ახსნა</h3></div>
                <p className="whitespace-pre-line text-slate-700 leading-loose">{subTopic.fullExplanation || subTopic.explanation}</p>
              </div>
              {subTopic.exampleProblem && (
                <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100">
                  <div className="flex items-center gap-3 mb-6 text-indigo-800"><PenTool size={24} /><h3 className="text-xl font-bold">მაგალითი</h3></div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="font-bold text-lg mb-4">ამოცანა: <span className="font-mono text-indigo-600">{subTopic.exampleProblem.problem}</span></p>
                    <div className="space-y-3">
                      {subTopic.exampleProblem.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3"><div className="bg-indigo-100 text-indigo-700 font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">{idx + 1}</div><p className="text-slate-600">{step}</p></div>
                      ))}
                    </div>
                    <div className="mt-6 bg-green-50 text-green-800 p-4 rounded-lg font-bold text-center border border-green-100">პასუხი: {subTopic.exampleProblem.solution}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // LEVEL 2: Subtopic List
    if (selectedTopicId) {
      const topic = mathTopics.find(t => t.id === selectedTopicId);
      if (!topic) return null;
      const Icon = iconMap[topic.icon] || BookOpen;

      return (
        <div className="animate-fadeIn pb-8 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={goBackToTopics} className="p-3 rounded-xl bg-white border hover:bg-indigo-50 transition-all"><ArrowLeft size={20} /></button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Icon size={24} /></div>
                <h2 className="text-3xl font-bold text-slate-800">{topic.title}</h2>
              </div>
            </div>
            
            <button 
              onClick={() => handleExportPdf('export-topic-grid', `${topic.title}_CheatSheet.pdf`)}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md font-bold text-sm hover:scale-105 active:scale-95"
            >
              {isExporting ? <Rocket className="animate-spin" size={18} /> : <FileDown size={18} />}
              <span className="hidden sm:inline">ფორმულების PDF</span>
            </button>
          </div>

          <div id="export-topic-grid" className="p-2">
             <div className="mb-4 text-center hidden" data-html2canvas-ignore="false" style={{display: isExporting ? 'block' : 'none'}}>
                <h1 className="text-2xl font-bold text-slate-900">{topic.title} - ფორმულების კრებული</h1>
                <p className="text-slate-500">MathMaster AI</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {topic.content.map((subTopic) => (
                 <MathCard key={subTopic.id} topic={subTopic} onClick={() => setSelectedSubTopicId(subTopic.id)} />
               ))}
             </div>
          </div>
        </div>
      );
    }

    // NEW: ALL TOPICS VIEW (Expanded Library)
    if (viewAllTopics) {
       return (
         <div className="animate-fadeIn pb-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
               <button onClick={handleBackFromAllTopics} className="p-3 rounded-xl bg-white border hover:bg-indigo-50 transition-all"><ArrowLeft size={20} /></button>
               <div>
                  <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><Library className="text-indigo-600"/> თემების სრული ბიბლიოთეკა</h2>
                  <p className="text-slate-500 text-sm">აირჩიეთ თემა დეტალური შესწავლისთვის</p>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {mathTopics.map(topic => {
                  const Icon = iconMap[topic.icon] || BookOpen;
                  return (
                     <div key={topic.id} onClick={() => setSelectedTopicId(topic.id)} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer flex flex-col gap-4 group">
                        <div className="flex items-center justify-between">
                           <div className="bg-slate-50 p-4 rounded-xl text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <Icon size={28} />
                           </div>
                           <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                              {topic.content.length} საკითხი
                           </span>
                        </div>
                        <div>
                           <h4 className="font-bold text-xl text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">{topic.title}</h4>
                           <p className="text-sm text-slate-500 line-clamp-2">
                              {topic.content.map(c => c.title).join(', ')}
                           </p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                           ნახვა <ChevronRight size={16} className="ml-1" />
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
       );
    }

    // LEVEL 1: REIMAGINED DASHBOARD
    return (
      <div className="space-y-8 animate-fadeIn pb-8">
         {/* 1. Welcome & Hero */}
         <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <div className="flex items-center gap-2 text-indigo-200 font-medium mb-2">
                     <Clock size={16} /> <span>{new Date().toLocaleDateString('ka-GE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{greeting}, მეგობარო! 👋</h1>
                  <p className="text-indigo-100 max-w-lg leading-relaxed">
                     დღეს მშვენიერი დღეა ახალი ცოდნის მისაღებად. შენი პროგრესი შთამბეჭდავია.
                  </p>
               </div>
               <div className="flex gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                  <div className="text-center">
                     <div className="text-2xl font-bold">{userProfile.streakDays}</div>
                     <div className="text-[10px] text-indigo-200 uppercase tracking-wider">დღიანი სტრიკი</div>
                  </div>
                  <div className="w-px bg-white/20"></div>
                  <div className="text-center">
                     <div className="text-2xl font-bold">{userProfile.level}</div>
                     <div className="text-[10px] text-indigo-200 uppercase tracking-wider">ლეველი</div>
                  </div>
                  <div className="w-px bg-white/20"></div>
                  <div className="text-center">
                     <div className="text-2xl font-bold">{userProfile.currentXp}</div>
                     <div className="text-[10px] text-indigo-200 uppercase tracking-wider">XP</div>
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2. Daily Challenge & Shortcuts */}
            <div className="lg:col-span-2 space-y-6">
               {/* Challenge Card */}
               <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:border-orange-300 transition-all group cursor-pointer" onClick={() => setCurrentView(AppView.QUIZ)}>
                  <div className="flex items-center gap-4">
                     <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
                        <Target size={28} />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-800">დღიური გამოწვევა</h3>
                        <p className="text-slate-500 text-sm">გაიარე "ალგებრის" ტესტი და მიიღე +50 XP</p>
                     </div>
                  </div>
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md shadow-orange-200 group-hover:shadow-lg transition-all">
                     დაწყება
                  </div>
               </div>

               {/* Quick Access Grid */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-800 text-lg">სწრაფი წვდომა</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <QuickAction icon={MessageCircle} label="AI ჩაი" color="bg-indigo-100 text-indigo-600" onClick={() => setCurrentView(AppView.CHAT)} />
                     <QuickAction icon={Camera} label="ფოტო ამოხსნა" color="bg-purple-100 text-purple-600" onClick={() => setCurrentView(AppView.VISION)} />
                     <QuickAction icon={CalculatorIcon} label="კალკულატორი" color="bg-emerald-100 text-emerald-600" onClick={() => setCurrentView(AppView.CALCULATOR)} />
                     <QuickAction icon={FileText} label="გამოცდა" color="bg-blue-100 text-blue-600" onClick={() => setCurrentView(AppView.NATIONAL_EXAM)} />
                  </div>
               </div>

               {/* Topics Horizontal Scroll */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-800 text-lg">თემების ბიბლიოთეკა</h3>
                     <button 
                       onClick={() => setViewAllTopics(true)} 
                       className="text-xs text-indigo-600 font-bold cursor-pointer hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors"
                     >
                       ყველას ნახვა
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {mathTopics.slice(0, 4).map(topic => {
                        const Icon = iconMap[topic.icon] || BookOpen;
                        return (
                           <div key={topic.id} onClick={() => setSelectedTopicId(topic.id)} className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group">
                              <div className="bg-slate-50 p-3 rounded-xl text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                 <Icon size={24} />
                              </div>
                              <div>
                                 <h4 className="font-bold text-slate-800">{topic.title}</h4>
                                 <p className="text-xs text-slate-500">{topic.content.length} გაკვეთილი</p>
                              </div>
                              <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-500" size={20} />
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>

            {/* 3. Tools & Stats Sidebar */}
            <div className="space-y-6">
               <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">ლაბორატორია</h3>
                  <div className="space-y-3">
                     <LabItem icon={Grid} label="მატრიცული მანქანა" onClick={() => setCurrentView(AppView.MATRIX_MACHINE)} />
                     <LabItem icon={BarChart} label="სტატისტიკა" onClick={() => setCurrentView(AppView.STATS_MACHINE)} />
                     <LabItem icon={Dices} label="ალბათობა" onClick={() => setCurrentView(AppView.PROBABILITY_MACHINE)} />
                     <LabItem icon={TriangleIcon} label="გეომეტრია" onClick={() => setCurrentView(AppView.GEOMETRY)} />
                     <LabItem icon={Presentation} label="დაფა (AI Solve)" onClick={() => setCurrentView(AppView.BOARD)} />
                  </div>
               </div>

               <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-6 border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="bg-white p-2 rounded-lg text-amber-500"><Quote size={20}/></div>
                     <h3 className="font-bold text-amber-900">დღის სიბრძნე</h3>
                  </div>
                  <p className="text-amber-800 text-sm font-serif italic leading-relaxed">
                     "მათემატიკა არის ის, რომლითაც ღმერთმა სამყარო დაწერა."
                  </p>
                  <div className="mt-2 text-right text-xs font-bold text-amber-600">— გალილეო გალილეი</div>
               </div>
            </div>
         </div>
      </div>
    );
  };

  // Sub-components for Dashboard
  const QuickAction = ({ icon: Icon, label, color, onClick }: any) => (
     <button onClick={onClick} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
        <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${color}`}>
           <Icon size={24} />
        </div>
        <span className="text-xs font-bold text-slate-700">{label}</span>
     </button>
  );

  const LabItem = ({ icon: Icon, label, onClick }: any) => (
     <button onClick={onClick} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
        <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
           <Icon size={18} />
        </div>
        <span className="font-medium text-slate-700 group-hover:text-indigo-900 text-sm">{label}</span>
        <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-400" size={16} />
     </button>
  );

  // Nav Item Component
  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => handleViewChange(view)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full md:w-auto font-medium ${
        currentView === view ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'text-indigo-600' : 'text-slate-400'} />
      <span className="truncate text-sm">{label}</span>
      {currentView === view && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
    </button>
  );

  const getCurrentTopicTitle = () => {
     const t = mathTopics.find(t => t.id === selectedTopicId);
     const s = t?.content.find(s => s.id === selectedSubTopicId);
     return s?.title || t?.title || '';
  };
  
  const getCurrentTopicContent = () => {
     const t = mathTopics.find(t => t.id === selectedTopicId);
     const s = t?.content.find(s => s.id === selectedSubTopicId);
     return s?.fullExplanation || s?.explanation || '';
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
      
      {/* --- TOAST NOTIFICATION --- */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] p-4 rounded-xl shadow-2xl border border-white/20 text-white flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${notification.type === 'xp' ? 'bg-indigo-600' : notification.type === 'level' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-purple-600'}`}>
           <div className="p-2 bg-white/20 rounded-full">
              {notification.type === 'level' ? <Crown size={24} /> : notification.type === 'achievement' ? <Award size={24} /> : <Bell size={24} />}
           </div>
           <div>
              <h4 className="font-bold text-sm uppercase tracking-wide">{notification.title}</h4>
              <p className="text-xs text-indigo-100">{notification.message}</p>
           </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm z-50 sticky top-0">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><Rocket size={18} /></div> MathMaster
        </div>
        <button onClick={toggleMobileMenu} className="p-2 text-slate-600 bg-slate-50 rounded-lg"><Menu /></button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="hidden md:flex items-center gap-3 mb-6 px-2">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200"><Rocket size={24} /></div>
            <div><h1 className="font-bold text-xl text-slate-900">MathMaster</h1><p className="text-xs text-slate-500 font-medium">AI Learning Hub</p></div>
          </div>

          {/* --- PROFILE WIDGET --- */}
          <div className="mb-6 bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500 blur-2xl opacity-20 rounded-full"></div>
             <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                   <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">ლეველი {userProfile.level}</div>
                   <div className="font-bold text-lg">მოსწავლე</div>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg text-xs font-bold">
                   <Flame size={12} className="text-orange-400" fill="currentColor" /> {userProfile.streakDays} დღე
                </div>
             </div>
             <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-500" style={{ width: `${(userProfile.currentXp / userProfile.nextLevelXp) * 100}%` }}></div>
             </div>
             <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>XP: {userProfile.currentXp}</span>
                <span>NEXT: {userProfile.nextLevelXp}</span>
             </div>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-2">მთავარი</div>
            <NavItem view={AppView.SYNOPSIS} icon={Grid} label="მთავარი პანელი" />
            <NavItem view={AppView.CHAT} icon={MessageCircle} label="AI რეპეტიტორი" />
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-6">ინსტრუმენტები</div>
            <NavItem view={AppView.VISION} icon={Camera} label="ფოტო ანალიზი" />
            <NavItem view={AppView.GEOMETRY} icon={PencilRuler} label="გეომეტრიის ვიზუალი" />
            <NavItem view={AppView.BOARD} icon={Presentation} label="დაფა & გრაფიკი" />
            <NavItem view={AppView.CALCULATOR} icon={CalculatorIcon} label="კალკულატორი" />
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-6">ლაბორატორია</div>
            <NavItem view={AppView.MATRIX_MACHINE} icon={Grid} label="მატრიცული კალკულატორი" />
            <NavItem view={AppView.PROBABILITY_MACHINE} icon={Dices} label="ალბათობა" />
            <NavItem view={AppView.STATS_MACHINE} icon={BarChart} label="სტატისტიკა" />
            <NavItem view={AppView.NUMBER_MACHINE} icon={Hash} label="რიცხვების ანალიზი" />
            <NavItem view={AppView.FUNCTION_MACHINE} icon={Cog} label="ფუნქციის მანქანა" />
            <NavItem view={AppView.PYTHAGORAS_MACHINE} icon={BoxSelect} label="პითაგორას მანქანა" />
            <NavItem view={AppView.UNIT_CIRCLE_MACHINE} icon={Circle} label="ტრიგონომეტრიის წრე" />
            <NavItem view={AppView.TRIANGLE_MACHINE} icon={TriangleIcon} label="სამკუთხედის ოსტატი" />
            <NavItem view={AppView.MOBILE_CONNECT} icon={Smartphone} label="Mobile Connect" />
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-6">შეფასება</div>
            <NavItem view={AppView.QUIZ} icon={ClipboardList} label="ტესტირება" />
            <NavItem view={AppView.NATIONAL_EXAM} icon={FileText} label="ეროვნული გამოცდა" />
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-6">ექსტრა</div>
            <NavItem view={AppView.QUOTES_GALLERY} icon={Quote} label="სიბრძნის კუთხე" />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
               <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-1"><Sparkles size={12}/> PRO ვერსია</div>
               <p className="text-[10px] text-slate-500 leading-tight">ყველა ფუნქცია გააქტიურებულია. წარმატებულ სწავლას გისურვებთ!</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 h-full overflow-hidden relative bg-slate-50/50">
        <div className={`absolute inset-0 p-0 md:p-0 ${currentView === AppView.BOARD ? 'z-10 block' : 'z-0 invisible'}`}><Whiteboard onAddXp={addXp} /></div>
        <div className={`absolute inset-0 p-4 md:p-8 ${currentView === AppView.CALCULATOR ? 'z-10 block' : 'z-0 invisible'}`}><Calculator /></div>
        <div className={`absolute inset-0 p-4 md:p-8 z-20 ${currentView === AppView.AI_DISCUSSION ? 'flex items-center justify-center backdrop-blur-sm bg-slate-900/50' : 'hidden'}`}>
           {currentView === AppView.AI_DISCUSSION && (
              <AIDiscussionPlayer 
                 topicTitle={getCurrentTopicTitle()} 
                 topicContent={getCurrentTopicContent()} 
                 onClose={() => setCurrentView(AppView.SYNOPSIS)} 
              />
           )}
        </div>
        
        <div className={`h-full w-full overflow-y-auto p-4 md:p-8 custom-scrollbar ${[AppView.BOARD, AppView.CALCULATOR, AppView.AI_DISCUSSION].includes(currentView) ? 'hidden' : 'block'}`}>
          <div className="max-w-7xl mx-auto h-full flex flex-col relative">
            <div className={currentView === AppView.SYNOPSIS ? 'block' : 'hidden'}>{renderSynopsisContent()}</div>
            <div className={currentView === AppView.CHAT ? 'block h-full' : 'hidden'}><ChatInterface onAddXp={addXp} /></div>
            <div className={currentView === AppView.VISION ? 'block h-full' : 'hidden'}><ImageAnalyzer onAddXp={addXp} /></div>
            <div className={currentView === AppView.QUIZ ? 'block h-full' : 'hidden'}><QuizInterface onAddXp={addXp} /></div>
            <div className={currentView === AppView.NATIONAL_EXAM ? 'block h-full' : 'hidden'}><NationalExam onAddXp={addXp} /></div>
            <div className={currentView === AppView.GEOMETRY ? 'block h-full' : 'hidden'}><GeometryVisualizer onAddXp={addXp} /></div>
            <div className={currentView === AppView.NUMBER_MACHINE ? 'block h-full' : 'hidden'}><NumberMachine onAddXp={addXp} /></div>
            <div className={currentView === AppView.STATS_MACHINE ? 'block h-full' : 'hidden'}><StatsMachine onAddXp={addXp} /></div>
            <div className={currentView === AppView.PROBABILITY_MACHINE ? 'block h-full' : 'hidden'}><ProbabilityMachine onAddXp={addXp} /></div>
            <div className={currentView === AppView.MATRIX_MACHINE ? 'block h-full' : 'hidden'}><MatrixMachine onAddXp={addXp} /></div>
            <div className={currentView === AppView.FUNCTION_MACHINE ? 'block h-full' : 'hidden'}><FunctionMachine onAddXp={addXp} /></div>
            <div className={currentView === AppView.PYTHAGORAS_MACHINE ? 'block h-full' : 'hidden'}><PythagorasMachine onAddXp={addXp} /></div>
            <div className={currentView === AppView.UNIT_CIRCLE_MACHINE ? 'block h-full' : 'hidden'}><UnitCircleMachine onAddXp={addXp} /></div>
            <div className={currentView === AppView.TRIANGLE_MACHINE ? 'block h-full' : 'hidden'}><TriangleMachine onAddXp={addXp} /></div>
            <div className={currentView === AppView.QUOTES_GALLERY ? 'block h-full' : 'hidden'}><QuotesGallery onAddXp={addXp} /></div>
            <div className={currentView === AppView.MOBILE_CONNECT ? 'block h-full' : 'hidden'}><MobileConnect onSimulateScan={handleMobileScan} /></div>
          </div>
        </div>
      </main>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
    </div>
  );
};

export default App;