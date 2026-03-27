interface TimerProgress {
  progress: number; // 百分比
  size: number; //大小
  strokeWidth: number; //厚度
  children?: React.ReactNode;
  className?: string;
}

export default function TimerProgress({ progress, size, strokeWidth, children }: TimerProgress) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center w-full h-full aspect-square mx-auto"
      style={{ maxWidth: size, maxHeight: size }}
    >
      {/* viewBox 讓 SVG 可以隨外層 div 縮放 */}
      <svg
        className="absolute inset-0 transform -rotate-90 w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="text-white/10"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-[#ffb347] transition-all duration-500 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {/* 中間文字區塊 */}
      <div className="relative z-10 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
