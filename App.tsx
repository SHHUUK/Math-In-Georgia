import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, MessageCircle, Camera, Menu, X, 
  Calculator as CalculatorIcon, Layers, Triangle, Grid, Activity, 
  TrendingUp, ArrowUpRight, List, BarChart, Zap,
  Infinity as InfinityIcon, ArrowLeft, ChevronRight, Lightbulb, Brain, PenTool,
  Divide, ClipboardList, Presentation, Smartphone, FileText, Sparkles, Rocket,
  PencilRuler, Award, Crown, Flame, Bell, Cog, BoxSelect, Circle, Triangle as TriangleIcon,
  Hash, Quote, Dices, Target, Calendar, Clock, Library, Mic, PlayCircle, FileDown,
  Sun, Moon, Languages
} from 'lucide-react';
import { AppView, MathSubTopic, UserProfile, Achievement, Language, Theme } from './types';
import { mathTopics } from './data/mathContent';
import { motion, AnimatePresence } from 'motion/react';
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

const translations = {
  ka: {
    welcome: 'მოგესალმებით',
    morning: 'დილა მშვიდობისა',
    evening: 'საღამო მშვიდობისა',
    friend: 'მეგობარო',
    dashboard: 'მთავარი პანელი',
    aiTutor: 'AI რეპეტიტორი',
    photoAnalysis: 'ფოტო ანალიზი',
    geometryVisual: 'გეომეტრიის ვიზუალი',
    whiteboard: 'დაფა & გრაფიკი',
    calculator: 'კალკულატორი',
    matrixCalc: 'მატრიცული კალკულატორი',
    probability: 'ალბათობა',
    stats: 'სტატისტიკა',
    numberAnalysis: 'რიცხვების ანალიზი',
    functionMachine: 'ფუნქციის მანქანა',
    pythagoras: 'პითაგორას მანქანა',
    unitCircle: 'ტრიგონომეტრიის წრე',
    triangleMaster: 'სამკუთხედის ოსტატი',
    mobileConnect: 'Mobile Connect',
    testing: 'ტესტირება',
    nationalExam: 'ეროვნული გამოცდა',
    quotes: 'სიბრძნის კუთხე',
    level: 'ლეველი',
    xp: 'XP',
    streak: 'დღე',
    proVersion: 'PRO ვერსია',
    proDesc: 'ყველა ფუნქცია გააქტიურებულია. წარმატებულ სწავლას გისურვებთ!',
    main: 'მთავარი',
    tools: 'ინსტრუმენტები',
    lab: 'ლაბორატორია',
    assessment: 'შეფასება',
    extra: 'ექსტრა',
    savePdf: 'შენახვა PDF',
    formulaPdf: 'ფორმულების PDF',
    back: 'უკან',
    allTopics: 'ყველას ნახვა',
    library: 'თემების ბიბლიოთეკა',
    fullLibrary: 'თემების სრული ბიბლიოთეკა',
    chooseTopic: 'აირჩიეთ თემა დეტალური შესწავლისთვის',
    dailyChallenge: 'დღიური გამოწვევა',
    start: 'დაწყება',
    quickAccess: 'სწრაფი წვდომა',
    aiChat: 'AI ჩათი',
    photoSolve: 'ფოტო ამოხსნა',
    wisdomOfDay: 'დღის სიბრძნე',
    explanation: 'ახსნა',
    example: 'მაგალითი',
    analogy: 'ანალოგია',
    problem: 'ამოცანა',
    solution: 'პასუხი',
    aiDiscussion: 'AI ვიდეო-დისკუსია',
    aiDiscussionDesc: 'მოუსმინე ორ AI ექსპერტს, როგორ განიხილავენ ამ თემას',
    turnOn: 'ჩართვა',
    student: 'მოსწავლე',
    next: 'საკითხი',
    achievementUnlocked: 'მიღწევა განბლოკილია!',
    mathWizard: 'მათემატიკის ჯადოქარი',
    congrats: 'გილოცავთ!',
    levelUp: 'ლეველი მოიმატა',
    levelReached: 'თქვენ გადახვედით ლეველზე',
    goodWork: 'კარგი ნამუშევარია!',
    pdfExportFailed: 'PDF ექსპორტი ვერ მოხერხდა. სცადეთ გვერდის გადატვირთვა.',
    pdfSaved: 'PDF შენახვა'
  },
  en: {
    welcome: 'Welcome',
    morning: 'Good Morning',
    evening: 'Good Evening',
    friend: 'Friend',
    dashboard: 'Dashboard',
    aiTutor: 'AI Tutor',
    photoAnalysis: 'Photo Analysis',
    geometryVisual: 'Geometry Visualizer',
    whiteboard: 'Board & Graph',
    calculator: 'Calculator',
    matrixCalc: 'Matrix Calculator',
    probability: 'Probability',
    stats: 'Statistics',
    numberAnalysis: 'Number Analysis',
    functionMachine: 'Function Machine',
    pythagoras: 'Pythagoras Machine',
    unitCircle: 'Unit Circle',
    triangleMaster: 'Triangle Master',
    mobileConnect: 'Mobile Connect',
    testing: 'Testing',
    nationalExam: 'National Exam',
    quotes: 'Wisdom Corner',
    level: 'Level',
    xp: 'XP',
    streak: 'Days',
    proVersion: 'PRO Version',
    proDesc: 'All features activated. Happy learning!',
    main: 'Main',
    tools: 'Tools',
    lab: 'Lab',
    assessment: 'Assessment',
    extra: 'Extra',
    savePdf: 'Save PDF',
    formulaPdf: 'Formulas PDF',
    back: 'Back',
    allTopics: 'See All',
    library: 'Topic Library',
    fullLibrary: 'Full Topic Library',
    chooseTopic: 'Choose a topic for detailed study',
    dailyChallenge: 'Daily Challenge',
    start: 'Start',
    quickAccess: 'Quick Access',
    aiChat: 'AI Chat',
    photoSolve: 'Photo Solve',
    wisdomOfDay: 'Wisdom of the Day',
    explanation: 'Explanation',
    example: 'Example',
    analogy: 'Analogy',
    problem: 'Problem',
    solution: 'Solution',
    aiDiscussion: 'AI Video Discussion',
    aiDiscussionDesc: 'Listen to two AI experts discuss this topic',
    turnOn: 'Play',
    student: 'Student',
    next: 'Topics',
    achievementUnlocked: 'Achievement Unlocked!',
    mathWizard: 'Math Wizard',
    congrats: 'Congratulations!',
    levelUp: 'Level Up',
    levelReached: 'You reached level',
    goodWork: 'Good work!',
    pdfExportFailed: 'PDF export failed. Try refreshing the page.',
    pdfSaved: 'PDF Saved'
  }
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
  
  // Theme & Language State
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('mathmaster_theme') as Theme) || 'light');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('mathmaster_lang') as Language) || 'ka');

  const t = translations[language];

  // Gamification State
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [notification, setNotification] = useState<{title: string, message: string, type: 'xp' | 'achievement' | 'level'} | null>(null);

  // Load Profile & Set Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t.morning);
    else if (hour < 18) setGreeting(t.welcome);
    else setGreeting(t.evening);

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

  // Theme & Language Effects
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mathmaster_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mathmaster_lang', language);
    // Update greeting when language changes
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t.morning);
    else if (hour < 18) setGreeting(t.welcome);
    else setGreeting(t.evening);
  }, [language, t]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => setLanguage(prev => prev === 'ka' ? 'en' : 'ka');

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
           setNotification({ title: t.achievementUnlocked, message: t.mathWizard, type: 'achievement' });
           return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return a;
      });

      if (leveledUp) {
        setNotification({ title: `${t.congrats} ${t.levelUp}`, message: `${t.levelReached}: ${newLevel}`, type: 'level' });
      } else {
        setNotification({ title: `+${amount} XP`, message: reason || t.goodWork, type: 'xp' });
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
      alert(t.pdfExportFailed);
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
      addXp(15, t.pdfSaved);
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
              <button onClick={goBackToSubTopics} className="p-2 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-slate-900 dark:text-white"><ArrowLeft size={20} /></button>
              <div>
                 <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{topic.title}</span>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{subTopic.title}</h2>
              </div>
            </div>
            <button 
              onClick={() => handleExportPdf('export-detail-container', `${subTopic.title}.pdf`)}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all shadow-sm font-bold text-sm"
            >
              {isExporting ? <Rocket className="animate-spin" size={18} /> : <FileDown size={18} />}
              <span className="hidden sm:inline">{t.savePdf}</span>
            </button>
          </div>
          
          <div id="export-detail-container" className="bg-white/0"> {/* Container for PDF */}
            {/* AI Discussion Banner */}
            <div className="mb-8 bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-slate-950 dark:to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between group cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => setCurrentView(AppView.AI_DISCUSSION)} data-html2canvas-ignore>
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                     <PlayCircle size={32} className="text-indigo-300" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">{t.aiDiscussion}</h3>
                     <p className="text-indigo-200 text-sm">{t.aiDiscussionDesc}</p>
                  </div>
               </div>
               <div className="hidden md:block bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                  {t.turnOn}
               </div>
            </div>

            <div className="space-y-8">
              {subTopic.formula && (
                 <div className="bg-slate-900 dark:bg-black rounded-2xl p-8 shadow-xl text-center overflow-x-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                    <pre className="font-mono text-2xl text-indigo-300 font-bold whitespace-pre-wrap relative z-10">{subTopic.formula}</pre>
                 </div>
              )}
              {subTopic.realWorldAnalogy && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 p-6 rounded-r-xl shadow-sm flex gap-3">
                  <Lightbulb className="text-amber-500 shrink-0 mt-1" size={24} />
                  <div><h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2">{t.analogy}</h3><p className="text-amber-800 dark:text-amber-300 text-lg">{subTopic.realWorldAnalogy}</p></div>
                </div>
              )}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4 text-indigo-700 dark:text-indigo-400"><Brain size={24} /><h3 className="text-xl font-bold">{t.explanation}</h3></div>
                <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-loose">{subTopic.fullExplanation || subTopic.explanation}</p>
              </div>
              {subTopic.exampleProblem && (
                <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-3 mb-6 text-indigo-800 dark:text-indigo-300"><PenTool size={24} /><h3 className="text-xl font-bold">{t.example}</h3></div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm">
                    <p className="font-bold text-lg mb-4 text-slate-900 dark:text-white">{t.problem}: <span className="font-mono text-indigo-600 dark:text-indigo-400">{subTopic.exampleProblem.problem}</span></p>
                    <div className="space-y-3">
                      {subTopic.exampleProblem.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3"><div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">{idx + 1}</div><p className="text-slate-600 dark:text-slate-400">{step}</p></div>
                      ))}
                    </div>
                    <div className="mt-6 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 p-4 rounded-lg font-bold text-center border border-green-100 dark:border-green-900/50">{t.solution}: {subTopic.exampleProblem.solution}</div>
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
              <button onClick={goBackToTopics} className="p-3 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-slate-900 dark:text-white"><ArrowLeft size={20} /></button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg"><Icon size={24} /></div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{topic.title}</h2>
              </div>
            </div>
            
            <button 
              onClick={() => handleExportPdf('export-topic-grid', `${topic.title}_CheatSheet.pdf`)}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md font-bold text-sm hover:scale-105 active:scale-95"
            >
              {isExporting ? <Rocket className="animate-spin" size={18} /> : <FileDown size={18} />}
              <span className="hidden sm:inline">{t.formulaPdf}</span>
            </button>
          </div>

          <div id="export-topic-grid" className="p-2">
             <div className="mb-4 text-center hidden" data-html2canvas-ignore="false" style={{display: isExporting ? 'block' : 'none'}}>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{topic.title}</h1>
                <p className="text-slate-500">MathMaster AI</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {topic.content.map((subTopic) => (
                 <MathCard key={subTopic.id} topic={subTopic} onClick={() => setSelectedSubTopicId(subTopic.id)} language={language} />
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
               <button onClick={handleBackFromAllTopics} className="p-3 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-slate-900 dark:text-white"><ArrowLeft size={20} /></button>
               <div>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3"><Library className="text-indigo-600 dark:text-indigo-400"/> {t.fullLibrary}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{t.chooseTopic}</p>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {mathTopics.map(topic => {
                  const Icon = iconMap[topic.icon] || BookOpen;
                  return (
                     <div key={topic.id} onClick={() => setSelectedTopicId(topic.id)} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer flex flex-col gap-4 group">
                        <div className="flex items-center justify-between">
                           <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-slate-600 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <Icon size={28} />
                           </div>
                           <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                              {topic.content.length} {t.next}
                           </span>
                        </div>
                        <div>
                           <h4 className="font-bold text-xl text-slate-800 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{topic.title}</h4>
                           <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                              {topic.content.map(c => c.title).join(', ')}
                           </p>
                        </div>
                        <div className="mt-auto pt-4 flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                           {t.turnOn} <ChevronRight size={16} className="ml-1" />
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
         <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-800 dark:from-indigo-900 dark:via-violet-950 dark:to-indigo-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <div className="flex items-center gap-2 text-indigo-200 font-medium mb-2">
                     <Clock size={16} /> <span>{new Date().toLocaleDateString(language === 'ka' ? 'ka-GE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{greeting}, {t.friend}! 👋</h1>
                  <p className="text-indigo-100 max-w-lg leading-relaxed">
                     {language === 'ka' ? 'დღეს მშვენიერი დღეა ახალი ცოდნის მისაღებად. შენი პროგრესი შთამბეჭდავია.' : 'Today is a wonderful day to gain new knowledge. Your progress is impressive.'}
                  </p>
               </div>
               <div className="flex gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                  <div className="text-center">
                     <div className="text-2xl font-bold">{userProfile.streakDays}</div>
                     <div className="text-[10px] text-indigo-200 uppercase tracking-wider">{t.streak}</div>
                  </div>
                  <div className="w-px bg-white/20"></div>
                  <div className="text-center">
                     <div className="text-2xl font-bold">{userProfile.level}</div>
                     <div className="text-[10px] text-indigo-200 uppercase tracking-wider">{t.level}</div>
                  </div>
                  <div className="w-px bg-white/20"></div>
                  <div className="text-center">
                     <div className="text-2xl font-bold">{userProfile.currentXp}</div>
                     <div className="text-[10px] text-indigo-200 uppercase tracking-wider">{t.xp}</div>
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2. Daily Challenge & Shortcuts */}
            <div className="lg:col-span-2 space-y-6">
               {/* Challenge Card */}
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:border-orange-300 dark:hover:border-orange-900 transition-all group cursor-pointer" onClick={() => setCurrentView(AppView.QUIZ)}>
                  <div className="flex items-center gap-4">
                     <div className="bg-orange-100 dark:bg-orange-950/30 p-4 rounded-2xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                        <Target size={28} />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t.dailyChallenge}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{language === 'ka' ? 'გაიარე "ალგებრის" ტესტი და მიიღე +50 XP' : 'Take the "Algebra" quiz and get +50 XP'}</p>
                     </div>
                  </div>
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md shadow-orange-200 dark:shadow-orange-900/20 group-hover:shadow-lg transition-all">
                     {t.start}
                  </div>
               </div>

               {/* Quick Access Grid */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-800 dark:text-white text-lg">{t.quickAccess}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <QuickAction icon={MessageCircle} label={t.aiChat} color="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" onClick={() => setCurrentView(AppView.CHAT)} />
                     <QuickAction icon={Camera} label={t.photoSolve} color="bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400" onClick={() => setCurrentView(AppView.VISION)} />
                     <QuickAction icon={CalculatorIcon} label={t.calculator} color="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" onClick={() => setCurrentView(AppView.CALCULATOR)} />
                     <QuickAction icon={FileText} label={t.nationalExam} color="bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" onClick={() => setCurrentView(AppView.NATIONAL_EXAM)} />
                  </div>
               </div>

               {/* Topics Horizontal Scroll */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-800 dark:text-white text-lg">{t.library}</h3>
                     <button 
                       onClick={() => setViewAllTopics(true)} 
                       className="text-xs text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1 rounded-lg transition-colors"
                     >
                       {t.allTopics}
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {mathTopics.slice(0, 4).map(topic => {
                        const Icon = iconMap[topic.icon] || BookOpen;
                        return (
                           <div key={topic.id} onClick={() => setSelectedTopicId(topic.id)} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group">
                              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                 <Icon size={24} />
                              </div>
                              <div>
                                 <h4 className="font-bold text-slate-800 dark:text-white">{topic.title}</h4>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{topic.content.length} {t.next}</p>
                              </div>
                              <ChevronRight className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" size={20} />
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>

            {/* 3. Tools & Stats Sidebar */}
            <div className="space-y-6">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">{t.lab}</h3>
                  <div className="space-y-3">
                     <LabItem icon={Grid} label={t.matrixCalc} onClick={() => setCurrentView(AppView.MATRIX_MACHINE)} />
                     <LabItem icon={BarChart} label={t.stats} onClick={() => setCurrentView(AppView.STATS_MACHINE)} />
                     <LabItem icon={Dices} label={t.probability} onClick={() => setCurrentView(AppView.PROBABILITY_MACHINE)} />
                     <LabItem icon={TriangleIcon} label={t.geometryVisual} onClick={() => setCurrentView(AppView.GEOMETRY)} />
                     <LabItem icon={Presentation} label={t.whiteboard} onClick={() => setCurrentView(AppView.BOARD)} />
                  </div>
               </div>

               <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/50">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-amber-500"><Quote size={20}/></div>
                     <h3 className="font-bold text-amber-900 dark:text-amber-200">{t.wisdomOfDay}</h3>
                  </div>
                  <p className="text-amber-800 dark:text-amber-300 text-sm font-serif italic leading-relaxed">
                     {language === 'ka' ? '"მათემატიკა არის ის, რომლითაც ღმერთმა სამყარო დაწერა."' : '"Mathematics is the language in which God has written the universe."'}
                  </p>
                  <div className="mt-2 text-right text-xs font-bold text-amber-600 dark:text-amber-400">— {language === 'ka' ? 'გალილეო გალილეი' : 'Galileo Galilei'}</div>
               </div>
            </div>
         </div>
      </div>
    );
  };

  // Sub-components for Dashboard
  const QuickAction = ({ icon: Icon, label, color, onClick }: any) => (
     <button onClick={onClick} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
        <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${color}`}>
           <Icon size={24} />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
     </button>
  );

  const LabItem = ({ icon: Icon, label, onClick }: any) => (
     <button onClick={onClick} className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
           <Icon size={18} />
        </div>
        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-900 dark:group-hover:text-indigo-100 text-sm">{label}</span>
        <ChevronRight className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-indigo-400" size={16} />
     </button>
  );

  // Nav Item Component
  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => handleViewChange(view)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full md:w-auto font-medium ${
        currentView === view 
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
      <span className="truncate text-sm">{label}</span>
      {currentView === view && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>}
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
    <div className="h-screen w-full bg-slate-50 dark:bg-black flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      
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
      <div className="md:hidden bg-white dark:bg-slate-950 p-4 flex justify-between items-center shadow-sm z-50 sticky top-0 border-b dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-white">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><Rocket size={18} /></div> MathMaster
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleLanguage} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors">
            <Languages size={18} />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={toggleMobileMenu} className="p-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-lg"><Menu /></button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="hidden md:flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"><Rocket size={24} /></div>
              <div><h1 className="font-bold text-xl text-slate-900 dark:text-white">MathMaster</h1><p className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Learning Hub</p></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleLanguage} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors" title="Switch Language">
                <Languages size={18} />
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors" title="Toggle Theme">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </div>

          {/* --- PROFILE WIDGET --- */}
          <div className="mb-6 bg-slate-900 dark:bg-black rounded-2xl p-4 text-white relative overflow-hidden shadow-lg border border-slate-800 dark:border-slate-800">
             <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500 blur-2xl opacity-20 rounded-full"></div>
             <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                   <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.level} {userProfile.level}</div>
                   <div className="font-bold text-lg">{t.student}</div>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg text-xs font-bold">
                   <Flame size={12} className="text-orange-400" fill="currentColor" /> {userProfile.streakDays} {t.streak}
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
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-2">{t.main}</div>
            <NavItem view={AppView.SYNOPSIS} icon={Grid} label={t.dashboard} />
            <NavItem view={AppView.CHAT} icon={MessageCircle} label={t.aiTutor} />
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-6">{t.tools}</div>
            <NavItem view={AppView.VISION} icon={Camera} label={t.photoAnalysis} />
            <NavItem view={AppView.GEOMETRY} icon={PencilRuler} label={t.geometryVisual} />
            <NavItem view={AppView.BOARD} icon={Presentation} label={t.whiteboard} />
            <NavItem view={AppView.CALCULATOR} icon={CalculatorIcon} label={t.calculator} />
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-6">{t.lab}</div>
            <NavItem view={AppView.MATRIX_MACHINE} icon={Grid} label={t.matrixCalc} />
            <NavItem view={AppView.PROBABILITY_MACHINE} icon={Dices} label={t.probability} />
            <NavItem view={AppView.STATS_MACHINE} icon={BarChart} label={t.stats} />
            <NavItem view={AppView.NUMBER_MACHINE} icon={Hash} label={t.numberAnalysis} />
            <NavItem view={AppView.FUNCTION_MACHINE} icon={Cog} label={t.functionMachine} />
            <NavItem view={AppView.PYTHAGORAS_MACHINE} icon={BoxSelect} label={t.pythagoras} />
            <NavItem view={AppView.UNIT_CIRCLE_MACHINE} icon={Circle} label={t.unitCircle} />
            <NavItem view={AppView.TRIANGLE_MACHINE} icon={TriangleIcon} label={t.triangleMaster} />
            <NavItem view={AppView.MOBILE_CONNECT} icon={Smartphone} label={t.mobileConnect} />
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-6">{t.assessment}</div>
            <NavItem view={AppView.QUIZ} icon={ClipboardList} label={t.testing} />
            <NavItem view={AppView.NATIONAL_EXAM} icon={FileText} label={t.nationalExam} />
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-4 mt-6">{t.extra}</div>
            <NavItem view={AppView.QUOTES_GALLERY} icon={Quote} label={t.quotes} />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
               <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1"><Sparkles size={12}/> {t.proVersion}</div>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{t.proDesc}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 h-full overflow-hidden relative bg-slate-50/50 dark:bg-black">
        <div className={`absolute inset-0 p-0 md:p-0 ${currentView === AppView.BOARD ? 'z-10 block' : 'z-0 invisible'}`}><Whiteboard onAddXp={addXp} /></div>
        <div className={`absolute inset-0 p-4 md:p-8 ${currentView === AppView.CALCULATOR ? 'z-10 block' : 'z-0 invisible'}`}><Calculator /></div>
        <div className={`absolute inset-0 p-4 md:p-8 z-20 ${currentView === AppView.AI_DISCUSSION ? 'flex items-center justify-center backdrop-blur-sm bg-slate-900/50 dark:bg-black/80' : 'hidden'}`}>
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