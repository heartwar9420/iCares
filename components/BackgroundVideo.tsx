import { useRef, useEffect } from 'react';
interface Props {
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function BackgroundVideo(props: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // HTMLVideoElement = 設定是影片格式 , null 代表 組件剛載入時為 null
  const { isPaused } = props;
  useEffect(() => {
    if (!isPaused) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [isPaused]);

  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-fill -z-10 brightness-75"
        ref={videoRef}
      >
        <source
          src="https://res.cloudinary.com/dg9oxvsoc/video/upload/v1770975196/test6_tzucp6.mp4"
          type="video/mp4"
        />
      </video>
    </>
  );
}
