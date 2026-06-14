import React from 'react';
import { Compass, AlertTriangle, Lightbulb } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

export const CircleTheoremsTheory: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Compass className="text-indigo-600" /> სრული თეორიული ცნობარი: წრეწირის თეორემები
        </h2>
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-8 text-sm text-indigo-800 dark:text-indigo-300">
          <strong>შენიშვნა:</strong> ეს სექცია წარმოადგენს წმინდა თეორიულ ცნობარს. აქ მოცემული წესები და ნახაზები წარმოადგენს გეომეტრიის ფუნდამენტს. მათი პრაქტიკაში გამოცდა შეგიძლიათ მარჯვენა პანელში არსებულ "დინამიურ მანქანაში".
        </div>

        <div className="space-y-10">
          
          {/* Theorem 1 */}
          <div className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
            <div className="shrink-0 flex justify-center items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <svg viewBox="0 0 100 100" className="w-40 h-40">
                <circle cx="50" cy="50" r="40" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="#ef4444" strokeWidth="2" />
                <polygon points="10,50 90,50 50,10" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="2" />
                <rect x="46" y="10" width="4" height="4" fill="none" stroke="#3b82f6" strokeWidth="1" />
                <circle cx="50" cy="50" r="2" fill="#000" />
                <text x="5" y="55" fill="#000" fontSize="8">A</text>
                <text x="92" y="55" fill="#000" fontSize="8">B</text>
                <text x="48" y="8" fill="#000" fontSize="8">C</text>
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">1. თალესის თეორემა (დიამეტრზე დაყრდნობილი კუთხე)</h3>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>ფორმულირება:</strong> ნებისმიერი ჩახაზული კუთხე, რომელიც ეყრდნობა წრეწირის დიამეტრს (ანუ ნახევარწრეწირს), არის მართი (უდრის $90^\circ$-ს).
              </p>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-900 dark:text-white"><Lightbulb className="w-4 h-4 text-yellow-500" /> რატომ მუშაობს?</div>
                დიამეტრი წრეწირს ყოფს ორ ტოლ ნაწილად, თითოეული $180^\circ$-ია. ჩახაზული კუთხე ყოველთვის იზომება იმ რკალის ნახევრით, რომელსაც ის ეყრდნობა. შესაბამისად, $180^\circ / 2 = 90^\circ$.
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>გავრცელებული შეცდომა:</strong> მოსწავლეებს ხშირად ავიწყდებათ შეამოწმონ, ნამდვილად გადის თუ არა ხაზი ცენტრზე. თუ ხაზი ცენტრზე არ გადის, ის უბრალოდ ქორდაა და კუთხე $90^\circ$ არ იქნება.</span>
              </div>
            </div>
          </div>

          {/* Theorem 2 */}
          <div className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
            <div className="shrink-0 flex justify-center items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <svg viewBox="0 0 100 100" className="w-40 h-40">
                <circle cx="50" cy="50" r="40" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <line x1="10" y1="90" x2="90" y2="90" stroke="#ec4899" strokeWidth="2" />
                <line x1="50" y1="50" x2="50" y2="90" stroke="#3b82f6" strokeWidth="2" />
                <rect x="50" y="85" width="5" height="5" fill="none" stroke="#ec4899" strokeWidth="1" />
                <circle cx="50" cy="50" r="2" fill="#000" />
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">2. მხებისა და რადიუსის მართობულობა</h3>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>ფორმულირება:</strong> წრეწირის მხები მართობულია შეხების წერტილში გავლებული რადიუსის.
              </p>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-900 dark:text-white"><Lightbulb className="w-4 h-4 text-yellow-500" /> რატომ მუშაობს?</div>
                მხებს წრეწირთან მხოლოდ ერთი საერთო წერტილი აქვს. ცენტრიდან ამ წრფემდე უმოკლესი მანძილი სწორედ შეხების წერტილზე გადის. გეომეტრიაში კი წერტილიდან წრფემდე უმოკლესი მანძილი ყოველთვის მართობია.
              </div>
            </div>
          </div>

          {/* Theorem 3 */}
          <div className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
            <div className="shrink-0 flex justify-center items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <svg viewBox="0 0 100 100" className="w-40 h-40">
                <circle cx="50" cy="50" r="40" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <path d="M 50 50 L 10 50 A 40 40 0 0 0 50 90 Z" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" strokeWidth="2" />
                <polygon points="50,10 10,50 50,90" fill="none" stroke="#10b981" strokeWidth="2" />
                <circle cx="50" cy="50" r="2" fill="#000" />
                <text x="35" y="65" fill="#f59e0b" fontSize="12" fontWeight="bold">2x</text>
                <text x="30" y="45" fill="#10b981" fontSize="12" fontWeight="bold">x</text>
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">3. ცენტრალური და ჩახაზული კუთხეები</h3>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>ფორმულირება:</strong> ერთსა და იმავე რკალზე დაყრდნობილი ცენტრალური კუთხე ორჯერ მეტია ჩახაზულ კუთხეზე.
              </p>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-900 dark:text-white"><Lightbulb className="w-4 h-4 text-yellow-500" /> რატომ მუშაობს?</div>
                ცენტრალური კუთხის გრადუსული ზომა ზუსტად ემთხვევა იმ რკალის ზომას, რომელსაც ის ეყრდნობა. ჩახაზული კუთხის წვერო კი წრეწირზეა და მისი ზომა რკალის ნახევარია.
              </div>
            </div>
          </div>

          {/* Theorem 4 */}
          <div className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
            <div className="shrink-0 flex justify-center items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <svg viewBox="0 0 100 100" className="w-40 h-40">
                <circle cx="50" cy="50" r="40" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <polygon points="21.7,21.7 78.3,78.3 21.7,78.3" fill="rgba(16, 185, 129, 0.1)" stroke="none" />
                <polygon points="21.7,21.7 78.3,78.3 78.3,21.7" fill="rgba(59, 130, 246, 0.1)" stroke="none" />
                <line x1="21.7" y1="21.7" x2="78.3" y2="78.3" stroke="#94a3b8" strokeWidth="1" />
                <line x1="21.7" y1="78.3" x2="78.3" y2="21.7" stroke="#94a3b8" strokeWidth="1" />
                <line x1="21.7" y1="21.7" x2="21.7" y2="78.3" stroke="#10b981" strokeWidth="2" />
                <line x1="78.3" y1="21.7" x2="78.3" y2="78.3" stroke="#3b82f6" strokeWidth="2" />
                <path d="M 21.7 30 A 10 10 0 0 0 30 21.7" fill="none" stroke="#10b981" strokeWidth="2" />
                <path d="M 78.3 30 A 10 10 0 0 1 70 21.7" fill="none" stroke="#3b82f6" strokeWidth="2" />
                <text x="25" y="35" fill="#10b981" fontSize="10">α</text>
                <text x="70" y="35" fill="#3b82f6" fontSize="10">α</text>
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">4. ერთსა და იმავე რკალზე დაყრდნობილი კუთხეები</h3>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>ფორმულირება:</strong> ერთსა და იმავე რკალზე (ან ერთსა და იმავე ქორდაზე ერთი და იმავე მხრიდან) დაყრდნობილი ყველა ჩახაზული კუთხე ტოლია.
              </p>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-900 dark:text-white"><Lightbulb className="w-4 h-4 text-yellow-500" /> რატომ მუშაობს?</div>
                რადგან ყველა ეს კუთხე ერთი და იმავე რკალის ნახევრით იზომება, მათი გრადუსული ზომები აუცილებლად ერთმანეთის ტოლი იქნება, მიუხედავად იმისა, წრეწირის რომელ წერტილში მდებარეობს მათი წვერო.
              </div>
            </div>
          </div>

          {/* Theorem 5 */}
          <div className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
            <div className="shrink-0 flex justify-center items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <svg viewBox="0 0 100 100" className="w-40 h-40">
                <circle cx="50" cy="50" r="40" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <line x1="20" y1="20" x2="80" y2="80" stroke="#8b5cf6" strokeWidth="2" />
                <line x1="20" y1="80" x2="80" y2="20" stroke="#8b5cf6" strokeWidth="2" />
                <text x="30" y="45" fill="#8b5cf6" fontSize="12" fontWeight="bold">a</text>
                <text x="65" y="65" fill="#8b5cf6" fontSize="12" fontWeight="bold">b</text>
                <text x="30" y="65" fill="#8b5cf6" fontSize="12" fontWeight="bold">c</text>
                <text x="65" y="45" fill="#8b5cf6" fontSize="12" fontWeight="bold">d</text>
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">5. მკვეთნარ ქორდათა თეორემა</h3>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>ფორმულირება:</strong> თუ ორი ქორდა იკვეთება წრეწირის შიგნით, ერთი ქორდის მონაკვეთების ნამრავლი უდრის მეორე ქორდის მონაკვეთების ნამრავლს. <MathRenderer text="$a \cdot b = c \cdot d$" inline />
              </p>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-900 dark:text-white"><Lightbulb className="w-4 h-4 text-yellow-500" /> რატომ მუშაობს?</div>
                ეს თეორემა მტკიცდება სამკუთხედების მსგავსებით. თუ ქორდების ბოლოებს შევაერთებთ, მივიღებთ ორ მსგავს სამკუთხედს (რადგან მათ აქვთ ტოლი ვერტიკალური და ტოლი ჩახაზული კუთხეები). მსგავსების პროპორციიდან პირდაპირ გამოდის ეს ტოლობა.
              </div>
            </div>
          </div>

          {/* Theorem 6 */}
          <div className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
            <div className="shrink-0 flex justify-center items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <svg viewBox="0 0 100 100" className="w-40 h-40">
                <circle cx="65" cy="50" r="30" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <line x1="5" y1="50" x2="50" y2="24" stroke="#ec4899" strokeWidth="2" />
                <line x1="5" y1="50" x2="50" y2="76" stroke="#ec4899" strokeWidth="2" />
                <circle cx="5" cy="50" r="2" fill="#ec4899" />
                <line x1="25" y1="35" x2="29" y2="39" stroke="#ec4899" strokeWidth="2" />
                <line x1="25" y1="65" x2="29" y2="61" stroke="#ec4899" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">6. მხების მონაკვეთები გარეთა წერტილიდან</h3>
              <p className="text-slate-800 dark:text-slate-200">
                <strong>ფორმულირება:</strong> წრეწირის გარეთ მდებარე ერთი წერტილიდან გავლებული მხების მონაკვეთები შეხების წერტილებამდე ტოლია.
              </p>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-900 dark:text-white"><Lightbulb className="w-4 h-4 text-yellow-500" /> რატომ მუშაობს?</div>
                თუ გარე წერტილს შევაერთებთ წრეწირის ცენტრთან და გავავლებთ რადიუსებს შეხების წერტილებში, მივიღებთ ორ მართკუთხა სამკუთხედს. მათ აქვთ საერთო ჰიპოტენუზა და ტოლი კათეტები (რადიუსები). შესაბამისად, ეს სამკუთხედები ტოლია და მეორე კათეტებიც (მხების მონაკვეთები) ტოლი იქნება.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
