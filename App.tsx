import React, { useState, useRef, useCallback } from 'react';
import { ProcessedImage, AppState, DrawResult } from './types';
import { compressImage } from './utils/imageUtils';
import { analyzeCards } from './services/geminiService';
import Snowfall from './components/Snowfall';
import ProgressBar from './components/ProgressBar';
import ImageModal from './components/ImageModal';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [drawnIndices, setDrawnIndices] = useState<Set<number>>(new Set());
  const [currentDraw, setCurrentDraw] = useState<DrawResult | null>(null);
  const [modalImage, setModalImage] = useState<ProcessedImage | null>(null);
  
  // Upload Processing State
  const [processedCount, setProcessedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Gemini State
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const fileList = Array.from(event.target.files);
    setTotalFiles(fileList.length);
    setProcessedCount(0);
    setIsProcessing(true);
    setImages([]); // Reset images on new upload

    const newImages: ProcessedImage[] = [];

    // Process sequentially to avoid freezing browser, or in small chunks
    // For simplicity in React loop, we'll do one by one with a small delay to let UI update
    for (const file of fileList) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const processed = await compressImage(file);
        newImages.push(processed);
      } catch (e) {
        console.error(`Failed to process ${file.name}`, e);
      }
      setProcessedCount(prev => prev + 1);
      // Allow UI to breathe
      await new Promise(r => setTimeout(r, 10));
    }

    setImages(newImages);
    setIsProcessing(false);
    setAppState(AppState.READY);
  };

  const handleDraw = useCallback(() => {
    if (images.length < 2) {
      alert("照片數量不足，無法抽獎！(Need at least 2 images)");
      return;
    }

    // Filter out already drawn indices
    const availableIndices = images.map((_, index) => index).filter(i => !drawnIndices.has(i));

    if (availableIndices.length < 2) {
      alert("所有感恩卡都已經抽出囉！聖誕快樂！");
      return;
    }

    setAppState(AppState.DRAWING);
    setGeminiAnalysis('');
    setIsAnalyzing(false);

    // Simple randomization animation logic could go here, but for now we just pick
    const idx1Random = Math.floor(Math.random() * availableIndices.length);
    const index1 = availableIndices[idx1Random];
    
    // Remove first pick from temp pool for second pick
    availableIndices.splice(idx1Random, 1);
    
    const idx2Random = Math.floor(Math.random() * availableIndices.length);
    const index2 = availableIndices[idx2Random];

    const card1 = images[index1];
    const card2 = images[index2];

    // Wait a brief moment for visual "Draw" transition
    setTimeout(() => {
      setCurrentDraw({ card1, card2 });
      setDrawnIndices(prev => {
        const next = new Set(prev);
        next.add(index1);
        next.add(index2);
        return next;
      });
      setAppState(AppState.REVEALED);
      
      // Trigger Gemini Analysis automatically
      triggerAnalysis(card1, card2);
    }, 800);
  }, [images, drawnIndices]);

  const triggerAnalysis = async (card1: ProcessedImage, card2: ProcessedImage) => {
    setIsAnalyzing(true);
    setGeminiAnalysis('Gemini 正在仔細閱讀這些真心話...');
    const result = await analyzeCards(card1, card2);
    setGeminiAnalysis(result);
    setIsAnalyzing(false);
  };

  const resetDraw = () => {
    // Optional: Only reset the current view, not the history
    setAppState(AppState.READY);
    setCurrentDraw(null);
    setGeminiAnalysis('');
  };

  return (
    <div className="min-h-screen font-body relative overflow-x-hidden flex flex-col items-center">
      <Snowfall />

      {/* Header */}
      <header className="z-10 w-full py-6 bg-xmas-red/90 shadow-lg border-b-4 border-xmas-gold sticky top-0 backdrop-blur-sm">
        <h1 className="text-3xl md:text-5xl font-christmas text-center text-xmas-cream drop-shadow-md">
          🎄 聖誕感恩卡真心告白 🎄
        </h1>
        <p className="text-center text-xmas-cream/80 mt-2 text-sm md:text-base">
           傳遞溫暖，分享愛 (剩餘照片: {images.length - drawnIndices.size}/{images.length})
        </p>
      </header>

      {/* Main Content */}
      <main className="z-10 flex-1 w-full max-w-6xl p-4 flex flex-col items-center justify-center min-h-[60vh]">
        
        {/* Upload View */}
        {appState === AppState.UPLOAD && (
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border-2 border-dashed border-xmas-gold w-full max-w-2xl text-center shadow-xl animate-bounce-slow">
            <h2 className="text-2xl font-bold text-xmas-gold mb-6 font-christmas">上傳感恩卡</h2>
            
            {!isProcessing ? (
              <label className="cursor-pointer group block">
                 <div className="bg-xmas-cream text-xmas-green font-bold py-4 px-8 rounded-full shadow-lg transform group-hover:scale-105 transition-all border-2 border-transparent group-hover:border-xmas-red">
                    <span className="text-xl">📸 點擊選擇照片 (約350張)</span>
                 </div>
                 <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <p className="mt-4 text-xmas-cream text-sm">系統會自動壓縮照片以優化效能 (約1.2Mb/張)</p>
              </label>
            ) : (
              <ProgressBar current={processedCount} total={totalFiles} />
            )}
          </div>
        )}

        {/* Ready View */}
        {appState === AppState.READY && (
          <div className="text-center">
             <button
              onClick={handleDraw}
              className="group relative bg-xmas-red text-xmas-cream font-christmas text-4xl md:text-6xl py-6 px-12 rounded-full shadow-2xl hover:bg-xmas-darkRed transition-all transform hover:scale-110 active:scale-95 border-4 border-xmas-gold"
            >
              <span className="relative z-10 drop-shadow-md">🎁 抽出感恩卡</span>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 animate-pulse"></div>
            </button>
            <p className="mt-8 text-xl text-xmas-gold font-bold animate-pulse">
              準備好迎接驚喜了嗎？
            </p>
          </div>
        )}

        {/* Drawing (Animation) View */}
        {appState === AppState.DRAWING && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 border-8 border-xmas-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-2xl font-christmas text-xmas-cream">正在從聖誕襪裡挑選禮物...</p>
          </div>
        )}

        {/* Revealed View */}
        {appState === AppState.REVEALED && currentDraw && (
          <div className="w-full flex flex-col items-center animate-fade-in-up">
            
            {/* Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
              {[currentDraw.card1, currentDraw.card2].map((card, idx) => (
                <div 
                  key={card.id} 
                  className="relative group cursor-pointer perspective-1000"
                  onClick={() => setModalImage(card)}
                >
                  <div className="bg-white p-3 rounded-lg shadow-xl transform group-hover:rotate-1 transition-all duration-300 border border-gray-200">
                     <div className="aspect-[4/3] overflow-hidden rounded bg-gray-100 relative">
                        <img 
                          src={card.dataUrl} 
                          alt="Gratitude Card" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                           <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">🔍 放大檢視</span>
                        </div>
                     </div>
                     <div className="mt-2 text-center text-gray-600 font-christmas text-lg">
                        卡片 #{idx + 1}
                     </div>
                  </div>
                  {/* Decorative Tape */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-xmas-red/80 rotate-2 shadow-sm z-10"></div>
                </div>
              ))}
            </div>

            {/* Gemini Analysis Section */}
            <div className="w-full max-w-4xl bg-xmas-cream/95 text-gray-800 p-6 rounded-xl shadow-2xl border-4 border-xmas-gold relative mb-8">
               <div className="absolute -top-5 left-8 bg-xmas-green text-xmas-cream px-4 py-1 rounded font-bold shadow-md border border-xmas-gold flex items-center gap-2">
                  <span>🤖 Gemini AI 判讀</span>
                  {isAnalyzing && <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>}
               </div>
               
               <div className="mt-2 min-h-[80px] font-body text-lg leading-relaxed whitespace-pre-line">
                 {isAnalyzing ? (
                   <span className="text-gray-500 italic animate-pulse">正在聆聽卡片裡的聲音...</span>
                 ) : (
                   geminiAnalysis
                 )}
               </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleDraw}
              className="bg-xmas-green text-xmas-cream font-bold py-4 px-10 rounded-full shadow-lg hover:bg-xmas-red transition-colors border-2 border-xmas-gold text-xl flex items-center gap-2"
            >
              <span>🔄 再抽一次</span>
            </button>

          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="w-full py-4 text-center text-xmas-cream/50 text-xs z-10">
        <p>Built for Christmas • Gemini AI Powered</p>
      </footer>

      {/* Modal */}
      <ImageModal image={modalImage} onClose={() => setModalImage(null)} />
      
      {/* Styles for simple animations */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;