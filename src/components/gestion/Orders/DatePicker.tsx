"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate));
  const pickerRef = useRef<HTMLDivElement>(null);
  
   
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Ajuster pour commencer la semaine par lundi (0 = lundi, 6 = dimanche)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = [];
    
    // Ajouter les jours du mois précédent pour remplir la première ligne
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Ajouter les jours du mois actuel
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime()
      });
    }
    
    // Ajouter les jours du mois suivant pour compléter la dernière ligne
    const totalDaysToShow = Math.ceil((adjustedFirstDay + daysInMonth) / 7) * 7;
    const nextMonthDays = totalDaysToShow - days.length;
    
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  };

  // Passer au mois précédent
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Passer au mois suivant
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Formater le mois et l'année
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  // Vérifier si une date est sélectionnée
  const isSelectedDate = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Jours de la semaine (commençant par lundi)
  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Obtenir les jours à afficher
  const days = getDaysInMonth(currentMonth);

  // Appliquer des dates prédéfinies
  const applyPreset = (preset: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newDate = new Date(today);
    
    switch (preset) {
      case 'today':
        // Déjà défini à aujourd'hui
        break;
      case 'tomorrow':
        newDate.setDate(today.getDate() + 1);
        break;
      case 'nextWeek':
        newDate.setDate(today.getDate() + 7);
        break;
      case 'nextMonth':
        newDate.setMonth(today.getMonth() + 1);
        break;
    }
    
    onChange(newDate);
    onClose();
  };

  return (
    <div 
      ref={pickerRef}
      className="absolute z-50 top-full mt-1 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
      style={{ maxHeight: '350px', overflowY: 'auto' }}
    >
      {/* En-tête avec navigation des mois */}
      <div className="flex items-center justify-between mb-2">
        <button 
          type="button" 
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm font-medium text-gray-700">
          {formatMonthYear(currentMonth)}
        </div>
        <button 
          type="button" 
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      
      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map(day => (
          <div key={day} className="text-center text-xs text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Jours du mois */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              onChange(day.date);
              onClose();
            }}
            className={`
              h-8 w-8 text-xs rounded-full flex items-center justify-center cursor-pointer
              ${!day.isCurrentMonth ? 'text-gray-300' : ''}
              ${day.isToday ? 'bg-orange-100 text-orange-700' : ''}
              ${isSelectedDate(day.date) ? 'bg-[#F17922] text-white' : 'hover:bg-gray-100'}
            `}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
      
      {/* Raccourcis */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500 mb-1">Raccourcis:</div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => applyPreset('today')}
            className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-md"
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tomorrow')}
            className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-md"
          >
            Demain
          </button>
          <button
            type="button"
            onClick={() => applyPreset('nextWeek')}
            className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-md"
          >
            Semaine prochaine
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
