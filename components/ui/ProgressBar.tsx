interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  colorClass?: string;
}

export function ProgressBar({ 
  current, 
  max, 
  label, 
  showPercentage = true,
  colorClass = 'bg-blue-600' 
}: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const barColor = isAtLimit 
    ? 'bg-red-600' 
    : isNearLimit 
    ? 'bg-yellow-600' 
    : colorClass;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">
              {current.toLocaleString()} / {max.toLocaleString()} ({percentage.toFixed(1)}%)
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
