import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number | null;
  onRatingChange: (rating: number) => void;
  size?: "small" | "medium" | "large";
}

export function StarRating({ 
  rating, 
  onRatingChange,
  size = "medium"
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const handleStarClick = (starIndex: number) => {
    onRatingChange(starIndex);
  };
  
  const handleStarMouseEnter = (starIndex: number) => {
    setHoverRating(starIndex);
  };
  
  const handleStarMouseLeave = () => {
    setHoverRating(null);
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "h-5 w-5";
      case "medium":
        return "h-8 w-8";
      case "large":
        return "h-10 w-10";
      default:
        return "h-8 w-8";
    }
  };
  
  const getStarSize = () => {
    switch (size) {
      case "small":
        return "px-0.5";
      case "medium":
        return "px-1";
      case "large":
        return "px-1.5";
      default:
        return "px-1";
    }
  };
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <button
          key={starIndex}
          type="button"
          className={cn(
            "star transition-all duration-200 ease-in-out transform hover:scale-110",
            getStarSize()
          )}
          onClick={() => handleStarClick(starIndex)}
          onMouseEnter={() => handleStarMouseEnter(starIndex)}
          onMouseLeave={handleStarMouseLeave}
          aria-label={`Rate ${starIndex} out of 5 stars`}
        >
          <Star
            className={cn(
              getSizeClasses(),
              "transition-colors",
              (hoverRating !== null && starIndex <= hoverRating) || 
              (hoverRating === null && rating !== null && starIndex <= rating)
                ? "fill-current text-yellow-400"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
