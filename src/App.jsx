import React, { useState, useRef } from 'react';
import { ChevronDown, Trophy, Star, History, Zap, Camera, Eye, EyeOff, Upload, X, RefreshCw } from 'lucide-react';

const App = () => {
  const [imageGenerated, setImageGenerated] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showUI, setShowUI] = useState(true);
  
  // ВСТАВЬ СВОЙ КЛЮЧ СЮДА:
  const apiKey = "AIzaSyBzu1xFSsFJbND70tMb5Eho6D9CudbE9AY";

  const achievements = [
    {
      year: "2021",
      title: "Восьмой подряд!",
      desc: "Mercedes-AMG Petronas устанавливает рекорд, забирая 8-й Кубок конструкторов подряд.",
    },
    {
      year: "2020",
      title: "Легендарная семерка",
      desc: "Льюис Хэмилтон сравнивается с Михаэлем Шумахером, завоевывая 7-й титул чемпиона мира.",
    },
    {
      year: "2016",
      title: "Битва напарников",
      desc: "Нико Росберг вырывает титул в напряженной борьбе.",
    },
    {
      year: "2014",
      title: "Рассвет Гибридной Эры",
      desc: "Введение турбогибридов V6 ознаменовало начало абсолютного лидерства Mercedes.",
    },
    {
      year: "1954",
      title: "Рождение Серебряных Стрел",
      desc: "Возвращение в Гран-при. Первая же гонка в Реймсе заканчивается триумфальным дублем.",
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result);
        const base64String = reader.result.split(',')[1];
        setUserPhotoBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateFanPhoto = async () => {
    if (!userPhotoBase64) {
      setError("Загрузи селфи!");
      return;
    }
    setIsGenerating(true);
    setError(null);
    
    const prompt = "A high-quality realistic photo where the woman from the attached portrait is standing next to F1 driver George Russell. They are both in Mercedes-AMG Petronas F1 team black shirts, smiling at camera in a paddock. Maintain her facial features from the provided image.";

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/png", data: userPhotoBase64 } }
            ]
          }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        })
      });

      const result = await response.json();
      const base64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (base64) {
        setImageUrl(`data:image/png;base64,${base64}`);
        setImageGenerated(true);
      } else {
        throw new Error('Ошибка генерации');
      }
    } catch (err) {
      setError("Не удалось создать фото. Попробуй еще раз.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00A19B]">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          {imageUrl ? (
            <img src={imageUrl} className="w-full h-full object-cover object-top transition-transform duration-1000" style={{ transform: showUI ? 'scale(1)' : 'scale(1.05)' }} />
          ) : (
            <div className="w-full h-full bg-[#080808] flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <Zap className="text-[#00A19B]/20 animate-pulse" size={120} />
            </div>
          )}
          <div className={`absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent transition-opacity ${showUI ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {imageGenerated && (
          <div className="absolute top-6 right-6 z-50 flex gap-3">
             <button onClick={() => { setImageGenerated(false); setImageUrl(null); }} className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/20"><RefreshCw size={20} /></button>
             <button onClick={() => setShowUI(!showUI)} className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/20">{showUI ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
        )}

        <div className={`relative z-10 w-full transition-all duration-700 px-6 pb-20 ${showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <div className="max-w-5xl mx-auto">
            {!imageGenerated ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-black italic leading-none uppercase">Mercedes <br /><span className="text-[#00A19B]">Fan Lab</span></h1>
                    <p className="text-gray-400 text-lg">Загрузи селфи и окажись в боксах Mercedes вместе с Джорджем Расселом.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                    {!userPhoto ? (
                        <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#00A19B]/30 rounded-2xl cursor-pointer hover:border-[#00A19B] transition-all">
                            <Upload className="text-gray-500 mb-4" size={40} />
                            <span className="text-gray-400">Выбери селфи</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                    ) : (
                        <div className="relative">
                            <img src={userPhoto} className="h-64 w-full object-cover rounded-2xl border border-[#00A19B]/50" />
                            <button onClick={() => { setUserPhoto(null); setUserPhotoBase64(null); }} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full hover:bg-red-500"><X size={16} /></button>
                        </div>
                    )}
                    <button onClick={generateFanPhoto} disabled={isGenerating || !userPhoto} className="w-full mt-6 py-5 bg-[#00A19B] text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex justify-center items-center gap-3">
                        {isGenerating ? 'В боксах...' : 'Создать фото'} <Camera size={22} />
                    </button>
                    {error && <p className="text-red-400 text-center mt-4 text-sm">{error}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-6xl md:text-9xl font-black italic uppercase leading-none">Perfect <br /><span className="text-[#00A19B]">Teammate.</span></h1>
                <div className="pt-10 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-[#00A19B] to-transparent opacity-30" />
                    <ChevronDown size={32} className="text-[#00A19B] animate-bounce" />
                    <div className="h-px flex-1 bg-gradient-to-l from-[#00A19B] to-transparent opacity-30" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="sticky top-32 h-fit">
              <h2 className="text-5xl md:text-7xl font-black italic uppercase">История <br /><span className="text-[#00A19B]">Триумфа</span></h2>
              <p className="text-gray-500 mt-6 text-lg">Путь легендарных «Серебряных стрел» сквозь десятилетия.</p>
            </div>
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