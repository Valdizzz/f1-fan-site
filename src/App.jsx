import React, { useState } from 'react';
import { Camera, RefreshCw, Zap, Upload, X, ChevronDown } from 'lucide-react';

const App = () => {
  const [imageGenerated, setImageGenerated] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Получаем ключ из Secrets (Vite автоматически подставит его при сборке на GitHub)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

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
      setError("Критическая ошибка: API ключ не найден в настройках GitHub.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    // Промпт для создания совместного фото
    const prompt = "Create a high-quality realistic photo. The person from the attached portrait should be standing next to George Russell in the Mercedes F1 paddock. Both are wearing black Mercedes team shirts and smiling. Professional lighting.";

    try {
      // ИСПОЛЬЗУЕМ СТАБИЛЬНУЮ ВЕРСИЮ v1
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/png", data: userPhotoBase64 } }
            ]
          }]
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Ошибка API");
      }

      // Проверяем, пришло ли изображение (inlineData) в ответе
      const base64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (base64) {
        setImageUrl(`data:image/png;base64,${base64}`);
        setImageGenerated(true);
      } else {
        // Если модель прислала только текст вместо картинки
        setError("Модель вернула текст вместо фото. Возможно, ваш ключ не поддерживает генерацию изображений через этот эндпоинт.");
        console.warn("Текстовый ответ AI:", result.candidates?.[0]?.content?.parts?.[0]?.text);
      }
    } catch (err) {
      setError(`ОШИБКА: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-sans p-6">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
          Mercedes <span className="text-[#00A19B]">Fan Lab</span>
        </h1>
        <p className="text-gray-500 mt-2">Стань частью команды Серебряных Стрел</p>
      </header>

      <div className="max-w-md w-full bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
        {!imageGenerated ? (
          <div className="space-y-6">
            {!userPhoto ? (
              <label className="flex flex-col items-center justify-center h-72 border-2 border-dashed border-[#00A19B]/30 rounded-3xl cursor-pointer hover:border-[#00A19B] transition-all group">
                <Upload className="mb-4 text-gray-500 group-hover:text-[#00A19B] transition-colors" size={48} />
                <span className="text-gray-400 font-medium">Загрузи свое селфи</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            ) : (
              <div className="relative group">
                <img src={userPhoto} className="h-72 w-full object-cover rounded-3xl border-2 border-[#00A19B]/50" alt="Preview" />
                <button 
                  onClick={() => {setUserPhoto(null); setUserPhotoBase64(null);}} 
                  className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:bg-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            <button 
              onClick={generateFanPhoto} 
              disabled={isGenerating || !userPhoto}
              className="w-full py-5 bg-[#00A19B] rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none shadow-lg shadow-[#00A19B]/20"
            >
              {isGenerating ? "Обработка в боксах..." : "Создать фото с Джорджем"}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#00A19B]">
                <img src={imageUrl} className="w-full h-auto" alt="Generated" />
            </div>
            <button 
                onClick={() => {setImageGenerated(false); setImageUrl(null);}} 
                className="w-full py-4 bg-white/10 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-white/20 transition-all"
            >
              <RefreshCw size={20} /> Попробовать другое фото
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-[11px] text-center font-mono leading-relaxed">
            {error}
          </div>
        )}
      </div>
      
      <footer className="mt-12 text-gray-600 text-[10px] uppercase tracking-[0.3em]">
        Powered by Gemini 3 Flash & Mercedes F1 Fan Spirit
      </footer>
    </div>
  );
};

export default App;