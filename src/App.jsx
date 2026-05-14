// src/App.jsx
import React, { useState } from 'react';
import { ChevronDown, Trophy, Camera, Eye, EyeOff, Upload, X, RefreshCw, Zap } from 'lucide-react';

const App = () => {
  const [imageGenerated, setImageGenerated] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showUI, setShowUI] = useState(true);
  
  // КЛЮЧ БЕРЕТСЯ ИЗ ПЕРЕМЕННЫХ ОКРУЖЕНИЯ (Безопасно для GitHub Pages)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  const achievements = [
    { year: "2021", title: "Восьмой подряд!", desc: "Mercedes-AMG Petronas устанавливает рекорд, забирая 8-й Кубок конструкторов подряд." },
    { year: "2020", title: "Легендарная семерка", desc: "Льюис Хэмилтон сравнивается с Михаэлем Шумахером, завоевывая 7-й титул чемпиона мира." },
    { year: "2016", title: "Битва напарников", desc: "Нико Росберг вырывает титул в напряженной борьбе." },
    { year: "2014", title: "Рассвет Гибридной Эры", desc: "Введение турбогибридов V6 ознаменовало начало абсолютного лидерства Mercedes." },
    { year: "1954", title: "Рождение Серебряных Стрел", desc: "Возвращение в Гран-при. Первая же гонка в Реймсе заканчивается триумфальным дублем." }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result);
        setUserPhotoBase64(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateFanPhoto = async () => {
    if (!apiKey) {
      setError("Ошибка: API ключ не найден. Проверьте GitHub Secrets.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    
    // Промпт оптимизирован для высокой точности лица
    const prompt = "A high-quality realistic close-up portrait where the man from the attached photo is standing next to Formula 1 driver George Russell in the Mercedes garage. Both are wearing black official Mercedes-AMG Petronas F1 team shirts, smiling directly at the camera. Professional cinematic lighting, extremely accurate facial features maintenance for the man.";

    try {
      // Используем модель gemini-1.5-flash — она стабильна и быстра
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/png", data: userPhotoBase64 } }
            ]
          }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Ошибка сервера API");
      }

      const result = await response.json();
      const base64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (base64) {
        setImageUrl(`data:image/png;base64,${base64}`);
        setImageGenerated(true);
      } else {
        setError("Модель не вернула изображение. Попробуйте другое селфи.");
      }
    } catch (err) {
      console.error(err);
      setError(`Ошибка: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00A19B]">
      <section className="relative h-screen w-full flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          {imageUrl ? (
            <img src={imageUrl} className="w-full h-full object-cover object-top transition-transform duration-700" style={{ transform: showUI ? 'scale(1)' : 'scale(1.05)' }} />
          ) : (
            <div className="w-full h-full bg-[#080808] flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <Zap className="text-[#00A19B]/20 animate-pulse" size={100} />
            </div>
          )}
          <div className={`absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent transition-opacity ${showUI ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {imageGenerated && (
          <div className="absolute top-6 right-6 z-50 flex gap-3">
             <button onClick={() => { setImageGenerated(false); setImageUrl(null); }} className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/20 transition-all"><RefreshCw size={20} /></button>
             <button onClick={() => setShowUI(!showUI)} className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/20 transition-all">{showUI ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
        )}

        <div className={`relative z-10 w-full transition-all duration-700 px-6 pb-20 ${showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <div className="max-w-5xl mx-auto">
            {!imageGenerated ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-black italic leads-none uppercase">Mercedes <br /><span className="text-[#00A19B]">Fan Lab</span></h1>
                    <p className="text-gray-400 text-lg">Загрузи селфи и окажись в боксах Mercedes вместе с Джорджем Расселом.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                    {!userPhoto ? (
                        <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#00A19B]/30 rounded-2xl cursor-pointer hover:border-[#00A19B] transition-all group">
                            <Upload className="text-gray-500 mb-4 group-hover:text-[#00A19B]" size={40} />
                            <span className="text-gray-400 font-medium">Выбери селфи</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                    ) : (
                        <div className="relative">
                            <img src={userPhoto} className="h-64 w-full object-cover rounded-2xl border border-[#00A19B]/50" />
                            <button onClick={() => { setUserPhoto(null); setUserPhotoBase64(null); }} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full hover:bg-red-500"><X size={16} /></button>
                        </div>
                    )}
                    <button onClick={generateFanPhoto} disabled={isGenerating || !userPhoto} className="w-full mt-6 py-5 bg-[#00A19B] text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex justify-center items-center gap-3">
                        {isGenerating ? 'В боксах...' : 'СОЗДАТЬ ФОТО'} <Camera size={22} />
                    </button>
                    {error && <p className="text-red-400 text-center mt-4 text-xs font-medium">{error}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-6xl md:text-9xl font-black italic uppercase leading-none">Perfect <br /><span className="text-[#00A19B]">Teammate.</span></h1>
                <ChevronDown size={32} className="text-[#00A19B] animate-bounce mt-10 hidden md:block" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-32 container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase">История <br /><span className="text-[#00A19B]">Триумфа</span></h2>
            <div className="space-y-24">
              {achievements.map((item, i) => (
                <div key={i} className="group relative pl-8 border-l-2 border-gray-900 hover:border-[#00A19B] transition-all">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-900 border-2 border-gray-800 group-hover:bg-[#00A19B]" />
                  <span className="text-[#00A19B] font-black text-xl block mb-2">{item.year}</span>
                  <h3 className="text-2xl font-bold uppercase italic mb-4">{item.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
      </section>
    </div>
  );
};

export default App;