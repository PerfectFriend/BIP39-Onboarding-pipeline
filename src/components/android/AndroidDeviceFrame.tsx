import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Shield, Fingerprint } from 'lucide-react';
import { BiometricAuthOverlay } from './BiometricAuthOverlay';
import { triggerHaptic } from '../../utils/haptics';

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
  onOpenBiometricAuth?: () => void;
  isUnlocked?: boolean;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  children,
  onOpenBiometricAuth,
  isUnlocked
}) => {
  const [time, setTime] = useState('12:45');
  const [showBiometrics, setShowBiometrics] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto my-2 w-full max-w-[420px]">
      {/* Device Body Chassis (Google Pixel / Galaxy style) */}
      <div className="relative bg-[#0d1117] rounded-[48px] p-3 shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_20px_rgba(56,189,248,0.2)] border-4 border-slate-800">
        {/* Hardware side buttons simulation */}
        <div className="absolute -left-[7px] top-28 w-1 h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-[7px] top-24 w-1 h-10 bg-slate-700 rounded-r-sm" />
        <div className="absolute -right-[7px] top-38 w-1 h-16 bg-slate-700 rounded-r-sm" />

        {/* Screen Display Glass */}
        <div className="relative bg-[#080914] rounded-[38px] overflow-hidden flex flex-col h-[780px] border border-slate-800/80">
          {/* Android Status Bar */}
          <div className="h-9 px-6 pt-1 flex items-center justify-between text-[11px] font-mono text-slate-300 select-none bg-slate-950/80 backdrop-blur-md z-30 shrink-0 border-b border-slate-900/60">
            {/* Left: Clock */}
            <span className="font-semibold text-slate-200">{time}</span>

            {/* Center: Punch Hole Camera */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            {/* Right: Network & Battery Icons */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[9px] font-bold text-sky-400">5G</span>
              <Signal className="w-3 h-3 text-slate-300" />
              <Wifi className="w-3 h-3 text-slate-300" />
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Android FLAG_SECURE Indicator Strip */}
          <div className="px-3 py-1 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[10px] text-amber-300/90 font-mono shrink-0 select-none">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-400" />
              FLAG_SECURE: Screen capture blocked
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowBiometrics(true);
              }}
              className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 hover:bg-sky-500/30 cursor-pointer"
            >
              <Fingerprint className="w-2.5 h-2.5" />
              Biometric Test
            </button>
          </div>

          {/* Mobile Screen Scrollable Content Viewport */}
          <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
            {children}
          </div>

          {/* Android Bottom Gesture Navigation Pill Bar */}
          <div className="h-6 bg-slate-950 flex items-center justify-center shrink-0 border-t border-slate-900 select-none">
            <div className="w-28 h-1 bg-slate-600 rounded-full hover:bg-sky-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* Biometric Prompt Modal */}
      <BiometricAuthOverlay
        isOpen={showBiometrics}
        title="Тест биометрии Android"
        subtitle="Android BiometricPrompt API"
        onSuccess={() => {
          setShowBiometrics(false);
          if (onOpenBiometricAuth) {
            onOpenBiometricAuth();
          }
        }}
        onFallbackToPin={() => setShowBiometrics(false)}
        onCancel={() => setShowBiometrics(false)}
      />
    </div>
  );
};
