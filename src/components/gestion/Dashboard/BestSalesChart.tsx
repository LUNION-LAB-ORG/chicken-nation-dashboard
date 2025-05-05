"use client"

import React from 'react';
import Image from 'next/image';
import './Dashboard.css';

interface MenuItem {
  id: string;
  name: string;
  count: number;
  image: string;
  percentage: number;
  interestedPercentage: string;
}

interface BestSalesChartProps {
  title: string;
  items: MenuItem[];
}

interface CircularProgressProps {
  value: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value }) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="50" height="50" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <circle
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke="#FFC107"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 16 16)"
        />
      </svg>
      <div className="absolute text-[14px] font-medium text-[#FFC107]">
        {value}%
      </div>
    </div>
  );
};

const MiniBarChart: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="flex gap-2 flex-row items-center justify-center">
      <div className="flex items-end h-6 gap-[2px]">
        <div className="w-[3px] h-3 bg-[#F17922] rounded-sm"></div>
        <div className="w-[3px] h-6 bg-[#F17922] rounded-sm"></div>
        <div className="w-[3px] h-4 bg-[#F17922] rounded-sm"></div>
        <div className="w-[3px] h-2 bg-[#F17922] rounded-sm"></div>
      </div>
      <span className="text-[16px] text-[#9796A1] font-medium mt-1">{count}</span>
    </div>
  );
};

const BestSalesChart: React.FC<BestSalesChartProps> = ({ title, items }) => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center mx-2 mb-4">
        <div className="flex items-center  ">
        <Image className='mt-1' src="/icons/chicken.png" alt="circle" width={14} height={14} />
          <h3 className="text-[#F17922] font-bold text-[15px] ml-2">{title}</h3>
        </div>
      </div>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2  border-b-[1px] border-[#E6E6E6]  ">
            <div className="flex items-center mx-2">
              <div className="lg:w-26 lg:h-20 w-16 h-16 mr-3 rounded-2xl border-[2px] mb-2 border-[#ffeacd]">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  width={200} 
                  height={200} 
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="lg:text-[13px] text-[10px] font-bold text-[#595959] lg:line-clamp-2 line-clamp-3 lg:w-60 w-26 mr-4">{item.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                <Image className='mt-1 contain-content lg:w-4 lg:h-4 w-3 h-3' src="/icons/stonk.png" alt="circle" width={14} height={14} />
                  <span className="lg:text-xs text-[10px] line-clamp-2 lg:line-clamp-1 lg:w-50 w-20 text-[#F17922]">{item.interestedPercentage}</span>
                </div>
              </div>
            </div>
           <div className='lg:mr-50'>
           <MiniBarChart count={item.count} />
           </div>
            <CircularProgress value={item.percentage} />
          </div>
        ))}
      </div>
      
 
    </div>
  );
};

export default BestSalesChart;
