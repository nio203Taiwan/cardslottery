import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <div className="flex justify-between mb-1 text-xmas-cream font-body">
        <span>正在準備聖誕禮物...</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-xmas-darkRed rounded-full h-4 border border-xmas-gold/30">
        <div
          className="bg-xmas-gold h-4 rounded-full transition-all duration-300 ease-out flex items-center justify-center"
          style={{ width: `${percentage}%` }}
        >
            {percentage > 10 && (
                 <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBIOHYyMHpNNDAgMEgwdjQwaDQwVjB6IiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0wIDQwVjBIOHYxMEgwVjBIMHY0MHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-30 animate-pulse"></div>
            )}
        </div>
      </div>
      <p className="text-center text-sm text-xmas-cream/70 mt-2 font-body">
        已處理 {current} / {total} 張照片
      </p>
    </div>
  );
};

export default ProgressBar;