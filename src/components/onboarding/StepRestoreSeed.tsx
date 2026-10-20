import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, QrCode, FileText, Keyboard, Upload, CheckCircle2, AlertCircle, Camera, ClipboardCheck } from 'lucide-react';
import jsQR from 'jsqr';
import { validateMnemonic, getWordSuggestions, deriveMockAddresses, mnemonicToSeedHex } from '../../services/bip39';
import { WalletCredentials } from '../../types/onboarding';

interface StepRestoreSeedProps {
  onSeedRestored: (credentials: WalletCredentials) => void;
  onBack: () => void;
}

export const StepRestoreSeed: React.FC<StepRestoreSeedProps> = ({
  onSeedRestored,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'qr' | 'pdf'>('manual');
  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentWordTyping, setCurrentWordTyping] = useState('');

  // Camera QR scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Auto-suggest words as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    setValidationError(null);

    // Extract currently typed word
    const lastWord = val.split(/\s+/).pop() || '';
    setCurrentWordTyping(lastWord);
    if (lastWord.length >= 2) {
      setSuggestions(getWordSuggestions(lastWord, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleApplySuggestion = (word: string) => {
    const tokens = inputText.trim().split(/\s+/);
    if (tokens.length > 0) {
      tokens[tokens.length - 1] = word;
      const nextText = tokens.join(' ') + ' ';
      setInputText(nextText);
      setSuggestions([]);
      setCurrentWordTyping('');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text.trim());
        setValidationError(null);
      }
    } catch {
      // Ignore
    }
  };

  // Process and validate mnemonic
  const handleProceedWithMnemonic = async (mnemonicToTest: string) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await validateMnemonic(mnemonicToTest);
      if (!result.valid || !result.words) {
        setValidationError(result.error || 'Неверная мнемоническая фраза');
        setIsValidating(false);
        return;
      }

      // Valid BIP-39! Derive keys and proceed
      const cleanMnemonic = result.words.join(' ');
      const seedHex = await mnemonicToSeedHex(cleanMnemonic);
      const addresses = await deriveMockAddresses(seedHex);

      const credentials: WalletCredentials = {
        mnemonic: cleanMnemonic,
        mnemonicWords: result.words,
        seedHex,
        masterFingerprint: addresses.fingerprint,
        accounts: {
          btc: addresses.btc,
          eth: addresses.eth,
          sol: addresses.sol
        },
        createdAt: Date.now()
      };

      onSeedRestored(credentials);
    } catch (err: any) {
      setValidationError(err?.message || 'Ошибка валидации seed-фразы');
    } finally {
      setIsValidating(false);
    }
  };

  // QR Image file upload decode
  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          setInputText(code.data);
          setActiveTab('manual');
          handleProceedWithMnemonic(code.data);
        } else {
          setValidationError('В загруженном изображении QR-код не найден. Попробуйте другое изображение.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // PDF or Text Passport file upload
  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // If text or json backup
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
        const text = await file.text();
        setInputText(text.trim());
        setActiveTab('manual');
        handleProceedWithMnemonic(text.trim());
      } else {
        // PDF file: try to extract text or notify user
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('latin1');
        const content = decoder.decode(arrayBuffer);

        // Search for BIP-39 patterns in raw PDF stream
        const wordsMatch = content.match(/SECRET RECOVERY PHRASE[^\n]*\n([\s\S]*?)Instant Recovery/i);
        if (wordsMatch && wordsMatch[1]) {
          const rawWords = wordsMatch[1].replace(/[0-9.]/g, ' ').replace(/\s+/g, ' ').trim();
          setInputText(rawWords);
          setActiveTab('manual');
          handleProceedWithMnemonic(rawWords);
        } else {
          // If encrypted binary PDF stream, inform user to enter words or scan QR from PDF
          setValidationError('Пожалуйста, отсканируйте QR-код из PDF-паспорта или введите слова из документа.');
        }
      }
    } catch {
      setValidationError('Не удалось прочитать файл паспорта.');
    }
  };

  // Start live camera stream
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        scanVideoFrame();
      }
    } catch {
      setCameraError('Не удалось получить доступ к камере. Используйте загрузку изображения.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCameraActive(false);
  };

  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.height = videoRef.current.videoHeight;
        canvas.width = videoRef.current.videoWidth;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          stopCamera();
          setInputText(code.data);
          setActiveTab('manual');
          handleProceedWithMnemonic(code.data);
          return;
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const parsedWords = inputText.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="max-w-xl mx-auto py-2">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к выбору
        </button>
        <span className="text-xs font-mono text-sky-400">Восстановление кошелька</span>
      </div>

      <div className="cyber-card rounded-3xl p-6 sm:p-7 relative gaudi-mosaic-border mb-6">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
            Импорт существующего аккаунта
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Введите вашу BIP-39 фразу или воспользуйтесь быстрым считыванием QR-кода / паспорта.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { stopCamera(); setActiveTab('manual'); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'manual'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Ввод фразы
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('qr'); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'qr'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR-код
          </button>

          <button
            type="button"
            onClick={() => { stopCamera(); setActiveTab('pdf'); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pdf'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            PDF-паспорт
          </button>
        </div>

        {/* TAB 1: MANUAL SEED INPUT */}
        {activeTab === 'manual' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300">
                Секретные слова (12 или 24 слова через пробел):
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                  parsedWords.length === 12 || parsedWords.length === 24
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  Слов: {parsedWords.length} / 12 или 24
                </span>

                <button
                  type="button"
                  onClick={handlePaste}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Вставить
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={handleInputChange}
              placeholder="abandon ability able about above absent absorb abstract absurd abuse access accident..."
              className="w-full rounded-2xl bg-slate-950/90 border border-slate-800 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-slate-100 font-mono text-sm p-4 outline-none resize-none placeholder:text-slate-600 transition-colors"
            />

            {/* Word autocomplete chips */}
            {suggestions.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500">Подсказка для &quot;{currentWordTyping}&quot;:</span>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleApplySuggestion(suggestion)}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-mono text-xs transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {validationError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                disabled={isValidating || (parsedWords.length !== 12 && parsedWords.length !== 24)}
                onClick={() => handleProceedWithMnemonic(inputText)}
                className={`px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                  parsedWords.length === 12 || parsedWords.length === 24
                    ? 'bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 hover:opacity-95 shadow-[0_0_20px_rgba(56,189,248,0.3)] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                {isValidating ? 'Проверка...' : 'Восстановить кошелек'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: QR CODE SCAN / UPLOAD */}
        {activeTab === 'qr' && (
          <div className="text-center py-2">
            {!cameraActive ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-700/80 hover:border-sky-500/50 rounded-2xl p-6 transition-colors">
                  <QrCode className="w-12 h-12 text-sky-400 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Загрузите снимок QR-кода
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
                    Изображение QR-кода из сохраненного PDF-паспорта или другого кошелька
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Выбрать файл изображения
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3 justify-center text-xs text-slate-500">
                  <span className="w-12 h-px bg-slate-800" />
                  <span>ИЛИ</span>
                  <span className="w-12 h-px bg-slate-800" />
                </div>

                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  Включить веб-камеру
                </button>

                {cameraError && (
                  <p className="text-xs text-rose-400 mt-2">{cameraError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-sky-400/40 max-w-xs mx-auto bg-black aspect-square">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-8 border-2 border-sky-400/80 rounded-xl pointer-events-none animate-pulse" />
                </div>
                <p className="text-xs text-slate-400">
                  Наведите камеру на QR-код для автоматического сканирования
                </p>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800"
                >
                  Отключить камеру
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PDF PASSPORT IMPORT */}
        {activeTab === 'pdf' && (
          <div className="text-center py-2">
            <div className="border-2 border-dashed border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-8 transition-colors">
              <FileText className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">
                Загрузите файл PDF-паспорта
              </h3>
              <p className="text-xs text-slate-400 mb-5 max-w-sm mx-auto">
                Система автоматически извлечет данные и проверит криптографическую контрольную сумму.
              </p>
              <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Загрузить PDF или текстовый бэкап
                <input
                  type="file"
                  accept=".pdf,.txt,.json"
                  onChange={handlePassportUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
