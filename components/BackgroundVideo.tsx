export default function BackgroundVideo() {
  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-fill -z-10 blur scale-200 brightness-75"
      >
        <source src="/test6.mp4" type="video/mp4" />
      </video>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-contain -z-5 opacity-80 drop-shadow-2xl"
      >
        <source src="/test6.mp4" type="video/mp4" />
      </video>
    </>
  );
}
