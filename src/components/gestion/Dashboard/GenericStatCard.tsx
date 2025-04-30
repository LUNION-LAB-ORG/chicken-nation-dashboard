"use client"

import Image from "next/image"
import { LucideIcon } from "lucide-react"
import React from "react"

interface GenericStatCardProps {
  title: string
  value: string | number
  unit?: string
  badgeColor?: string
  badgeText?: string
  icon?: LucideIcon
  iconColor?: string
  iconImage?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function GenericStatCard({
  title,
  value,
  unit = "",
  badgeColor = "#007AFF",
  badgeText,
  icon: Icon,
  iconColor = "#F17922",
  iconImage,
  trend,
  className = ""
}: GenericStatCardProps) {
  return (
    <div className={`w-full rounded-3xl relative border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      {badgeText && (
        <div 
          className="rounded-b-xl h-7 absolute top-0 left-5 px-2 text-white flex items-center justify-center"
          style={{ backgroundColor: badgeColor }}
        >
          <span className="text-xs ml-4 font-sofia-regular font-normal">{badgeText}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-6">
        <div>
          <h2 className="text-xl font-medium text-[#9796A1]">
            {value} {unit}
            {trend && (
              <span className={`ml-2 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
            )}
          </h2>
          {title && title !== badgeText && (
            <p className="text-sm text-gray-500 mt-1">{title}</p>
          )}
        </div>
        
        <div style={{ color: iconColor }}>
          {Icon && <Icon size={30} strokeWidth={2} />}
          {iconImage && <Image src={iconImage} alt={title} width={30} height={30} />}
        </div>
      </div>
    </div>
  )
}