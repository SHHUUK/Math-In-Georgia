
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, MessageCircle, Camera, Menu, X, 
  Calculator as CalculatorIcon, Layers, Triangle, Grid, Activity, 
  TrendingUp, ArrowUpRight, List, BarChart, Zap,
  Infinity as InfinityIcon, ArrowLeft, ChevronRight, Lightbulb, Brain, PenTool,
  Divide, ClipboardList, Presentation, Smartphone, FileText, Sparkles, Rocket,
  PencilRuler, Award, Crown, Flame, Bell, Cog, BoxSelect, Circle, Triangle as TriangleIcon,
  Hash, Quote
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
import { QuotesGallery } from './components/QuotesGallery';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileImage, setMobileImage] = useState<string | null>(null);
  
  // Gamification State
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [notification, setNotification] = useState<{title: string, message: string, type: 'xp' | 'achievement' | 'level'} | null>(null);

  // Load Profile
  useEffect(() => {
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

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
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

  const renderSynopsisContent = () => {
    // LEVEL 3: Detail View
    if (selectedTopicId && selectedSubTopicId) {
      const topic = mathTopics.find(t => t.id === selectedTopicId);
      const subTopic = topic?.content.find(s => s.id === selectedSubTopicId);
      if (!topic || !subTopic) return null;

      return (
        <div className="animate-fadeIn pb-20 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={goBackToSubTopics} className="p-2 rounded-xl bg-white border hover:bg-indigo-50 transition-all"><ArrowLeft size={20} /></button>
            <div>
               <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{topic.title}</span>
               <h2 className="text-2xl font-bold text-slate-900">{subTopic.title}</h2>
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
      );
    }

    // LEVEL 2: Subtopic List
    if (selectedTopicId) {
      const topic = mathTopics.find(t => t.id === selectedTopicId);
      if (!topic) return null;
      const Icon = iconMap[topic.icon] || BookOpen;

      return (
        <div className="animate-fadeIn pb-10 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={goBackToTopics} className="p-3 rounded-xl bg-white border hover:bg-indigo-50 transition-all"><ArrowLeft size={20} /></button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Icon size={24} /></div>
              <h2 className="text-3xl font-bold text-slate-800">{topic.title}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {topic.content.map((subTopic) => (
              <MathCard key={subTopic.id} topic={subTopic} onClick={() => setSelectedSubTopicId(subTopic.id)} />
            ))}
          </div>
        </div>
      );
    }

    // LEVEL 1: DASHBOARD HUB
    return (
      <div className="space-y-8 animate-fadeIn pb-10">
         {/* Hero Section */}
         <div className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-indigo-500/30">
                 <Sparkles size={12} /> დღის მათემატიკური ფაქტი
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">სამყარო რიცხვების ენაზე საუბრობს.</h1>
              <p className="text-slate-400 text-lg mb-8">
                იცით თუ არა? 0 არ იყო რიცხვი მე-5 საუკუნემდე. ის გამოიგონეს ინდოეთში, როგორც "სიცარიელის" სიმბოლო.
              </p>
              <button onClick={() => setCurrentView(AppView.CHAT)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2">
                 <MessageCircle size={20} /> კითხე AI-ს ნებისმიერი რამ
              </button>
            </div>
            {/* Abstract visual decor */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-900/50 to-transparent skew-x-12"></div>
            <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
         </div>

         {/* Quick Actions Strip */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => setCurrentView(AppView.CALCULATOR)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3 group">
               <div className="bg-green-100 text-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform"><CalculatorIcon size={20}/></div>
               <span className="font-bold text-slate-700 text-sm">კალკულატორი</span>
            </button>
            <button onClick={() => setCurrentView(AppView.VISION)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3 group">
               <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform"><Camera size={20}/></div>
               <span className="font-bold text-slate-700 text-sm">ფოტოს ამოხსნა</span>
            </button>
            <button onClick={() => setCurrentView(AppView.BOARD)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3 group">
               <div className="bg-purple-100 text-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform"><Presentation size={20}/></div>
               <span className="font-bold text-slate-700 text-sm">დაფა & გრაფიკი</span>
            </button>
            <button onClick={() => setCurrentView(AppView.QUIZ)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3 group">
               <div className="bg-amber-100 text-amber-600 p-2 rounded-lg group-hover:scale-110 transition-transform"><ClipboardList size={20}/></div>
               <span className="font-bold text-slate-700 text-sm">ცოდნის ტესტი</span>
            </button>
         </div>

         <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><BookOpen className="text-indigo-600"/> სასწავლო თემები</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">სრული სია</span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {mathTopics.map((topic) => {
             const Icon = iconMap[topic.icon] || BookOpen;
             return (
               <button
                 key={topic.id}
                 onClick={() => setSelectedTopicId(topic.id)}
                 className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 group text-left flex flex-col h-full relative overflow-hidden"
               >
                 <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12 scale-150 pointer-events-none">
                    <Icon size={100} />
                 </div>
                 
                 <div className="flex justify-between items-start mb-4 relative z-10">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                     <Icon size={28} />
                   </div>
                   <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wide">
                     {topic.content.length} საკითხი
                   </span>
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors relative z-10">{topic.title}</h3>
                 <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1 relative z-10 leading-relaxed">
                   {topic.content.slice(0, 2).map(c => c.title).join(', ')}...
                 </p>
                 <div className="flex items-center text-indigo-600 font-bold text-sm mt-auto group-hover:translate-x-2 transition-transform relative z-10">
                   ნახვა <ChevronRight size={16} className="ml-1" />
                 </div>
               </button>
             );
           })}
         </div>
      </div>
    );
  };

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
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
            <NavItem view={AppView.NUMBER_MACHINE} icon={Hash} label="რიცხვების ანალიზი" />
            <NavItem view={AppView.STATS_MACHINE} icon={BarChart} label="სტატისტიკა" />
            <NavItem view={AppView.FUNCTION_MACHINE} icon={Cog} label="ფუნქციის მანქანა" />
            <NavItem view={AppView.PYTHAGORAS_MACHINE} icon={BoxSelect} label="პითაგორას მანქანა" />
            <NavItem view={AppView.UNIT_CIRCLE_MACHINE} icon={Circle} label="ტრიგონომეტრიის წრე" />
            <NavItem view={AppView.TRIANGLE_MACHINE} icon={TriangleIcon} label="სამკუთხედის კალკულატორი" />
            <NavItem view={AppView.CALCULATOR} icon={CalculatorIcon} label="კალკულატორი" />
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
      <main className="flex-1 h-[calc(100vh-64px)] md:h-screen overflow-hidden relative bg-slate-50/50">
        <div className={`absolute inset-0 p-0 md:p-0 ${currentView === AppView.BOARD ? 'z-10 block' : 'z-0 invisible'}`}><Whiteboard /></div>
        <div className={`absolute inset-0 p-4 md:p-8 ${currentView === AppView.CALCULATOR ? 'z-10 block' : 'z-0 invisible'}`}><Calculator /></div>
        
        <div className={`h-full w-full overflow-y-auto p-4 md:p-8 custom-scrollbar ${[AppView.BOARD, AppView.CALCULATOR].includes(currentView) ? 'hidden' : 'block'}`}>
          <div className="max-w-7xl mx-auto h-full flex flex-col relative">
            <div className={currentView === AppView.SYNOPSIS ? 'block' : 'hidden'}>{renderSynopsisContent()}</div>
            <div className={currentView === AppView.CHAT ? 'block h-full' : 'hidden'}><ChatInterface onAddXp={addXp} /></div>
            <div className={currentView === AppView.VISION ? 'block h-full' : 'hidden'}><ImageAnalyzer onAddXp={addXp} /></div>
            <div className={currentView === AppView.QUIZ ? 'block h-full' : 'hidden'}><QuizInterface onAddXp={addXp} /></div>
            <div className={currentView === AppView.NATIONAL_EXAM ? 'block h-full' : 'hidden'}><NationalExam onAddXp={addXp} /></div>
            <div className={currentView === AppView.GEOMETRY ? 'block h-full' : 'hidden'}><GeometryVisualizer onAddXp={addXp} /></div>
            <div className={currentView === AppView.NUMBER_MACHINE ? 'block h-full' : 'hidden'}><NumberMachine onAddXp={addXp} /></div>
            <div className={currentView === AppView.STATS_MACHINE ? 'block h-full' : 'hidden'}><StatsMachine onAddXp={addXp} /></div>
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