import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Track {
  id: string;
  title: string;
  subtitle: string;
  isLocal?: boolean;
  url?: string;
}

interface AudioPlayerContextType {
  isAudioPlaying: boolean;
  activeTrackIndex: number;
  isMuted: boolean;
  localTracks: Track[];
  allTracks: Track[];
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (v: number) => void;
  isPlayerVisible: boolean;
  setIsPlayerVisible: (visible: boolean) => void;
  togglePlay: () => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setMute: (muted: boolean) => void;
  uploadLocalTracks: (files: FileList) => void;
  seek: (time: number) => void;
  getAnalyserData: () => Uint8Array | null;
  stopAndClear: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [localTracks, setLocalTracks] = useState<Track[]>(() => {
    // Attempt to load previously uploaded tracks from localStorage if any, or leave empty
    return [];
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('productivity_audio_volume');
    return saved ? parseFloat(saved) : 0.8;
  });

  const setVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    localStorage.setItem('productivity_audio_volume', clamped.toString());
  };

  const playlistTracks: Track[] = [
    { id: 'lofi', title: 'Lo-Fi Beats', subtitle: 'Chill & Cafe Focus' },
    { id: 'rain', title: 'Rainy Cafe', subtitle: 'Relaxing Offline Rain' },
    { id: 'synthwave', title: 'Synthwave Focus', subtitle: 'Upbeat Arpeggiator' },
    { id: 'zen', title: 'Deep Zen', subtitle: 'Theta Breathing Drone' }
  ];

  const allTracks = [...playlistTracks, ...localTracks];
  const currentTrack = activeTrackIndex === -1 ? null : (allTracks[activeTrackIndex] || null);

  // Web Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const synthGainNodeRef = useRef<GainNode | null>(null);
  const activeSynthNodesRef = useRef<any[]>([]);
  const synthIntervalRef = useRef<any>(null);

  // Local Audio HTML Element Refs
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Initialize Audio Context on demand
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Create a single Analyser for everything
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64; // Small fftSize is perfect for 24 waveform bars
        analyserNodeRef.current = analyser;
        analyser.connect(ctx.destination);
      }
    }
  };

  // Setup local audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.loop = false; // We will handle looping or automatic next manually/with standard loops
    localAudioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      // Loop local audio tracks
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Clean up synthesis nodes
  const stopSynthesis = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }

    // Stop and disconnect all active oscillators/filters
    activeSynthNodesRef.current.forEach(node => {
      try {
        if (typeof node.stop === 'function') {
          node.stop();
        }
        if (typeof node.disconnect === 'function') {
          node.disconnect();
        }
      } catch (e) {
        // Already stopped/disconnected
      }
    });
    activeSynthNodesRef.current = [];

    if (synthGainNodeRef.current) {
      try {
        synthGainNodeRef.current.disconnect();
      } catch (e) {}
      synthGainNodeRef.current = null;
    }
  };

  // Perform Audio Playback Transitions
  useEffect(() => {
    if (!isAudioPlaying) {
      // Pause everything
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
      stopSynthesis();
      return;
    }

    // Ensure AudioContext is initialized
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const track = currentTrack;
    if (!track) {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
      stopSynthesis();
      return;
    }

    if (track.isLocal && track.url) {
      // Stop synthetic audio first
      stopSynthesis();

      const audio = localAudioRef.current;
      if (audio) {
        // Connect HTMLAudioElement to Analyser if not already connected
        if (!mediaSourceRef.current && analyserNodeRef.current) {
          try {
            mediaSourceRef.current = ctx.createMediaElementSource(audio);
            mediaSourceRef.current.connect(analyserNodeRef.current);
          } catch (err) {
            console.warn("Failed to connect media source node:", err);
          }
        }

        // ONLY change source if it's actually a different URL to prevent stutters, noise, and resets!
        // We compare the clean URL path.
        const currentSrc = audio.src;
        const targetSrc = track.url;
        if (currentSrc !== targetSrc && targetSrc) {
          audio.src = targetSrc;
          audio.load();
        }

        audio.volume = isMuted ? 0.0 : volume; // Set volume dynamically

        // Start playback smoothly
        audio.play().catch(err => {
          console.warn("Local audio autoplay failed/blocked:", err);
        });
      }
    } else {
      // Play Synthesized Ambient Track
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
      stopSynthesis();
      playSynthesizedTrack(track.id);
    }
  }, [isAudioPlaying, activeTrackIndex, isMuted, volume]);

  // Adjust volumes when mute state or volume level changes
  useEffect(() => {
    if (localAudioRef.current) {
      localAudioRef.current.volume = isMuted ? 0.0 : volume;
    }
    if (synthGainNodeRef.current && audioContextRef.current) {
      const targetGain = isMuted ? 0.0 : (volume * 0.1);
      synthGainNodeRef.current.gain.setValueAtTime(targetGain, audioContextRef.current.currentTime);
    }
  }, [isMuted, volume]);

  // Clean up on unmount (Wait! Context will stay alive for App lifetime, which is what we want!)
  useEffect(() => {
    return () => {
      stopSynthesis();
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Synthesize custom high-quality focus sounds
  const playSynthesizedTrack = (trackId: string) => {
    const ctx = audioContextRef.current;
    if (!ctx || !analyserNodeRef.current) return;

    // Create a local main gain for this synth to prevent clicks
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0, ctx.currentTime);
    // Smooth fade-in to prevent loud pop sounds!
    mainGain.gain.linearRampToValueAtTime(isMuted ? 0.0 : (volume * 0.1), ctx.currentTime + 0.1);
    mainGain.connect(analyserNodeRef.current);
    synthGainNodeRef.current = mainGain;

    if (trackId === 'rain') {
      // High-Quality Brown Noise Synthesizer (Rain sound)
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise coefficient formula
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, ctx.currentTime);

      noise.connect(filter);
      filter.connect(mainGain);
      noise.start();

      activeSynthNodesRef.current.push(noise, filter);

    } else if (trackId === 'zen') {
      // Beautiful spatial breathing drone (binaural beats + slow LFO)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110.8, ctx.currentTime); // Binaural beat delta of 0.8Hz (Deep delta state)

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(165, ctx.currentTime); // E3 (beautiful pure perfect fifth)

      // Slow breathing LFO filter modulator
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8-second respiratory cycle
      lfoGain.gain.setValueAtTime(100, ctx.currentTime); // Modulate filter cutoff by 100Hz

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(mainGain);

      lfo.start();
      osc1.start();
      osc2.start();
      osc3.start();

      activeSynthNodesRef.current.push(osc1, osc2, osc3, lfo, lfoGain, filter);

    } else if (trackId === 'synthwave') {
      // retro arpeggiator synthesizer
      const bassOsc = ctx.createOscillator();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(73.42, ctx.currentTime); // D2

      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(150, ctx.currentTime);

      bassOsc.connect(bassFilter);
      bassFilter.connect(mainGain);
      bassOsc.start();

      activeSynthNodesRef.current.push(bassOsc, bassFilter);

      const notes = [146.83, 174.61, 220.00, 293.66]; // D minor chord notes
      let step = 0;

      const playStep = () => {
        if (!audioContextRef.current) return;
        const now = audioContextRef.current.currentTime;
        const osc = audioContextRef.current.createOscillator();
        const env = audioContextRef.current.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(notes[step], now);

        const stepFilter = audioContextRef.current.createBiquadFilter();
        stepFilter.type = 'lowpass';
        stepFilter.frequency.setValueAtTime(600, now);

        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.04, now + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(stepFilter);
        stepFilter.connect(env);
        env.connect(mainGain);

        osc.start(now);
        osc.stop(now + 0.2);

        activeSynthNodesRef.current.push(osc, stepFilter, env);
        step = (step + 1) % notes.length;
      };

      playStep();
      synthIntervalRef.current = setInterval(playStep, 220);

    } else {
      // 'lofi' - Cozy electric piano chords
      const chords = [
        [196.00, 246.94, 293.66, 392.00], // Gmaj7
        [220.00, 261.63, 329.63, 440.00]  // Am7
      ];
      let chordStep = 0;

      const playChord = () => {
        if (!audioContextRef.current) return;
        const now = audioContextRef.current.currentTime;
        const activeChord = chords[chordStep];

        activeChord.forEach((freq) => {
          if (!audioContextRef.current) return;
          const osc = audioContextRef.current.createOscillator();
          const env = audioContextRef.current.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          env.gain.setValueAtTime(0, now);
          env.gain.linearRampToValueAtTime(0.02, now + 0.4);
          env.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

          osc.connect(env);
          env.connect(mainGain);

          osc.start(now);
          osc.stop(now + 3.6);

          activeSynthNodesRef.current.push(osc, env);
        });

        chordStep = (chordStep + 1) % chords.length;
      };

      playChord();
      synthIntervalRef.current = setInterval(playChord, 4000);
    }
  };

  const togglePlay = () => {
    if (activeTrackIndex === -1) {
      setActiveTrackIndex(0);
      setIsAudioPlaying(true);
    } else {
      setIsAudioPlaying(prev => !prev);
    }
  };

  const playTrack = (index: number) => {
    if (index >= 0 && index < allTracks.length) {
      setActiveTrackIndex(index);
      setIsAudioPlaying(true);
    }
  };

  const nextTrack = () => {
    if (allTracks.length === 0) return;
    const nextIndex = activeTrackIndex === -1 ? 0 : (activeTrackIndex + 1) % allTracks.length;
    setActiveTrackIndex(nextIndex);
    setIsAudioPlaying(true);
  };

  const prevTrack = () => {
    if (allTracks.length === 0) return;
    const prevIndex = activeTrackIndex === -1 ? 0 : (activeTrackIndex - 1 + allTracks.length) % allTracks.length;
    setActiveTrackIndex(prevIndex);
    setIsAudioPlaying(true);
  };

  const setMute = (muted: boolean) => {
    setIsMuted(muted);
  };

  const uploadLocalTracks = (files: FileList) => {
    const newTracks: Track[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const trackUrl = URL.createObjectURL(file);
      newTracks.push({
        id: `local-${Date.now()}-${i}`,
        title: file.name.replace(/\.[^/.]+$/, ""), // remove extension
        subtitle: 'Local Audio File',
        isLocal: true,
        url: trackUrl
      });
    }
    setLocalTracks(prev => [...prev, ...newTracks]);
    // Immediately select and play the first newly uploaded file
    const newActiveIndex = playlistTracks.length + localTracks.length;
    setActiveTrackIndex(newActiveIndex);
    setIsAudioPlaying(true);
  };

  const seek = (time: number) => {
    if (localAudioRef.current && currentTrack?.isLocal) {
      localAudioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const stopAndClear = () => {
    setIsAudioPlaying(false);
    setActiveTrackIndex(-1);
    setCurrentTime(0);
    setDuration(0);
    if (localAudioRef.current) {
      localAudioRef.current.pause();
      localAudioRef.current.src = '';
    }
    stopSynthesis();
  };

  const getAnalyserData = () => {
    if (!analyserNodeRef.current) return null;
    const array = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
    analyserNodeRef.current.getByteFrequencyData(array);
    return array;
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        isAudioPlaying,
        activeTrackIndex,
        isMuted,
        localTracks,
        allTracks,
        currentTrack,
        currentTime,
        duration,
        isPlayerVisible,
        setIsPlayerVisible,
        togglePlay,
        playTrack,
        nextTrack,
        prevTrack,
        setMute,
        uploadLocalTracks,
        seek,
        getAnalyserData,
        stopAndClear,
        volume,
        setVolume
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
