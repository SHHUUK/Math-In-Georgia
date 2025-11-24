
import React, { useState, useEffect, useRef } from 'react';
import { Dices, Coins, CreditCard, RotateCcw, Play, BarChart3, X, Info, Trophy, HelpCircle } from 'lucide-react';

interface ProbabilityMachineProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

type Tab = 'dice' | 'coin' | 'cards';

export const ProbabilityMachine: React.FC<ProbabilityMachineProps> = ({ onAddXp }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dice');
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4 md:p-8 animate-fadeIn overflow-y-auto relative">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative">
            <button onClick={() => setShowTutorial(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Info size={32} /></div>
               <div>
                 <h2 className="text-2xl font-bold text-slate-800">ალბათობის ლაბორატორია</h2>
                 <p className="text-slate-500">ექსპერიმენტული მათემატიკა</p>
               </div>
            </div>
            <p className="text-slate-600 mb-4">
              აქ შეგიძლიათ ჩაატაროთ ათასობით ცდა წამებში და დააკვირდეთ დიდ რიცხვთა კანონს მოქმედებაში.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
               <li className="flex gap-2"><Dices size={18} className="text-indigo-500 shrink-0"/> <strong>კამათელი:</strong> გამოიკვლიეთ ჯამის განაწილება (ნორმალური განაწილება).</li>
               <li className="flex gap-2"><Coins size={18} className="text-amber-500 shrink-0"/> <strong>მონეტა:</strong> ნახეთ როგორ უახლოვდება სიხშირე 50/50-ს.</li>
               <li className="flex gap-2"><CreditCard size={18} className="text-red-500 shrink-0"/> <strong>ბანქო:</strong> შეისწავლეთ ფერებისა და მასტების ალბათობა.</li>
            </ul>
            <button onClick={() => setShowTutorial(false)} className="w-full mt-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">დავიწყოთ</button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full">
         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                     <BarChart3 className="text-indigo-600" size={32} /> ალბათობის ლაბორატორია
                  </h1>
                  <p className="text-slate-500 mt-1">სიმულაციები და სტატისტიკა</p>
               </div>
               <button onClick={() => setShowTutorial(true)} className="text-slate-400 hover:text-indigo-600"><HelpCircle size={24} /></button>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl inline-flex">
               <TabButton id="dice" icon={Dices} label="კამათელი" active={activeTab === 'dice'} onClick={() => setActiveTab('dice')} />
               <TabButton id="coin" icon={Coins} label="მონეტა" active={activeTab === 'coin'} onClick={() => setActiveTab('coin')} />
               <TabButton id="cards" icon={CreditCard} label="ბანქო" active={activeTab === 'cards'} onClick={() => setActiveTab('cards')} />
            </div>
         </div>

         <div className="animate-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dice' && <DiceSimulation onAddXp={onAddXp} />}
            {activeTab === 'coin' && <CoinSimulation onAddXp={onAddXp} />}
            {activeTab === 'cards' && <CardSimulation onAddXp={onAddXp} />}
         </div>
      </div>
    </div>
  );
};

// --- DICE SIMULATION ---

const DiceSimulation = ({ onAddXp }: { onAddXp?: (a:number, r:string) => void }) => {
  const [diceCount, setDiceCount] = useState<1|2>(2);
  const [rollAmount, setRollAmount] = useState(1);
  const [lastRoll, setLastRoll] = useState<number[]>([1, 1]);
  const [stats, setStats] = useState<number[]>(new Array(13).fill(0)); // Index 0-12
  const [totalRolls, setTotalRolls] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  const roll = () => {
    setIsRolling(true);
    
    // Visual animation for single roll
    if (rollAmount === 1) {
       let frames = 0;
       const interval = setInterval(() => {
          setLastRoll([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
          frames++;
          if (frames > 10) {
             clearInterval(interval);
             finalizeRoll();
          }
       }, 50);
    } else {
       finalizeRoll();
    }
  };

  const finalizeRoll = () => {
    const newStats = [...stats];
    let finalRoll = [1,1];

    for (let i = 0; i < rollAmount; i++) {
       const d1 = Math.floor(Math.random() * 6) + 1;
       const d2 = Math.floor(Math.random() * 6) + 1;
       const sum = diceCount === 1 ? d1 : d1 + d2;
       newStats[sum]++;
       if (i === rollAmount - 1) finalRoll = [d1, diceCount === 2 ? d2 : 0];
    }

    setLastRoll(finalRoll);
    setStats(newStats);
    setTotalRolls(prev => prev + rollAmount);
    setIsRolling(false);
    if (onAddXp) onAddXp(rollAmount > 1 ? 15 : 5, 'კამათლის გაგორება');
  };

  const reset = () => {
    setStats(new Array(13).fill(0));
    setTotalRolls(0);
  };

  const maxFreq = Math.max(...stats, 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* Controls */}
       <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit">
          <div className="mb-6">
             <label className="text-xs font-bold text-slate-400 uppercase block mb-2">კამათლების რაოდენობა</label>
             <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                <button onClick={() => {setDiceCount(1); reset();}} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${diceCount === 1 ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>1 კამათელი</button>
                <button onClick={() => {setDiceCount(2); reset();}} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${diceCount === 2 ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>2 კამათელი</button>
             </div>
          </div>

          <div className="mb-6">
             <label className="text-xs font-bold text-slate-400 uppercase block mb-2">გაგორებების რაოდენობა</label>
             <div className="grid grid-cols-4 gap-2">
                {[1, 10, 100, 1000].map(n => (
                   <button key={n} onClick={() => setRollAmount(n)} className={`py-2 text-sm font-bold rounded-lg border transition-all ${rollAmount === n ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600'}`}>{n}</button>
                ))}
             </div>
          </div>

          <button onClick={roll} disabled={isRolling} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
             {isRolling ? 'გორდება...' : <><Dices /> გაგორება</>}
          </button>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
             <div className="text-xs font-bold text-slate-400 uppercase mb-2">ბოლო შედეგი</div>
             <div className="flex justify-center gap-4">
                <DiceFace val={lastRoll[0]} />
                {diceCount === 2 && <DiceFace val={lastRoll[1]} />}
             </div>
             <div className="mt-2 font-bold text-slate-700 text-xl">ჯამი: {diceCount === 1 ? lastRoll[0] : lastRoll[0] + lastRoll[1]}</div>
          </div>
       </div>

       {/* Chart */}
       <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <div>
               <h3 className="font-bold text-slate-800">შედეგების განაწილება</h3>
               <p className="text-xs text-slate-500">სულ გაგორება: {totalRolls}</p>
             </div>
             <button onClick={reset} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><RotateCcw size={18}/></button>
          </div>
          
          <div className="flex-1 flex items-end gap-2 min-h-[300px] border-b border-slate-100 pb-2 px-2">
             {stats.map((count, sum) => {
                if (diceCount === 1 && (sum < 1 || sum > 6)) return null;
                if (diceCount === 2 && sum < 2) return null;
                
                const height = (count / maxFreq) * 100;
                return (
                   <div key={sum} className="flex-1 flex flex-col items-center group relative">
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity z-10">
                         {count} ({totalRolls > 0 ? ((count/totalRolls)*100).toFixed(1) : 0}%)
                      </div>
                      <div className="w-full bg-indigo-100 rounded-t-md relative overflow-hidden hover:bg-indigo-200 transition-colors" style={{height: `${Math.max(height, 0)}%`, minHeight: count > 0 ? '4px' : '0'}}>
                         <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 transition-all duration-500" style={{height: '100%'}}></div>
                      </div>
                      <div className="mt-2 text-xs font-bold text-slate-500">{sum}</div>
                   </div>
                );
             })}
          </div>
       </div>
    </div>
  );
};

const DiceFace = ({ val }: { val: number }) => {
   // Standard Dice Dot Positions
   const dots = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
   }[val] || [];

   return (
      <div className="w-16 h-16 bg-white border-2 border-slate-300 rounded-2xl shadow-md grid grid-cols-3 grid-rows-3 p-2 gap-1">
         {[...Array(9)].map((_, i) => (
            <div key={i} className={`rounded-full ${dots.includes(i) ? 'bg-slate-800' : ''}`}></div>
         ))}
      </div>
   );
};

// --- COIN SIMULATION ---

const CoinSimulation = ({ onAddXp }: { onAddXp?: (a:number, r:string) => void }) => {
   const [flipAmount, setFlipAmount] = useState(1);
   const [heads, setHeads] = useState(0);
   const [tails, setTails] = useState(0);
   const [lastResult, setLastResult] = useState<'H' | 'T' | null>(null);
   const [isFlipping, setIsFlipping] = useState(false);

   const flip = () => {
      setIsFlipping(true);

      if (flipAmount === 1) {
         // Animation
         setTimeout(() => {
            finalizeFlip();
         }, 500);
      } else {
         finalizeFlip();
      }
   };

   const finalizeFlip = () => {
      let h = 0;
      let t = 0;
      let last: 'H' | 'T' = 'H';

      for(let i=0; i<flipAmount; i++) {
         if (Math.random() < 0.5) { h++; last='H'; } else { t++; last='T'; }
      }

      setHeads(prev => prev + h);
      setTails(prev => prev + t);
      setLastResult(last);
      setIsFlipping(false);
      if (onAddXp) onAddXp(flipAmount > 1 ? 15 : 5, 'მონეტის აგდება');
   };

   const reset = () => {
      setHeads(0);
      setTails(0);
      setLastResult(null);
   };

   const total = heads + tails;
   const hPct = total > 0 ? (heads / total) * 100 : 50;
   const tPct = total > 0 ? (tails / total) * 100 : 50;

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Controls */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit">
            <div className="mb-6">
               <label className="text-xs font-bold text-slate-400 uppercase block mb-2">აგდებების რაოდენობა</label>
               <div className="grid grid-cols-4 gap-2">
                  {[1, 10, 100, 1000].map(n => (
                     <button key={n} onClick={() => setFlipAmount(n)} className={`py-2 text-sm font-bold rounded-lg border transition-all ${flipAmount === n ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600'}`}>{n}</button>
                  ))}
               </div>
            </div>

            <button onClick={flip} disabled={isFlipping} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
               {isFlipping ? 'ტრიალებს...' : <><Coins /> აგდება</>}
            </button>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
               <div className="text-xs font-bold text-slate-400 uppercase mb-4">ბოლო შედეგი</div>
               <div className={`w-24 h-24 rounded-full mx-auto border-4 border-amber-300 shadow-inner flex items-center justify-center text-3xl font-bold text-amber-700 transition-all duration-500 ${isFlipping ? 'animate-spin' : ''} ${lastResult === 'H' ? 'bg-amber-100' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                  {lastResult === 'H' ? 'G' : lastResult === 'T' ? 'S' : '?'}
               </div>
               <div className="mt-2 font-bold text-slate-500">{lastResult === 'H' ? 'გერბი' : lastResult === 'T' ? 'საფასური' : ''}</div>
            </div>
         </div>

         {/* Stats */}
         <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
             <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="font-bold text-slate-800">სტატისტიკა</h3>
                  <p className="text-xs text-slate-500">დიდი რიცხვების კანონი: რაც მეტია ცდა, მით უფრო უახლოვდება 50%-ს.</p>
               </div>
               <button onClick={reset} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><RotateCcw size={18}/></button>
             </div>

             <div className="flex-1 flex flex-col justify-center gap-8">
                {/* Visual Bar */}
                <div className="w-full h-16 bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner relative">
                   <div className="h-full bg-amber-400 flex items-center justify-start px-4 transition-all duration-700 text-amber-900 font-bold whitespace-nowrap overflow-hidden" style={{width: `${hPct}%`}}>
                      გერბი {heads}
                   </div>
                   <div className="h-full bg-slate-300 flex items-center justify-end px-4 transition-all duration-700 text-slate-700 font-bold whitespace-nowrap overflow-hidden" style={{width: `${tPct}%`}}>
                      {tails} საფასური
                   </div>
                   
                   {/* Center Marker */}
                   <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 z-10"></div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-center">
                   <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <div className="text-4xl font-bold text-amber-600 mb-1">{hPct.toFixed(1)}%</div>
                      <div className="text-xs font-bold text-amber-400 uppercase">გერბის ალბათობა</div>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-4xl font-bold text-slate-600 mb-1">{tPct.toFixed(1)}%</div>
                      <div className="text-xs font-bold text-slate-400 uppercase">საფასურის ალბათობა</div>
                   </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl text-sm text-indigo-800 flex items-center gap-3">
                   <Info size={20} className="shrink-0" />
                   სულ ჩატარდა {total} ცდა. თეორიული ალბათობაა 50%. განსხვავება არის {Math.abs(50 - hPct).toFixed(2)}%.
                </div>
             </div>
         </div>
      </div>
   );
};

// --- CARD SIMULATION ---

const CardSimulation = ({ onAddXp }: { onAddXp?: (a:number, r:string) => void }) => {
   const [drawnCards, setDrawnCards] = useState<any[]>([]);
   const [stats, setStats] = useState({ red: 0, black: 0, suits: { hearts: 0, diamonds: 0, clubs: 0, spades: 0 } });

   const draw = (count: number) => {
      const suits = ['♥', '♦', '♣', '♠'];
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const newCards = [];

      // Update Stats Temps
      let r = stats.red;
      let b = stats.black;
      let s = { ...stats.suits };

      for(let i=0; i<count; i++) {
         const suitIdx = Math.floor(Math.random() * 4);
         const rankIdx = Math.floor(Math.random() * 13);
         const suit = suits[suitIdx];
         const isRed = suit === '♥' || suit === '♦';
         
         // Stats
         if (isRed) r++; else b++;
         if (suit === '♥') s.hearts++;
         else if (suit === '♦') s.diamonds++;
         else if (suit === '♣') s.clubs++;
         else s.spades++;

         newCards.push({
            suit, 
            rank: ranks[rankIdx], 
            isRed,
            id: Math.random()
         });
      }

      setStats({ red: r, black: b, suits: s });
      // Keep last 5 visible
      setDrawnCards(prev => [...newCards, ...prev].slice(0, 5));
      if (onAddXp) onAddXp(10, 'ბანქოს ამოღება');
   };

   const reset = () => {
      setStats({ red: 0, black: 0, suits: { hearts: 0, diamonds: 0, clubs: 0, spades: 0 } });
      setDrawnCards([]);
   };

   const total = stats.red + stats.black;

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit">
            <div className="mb-6 space-y-3">
               <button onClick={() => draw(1)} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95">
                  1 კარტის ამოღება
               </button>
               <button onClick={() => draw(5)} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95">
                  5 კარტის ამოღება
               </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
               <div className="text-xs font-bold text-slate-400 uppercase mb-4 text-center">ბოლოს ამოღებული</div>
               <div className="flex justify-center gap-[-10px] min-h-[140px] perspective-500">
                  {drawnCards.length === 0 && <div className="text-slate-300 text-sm italic mt-10">მაგიდა ცარიელია</div>}
                  {drawnCards.map((c, i) => (
                     <div key={c.id} className={`w-24 h-36 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col items-center justify-center text-3xl animate-in slide-in-from-right-10 fade-in duration-500 absolute`} style={{transform: `translateX(${i * 20}px) rotate(${i * 5}deg)`, zIndex: 10-i, left: '50%', marginLeft: '-48px'}}>
                        <div className={`font-bold ${c.isRed ? 'text-red-600' : 'text-slate-900'}`}>{c.suit}</div>
                        <div className={`font-bold text-xl ${c.isRed ? 'text-red-600' : 'text-slate-900'}`}>{c.rank}</div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-slate-800">სტატისტიკა ({total} კარტი)</h3>
               <button onClick={reset} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><RotateCcw size={18}/></button>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-6">
                <StatBox label="წითელი" val={stats.red} total={total} color="text-red-500 bg-red-50" />
                <StatBox label="შავი" val={stats.black} total={total} color="text-slate-800 bg-slate-100" />
             </div>

             <div className="grid grid-cols-4 gap-2">
                <SuitStat icon="♥" val={stats.suits.hearts} total={total} color="text-red-500" />
                <SuitStat icon="♦" val={stats.suits.diamonds} total={total} color="text-red-500" />
                <SuitStat icon="♣" val={stats.suits.clubs} total={total} color="text-slate-800" />
                <SuitStat icon="♠" val={stats.suits.spades} total={total} color="text-slate-800" />
             </div>
         </div>
      </div>
   );
};

const StatBox = ({ label, val, total, color }: any) => (
   <div className={`p-4 rounded-xl border border-transparent ${color}`}>
      <div className="text-xs font-bold uppercase opacity-70">{label}</div>
      <div className="text-2xl font-bold">{val} <span className="text-sm opacity-60">({total > 0 ? ((val/total)*100).toFixed(0) : 0}%)</span></div>
   </div>
);

const SuitStat = ({ icon, val, total, color }: any) => (
   <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
      <div className={`text-2xl mb-1 ${color}`}>{icon}</div>
      <div className="font-bold text-slate-700">{val}</div>
      <div className="text-[10px] text-slate-400">{total > 0 ? ((val/total)*100).toFixed(0) : 0}%</div>
   </div>
);

const TabButton = ({ id, icon: Icon, label, active, onClick }: any) => (
   <button onClick={onClick} className={`flex-1 py-2 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
      <Icon size={18} /> {label}
   </button>
);
