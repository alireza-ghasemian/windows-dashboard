import React, { useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Music, 
  Sparkles,
  X 
} from 'lucide-react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TopAudioBarProps {
  language: Language;
}

const TRANSLATIONS = {
  fa: {
    nowPlaying: "درحال پخش:",
    lofiBeats: "بیت‌های لوفای (کافئین)",
    synthwave: "سینث‌ویو متمرکز (تند)",
    rainyCafe: "باران ملایم (آفلاین)",
    deepZen: "ذن عمیق (امواج آلفا)",
    focusTrack: "موسیقی تمرکز",
    liveSynth: "سینث‌سایزر زنده فعال است",
    standby: "آماده پخش"
  },
  en: {
    nowPlaying: "Now Playing:",
    lofiBeats: "Lo-Fi Beats (Caffeine)",
    synthwave: "Synthwave Focus (Upbeat)",
    rainyCafe: "Rainy Cafe (Offline Synth)",
    deepZen: "Deep Zen (Alpha Waves)",
    focusTrack: "Focus Track",
    liveSynth: "Live Synth Active",
    standby: "Standby"
  },
  de: {
    nowPlaying: "Läuft gerade:",
    lofiBeats: "Lo-Fi Beats (Koffein)",
    synthwave: "Synthwave Fokus (Schnell)",
    rainyCafe: "Regnerisches Café (Offline)",
    deepZen: "Deep Zen (Alpha-Wellen)",
    focusTrack: "Fokus-Track",
    liveSynth: "Live-Synth Aktiv",
    standby: "Standby"
  }
};

export default function TopAudioBar({ language }: TopAudioBarProps) {
  const {
    isAudioPlaying,
    currentTrack,
    currentTime,
    duration,
    isMuted,
    volume,
    setVolume,
    isPlayerVisible,
    togglePlay,
    nextTrack,
    prevTrack,
    setMute,
    seek,
    stopAndClear
  } = useAudioPlayer();

  const isRtl = language === 'fa';
  const trans = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Track drag state to prevent slider knob jumping / lag
  const [isSeeking, setIsSeeking] = React.useState(false);
  const [localTime, setLocalTime] = React.useState(0);

  React.useEffect(() => {
    if (!isSeeking) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isSeeking]);

  const getTrackTitle = (track: any) => {
    if (!track) return '';
    if (track.isLocal) return track.title;
    if (track.id === 'lofi') return trans.lofiBeats;
    if (track.id === 'rain') return trans.rainyCafe;
    if (track.id === 'synthwave') return trans.synthwave;
    if (track.id === 'zen') return trans.deepZen;
    return track.title;
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // We only show this bar if:
  // 1. The main music player component is NOT visible in the viewport (scrolled out or on another tab)
  // 2. AND we are actively playing a track
  const shouldShow = !isPlayerVisible && currentTrack && isAudioPlaying;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          id="top-telegram-audio-bar"
          initial={{ height: 0, opacity: 0, y: -10 }}
          animate={{ height: 'auto', opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="w-full bg-[#0d0925]/95 border-b border-purple-500/20 px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Active track Title & Status info */}
          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shrink-0 relative">
              <Music className={`w-4 h-4 text-white ${isAudioPlaying ? 'animate-bounce' : ''}`} />
              {isAudioPlaying && (
                <span className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center text-[8px] animate-ping"></span>
              )}
            </div>

            <div className="min-w-0 flex-1 text-right sm:text-start">
              <div className="flex items-center gap-1.5 text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>{trans.nowPlaying}</span>
              </div>
              <h4 className="text-xs font-black text-white truncate max-w-[200px] sm:max-w-[320px]">
                {getTrackTitle(currentTrack)}
              </h4>
            </div>
          </div>

          {/* Interactive slider progress bar & timing */}
          <div className="w-full sm:w-72 md:w-96 flex items-center gap-3 font-mono shrink-0" dir="ltr">
            {currentTrack?.isLocal ? (
              <>
                <span className="text-[10px] text-slate-400 w-8 text-center">{formatTime(localTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={localTime}
                  onMouseDown={() => setIsSeeking(true)}
                  onMouseUp={() => {
                    setIsSeeking(false);
                    seek(localTime);
                  }}
                  onTouchStart={() => setIsSeeking(true)}
                  onTouchEnd={() => {
                    setIsSeeking(false);
                    seek(localTime);
                  }}
                  onChange={(e) => {
                    const newVal = parseFloat(e.target.value);
                    setLocalTime(newVal);
                    seek(newVal);
                  }}
                  className="flex-1 h-1 bg-white/10 hover:bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 focus:outline-none transition-all"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(localTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.1) ${(localTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                  }}
                />
                <span className="text-[10px] text-slate-400 w-8 text-center">{formatTime(duration)}</span>
              </>
            ) : (
              <div className="flex-1 h-1 bg-white/5 rounded-lg overflow-hidden relative">
                <div 
                  className={`absolute inset-y-0 bg-gradient-to-r from-purple-500 to-indigo-500 ${isAudioPlaying ? 'w-full animate-pulse' : 'w-1/3'}`} 
                  style={{ transition: 'width 1s ease-in-out' }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-purple-300 uppercase tracking-widest font-sans select-none pointer-events-none">
                  {isAudioPlaying ? trans.liveSynth : trans.standby}
                </span>
              </div>
            )}
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Prev Track */}
            <button 
              onClick={prevTrack} 
              className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all active:scale-90"
              title="Previous Track"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause Button */}
            <button 
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-90"
            >
              {isAudioPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>

            {/* Next Track */}
            <button 
              onClick={nextTrack} 
              className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all active:scale-90"
              title="Next Track"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Divider */}
            <div className="w-[1px] h-4 bg-white/10"></div>

            {/* Mute Toggle */}
            <button 
              onClick={() => setMute(!isMuted)}
              className={`p-1.5 hover:bg-white/5 border border-white/10 rounded-lg transition-all ${isMuted ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white'}`}
              title="Mute/Unmute"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button 
              onClick={stopAndClear}
              className="p-1.5 hover:bg-rose-500/20 border border-white/10 rounded-lg text-slate-400 hover:text-rose-400 transition-all active:scale-90"
              title="Close Player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
