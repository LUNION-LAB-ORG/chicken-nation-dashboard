import Checkbox from "@/components/ui/Checkbox";
 
import Image from "next/image";
import { useState } from "react";

interface Review {
  id: string;
  date: string;
  comment: string;
}

interface ReviewsTabProps {
  clientReviews: Review[];
  client: {
    firstName: string;
    [key: string]: unknown;
  };
  fullName: string;
  formatDate: (date: string) => string;
}

export function ReviewsTab({ clientReviews, client, fullName, formatDate }: ReviewsTabProps) {
  const [selectedReviews, setSelectedReviews] = useState<Record<string, boolean>>({});

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    setSelectedReviews(prev => ({
      ...prev,
      [reviewId]: checked
    }));
  };

  return (
    <div className="w-full">
     
      
      <div className="flex flex-col space-y-4">
        {clientReviews.length > 0 ? (
          clientReviews.map((review) => (
            <div key={review.id} className="flex p-4   border-b  border-[#80808096]  ">
              <div className=" items-center mr-6 space-y-2">
                <Checkbox 
                  checked={selectedReviews[review.id] || false} 
                  onChange={(checked) => handleSelectReview(review.id, checked)}
                />
                <button className="flex items-center text-xs text-gray-500 hover:text-gray-700 mt-auto">
                  <Image src={"/icons/copy.png"} alt="Copy" width={20} height={20} />
                </button>
              </div>
              
              <div className="flex-1 ">
                <div className="flex   space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                    {client.firstName.charAt(0)}
                  </div>
                  <div className="flex gap-4 items-center ">
                    <h4 className="text-sm font-medium text-gray-900">{fullName}</h4>
                    <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
                  </div>
                </div>
                
                <p className="mt-2 text-sm text-gray-700 pl-0">{review.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center p-4 bg-gray-50 rounded-lg">Aucun commentaire trouvé</p>
        )}
      </div>
    </div>
  );
}
