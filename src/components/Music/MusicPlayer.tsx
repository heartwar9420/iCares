import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Link, Unlink } from 'lucide-react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { useTimerContext } from '@/src/contexts/TimerContext';
import ActionIconButton from '../UI/ActionIconButton';

export default function MusicPlayer() {
  const [hasMounted, setHasMounted] = useState(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const { isTimerRunning } = useTimerContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const savedVolume = localStorage.getItem('icares_music_vol');
        const savedMuted = localStorage.getItem('icares_music_muted');
        const savedAutoSync = localStorage.getItem('icares_music_autosync');

        if (savedVolume !== null) setVolume(Number(savedVolume));
        if (savedMuted !== null) setIsMuted(savedMuted === 'true');
        if (savedAutoSync !== null) setIsAutoSync(savedAutoSync === 'true');
      }
      setHasMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    const p = event.target;
    setPlayer(p);
    p.setVolume(volume);
    if (isMuted) p.mute();
  };

  // 在 isAutoSync 為 true 時，才允許連動播放
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTimerRunning && player && isAutoSync) {
        player.playVideo();
        setIsPlaying(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isTimerRunning, player, isAutoSync]);

  if (!hasMounted) {
    return null;
  }

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    localStorage.setItem('icares_music_vol', String(newVol));

    if (player) {
      player.setVolume(newVol);
      if (isMuted && newVol > 0) {
        setIsMuted(false);
        localStorage.setItem('icares_music_muted', 'false');
        player.unMute();
      }
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('icares_music_muted', String(newMutedState));

    if (player) {
      if (newMutedState) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(volume);
      }
    }
  };

  const toggleAutoSync = (e?: React.MouseEvent | React.PointerEvent) => {
    // 安全檢查：如果有傳入 e，才執行阻擋冒泡
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    const newValue = !isAutoSync;
    setIsAutoSync(newValue);
    localStorage.setItem('icares_music_autosync', String(newValue));
  };

  return (
    <div
      className="w-full h-full flex relative group overflow-hidden bg-[#0a0e17] cursor-pointer hover:bg-white/5 transition-colors duration-300"
      onClick={togglePlay}
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
        <YouTube
          videoId="jfKfPfyJRdk"
          opts={{
            width: '100%',
            height: '250px',
            // autoplay = 自動播放 , controls = youtube 控制列
            // disablekb = 禁用鍵盤快捷鍵 , modestbranding = 隱藏 YouTube Logo
            playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1 },
          }}
          onReady={onPlayerReady}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] pointer-events-none"
        />
      </div>

      <div className="absolute inset-0 bg-linear-to-r from-[#0a0e17] via-[#0a0e17]/80 to-transparent z-0"></div>

      <div className="flex-1 flex flex-col justify-center px-6 relative z-10 w-full gap-3">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold text-slate-200 truncate group-hover:text-white transition-colors">
              Lofi Girl Radio
            </div>
            <p className="text-sm text-slate-400 mt-0.5 truncate">Beats to relax/study to</p>
          </div>
        </div>

        {/* 控制列區塊 */}
        <div className="flex items-center justify-between mt-1">
          {/* 音量控制區 */}
          <div
            className="flex items-center gap-2 w-full group/volume"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors p-1 -ml-1"
            >
              {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-400 opacity-70 group-hover/volume:opacity-100 hover:accent-violet-300 transition-all"
            />
          </div>

          <ActionIconButton
            onClick={toggleAutoSync}
            className={`relative p-1.5 rounded-lg transition-all ${
              isAutoSync
                ? 'text-[#ffb347] bg-[#ffb347]/10 hover:bg-[#ffb347]/20'
                : 'text-slate-400 bg-slate-800 hover:text-slate-400 hover:bg-white/5'
            }`}
          >
            {isAutoSync ? <Link size={20} /> : <Unlink size={20} />}

            <div className="absolute bottom-full left-1/2 -translate-x-25 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
              <div className="bg-[#161b26] border border-white/10 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-2">
                <span className="font-bold text-slate-300">
                  {isAutoSync ? '自動播放音樂：開啟' : '自動播放音樂：關閉'}
                </span>
              </div>
            </div>
          </ActionIconButton>
        </div>
      </div>
    </div>
  );
}
