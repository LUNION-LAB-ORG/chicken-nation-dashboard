"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Checkbox from '@/components/ui/Checkbox'
import MemberActionsMenu from './MemberActionsMenu'
import MemberDeleteModal from './MemberDeleteModal'
import MemberBlockModal from './MemberBlockModal'
import MemberViewModal from './MemberViewModal'
import EditMember from './EditMember'
import { createPortal } from 'react-dom'
import { User } from '@/services/userService';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  restaurant?: string;
  phone?: string;
  address?: string;
}

interface MemberViewProps {
  members: Member[]
  onRefresh?: () => void;
  onEdit?: (member: Member) => void;
}

const MemberView: React.FC<MemberViewProps> = ({ members, onRefresh, onEdit }) => {
  const [selected, setSelected] = useState<string[]>([])
  const allChecked = selected.length === members.length && members.length > 0
  const toggleAll = () => setSelected(allChecked ? [] : members.map(m => m.id))
  const toggleOne = (id: string) => setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id])

  // Actions menu state
  const [menuOpenId, setMenuOpenId] = useState<string|null>(null)
  const [menuPosition, setMenuPosition] = useState<{top: number, left: number}|null>(null)
  // Modal states
  const [modal, setModal] = useState<{type: 'block'|'delete'|'edit', member: Member|null}|null>(null)
  const [editMember, setEditMember] = useState<Member|null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMemberViewModal, setShowMemberViewModal] = useState(false)
  const menuBtnRefs = useRef<Record<string, HTMLSpanElement|null>>({})
  const menuRef = useRef<HTMLDivElement|null>(null)

  // Helper to open menu at correct position
  const handleMenuOpen = (memberId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (menuOpenId === memberId) {
      // Si déjà ouvert sur ce membre, toggle (ferme)
      setMenuOpenId(null);
      setMenuPosition(null);
    } else {
      // Utiliser directement la position du clic pour le menu
      setMenuPosition({ 
        top: event.clientY, 
        left: event.clientX 
      });
      setMenuOpenId(memberId);
    }
  }

  // Close menu on scroll or click outside
  useEffect(() => {
    if (!menuOpenId) return
    // Handler pour click (détecte clic extérieur)
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return;
      setMenuOpenId(null); setMenuPosition(null)
    }
    // Handler pour scroll/resize (ferme direct)
    const handleClose = () => { setMenuOpenId(null); setMenuPosition(null) }
    window.addEventListener('scroll', handleClose, true)
    window.addEventListener('resize', handleClose)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('scroll', handleClose, true)
      window.removeEventListener('resize', handleClose)
      window.removeEventListener('click', handleClick)
    }
  }, [menuOpenId])

 
  function getImageUrl(member: Member) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
    if (!member.image) return '/icons/avatar.png';
    
 
    const cacheBuster = `?t=${Date.now()}`;
    
    if (member.image.startsWith('http')) {
      
      return `${member.image}${cacheBuster}`;
    }
    
    
    return `${API_BASE_URL}/${member.image}${cacheBuster}`;
  }

 
  function normalizeMemberImage(member: Member | null): (User & { image?: string }) | null {
    if (!member) return null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
    
    // Convertir Member en User
    const userMember: User & { image?: string } = {
      id: member.id,
      fullname: member.name, 
      email: member.email,
      role: member.role,
      type: '',
      restaurant: member.restaurant,
      phone: member.phone || '',
      address: member.address || '',
      image: member.image
    };
    
    return userMember;
  }

  return (
    <div className="w-full  min-h-screen mt-2">
      {/* Table desktop */}
      <table className="w-full bg-white border-separate border-spacing-0 hidden md:table">
        <thead className="border-b border-[#ECECEC]">
          <tr className="text-[#9796A1] text-[14px]">
            <th className="px-4 py-2 w-8 border-b-2 border-[#A1A1AA]/50">
              <Checkbox checked={allChecked} onChange={toggleAll} />
            </th>
            <th className="font-bold text-[#71717A]  px-0 py-2 text-left border-b-2  pl-10 border-[#A1A1AA]/50">Utilisateur</th>
            <th className="font-bold text-[#71717A] px-0 py-2 text-left border-b-2 border-[#A1A1AA]/50">Rôle</th>
            <th className="font-bold text-[#71717A] px-0 py-2 text-left border-b-2 border-[#A1A1AA]/50"> </th> 
            <th className="px-4 py-2 w-10 border-b-2 border-[#A1A1AA]/50"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-t border-[#ECECEC] relative hover:bg-[#FFF6E9]/60 transition cursor-pointer"
              onClick={() => { setEditMember(member); setShowAddModal(false); setModal(null); setShowMemberViewModal(true); }}>
              <td className="px-4 py-2 w-8" onClick={e => e.stopPropagation()}>
                <Checkbox
                  checked={selected.includes(member.id)}
                  onChange={() => toggleOne(member.id)}
                />
              </td>
              <td className="px-0 py-2">
                <div className="flex ml-10 items-center gap-2 min-w-[180px]">
                  <div className="w-8 h-8 rounded-full bg-[#FFF6E9] flex items-center justify-center overflow-hidden ">
                    <Image src={getImageUrl(member)} alt={member.name} width={60} height={60} className="object-contain w-full h-full" unoptimized={getImageUrl(member).startsWith('/icons/')} />
                  </div>
                  <span className="text-sm lg:text-[15px] text-[#232323] font-normal">{member.name}</span>
                </div>
              </td>
              <td className="px-0 py-2">
                <span className={
                  member.role === 'SuperAdmin'
                    ? "bg-[#E5F9EB] text-[#34C759] text-[14px] font-bold px-4 py-1 rounded-full inline-block min-w-[240px] text-start"
                    : "bg-[#FBDBA7] text-[#7A3502] text-[14px] font-bold px-4 py-1 rounded-full inline-block min-w-[240px] text-start"
                }>
                  {member.role}
                </span>
              </td>
              <td className="px-0 py-2 text-[15px] text-[#232323]">{member.email}</td>
              <td className="px-4 py-2 w-10 text-right relative" onClick={e => e.stopPropagation()}>
                <span
                  className="text-[#71717A] text-md lg:text-lg cursor-pointer select-none"
                  ref={el => { if (el) menuBtnRefs.current[member.id] = el; }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(member.id, e);
                  }}
                >•••</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cards mobile */}
      <div className="flex flex-col gap-4 md:hidden">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-[#ECECEC] p-4 flex items-center gap-4 cursor-pointer hover:bg-[#FFF6E9]/60 transition"
            onClick={() => setModal({ type: 'edit', member })}>
            <div className="w-14 h-14 rounded-full bg-[#FFF6E9] flex items-center justify-center overflow-hidden">
              <Image src={getImageUrl(member)} alt={member.name} width={56} height={56}
               className="object-cover w-full h-full" unoptimized={getImageUrl(member).startsWith('/icons/')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-row justify-between gap-2">
                <span className="text-[13px] text-[#232323] font-semibold truncate">{member.name}</span>
                <span className={
                  member.role === 'SuperAdmin'
                    ? "bg-[#E5F9EB] text-[#34C759] text-[10px] font-bold px-2 py-0.5 rounded-full"
                    : "bg-[#FBDBA7] text-[#7A3502] text-[10px] font-bold px-2 py-0.5 rounded-full"
                }>{member.role}</span>
              </div>
              <div className="text-[12px] text-[#71717A] truncate">{member.email}</div>
              {member.restaurant && member.role !== 'SuperAdmin' && (
                <div className="text-[13px] text-[#F17922] mt-1 font-medium">{member.restaurant}</div>
              )}
            </div>
            <span
              className="text-[#71717A] text-lg cursor-pointer select-none px-2"
              ref={el => { if (el) menuBtnRefs.current[member.id] = el; }}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(member.id, e);
              }}
            >•••</span>
          </div>
        ))}
      </div>

 
      {menuOpenId && menuPosition && typeof document !== 'undefined' && createPortal(
        <div 
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 9999,
            transform: 'translate(-50%, 10px)'
          }}
        >
          <MemberActionsMenu
            onEdit={() => {
              setMenuOpenId(null); 
              setMenuPosition(null);
              const memberToEdit = members.find(m => m.id === menuOpenId)!;
          
              if (onEdit) {
                onEdit(memberToEdit);
              } else { 
                setEditMember(memberToEdit);
                setShowAddModal(true);
              }
            }}
            onBlock={() => { setMenuOpenId(null); setMenuPosition(null); setModal({ type: 'block', member: members.find(m => m.id === menuOpenId)! }) }}
            onDelete={() => { setMenuOpenId(null); setMenuPosition(null); setModal({ type: 'delete', member: members.find(m => m.id === menuOpenId)! }) }}
            onClose={() => { setMenuOpenId(null); setMenuPosition(null) }}
          />
        </div>,
        document.body
      )}

     
      <MemberDeleteModal
        open={!!modal && modal.type === 'delete'}
        member={modal?.member || null}
        onClose={() => setModal(null)}
        onConfirm={() => { setModal(null) }}
      />
   
      <MemberBlockModal
        open={!!modal && modal.type === 'block'}
        member={modal?.member || null}
        onClose={() => setModal(null)}
        onConfirm={() => {   setModal(null) }}
      />
    
      <MemberViewModal
        open={!!modal && modal.type === 'edit'}
        member={modal?.member || null}
        onClose={() => setModal(null)}
      />
     
      {showAddModal && editMember && (
        <EditMember
          existingMember={normalizeMemberImage(editMember)!}
          onCancel={() => { setShowAddModal(false); setEditMember(null) }}
          onSuccess={() => { 
            setShowAddModal(false); 
            setEditMember(null);
        
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}
     
      {showMemberViewModal && (
        <MemberViewModal
          open={showMemberViewModal}
          member={editMember}
          onClose={() => setShowMemberViewModal(false)}
        />
      )}
    </div>
  )
}

export default MemberView
