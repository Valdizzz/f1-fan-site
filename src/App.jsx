import React, { useState } from 'react';
import { Camera, RefreshCw, Zap, Upload, X, ChevronDown } from 'lucide-react';

const App = () => {
  const [imageGenerated, setImageGenerated] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Получаем ключ из Secrets
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
      setError("API ключ не найден. Проверьте настройки в GitHub!");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    // Промпт для генерации фото
    const prompt = "A realistic photo of the person from the attached portrait standing next to F1 driver George Russell. They are both wearing black Mercedes-AMG Petronas F1 team shirts and smiling in a paddock setting.";

    try {
      // ИСПОЛЬЗУЕМ СТАБИЛЬНУЮ ВЕРСИЮ v1 и модель gemini-1.5-flash
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/png", data: userPhotoBase64 } }
            ]
          }],
          // Важное примечание: стандартный Gemini 1.5 Flash через API 
          // чаще всего возвращает ТЕКСТ. Для генерации ИЗОБРАЖЕНИЯ (Image-to-Image) 
          // обычно требуются специальные модели (например, Imagen), 
          // но мы пробуем выполнить мультимодальный запрос.
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Ошибка API");
      }

      // Пытаемся найти изображение в ответе (если модель его сгенерировала)
      const base64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (base64) {
        setImageUrl(`data:image/png;base64,${base64}`);
        setImageGenerated(true);
      } else {
        // Если модель вернула только текст (описание), выводим это как ошибку для данного сайта
        setError("Модель вернула текст вместо фото. Для генерации картинок убедитесь, что ваш API-ключ поддерживает Imagen или мультимодальный вывод.");
        console.log("Ответ модели (текст):", result.candidates?.[0]?.content?.parts?.[0]?.text);
      }
    } catch (err) {
      setError(`ОШИБКА: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // ... (остальной UI остается таким же, как в прошлом сообщении)
  return (
    <div className="min-h-screen bg-[#050505] text-white p-10 flex flex-col items-center justify-center font-sans">
      <h1 className="text-4xl font-black italic uppercase mb-10">Mercedes <span className="text-[#00A19B]">Fan Lab</span></h1>
      <div className="max-w-md w-full bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
        {!imageGenerated ? (
          <>
            {!userPhoto ? (
              <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#00A19B]/30 rounded-2xl cursor-pointer hover:border-[#00A19B] transition-all">
                <Upload className="mb-2 text-gray-500" />
                <span className="text-gray-400">Загрузи селфи</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            ) : (
              <div className="relative">
                <img src={userPhoto} className="h-64 w-full object-cover rounded-2xl border border-[#00A19B]/50" />
                <button onClick={() => setUserPhoto(null)} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full"><X size={16} /></button>
              </div>
            )}
            <button onClick={generateFanPhoto} disabled={isGenerating || !userPhoto} className="w-full mt-6 py-4 bg-[#00A19B] rounded-xl font-bold uppercase hover:scale-105 transition-all disabled:opacity-20">
              {isGenerating ? "Запрос к AI..." : "Создать фото"}
            </button>
          </>
        ) : (
          <div className="space-y-6">
            <img src={imageUrl} className="w-full rounded-2xl border border-[#00A19B]" />
            <button onClick={() => setImageGenerated(false)} className="w-full py-4 bg-white/10 rounded-xl flex items-center justify-center gap-2">
              <RefreshCw size={18} /> Еще раз
            </button>
          </div>
        )}
        {error && <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-[10px] text-center font-mono">{error}</div>}
      </div>
    </div>
  );
};

export default App;