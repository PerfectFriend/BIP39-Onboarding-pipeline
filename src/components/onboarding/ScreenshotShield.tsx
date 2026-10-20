import React, { useEffect, useState } from 'react';
import { ShieldAlert, EyeOff } from 'lucide-react';

interface ScreenshotShieldProps {
  children: React.ReactNode;
  active?: boolean;
}

export const ScreenshotShield: React.FC<ScreenshotShieldProps> = ({ children, active = true }) => {
  const [isBlurred, setIsBlurred] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    // Handle blur and visibility change (anti-screenshot / screen-recording shield)
    const handleWindowBlur = () => {
      setIsBlurred(true);
      setWarningMessage('Приложение скрыто: окно потеряло фокус для защиты мнемонической фразы.');
    };

    const handleWindowFocus = () => {
      setIsBlurred(false);
      setWarningMessage(null);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
        setWarningMessage('Экран затемнен: переключение вкладок заблокировано.');
      } else {
        setIsBlurred(false);
        setWarningMessage(null);
      }
    };

    // Intercept keyboard shortcut combinations for PrintScreen & Screen Clipping
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        setIsBlurred(true);
        setWarningMessage('Снимок экрана заблокирован политикой безопасности BIP-39.');
        setTimeout(() => setIsBlurred(false), 2500);
        return false;
      }

      // Windows: Win+Shift+S, macOS: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (e.key === 's' || e.key === 'S' || e.key === '3' || e.key === '4' || e.key === '5')
      ) {
        setIsBlurred(true);
        setWarningMessage('Захват экрана заблокирован. Пожалуйста, запишите фразу на физический носитель.');
        setTimeout(() => setIsBlurred(false), 3000);
      }
    };

    // Intercept context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keyup', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keyup', handleKeyDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [active]);

  return (
    <div className="relative select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className={`transition-all duration-200 ${isBlurred ? 'screenshot-shield-blur pointer-events-none' : ''}`}>
        {children}
      </div>

      {isBlurred && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-2xl rounded-2xl p-6 text-center animate-fade-in border border-amber-500/30">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <EyeOff className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-slate-100 mb-1 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Защита от утечки и скриншотов
          </h4>
          <p className="text-xs text-slate-400 max-w-sm">
            {warningMessage || 'Окно временно заблокировано для предотвращения перехвата секретной seed-фразы.'}
          </p>
          <span className="mt-4 text-[11px] text-sky-400/80 font-mono">
            Нажмите на окно приложения для продолжения
          </span>
        </div>
      )}
    </div>
  );
};
