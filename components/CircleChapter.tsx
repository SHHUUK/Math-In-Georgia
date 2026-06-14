import React, { useState, useRef, useMemo } from 'react';
import { BookOpen, Compass, Calculator, HelpCircle, Plus, Trash2, MousePointer2, RefreshCw, Activity, CheckCircle2, CircleDot, Library } from 'lucide-react';
import { MathRenderer } from './MathRenderer';
import { CircleTheoremsTheory } from './CircleTheoremsTheory';

type PointType = 'center' | 'circle' | 'free';
type Point = { id: string; x: number; y: number; label: string; type: PointType };
type Segment = { id: string; p1Id: string; p2Id: string };

const R = 100;

const getDist = (p1: Point, p2: Point) => Math.hypot(p2.x - p1.x, p2.y - p1.y);
const getAngle = (p1: Point, v: Point, p2: Point) => {
  const a1 = Math.atan2(p1.y - v.y, p1.x - v.x);
  const a2 = Math.atan2(p2.y - v.y, p2.x - v.x);
  let ang = (a2 - a1) * (180 / Math.PI);
  if (ang < 0) ang += 360;
  if (ang > 180) ang = 360 - ang;
  return ang;
};
const isDiam = (p1: Point, p2: Point) => p1.type === 'circle' && p2.type === 'circle' && Math.abs(getDist(p1, p2) - 2 * R) < 2;

interface CircleChapterProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

export const CircleChapter: React.FC<CircleChapterProps> = ({ onAddXp }) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'examples' | 'exercises' | 'constructor' | 'theorems'>('theory');
  
  // Machine State
  const [points, setPoints] = useState<Point[]>([
    { id: 'O', x: 0, y: 0, label: 'O', type: 'center' },
    { id: 'A', x: 100, y: 0, label: 'A', type: 'circle' }
  ]);
  const [segments, setSegments] = useState<Segment[]>([{ id: 's1', p1Id: 'O', p2Id: 'A' }]);
  
  const [draggingPoint, setDraggingPoint] = useState<string | null>(null);
  const [connectingPoint, setConnectingPoint] = useState<string | null>(null);
  const [nextLabelCode, setNextLabelCode] = useState(66); // 'B'
  const svgRef = useRef<SVGSVGElement>(null);

  const loadConfig = (config: { points: Point[], segments: Segment[] }) => {
    setPoints(config.points);
    setSegments(config.segments);
    setConnectingPoint(null);
    setDraggingPoint(null);
    
    let maxCode = 64;
    config.points.forEach(p => {
      if (p.label.length === 1) {
        const code = p.label.charCodeAt(0);
        if (code > maxCode && code <= 90) maxCode = code;
      }
    });
    setNextLabelCode(maxCode + 1);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingPoint || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    
    setPoints(prev => prev.map(p => {
      if (p.id !== draggingPoint) return p;
      if (p.type === 'center') return p;
      if (p.type === 'circle') {
        const angle = Math.atan2(cursor.y, cursor.x);
        return { ...p, x: R * Math.cos(angle), y: R * Math.sin(angle) };
      }
      return { ...p, x: cursor.x, y: cursor.y };
    }));
  };

  const handlePointClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectingPoint) {
      if (connectingPoint !== id) {
        const exists = segments.some(s => (s.p1Id === connectingPoint && s.p2Id === id) || (s.p1Id === id && s.p2Id === connectingPoint));
        if (!exists) {
          setSegments([...segments, { id: `s_${Date.now()}`, p1Id: connectingPoint, p2Id: id }]);
        }
      }
      setConnectingPoint(null);
    }
  };

  const addPointOnCircle = () => {
    const angle = Math.random() * Math.PI * 2;
    const label = String.fromCharCode(nextLabelCode);
    setNextLabelCode(prev => prev >= 90 ? 65 : prev + 1);
    setPoints([...points, { id: `p_${Date.now()}`, x: R * Math.cos(angle), y: R * Math.sin(angle), label, type: 'circle' }]);
  };

  const addFreePoint = () => {
    const label = String.fromCharCode(nextLabelCode);
    setNextLabelCode(prev => prev >= 90 ? 65 : prev + 1);
    setPoints([...points, { id: `p_${Date.now()}`, x: (Math.random()-0.5)*150, y: (Math.random()-0.5)*150, label, type: 'free' }]);
  };

  const clearAll = () => {
    setPoints([{ id: 'O', x: 0, y: 0, label: 'O', type: 'center' }]);
    setSegments([]);
    setNextLabelCode(65);
  };

  // --- ANALYSIS ENGINE ---
  const analysis = useMemo(() => {
    const res = { lengths: [] as any[], angles: [] as any[], theorems: new Set<string>(), messages: new Set<string>() };
    
    // Lengths
    segments.forEach(s => {
      const p1 = points.find(p => p.id === s.p1Id);
      const p2 = points.find(p => p.id === s.p2Id);
      if (p1 && p2) {
        const d = getDist(p1, p2);
        res.lengths.push({ label: `${p1.label}${p2.label}`, val: d });
        
        if ((p1.type === 'center' && p2.type === 'circle') || (p2.type === 'center' && p1.type === 'circle')) {
           res.theorems.add("რადიუსი");
        }
        if (isDiam(p1, p2)) {
           res.theorems.add("დიამეტრი");
        }
      }
    });

    // Angles
    const adjList: Record<string, string[]> = {};
    points.forEach(p => adjList[p.id] = []);
    segments.forEach(s => {
      if(adjList[s.p1Id]) adjList[s.p1Id].push(s.p2Id);
      if(adjList[s.p2Id]) adjList[s.p2Id].push(s.p1Id);
    });

    points.forEach(v => {
      const neighbors = adjList[v.id];
      if (!neighbors) return;
      for(let i=0; i<neighbors.length; i++) {
        for(let j=i+1; j<neighbors.length; j++) {
          const p1 = points.find(p => p.id === neighbors[i]);
          const p2 = points.find(p => p.id === neighbors[j]);
          if (p1 && p2) {
            const ang = getAngle(p1, v, p2);
            res.angles.push({ label: `∠${p1.label}${v.label}${p2.label}`, val: ang, v, p1, p2 });
          }
        }
      }
    });

    // Detect Theorems
    res.angles.forEach(a => {
      if (a.v.type === 'circle' && a.p1.type === 'circle' && a.p2.type === 'circle') {
        if (isDiam(a.p1, a.p2)) {
          res.theorems.add("თალესის თეორემა");
          res.messages.add(`∠${a.label.substring(1)} ეყრდნობა დიამეტრს, ამიტომ ის ზუსტად 90°-ია.`);
        } else {
          res.theorems.add("ჩახაზული კუთხე");
          res.messages.add(`∠${a.label.substring(1)} არის ჩახაზული კუთხე (${a.val.toFixed(1)}°).`);
        }
      }
      if (a.v.type === 'center' && a.p1.type === 'circle' && a.p2.type === 'circle') {
        res.theorems.add("ცენტრალური კუთხე");
        res.messages.add(`∠${a.label.substring(1)} არის ცენტრალური კუთხე (${a.val.toFixed(1)}°). ის რკალის ტოლია.`);
      }
    });

    return {
      lengths: res.lengths,
      angles: res.angles,
      theorems: Array.from(res.theorems),
      messages: Array.from(res.messages)
    };
  }, [points, segments]);

  // --- CONTENT DEFINITIONS ---
  const THEORY_CONTENT = [
    {
      id: 'def_circle',
      title: 'წრეწირი და წრე',
      desc: 'წრეწირი: წერტილთა სიმრავლე, რომლებიც თანაბრადაა დაშორებული ცენტრიდან. წრე: სიბრტყის ნაწილი, შემოსაზღვრული წრეწირით.',
      action: () => loadConfig({
        points: [{ id: 'O', x: 0, y: 0, label: 'O', type: 'center' }, { id: 'A', x: 100, y: 0, label: 'A', type: 'circle' }],
        segments: [{ id: 's1', p1Id: 'O', p2Id: 'A' }]
      })
    },
    {
      id: 'def_radius',
      title: 'რადიუსი და დიამეტრი',
      desc: 'რადიუსი (R) აერთებს ცენტრს წრეწირთან. დიამეტრი (D) გადის ცენტრზე და უდრის ორ რადიუსს (D = 2R).',
      action: () => loadConfig({
        points: [
          { id: 'O', x: 0, y: 0, label: 'O', type: 'center' },
          { id: 'A', x: -100, y: 0, label: 'A', type: 'circle' },
          { id: 'B', x: 100, y: 0, label: 'B', type: 'circle' }
        ],
        segments: [{ id: 's1', p1Id: 'A', p2Id: 'B' }]
      })
    },
    {
      id: 'thales',
      title: 'თალესის თეორემა',
      desc: 'ჩახაზული კუთხე, რომელიც ეყრდნობა დიამეტრს, ყოველთვის მართია (90°).',
      action: () => loadConfig({
        points: [
          { id: 'O', x: 0, y: 0, label: 'O', type: 'center' },
          { id: 'A', x: -100, y: 0, label: 'A', type: 'circle' },
          { id: 'B', x: 100, y: 0, label: 'B', type: 'circle' },
          { id: 'C', x: 0, y: -100, label: 'C', type: 'circle' }
        ],
        segments: [
          { id: 's1', p1Id: 'A', p2Id: 'B' },
          { id: 's2', p1Id: 'A', p2Id: 'C' },
          { id: 's3', p1Id: 'B', p2Id: 'C' }
        ]
      })
    },
    {
      id: 'central_inscribed',
      title: 'ცენტრალური და ჩახაზული კუთხეები',
      desc: 'ერთსა და იმავე რკალზე დაყრდნობილი ცენტრალური კუთხე ორჯერ მეტია ჩახაზულ კუთხეზე.',
      action: () => loadConfig({
        points: [
          { id: 'O', x: 0, y: 0, label: 'O', type: 'center' },
          { id: 'A', x: -70.7, y: 70.7, label: 'A', type: 'circle' },
          { id: 'B', x: 70.7, y: 70.7, label: 'B', type: 'circle' },
          { id: 'C', x: 0, y: -100, label: 'C', type: 'circle' }
        ],
        segments: [
          { id: 's1', p1Id: 'O', p2Id: 'A' },
          { id: 's2', p1Id: 'O', p2Id: 'B' },
          { id: 's3', p1Id: 'C', p2Id: 'A' },
          { id: 's4', p1Id: 'C', p2Id: 'B' }
        ]
      })
    },
    {
      id: 'intersecting_chords',
      title: 'მკვეთნარ ქორდათა თეორემა',
      desc: 'თუ ორი ქორდა იკვეთება წრეწირის შიგნით, ერთი ქორდის მონაკვეთების ნამრავლი უდრის მეორე ქორდის მონაკვეთების ნამრავლს.',
      action: () => loadConfig({
        points: [
          { id: 'O', x: 0, y: 0, label: 'O', type: 'center' },
          { id: 'A', x: -80, y: -60, label: 'A', type: 'circle' },
          { id: 'B', x: 80, y: 60, label: 'B', type: 'circle' },
          { id: 'C', x: -60, y: 80, label: 'C', type: 'circle' },
          { id: 'D', x: 60, y: -80, label: 'D', type: 'circle' }
        ],
        segments: [
          { id: 's1', p1Id: 'A', p2Id: 'B' },
          { id: 's2', p1Id: 'C', p2Id: 'D' }
        ]
      })
    }
  ];

  const EXAMPLES_CONTENT = [
    {
      id: 'ex_thales',
      title: 'დინამიური მაგალითი: თალესის თეორემა',
      desc: 'ამოძრავეთ C წერტილი წრეწირზე და დააკვირდით, იცვლება თუ არა კუთხე.',
      action: () => {
        const ang = Math.random() * Math.PI;
        loadConfig({
          points: [
            { id: 'O', x: 0, y: 0, label: 'O', type: 'center' },
            { id: 'A', x: -100, y: 0, label: 'A', type: 'circle' },
            { id: 'B', x: 100, y: 0, label: 'B', type: 'circle' },
            { id: 'C', x: 100*Math.cos(ang), y: -100*Math.sin(ang), label: 'C', type: 'circle' }
          ],
          segments: [
            { id: 's1', p1Id: 'A', p2Id: 'B' },
            { id: 's2', p1Id: 'A', p2Id: 'C' },
            { id: 's3', p1Id: 'B', p2Id: 'C' }
          ]
        });
      }
    },
    {
      id: 'ex_central',
      title: 'დინამიური მაგალითი: ცენტრალური კუთხე',
      desc: 'ამოძრავეთ A ან B წერტილები და დააკვირდით როგორ იცვლება კუთხე.',
      action: () => {
        const ang1 = Math.random() * Math.PI;
        const ang2 = ang1 + Math.random() * Math.PI;
        loadConfig({
          points: [
            { id: 'O', x: 0, y: 0, label: 'O', type: 'center' },
            { id: 'A', x: 100*Math.cos(ang1), y: 100*Math.sin(ang1), label: 'A', type: 'circle' },
            { id: 'B', x: 100*Math.cos(ang2), y: 100*Math.sin(ang2), label: 'B', type: 'circle' }
          ],
          segments: [
            { id: 's1', p1Id: 'O', p2Id: 'A' },
            { id: 's2', p1Id: 'O', p2Id: 'B' }
          ]
        });
      }
    }
  ];

  const EXERCISES_CONTENT = [
    {
      id: 'prac_1',
      title: 'პრაქტიკა: იპოვეთ უცნობი კუთხე',
      desc: 'მოცემულია დიამეტრი და მასზე დაყრდნობილი კუთხე. რას უდრის ეს კუთხე? ამოძრავეთ წერტილები და შეამოწმეთ.',
      action: () => {
        const ang = Math.random() * Math.PI;
        loadConfig({
          points: [
            { id: 'O', x: 0, y: 0, label: 'O', type: 'center' },
            { id: 'A', x: -100, y: 0, label: 'A', type: 'circle' },
            { id: 'B', x: 100, y: 0, label: 'B', type: 'circle' },
            { id: 'C', x: 100*Math.cos(ang), y: -100*Math.sin(ang), label: 'C', type: 'circle' }
          ],
          segments: [
            { id: 's1', p1Id: 'A', p2Id: 'B' },
            { id: 's2', p1Id: 'A', p2Id: 'C' },
            { id: 's3', p1Id: 'B', p2Id: 'C' }
          ]
        });
      }
    }
  ];

  const renderContent = () => {
    let content = THEORY_CONTENT;
    if (activeTab === 'examples') content = EXAMPLES_CONTENT;
    if (activeTab === 'exercises') content = EXERCISES_CONTENT;
    if (activeTab === 'theorems') {
      return <CircleTheoremsTheory />;
    }
    if (activeTab === 'constructor') {
      return (
        <div className="p-6 text-center text-slate-500 dark:text-slate-400">
          <Compass className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold mb-2">კონსტრუქტორი</h3>
          <p>გამოიყენეთ მარჯვენა პანელზე არსებული ხელსაწყოები, რათა ააგოთ თქვენი საკუთარი ნახაზი და დააკვირდეთ შედეგებს.</p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4">
        {content.map(item => (
          <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer" onClick={item.action}>
            <h3 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
            <button className="mt-3 text-xs font-bold text-white bg-indigo-500 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-600 transition-colors">
              <RefreshCw className="w-3 h-3" /> ნახაზის ჩატვირთვა
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <CircleDot className="text-indigo-600 w-8 h-8" />
          წრეწირი და წრე (ინტერაქტიული)
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          დინამიური გეომეტრიის ლაბორატორია. ამოძრავეთ წერტილები, ააგეთ ფიგურები და დააკვირდით თეორემებს ცოცხალ რეჟიმში.
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* LEFT PANEL: Content */}
        <div className="w-full lg:w-4/12 flex flex-col bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 p-2 gap-2">
            {[
              { id: 'theory', icon: BookOpen, label: 'ცნებები' },
              { id: 'theorems', icon: Library, label: 'თეორემები (ცნობარი)' },
              { id: 'examples', icon: Calculator, label: 'მაგალითები' },
              { id: 'exercises', icon: HelpCircle, label: 'პრაქტიკა' },
              { id: 'constructor', icon: Compass, label: 'კონსტრუქტორი' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {renderContent()}
          </div>
        </div>

        {/* RIGHT PANEL: Machine & Results */}
        <div className="w-full lg:w-8/12 flex flex-col gap-4">
          
          {/* Machine Canvas */}
          <div className="flex-1 bg-slate-900 rounded-2xl relative overflow-hidden shadow-inner flex flex-col border border-slate-800">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 bg-slate-800/80 backdrop-blur-md p-2 rounded-xl border border-slate-700">
              <button onClick={addPointOnCircle} className="text-xs font-bold text-white bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-600 transition-colors">
                <Plus className="w-3 h-3" /> წერტილი წრეზე
              </button>
              <button onClick={addFreePoint} className="text-xs font-bold text-white bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-600 transition-colors">
                <Plus className="w-3 h-3" /> თავისუფალი წერტილი
              </button>
              <button 
                onClick={() => setConnectingPoint(connectingPoint ? null : 'active')} 
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${connectingPoint ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
              >
                <MousePointer2 className="w-3 h-3" /> {connectingPoint ? 'აირჩიეთ წერტილები...' : 'მონაკვეთი'}
              </button>
              <button onClick={clearAll} className="text-xs font-bold text-red-400 bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-600 transition-colors">
                <Trash2 className="w-3 h-3" /> გასუფთავება
              </button>
            </div>
            
            <svg 
              ref={svgRef}
              viewBox="-150 -150 300 300" 
              className="w-full h-full touch-none cursor-crosshair"
              onPointerMove={handlePointerMove}
              onPointerUp={() => setDraggingPoint(null)}
              onPointerLeave={() => setDraggingPoint(null)}
            >
              <circle cx="0" cy="0" r={R} stroke="#4f46e5" strokeWidth="2" fill="rgba(79, 70, 229, 0.05)" />
              
              {/* Segments */}
              {segments.map(s => {
                const p1 = points.find(p => p.id === s.p1Id);
                const p2 = points.find(p => p.id === s.p2Id);
                if (!p1 || !p2) return null;
                return (
                  <line 
                    key={s.id} 
                    x1={p1.x} y1={p1.y} 
                    x2={p2.x} y2={p2.y} 
                    stroke="#8b5cf6" 
                    strokeWidth="2" 
                  />
                );
              })}

              {/* Points */}
              {points.map(p => (
                <g key={p.id} transform={`translate(${p.x}, ${p.y})`}>
                  <circle 
                    r="6" 
                    fill={p.id === connectingPoint ? "#ec4899" : (p.type === 'center' ? "#ef4444" : "#10b981")} 
                    className="cursor-pointer hover:opacity-80"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      if (connectingPoint) {
                        handlePointClick(p.id, e);
                      } else {
                        setDraggingPoint(p.id);
                      }
                    }}
                    onClick={(e) => {
                      if (connectingPoint) handlePointClick(p.id, e);
                    }}
                  />
                  <text 
                    x="8" y="-8" 
                    fill="white" 
                    fontSize="12" 
                    fontWeight="bold" 
                    className="pointer-events-none select-none"
                    stroke="#0f172a"
                    strokeWidth="3"
                    paintOrder="stroke"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Results Panel */}
          <div className="h-48 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 overflow-y-auto flex flex-col">
            <h3 className="font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" /> ცოცხალი ანალიზი
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">მონაცემები</h4>
                <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {analysis.lengths.slice(0, 4).map((l, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{l.label}:</span>
                      <span className="font-mono font-bold">{l.val.toFixed(1)}</span>
                    </div>
                  ))}
                  {analysis.angles.slice(0, 4).map((a, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{a.label}:</span>
                      <span className="font-mono font-bold">{a.val.toFixed(1)}°</span>
                    </div>
                  ))}
                  {analysis.lengths.length === 0 && analysis.angles.length === 0 && (
                    <span className="text-slate-400 italic">მონაცემები არ არის</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 md:col-span-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">აღმოჩენილი თეორემები</h4>
                <div className="space-y-2">
                  {analysis.theorems.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {analysis.theorems.map((t, i) => (
                        <span key={i} className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-md text-xs font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-sm">თეორემები არ მოიძებნა</span>
                  )}
                  
                  {analysis.messages.map((m, i) => (
                    <div key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
