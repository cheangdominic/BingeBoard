import { Apple } from "lucide-react";

function AppleRating({ rating = 0 }) {
  const fullApples = Math.floor(rating);
  const partialFillPercent = (rating - fullApples) * 100;
  const hasPartialApple = partialFillPercent > 0;
  const emptyApples = 5 - fullApples - (hasPartialApple ? 1 : 0);

  const PartialApple = ({ fillPercent }) => (
    <div className="relative w-5 h-5 inline-block">
      <Apple className="absolute top-0 left-0 w-5 h-5 text-gray-400" />
      <div className="absolute top-0 left-0 h-5 overflow-hidden" style={{ width: `${fillPercent}%` }}>
        <Apple className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      </div>
    </div>
  );

  return (
    <div className="flex gap-1">
      {[...Array(fullApples)].map((_, i) => (
        <Apple key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      ))}
      {hasPartialApple && (
        <PartialApple key="partial" fillPercent={partialFillPercent} />
      )}
      {[...Array(emptyApples)].map((_, i) => (
        <Apple key={`empty-${i}`} className="w-5 h-5 text-gray-400" />
      ))}
    </div>
  );
}

export default AppleRating;