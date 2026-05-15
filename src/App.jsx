import { useState } from 'react';
import { RefreshCw, Upload, X } from 'lucide-react';

const App = () => {
  const [imageGenerated, setImageGenerated] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState(null);
  const [userPhotoMimeType, setUserPhotoMimeType] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const imageModel = "gemini-2.5-flash-image";

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserPhoto(reader.result);
      setUserPhotoBase64(reader.result.split(',')[1]);
      setUserPhotoMimeType(file.type || "image/png");
      setImageGenerated(false);
      setImageUrl(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const resetUpload = () => {
    setUserPhoto(null);
    setUserPhotoBase64(null);
    setUserPhotoMimeType(null);
    setImageGenerated(false);
    setImageUrl(null);
    setError(null);
  };

  const generateFanPhoto = async () => {
    if (!apiKey) {
      setError("API ключ не найден. Добавьте VITE_GEMINI_API_KEY в .env.local для локального запуска или в GitHub Secrets для сборки.");
      return;
    }

    if (!userPhotoBase64) {
      setError("Сначала загрузите фото.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const prompt = "Create a high-quality realistic photo. The person from the attached portrait should be standing next to George Russell in the Mercedes F1 paddock. Both are wearing black Mercedes team shirts and smiling. Professional lighting.";

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: userPhotoMimeType || "image/png",
                  data: userPhotoBase64,
                },
              },
            ],
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Ошибка API");
      }

      const imagePart = result.candidates?.[0]?.content?.parts?.find((part) => part.inlineData || part.inline_data);
      const inlineData = imagePart?.inlineData || imagePart?.inline_data;

      if (inlineData?.data) {
        setImageUrl(`data:${inlineData.mimeType || inlineData.mime_type || "image/png"};base64,${inlineData.data}`);
        setImageGenerated(true);
      } else {
        const textResponse = result.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
        setError(textResponse || "Модель не вернула изображение. Проверьте доступ ключа к Gemini image generation.");
        console.warn("Ответ Gemini без изображения:", result);
      }
    } catch (err) {
      setError(`Ошибка: ${err.message}`);
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
                  onClick={resetUpload}
                  className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:bg-red-500 transition-colors"
                  aria-label="Удалить фото"
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
              onClick={() => { setImageGenerated(false); setImageUrl(null); }}
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
        Powered by Gemini Image & Mercedes F1 Fan Spirit
      </footer>
    </div>
  );
};

export default App;
