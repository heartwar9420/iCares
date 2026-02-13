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
        <source
          src="https://res.cloudinary.com/dg9oxvsoc/video/upload/v1770975196/test6_tzucp6.mp4
        "
          type="video/mp4"
        />
      </video>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-contain -z-5 opacity-80 drop-shadow-2xl"
      >
        <source
          src="https://res.cloudinary.com/dg9oxvsoc/video/upload/v1770975196/test6_tzucp6.mp4"
          type="video/mp4"
        />
      </video>
    </>
  );
}
