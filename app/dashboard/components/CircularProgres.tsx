type CircularProgressProps = {
  progress: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
};

export default function CircularProgress({
  progress,
  size = 160,
  strokeWidth = 18,
}: CircularProgressProps) {
  /**
   * =========================
   * Derived Values
   * =========================
   */
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = progress / 100;
  const offset = circumference - progressRatio * circumference;

  /**
   * =========================
   * Render
   * =========================
   */
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-gray-200"
          fill="transparent"
        />

        {/* Progress Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          stroke="var(--np)"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center Text */}
      <div className="absolute flex items-center leading-none text-dp">
        <span className="w-3" />
        <span className="text-4xl font-semibold">{progress}</span>
        <span className="ml-0.5 text-xl font-medium relative -top-1">%</span>
      </div>
    </div>
  );
}
