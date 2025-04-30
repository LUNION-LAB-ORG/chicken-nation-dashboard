"use client"

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

type Option = {
  value: string
  label: string
  price?: string
  image?: string
}

type SelectWithCheckboxesAndImagesProps = {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

const SelectWithCheckboxesAndImages = ({
  options,
  value,
  onChange,
  placeholder = 'Selectionner...',
  className = '',
}: SelectWithCheckboxesAndImagesProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const [isMounted, setIsMounted] = useState(false)

 
   useEffect(() => {
     if (options.length === 0) return;
    
     const validValues = value.filter(v => options.some(opt => opt.value === v));
    
     if (validValues.length !== value.length) { 
      const hasRealDifference = value.some(v => !validValues.includes(v)) || 
                               validValues.some(v => !value.includes(v));
      
      if (hasRealDifference) {
        onChange(validValues);
      } else {
        
      }
    }
  }, [options, value, onChange]);

  useEffect(() => {
    setIsMounted(true)
    setPortalContainer(document.body)

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOptionClick = (optionValue: string) => {
    const newValue = [...value]
    const index = newValue.indexOf(optionValue)
    if (index === -1) {
      newValue.push(optionValue)
    } else {
      newValue.splice(index, 1)
    }
    onChange(newValue)
  }

  const renderDropdown = () => {
    if (!containerRef.current || !isOpen || !portalContainer || !isMounted) return null

    const rect = containerRef.current.getBoundingClientRect()
    
    return createPortal(
      <div 
        className="fixed inset-0"
        style={{ 
          zIndex: 99999,
          pointerEvents: 'none'
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div 
          className="absolute bg-white border border-white rounded-b-xl shadow-lg overflow-hidden"
          style={{ 
            top: `${rect.bottom + window.scrollY}px`,
            left: `${rect.left + window.scrollX}px`,
            width: `${rect.width}px`,
            pointerEvents: 'auto'
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-0 max-h-60 overflow-y-auto">
            <div
              className="flex items-center justify-between px-4 py-3 bg-[#f5f5f5] hover:bg-[#f5f5f5] cursor-pointer border-b-2 border-white"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onChange(value.length === options.length ? [] : options.map(opt => opt.value));
                return false;
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <span className="text-[#595959] font-regular text-[13px]">Tout selectionner</span>
              <div className={`w-5 h-5 rounded-md ${value.length === options.length ? 'bg-[#F17922]' : 'border-2 border-gray-300'} flex items-center justify-center`}>
                {value.length === options.length && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            {options.map((option, index) => (
              <div
                key={option.value}
                className={`flex items-center justify-between px-4 py-3 hover:bg-[#f5f5f5] cursor-pointer ${
                  index === 0 ? 'border-b-2 border-white' : ''
                } bg-[#f5f5f5]`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleOptionClick(option.value);
                  return false;
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <div className="flex items-center gap-3">
                  {option.image && (
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image 
                        src={option.image} 
                        alt={option.label} 
                        width={24} 
                        height={24} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[#595959] font-regular text-[13px]">{option.label}</span>
                    {option.price && (
                      <span className="text-[#9796A1] text-[11px]">{option.price}</span>
                    )}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md ${value.includes(option.value) ? 'bg-[#F17922]' : 'border-2 border-gray-300'} flex items-center justify-center`}>
                  {value.includes(option.value) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {!value.includes(option.value) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L5 9L13 1" stroke="#F17922" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>,
      portalContainer
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex items-center justify-between w-full px-4 py-2 bg-[#d8d8d8] rounded-xl cursor-pointer ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center w-full justify-between gap-2">
          <span className="text-[#595959] font-semibold text-[13px]">{placeholder}</span>
          <Image 
            src="/icons/down.png" 
            alt="arrow" 
            width={1} 
            height={1}
            className={`w-1 xs:w-3 xs:h-2 sm:w-4 sm:h-2 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {renderDropdown()}
    </div>
  )
}

export default SelectWithCheckboxesAndImages
