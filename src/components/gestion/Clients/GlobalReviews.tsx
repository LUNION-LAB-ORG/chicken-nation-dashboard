import React, { useState } from 'react';
import { ReviewCard } from '@/components/ui/ReviewCard';  

const MOCK_REVIEWS = [
  {
    id: '1',
    clientName: 'Maxin Will',
    clientInitial: 'MW',
    date: '2024-03-22',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    rating: 4.8,
    avatarColor: 'bg-red-500'
  },
  {
    id: '2',
    clientName: 'Olivia Smith',
    clientInitial: 'OS',
    date: '2024-03-21',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    rating: 4.5,
    avatarColor: 'bg-blue-500'
  }
];

export function GlobalReviews() {
  const [selectedReviews, setSelectedReviews] = useState<Record<string, boolean>>({});

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    setSelectedReviews(prev => ({
      ...prev,
      [reviewId]: checked
    }));
  };

  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Notes & avis clients</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
            Filtrer
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
            Exporter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {MOCK_REVIEWS.map((review) => (
          <ReviewCard 
            key={review.id}
            clientName={review.clientName}
            clientInitial={review.clientInitial}
            date={review.date}
            comment={review.comment}
            rating={review.rating}
            avatarColor={review.avatarColor}
            checked={selectedReviews[review.id] || false}
            onCheck={(checked) => handleSelectReview(review.id, checked)}
          />
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
          Tout supprimer
        </button>
      </div>
    </div>
  );
}