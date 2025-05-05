"use client"

import Image from 'next/image';
import React from 'react';

interface SalesData {
  label: string;
  value: string;
  color: string;
  percentage: number;
}

interface DailySalesProps {
  title?: string;
  subtitle?: string;
}

const DailySales: React.FC<DailySalesProps> = ({ 
  title = "Revenu journalier actualisé",
  subtitle = "Affichage mensuel"
}) => {
  // Données mockées pour les catégories
  const salesData: SalesData[] = [
    { label: "Net en caisse", value: "560.000.000 xof", color: "#4DD0B5", percentage: 50 },
    { label: "Entrée du mois", value: "145.000.000 xof", color: "#1B2559", percentage: 24 },
    { label: "Dépenses", value: "9.860.000 xof", color: "#F44336", percentage: 18 },
    { label: "Frais de service", value: "130.000 xof", color: "#4285F4", percentage: 8 },
  ];

  // Calculer la largeur totale pour s'assurer que les pourcentages s'additionnent à 100%
  const totalPercentage = salesData.reduce((sum, item) => sum + item.percentage, 0);
  
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center">
        <Image className='mt-1' src="/icons/chicken.png" alt="circle" width={14} height={14} />
          <h3 className="text-[#F17922] font-bold text-[15px] ml-2">{title}</h3>
        </div>
        <div className="flex items-center text-gray-500">
          <span className="text-sm">{subtitle}</span>
          <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Barre de progression avec segments colorés et pourcentages */}
      <div className="w-full h-10 rounded-2xl overflow-hidden flex mb-8 relative">
        {salesData.map((item, index) => (
          <div 
            key={index} 
            className="h-full flex items-center justify-center relative"
            style={{ 
              width: `${(item.percentage / totalPercentage) * 100}%`,
              backgroundColor: item.color,
              position: 'relative',
            }}
          >
            <span
              className="absolute left-1/2 top-1/2 text-xs font-bold text-white select-none"
              style={{
                transform: 'translate(-50%, -50%)',
                whiteSpace: 'nowrap',
                textShadow: '0 1px 4px rgba(0,0,0,0.15)',
                fontSize: '11px',
                fontWeight: 600,
                color: '#fff',
                zIndex: 2,
                minWidth: '20px',
              }}
            >
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
      
      {/* Liste des catégories avec valeurs */}
      <div className="space-y-4">
        {salesData.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="flex items-center w-1/2">
              <div 
                className="w-3 h-7 mr-3" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#9796A1] font-light">{item.label}</span>
            </div>
            <div className="w-1/2 text-[#9796A1] font-bold">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailySales;
