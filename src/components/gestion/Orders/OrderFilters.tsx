import React, { useState } from 'react';
import DatePicker from './DatePicker';
import Image from 'next/image';

interface OrderFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function OrderFilters({ activeFilter, onFilterChange, selectedDate, onDateChange }: OrderFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'delivery', label: 'À livrer' },
    { id: 'pickup', label: 'À récupérer' },
    { id: 'table', label: 'À tables' },
    { id: 'new', label: 'Nouvelles commandes' },
  ];

  // Formater la date pour l'affichage
  const formatDate = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Si la date sélectionnée est aujourd'hui
    if (date.getTime() === today.getTime()) {
      return "Aujourd'hui";
    }
    
    // Si la date sélectionnée est demain
    if (date.getTime() === tomorrow.getTime()) {
      return "Demain";
    }
    
    // Sinon, afficher la date formatée
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div className="w-full bg-white p-2 rounded-t-xl border-b border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`px-5 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${activeFilter === filter.id
                ? filter.id === 'all' 
                  ? 'bg-[#F17922] text-white' 
                  : 'bg-[#F17922] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 relative">
          <button 
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 cursor-pointer border-gray-300 text-sm text-gray-700"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
             <Image src="/icons/calendar.png" alt="calendar" width={20} height={20} className='mr-2' />
            <span>{formatDate(selectedDate)}</span>
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDatePicker && (
            <DatePicker
              selectedDate={selectedDate}
              onChange={(date) => {
                onDateChange(date);
                setShowDatePicker(false);
              }}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
