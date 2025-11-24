
import React, { useState } from 'react';
import { Quote, Copy, Check, RefreshCw, Search, User } from 'lucide-react';

interface QuotesGalleryProps {
  onAddXp?: (amount: number, reason?: string) => void;
}

const QUOTES = [
  { text: "მათემატიკა მეცნიერებათა დედოფალია, ხოლო არითმეტიკა - მათემატიკის დედოფალი.", author: "კარლ ფრიდრიხ გაუსი" },
  { text: "ბუნების წიგნი მათემატიკის ენაზეა დაწერილი.", author: "გალილეო გალილეი" },
  { text: "სუფთა მათემატიკა, თავისი გზით, ლოგიკური იდეების პოეზიაა.", author: "ალბერტ აინშტაინი" },
  { text: "ნუ ღელავთ თქვენს სირთულეებზე მათემატიკაში. გარწმუნებთ, ჩემი უფრო დიდია.", author: "ალბერტ აინშტაინი" },
  { text: "მათემატიკა არის ის, რომლითაც ღმერთმა სამყარო დაწერა.", author: "გალილეო გალილეი" },
  { text: "რიცხვები მართავენ სამყაროს.", author: "პითაგორა" },
  { text: "გეომეტრიაში არ არსებობს მეფისათვის განკუთვნილი განსაკუთრებული გზები.", author: "ევკლიდე" },
  { text: "მე ვფიქრობ, მაშასადამე ვარსებობ.", author: "რენე დეკარტი" },
  { text: "სრულყოფილი რიცხვები ისეთივე იშვიათია, როგორც სრულყოფილი ადამიანები.", author: "რენე დეკარტი" },
  { text: "მუსიკა არის გონების არაცნობიერი ვარჯიში არითმეტიკაში.", author: "გოტფრიდ ლაიბნიცი" },
  { text: "რაც არ უნდა ვაკეთოთ, ჩვენ ვითვლით.", author: "პითაგორა" },
  { text: "მათემატიკა არ არის რიცხვები, განტოლებები ან ალგორითმები: ეს არის გაგება.", author: "უილიამ პოლ თერსტონი" },
  { text: "თუ ხალხს არ სჯერა, რომ მათემატიკა მარტივია, ეს მხოლოდ იმიტომ, რომ მათ არ იციან რამდენად რთულია ცხოვრება.", author: "ჯონ ფონ ნოიმანი" },
  { text: "ღმერთმა შექმნა მთელი რიცხვები, დანარჩენი ყველაფერი ადამიანის ნახელავია.", author: "ლეოპოლდ კრონეკერი" },
  { text: "მათემატიკა არის ხელოვნება, დაარქვა ერთი და იგივე სახელი სხვადასხვა ნივთებს.", author: "ანრი პუანკარე" },
  { text: "არსი მათემატიკისა მდგომარეობს მის თავისუფლებაში.", author: "გეორგ კანტორი" },
  { text: "არაფერია უფრო პრაქტიკული, ვიდრე კარგი თეორია.", author: "ლუდვიგ ბოლცმანი" },
  { text: "ჭეშმარიტება უფრო ხშირად სიმარტივეშია, ვიდრე არეულობასა და ქაოსში.", author: "ისააკ ნიუტონი" },
  { text: "მე არ ვიცი, როგორად ვჩანვარ მსოფლიოსთვის, მაგრამ ჩემთვის მე ვარ როგორც ბიჭი, რომელიც ზღვის პირას თამაშობს.", author: "ისააკ ნიუტონი" },
  { text: "მილიონობით ადამიანი ხედავდა ვაშლის ჩამოვარდნას, მაგრამ მხოლოდ ნიუტონმა იკითხა - რატომ?", author: "ბერნარდ ბარუხი" },
  { text: "ორ წერტილს შორის უმოკლესი მანძილი არის სწორი ხაზი.", author: "არქიმედე" },
  { text: "მიეცით დასაყრდენი წერტილი და მე დავძრავ დედამიწას.", author: "არქიმედე" },
  { text: "მათემატიკა არის გონების მუსიკა.", author: "ჯეიმს ჯოზეფ სილვესტერი" },
  { text: "ცხოვრება კარგია მხოლოდ ორი რამის გამო: მათემატიკის აღმოჩენა და მათემატიკის სწავლება.", author: "სიმონ პუასონი" },
  { text: "რიცხვები არ ცრუობენ.", author: "უცნობი ავტორი" },
  { text: "მათემატიკა არის ერთადერთი ადგილი, სადაც სიმართლე და სილამაზე ერთი და იგივეა.", author: "დენიკა მაკკელარი" },
  { text: "ალგებრა არის ინტელექტუალური ინსტრუმენტი, რომელიც შეიქმნა იმისთვის, რომ გაგვეზომა სამყარო.", author: "ალფრედ ნორთ უაიტჰედი" },
  { text: "გეომეტრია არის სივრცის ცოდნა.", author: "პითაგორა" },
  { text: "მათემატიკა არის კარიბჭე და გასაღები მეცნიერებებისა.", author: "როჯერ ბეკონი" },
  { text: "შავი ხვრელები არიან ადგილი, სადაც ღმერთმა ნულზე გაყო.", author: "სტივენ ჰოკინგი" },
  { text: "განტოლება ჩემთვის არაფერს ნიშნავს, თუ ის არ გამოხატავს ღმერთის აზრს.", author: "სრინივასა რამანუჯანი" },
  { text: "ყველა ფორმულა, რომელიც ელეგანტურია, სავარაუდოდ სწორია.", author: "ედვარდ ვიტენი" },
  { text: "სტატისტიკა არის ტყუილის ყველაზე დახვეწილი ფორმა.", author: "მარკ ტვენი" },
  { text: "უსასრულობა არ არის რიცხვი, ეს არის ცნება.", author: "უცნობი" },
  { text: "წრე არის ყველაზე სრულყოფილი ფორმა.", author: "უცნობი" },
  { text: "პრობლემა, რომელიც ღირს დასასმელად, ღირს გადასაჭრელადაც.", author: "ანრი პუანკარე" },
  { text: "ლოგიკა მიგიყვანს A-დან B-მდე. წარმოსახვა მიგიყვანს ყველგან.", author: "ალბერტ აინშტაინი" },
  { text: "მათემატიკაში კითხვების დასმა უფრო მნიშვნელოვანია, ვიდრე პასუხების გაცემა.", author: "გეორგ კანტორი" },
  { text: "ნული არის რიცხვი, რომელმაც შეცვალა მსოფლიო.", author: "უცნობი" },
  { text: "მათემატიკა არ ცნობს რასებს ან გეოგრაფიულ საზღვრებს; მათემატიკისთვის კულტურული სამყარო ერთი ქვეყანაა.", author: "დავიდ ჰილბერტი" },
  { text: "ჩვენ უნდა ვიცოდეთ, ჩვენ გვეცოდინება.", author: "დავიდ ჰილბერტი" },
  { text: "მათემატიკოსი არის ბრმა კაცი ბნელ ოთახში, რომელიც ეძებს შავ კატას, რომელიც იქ არ არის.", author: "ჩარლზ დარვინი (ხუმრობით)" },
  { text: "მათემატიკა ენის გიმნასტიკაა.", author: "უცნობი" },
  { text: "ვინც უგულებელყოფს გეომეტრიას, ის უგულებელყოფს სიმართლეს.", author: "პლატონი" },
  { text: "რიცხვები უნივერსალური ენაა.", author: "უცნობი" },
  { text: "მათემატიკა არის აბსტრაქტული ჭეშმარიტების ძიება.", author: "უცნობი" },
  { text: "თუ გინდა გაიგო სამყარო, იფიქრე ენერგიის, სიხშირისა და ვიბრაციის ტერმინებში.", author: "ნიკოლა ტესლა" },
  { text: "სწავლა არასდროს ღლის გონებას.", author: "ლეონარდო და ვინჩი" },
  { text: "სიმარტივე არის დახვეწილობის უმაღლესი ფორმა.", author: "ლეონარდო და ვინჩი" }
];

export const QuotesGallery: React.FC<QuotesGalleryProps> = ({ onAddXp }) => {
  const [search, setSearch] = useState('');
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  React.useEffect(() => {
    // Random quote on load
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setDailyQuote(random);
  }, []);

  const handleCopy = (text: string, author: string, idx: number) => {
    navigator.clipboard.writeText(`"${text}" — ${author}`);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    if (onAddXp) onAddXp(5, 'ციტატის გაზიარება');
  };

  const filteredQuotes = QUOTES.filter(q => 
    q.text.includes(search) || q.author.includes(search)
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 p-4 md:p-8 animate-fadeIn overflow-y-auto">
       
       {/* Header / Daily Quote */}
       {/* Added z-10 to content and ensured min-height to prevent overlap with absolute icon */}
       <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-8 relative overflow-hidden min-h-[250px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Quote size={150} /></div>
          <div className="relative z-10 max-w-4xl">
             <div className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><RefreshCw size={14}/> შემთხვევითი ციტატა</div>
             <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed mb-6 drop-shadow-md">
               "{dailyQuote.text}"
             </h1>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><User size={20}/></div>
                <span className="font-bold text-lg">{dailyQuote.author}</span>
             </div>
          </div>
       </div>

       {/* Search & Grid */}
       <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
             <Search className="text-slate-400" />
             <input 
               type="text" 
               placeholder="მოძებნე ავტორი ან სიტყვა..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="flex-1 outline-none text-slate-900 bg-transparent placeholder:text-slate-400"
             />
             <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {filteredQuotes.length} ციტატა
             </span>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
             {filteredQuotes.map((q, idx) => (
                <div key={idx} className="break-inside-avoid bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                   <Quote size={24} className="text-indigo-200 mb-3" />
                   <p className="text-slate-800 font-medium mb-4 leading-relaxed font-serif">
                      {q.text}
                   </p>
                   <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">{q.author}</span>
                      <button 
                        onClick={() => handleCopy(q.text, q.author, idx)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg"
                        title="კოპირება"
                      >
                         {copiedIdx === idx ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
