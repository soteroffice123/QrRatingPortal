import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function RatingPage() {
  const { qrCodeId } = useParams();
  const [, setLocation] = useLocation();
  const [rating, setRating] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/rating/${qrCodeId}`],
  });

  const submitRatingMutation = useMutation({
    mutationFn: async (rating: number) => {
      const res = await apiRequest("POST", `/api/rating/${qrCodeId}`, { rating });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        // Different redirection based on rating
        if (rating === 5) {
          // For 5-star ratings, redirect to Google review page
          console.log("Redirecting to Google review:", data.redirectUrl);
          window.location.href = data.redirectUrl;
        } else {
          // For 1-4 star ratings, redirect to feedback form
          console.log("Redirecting to feedback form:", data.redirectUrl);
          window.location.href = data.redirectUrl;
        }
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600">The QR code is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = () => {
    if (rating !== null) {
      submitRatingMutation.mutate(rating);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="text-center py-6 bg-gray-50 shadow-sm">
        {data?.business?.logoUrl ? (
          <img 
            src={data.business.logoUrl} 
            alt={data.business.name} 
            className="h-20 w-auto mx-auto object-contain" 
          />
        ) : (
          <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
            <span className="text-gray-500 text-xl font-semibold">
              {data?.business?.name?.charAt(0) || "?"}
            </span>
          </div>
        )}
        <h1 className="mt-3 text-xl font-bold text-gray-800">
          {data?.business?.name || "Business"}
        </h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          How was your experience today?
        </h2>
        
        <div className="mb-12">
          <StarRating 
            rating={rating}
            onRatingChange={handleRatingChange}
            size="large"
          />
        </div>
        
        <Button
          onClick={handleSubmit}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-md shadow transition duration-200"
          disabled={rating === null || submitRatingMutation.isPending}
        >
          {submitRatingMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit
        </Button>
        
        <p className="mt-8 text-sm text-gray-500 text-center">
          Thank you for your feedback! Your opinion helps us improve our service.
        </p>
      </div>
    </div>
  );
}
