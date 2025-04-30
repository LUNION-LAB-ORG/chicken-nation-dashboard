"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import Textarea from '@/components/ui/textarea'
import { ImageIcon } from 'lucide-react'
import { updateUser, updateUserWithImage, updateUserJSON, User } from '@/services/userService'
import toast from 'react-hot-toast'
import type { Member } from './MemberView'

// Type qui accepte soit un User soit un Member
type UserOrMember = (User & { image?: string }) | (Member & {
  fullname?: string;
  phone?: string;
  address?: string;
});

interface EditMemberProps {
  onCancel: () => void
  onSuccess?: (member: User) => void
  existingMember: UserOrMember
}

export default function EditMember({ onCancel, onSuccess, existingMember }: EditMemberProps) {
  // Helper pour obtenir l'avatar réel ou une image par défaut
  function getAvatarUrl(member: UserOrMember) {
    // Si l'image existe et est une URL valide, l'utiliser directement
    if ('image' in member && member.image && member.image.startsWith('http')) {
      return member.image;
    }
    
    // Sinon, utiliser l'avatar par défaut
    return '/icons/avatar.png';
  }
  
  // État initial avec valeurs par défaut sécurisées
  // Initialiser avec des valeurs par défaut, puis mettre à jour dans useEffect
  const [formData, setFormData] = useState<{ fullname: string; email: string; phone: string; address: string; image?: File }>({
    fullname: ('fullname' in existingMember && existingMember.fullname) ? existingMember.fullname : 
             ('name' in existingMember && existingMember.name) ? existingMember.name : '',
    email: existingMember.email || '',
    phone: ('phone' in existingMember && existingMember.phone) ? existingMember.phone : '',
    address: ('address' in existingMember && existingMember.address) ? existingMember.address : '',
    image: undefined
  })
  
  // Stocker les valeurs initiales pour comparer lors de la soumission
  const [initialValues, setInitialValues] = useState({
    fullname: ('fullname' in existingMember && existingMember.fullname) ? existingMember.fullname : 
             ('name' in existingMember && existingMember.name) ? existingMember.name : '',
    email: existingMember.email || '',
    phone: ('phone' in existingMember && existingMember.phone) ? existingMember.phone : '',
    address: ('address' in existingMember && existingMember.address) ? existingMember.address : '',
    role: 'role' in existingMember ? existingMember.role : ''
  })
  const [imagePreview, setImagePreview] = useState<string>('/icons/avatar.png')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [role, setRole] = useState('role' in existingMember ? existingMember.role : '')
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const roleDropdownRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
 
  useEffect(() => {
   
    const newFormData = {
      fullname: ('fullname' in existingMember && existingMember.fullname) ? existingMember.fullname : 
               ('name' in existingMember && existingMember.name) ? existingMember.name : '',
      email: existingMember.email || '',
      phone: ('phone' in existingMember && existingMember.phone) ? existingMember.phone : '',
      address: ('address' in existingMember && existingMember.address) ? existingMember.address : '',
      image: undefined 
    };
    
    const newInitialValues = {
      fullname: newFormData.fullname,
      email: newFormData.email,
      phone: newFormData.phone,
      address: newFormData.address,
      role: 'role' in existingMember ? existingMember.role : 'ADMIN'
    };
    
    // Mettre à jour les données du formulaire
    setFormData(newFormData);
    
    // Mettre à jour les valeurs initiales
    setInitialValues(newInitialValues);
    
    // Initialiser l'aperçu de l'image si disponible
    setImagePreview(getAvatarUrl(existingMember));
    
    // Mise à jour du rôle
    setRole('role' in existingMember ? existingMember.role : 'ADMIN');
    
  }, [existingMember])

  useEffect(() => {
    if (!showRoleDropdown) return
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setShowRoleDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showRoleDropdown])

  const roleOptions = [
    { value: 'ADMIN', label: 'ADMINISTRATEUR' }
  ]

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.fullname.trim()) errors.fullname = 'Le nom est requis'
    if (!formData.email.trim()) errors.email = 'L\'email est requis'
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Email invalide'
    if (!formData.phone.trim()) errors.phone = 'Le téléphone est requis'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }
    
    // Vérifier la taille du fichier (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }
    
    // Stocker le fichier pour l'upload
    setImageFile(file);
    
    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try { 
      const authData = localStorage.getItem('chicken-nation-auth');
      if (authData) {
        const parsedData = JSON.parse(authData);
        const currentUserId = parsedData?.state?.user?.id || parsedData?.user?.id;
        
        if (currentUserId === existingMember.id) {
           
          setIsLoading(false);
          return;
        }
      }
     
      toast.success('Fonctionnalité  indisponible');
      
     
      const mockUpdated: User = {
        ...existingMember,
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone || '',
        address: formData.address || '',
        role: role
      };
     
      if (onSuccess) {
        onSuccess(mockUpdated as User);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[760px] mx-0 md:mx-0 p-0">
        {/* Header */}
        <div className="relative flex items-center justify-center px-0 pt-0 pb-0 bg-[#FFF3E3] rounded-t-2xl h-[40px]">
          <h2 className="text-base font-sofia-semibold text-[#F17922] mx-auto text-center">Modifier un membre</h2>
          <Image src="/icons/close.png" width={20} height={20} alt="Fermer" onClick={onCancel}
            className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-4xl font-bold" /> 
        </div>
        {/* MOBILE */}
        <form onSubmit={handleSubmit} className="block md:hidden w-full">
          <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-[96px] h-[96px] rounded-full bg-[#F4F4F5] flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => document.getElementById('edit-image-upload')?.click()}>
                <Image 
                  src={imagePreview} 
                  alt="Aperçu du membre" 
                  width={96} 
                  height={96}
                  className="object-cover w-full h-full rounded-full"
                  unoptimized={!imagePreview?.startsWith('/')}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Erreur de chargement de l\'image:', e);
                    (e.target as HTMLImageElement).src = '/icons/avatar.png';
                  }}
                />
                <input
                  id="edit-image-upload"
                  type="file"
                  accept="image/*"
                  className="absolute invisible"
                  onChange={handleImageChange}
                />
              </div>
              <button type="button" className="text-[#F17922] text-xs font-semibold mt-1" onClick={() => document.getElementById('edit-image-upload')?.click()}>Changer la photo</button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#71717A] text-sm">Nom et prénom(s)</label>
              <Input name="fullname" value={formData.fullname} onChange={handleChange} 
                className="h-[40px] rounded-lg border-[#ECECEC] bg-white text-[15px] text-slate-700" 
                error={formErrors.fullname} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#71717A] text-sm">E-mail</label>
              <Input name="email" value={formData.email} onChange={handleChange} 
                className="h-[40px] rounded-lg border-[#ECECEC] bg-white text-[15px] text-slate-700" 
                error={formErrors.email} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#71717A] text-sm">Téléphone</label>
              <Input name="phone" value={formData.phone} onChange={handleChange} 
                className="h-[40px] rounded-lg border-[#ECECEC] bg-white text-[15px] text-slate-700" 
                error={formErrors.phone} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#71717A] text-sm">Adresse</label>
              <Input name="address" value={formData.address} onChange={handleChange} 
                className="h-[40px] rounded-lg border-[#ECECEC] bg-white text-[15px] text-slate-700" />
            </div>
            <div className="relative">
              <div className="text-[#595959] text-[15px] mb-1">Rôle</div>
              <div ref={roleDropdownRef} className="flex items-center border border-[#ECECEC] rounded-lg px-4 h-[44px] cursor-pointer" onClick={() => setShowRoleDropdown(v => !v)}>
                <span className="flex-1 text-[#71717A] font-semibold">{role || 'Choisissez un rôle'}</span>
                <span className="text-[#F17922] font-bold text-xl">›</span>
              </div>
              {showRoleDropdown && <div className="absolute left-0 right-0 bg-white rounded-xl shadow-lg border border-[#ECECEC] mt-1">
                {roleOptions.map(o => <div key={o.value} className="px-4 py-2 hover:bg-[#FFF3E3] cursor-pointer" onMouseDown={() => { setRole(o.value); setShowRoleDropdown(false) }}>{o.label}</div>)}
              </div>}
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="button" onClick={onCancel} className="flex-1 bg-[#ECECEC]">Annuler</Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-[#F17922] text-white">{isLoading ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </div>
          </div>
        </form>
        {/* DESKTOP */}
        <form onSubmit={handleSubmit} className="hidden md:block w-full min-w-[600px]">
          <div className="px-12 pt-5"><span className="text-xs text-[#F17922] font-semibold">Informations basiques</span></div>
          <div className="flex flex-row items-center justify-between px-12 pt-3 pb-2 gap-3">
            <span className="text-[15px] text-[#71717A] font-medium">Photo de profil</span>
            <div className="flex items-center gap-3">
              <div 
                className="w-[88px] h-[88px] bg-[#F4F4F5] rounded-full flex flex-col items-center justify-center 
                cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                onClick={() => document.getElementById('edit-image-upload-desktop')?.click()}
              >
                <Image 
                  src={imagePreview} 
                  alt="Aperçu du membre" 
                  width={88} 
                  height={88}
                  className="object-cover w-full h-full rounded-full"
                  unoptimized={!imagePreview?.startsWith('/')}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Erreur de chargement de l\'image:', e);
                    (e.target as HTMLImageElement).src = '/icons/avatar.png';
                  }}
                />
                <input
                  id="edit-image-upload-desktop"
                  type="file"
                  accept="image/*"
                  className="absolute invisible"
                  onChange={handleImageChange}
                />
              </div>
              <span className="text-[15px] text-[#9796A1] font-normal ml-2 cursor-pointer select-none" 
              onClick={() => document.getElementById('edit-image-upload-desktop')?.click()}>Télécharger une image</span>
            </div>
            <div className="w-32" />
          </div>
          <div className="flex flex-col gap-0 px-12">
            <div className="flex flex-row items-center border-b border-[#ECECEC] h-[54px]">
              <label className="text-[#71717A] w-[160px] text-[15px] font-normal">Nom et prénom(s)</label>
              <Input name="fullname" value={formData.fullname} onChange={handleChange} 
              className="h-[40px] border-none bg-transparent font-bold ml-2  text-slate-700 " style={{width:'520px'}} error={formErrors.fullname} 
              />
              </div>
            <div className="flex flex-row items-center border-b border-[#ECECEC] h-[54px]">
              <label className="text-[#71717A] w-[160px] text-[15px] font-normal">E-mail</label><Input name="email" value={formData.email} onChange={handleChange} 
              className="h-[40px] border-none bg-transparent font-bold ml-2 text-slate-700" 
              style={{width:'520px'}} error={formErrors.email} />
              
            </div>

            <div className="flex flex-row items-center border-b border-[#ECECEC] h-[54px]">
              <label className="text-[#71717A] w-[160px] text-[15px] font-normal">Téléphone</label>
              <Input name="phone" value={formData.phone} onChange={handleChange} 
              className="h-[40px] border-none bg-transparent font-bold ml-2  text-slate-700 "  style={{width:'520px'}}
               error={formErrors.phone} />
               </div>

            <div className="flex flex-row items-center border-b border-[#ECECEC] h-[54px]">
              <label className="text-[#71717A] w-[160px] text-[15px] font-normal">Adresse</label>
              <Input name="address" value={formData.address} onChange={handleChange} 
              className="h-[40px] border-none bg-transparent font-bold ml-2 text-slate-700" style={{width:'520px'}} />
            </div>

            <div className="flex flex-row items-center border-b border-[#ECECEC] h-[54px]">
              <label className="text-[#71717A] w-[160px] text-[15px] font-normal">Rôle</label>
              <div ref={roleDropdownRef} className="flex items-center cursor-pointer ml-2" onClick={() => setShowRoleDropdown(v => !v)}>
                <span className="flex-1 font-semibold  text-slate-700 ">{role}</span><span className="text-[#F17922] ml-2">›</span>
                </div>
                
                </div>

            <div className="flex justify-end gap-3 mt-6 px-12 pb-6">
              <Button type="button" onClick={onCancel}  className="h-[32px] cursor-pointer text-[#9796A1] px-12 rounded-[10px] bg-[#ECECEC] text-[13px] items-center 
              justify-center hover:bg-gray-100 min-w-[120px]">Annuler</Button>
              
              <Button type="submit" disabled={isLoading}   className="h-[32px] cursor-pointer px-12 rounded-[10px] bg-[#F17922] hover:bg-[#F17922]/90 text-white 
              text-[13px] min-w-[230px] disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}</Button>
                
                </div>
          </div>
        </form>
      </div>
    </div>
  )
}
