"use client"

import React from "react"

interface MemberActionsMenuProps {
  onEdit: () => void
  onBlock: () => void
  onDelete: () => void
  onClose: () => void
}

export default function MemberActionsMenu({ onEdit, onBlock, onDelete }: MemberActionsMenuProps) {
   
  return (
    <div
      className="bg-white rounded-xl shadow-lg px-0 py-0 min-w-[200px] border border-[#ECECEC] select-none z-[120]"
      style={{ boxShadow: '0 4px 28px 0 rgba(44, 44, 44, 0.10)' }}
      onClick={e => e.stopPropagation()}
    >
      <button
        className="block w-full text-[#484848] text-[14px] cursor-pointer text-left font-normal px-4 py-2.5 hover:bg-[#F7F7F7] outline-none"
        onClick={onBlock}
      >
        Bloquer l’utilisateur
      </button>
      <button
        className="block w-full text-[#F04438] text-[14px] cursor-pointer text-left font-semibold px-4 py-2.5 hover:bg-[#FFF3F2] rounded-b-xl outline-none"
        onClick={onDelete}
      >
        Supprimer l’utilisateur
      </button>
    </div>
  )
}
