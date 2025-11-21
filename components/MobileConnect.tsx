
import React, { useState } from 'react';
import { Smartphone, ArrowRight, CheckCircle2, Loader2, Info } from 'lucide-react';

interface MobileConnectProps {
  onSimulateScan: (imageUrl: string) => void;
}

export const MobileConnect: React.FC<MobileConnectProps> = ({ onSimulateScan }) => {
  const [step, setStep] = useState<'scan' | 'connecting' | 'success'>('scan');

  // Using simple text content for the QR code to avoid "Server Not Found" errors when scanning with a real phone
  const qrData = "MathMaster: Prototype Demo Mode. Please use the Simulate button on screen.";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}&color=4f46e5`;

  const handleSimulate = () => {
    setStep('connecting');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        // A dummy math problem image for simulation
        const dummyImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNCRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAHgAoADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z"; 
        onSimulateScan(dummyImage);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-fadeIn p-6">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full text-center relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-50 rounded-full blur-3xl"></div>

        {step === 'scan' && (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
              <Smartphone className="text-indigo-600" />
              მობილურით დაკავშირება
            </h2>
            
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 text-left mb-6 flex gap-3 items-start">
               <Info size={24} className="shrink-0 text-amber-600" />
               <p>
                 <strong>შენიშვნა:</strong> ეს არის პროტოტიპი. რეალური კავშირისთვის საჭიროა სერვერი. გთხოვთ გამოიყენოთ 
                 ქვემოთ მოცემული <strong>"სიმულაციის"</strong> ღილაკი ფუნქციონალის შესამოწმებლად.
               </p>
            </div>

            <p className="text-slate-500 mb-6 text-sm">
              დაასკანერეთ QR კოდი ან გამოიყენეთ სიმულაცია
            </p>
            
            <div className="bg-white p-4 rounded-2xl inline-block shadow-sm border border-slate-200 mb-8 relative group">
              {/* Real Generated QR Code */}
              <img 
                src={qrUrl} 
                alt="Scan QR Code" 
                className="w-48 h-48 object-contain mix-blend-multiply" 
              />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-xl pointer-events-none">
                <span className="font-bold text-indigo-600 text-sm">მხოლოდ ტექსტური ინფო</span>
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 animate-pulse hover:animate-none"
            >
              სიმულაცია (მობილურით ატვირთვა)
              <ArrowRight size={18} />
            </button>
          </>
        )}

        {step === 'connecting' && (
          <div className="py-10 flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mt-6">კავშირი მყარდება...</h3>
            <p className="text-slate-500 mt-2">გთხოვთ დაელოდოთ</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-10 flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">წარმატება!</h3>
            <p className="text-slate-500 mt-2">სურათი მიღებულია</p>
          </div>
        )}

      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-slate-400 text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          სერვერი აქტიურია (Client-Side Mock)
        </p>
      </div>
    </div>
  );
};
