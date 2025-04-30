"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import Textarea from '@/components/ui/textarea'
import { ImageIcon } from 'lucide-react'
import { createUser, updateUserWithImage, CreateUserDto } from '@/services';
import UserCredentialsModal from './UserCredentialsModal';
import toast from 'react-hot-toast';

interface AddMemberProps {
  onCancel: () => void
  onSuccess?: (member: any) => void
}

export default function AddMember({ onCancel, onSuccess }: AddMemberProps) {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    image: undefined as File | undefined,
  })
   
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [role, setRole] = useState('ADMIN');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (!showRoleDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRoleDropdown]);

  const roleOptions = [
    { value: 'ADMIN', label: 'ADMINISTRATEUR' }, 
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.fullname.trim()) {
      errors.fullname = 'Le nom du personnel est requis'
    }
    if (!formData.email.trim()) {
      errors.email = "L'email est requis"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  }
 
  function getImagePreviewUrl() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!imagePreview) return '/icons/avatar.png';
    if (imagePreview.startsWith('blob:') || imagePreview.startsWith('data:')) return imagePreview;
    if (imagePreview.startsWith('http')) return imagePreview;
    return `${API_BASE_URL}/${imagePreview}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const userObj = {
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: 'ADMIN',
        image: formData.image,
      };
      try {
        const created = await createUser(userObj);
        setIsLoading(false);
        console.log('Utilisateur créé:', created);
        setCreatedUserCredentials({ 
          email: created.email, 
          password: created.password || 'Mot de passe non disponible' 
        });
        setShowCredentialsModal(true);
      } catch (error: any) {
        setIsLoading(false);
        toast.error(error.message || 'Erreur lors de la création du membre');
      }
      return;
    } catch (error) {
      setIsLoading(false);
      toast.error('Erreur lors de la soumission du formulaire');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[760px] mx-0 md:mx-0 p-0">
  
        <div className="relative flex items-center justify-center px-0 pt-0 pb-0 bg-[#FFF3E3] rounded-t-2xl h-[40px]">
          <h2 className="text-base font-sofia-semibold text-[#F17922] mx-auto text-center">Créer un membre</h2>
          <Image src="/icons/close.png" width={20} height={20} alt="Fermer" onClick={onCancel}
            className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-4xl font-bold" /> 
        </div>
        <form onSubmit={handleSubmit} className="block md:hidden w-full">
          <div className="px-4 pt-6 pb-4 flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-[96px] h-[96px] rounded-full bg-[#F4F4F5] flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => document.getElementById('member-image-upload')?.click()}>
                <Image src={getImagePreviewUrl()} alt="Aperçu du membre" width={96} height={96} className="object-cover w-full h-full rounded-full" unoptimized />
                <input
                  id="member-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              <button type="button" className="text-[#F17922] text-xs font-semibold mt-1" onClick={() => document.getElementById('member-image-upload')?.click()}>Changer la photo</button>
            </div>
            <Input
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Nom complet"
              required
              className="h-[44px] rounded-lg border border-[#ECECEC] bg-white text-[15px] px-4 placeholder-[#D8D8D8] focus:ring-2 focus:ring-[#F17922]/30 mb-1"
            />
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Adresse email"
              className="h-[44px] rounded-lg border border-[#ECECEC] bg-white text-[15px] px-4 placeholder-[#D8D8D8] focus:ring-2 focus:ring-[#F17922]/30 mb-1"
            />
            <Input
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="Numéro de téléphone"
              className="h-[44px] rounded-lg border border-[#ECECEC] bg-white text-[15px] px-4 placeholder-[#D8D8D8] focus:ring-2 focus:ring-[#F17922]/30 mb-1"
            />
            <Input
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              placeholder="Adresse"
              className="h-[44px] rounded-lg border border-[#ECECEC] bg-white text-[15px] px-4 placeholder-[#D8D8D8] focus:ring-2 focus:ring-[#F17922]/30 mb-1"
            />
            <div className="relative">
              <div className="text-[#595959] text-[15px] font-normal mb-1">Rôle</div>
              <div className="flex items-center border border-[#ECECEC] rounded-lg bg-white px-4 h-[44px] cursor-pointer select-none" onClick={() => setShowRoleDropdown(v => !v)}>
                <span className="flex-1 text-[#71717A] text-[15px] font-semibold">{role ? role : 'Choisissez un rôle'}</span>
                <span className="text-[#F17922] font-bold text-xl">›</span>
              </div>
              {showRoleDropdown && (
                <div className="absolute left-0 right-0 z-20 bg-white rounded-xl shadow-lg border border-[#ECECEC] mt-1">
                  {roleOptions.map((option) => (
                    <div
                      key={option.value}
                      className="px-4 py-2 text-[15px] text-[#232323] hover:bg-[#FFF3E3] hover:text-[#F17922] cursor-pointer rounded-xl"
                      onMouseDown={() => { setRole(option.value); setShowRoleDropdown(false); }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Button
                type="button"
                onClick={onCancel}
                className="h-[40px] cursor-pointer text-[#9796A1] rounded-lg bg-[#ECECEC] text-[15px] items-center justify-center hover:bg-gray-100 w-full"
              >Annuler</Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-[40px] cursor-pointer rounded-lg bg-[#F17922] hover:bg-[#F17922]/90 text-white text-[15px] w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >{isLoading ? 'Enregistrement...' : 'Enregistrer'}</Button>
            </div>
          </div>
        </form>
        <form onSubmit={handleSubmit} className="md:block px-0 pt-0 pb-0 flex flex-col gap-0 min-w-[600px]">
          <div className="px-12 pt-5">
            <span className="text-xs text-[#F17922] font-semibold">Informations basiques</span>
          </div>
          <div className="flex flex-row items-center justify-between px-12 pt-3 pb-2 w-full gap-3">
            <span className="text-[15px] text-[#71717A] font-medium">Photo de profil</span>
            <div className="flex items-center gap-3">
              <div 
                className="w-[88px] h-[88px]  bg-[#F4F4F5]  rounded-full flex flex-col items-center justify-center 
                cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
                onClick={() => document.getElementById('member-image-upload-desktop')?.click()}
              >
                <Image src={getImagePreviewUrl()} alt="Aperçu du membre" width={88} height={88} className="object-cover w-full h-full rounded-full" unoptimized />
                <input
                  id="member-image-upload-desktop"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              <span className="text-[15px] text-[#9796A1] font-normal ml-2 cursor-pointer select-none" 
              onClick={() => document.getElementById('member-image-upload-desktop')?.click()}>Télécharger une image</span>
            </div>
            <div className="w-32" />
          </div> 
          <div className="flex flex-col gap-0 px-12"> 
            <div className="flex flex-row items-center border-b border-[#ECECEC] h-[54px]">
              <label className="text-[#71717A] w-[160px] text-[15px] font-normal">Nom et prénom(s)</label>
              <Input
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Nom complet"
                required
                className="h-[40px] rounded-none  font-bold border-none bg-transparent text-[15px] placeholder-[#D8D8D8] focus:ring-0 
                focus:border-none ml-2"
                style={{width:'520px', maxWidth:'100%'}}
              />
            </div>
            {/* Email */}
            <div className="flex flex-row items-center border-b border-[#ECECEC] h-[54px]">
              <label className="text-[#71717A] w-[160px] text-[15px] font-normal">E-mail</label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Créez une adresse mail"
                className="h-[40px] rounded-none font-bold border-none bg-transparent text-[15px] placeholder-[#D8D8D8]  text-slate-700  focus:ring-0 focus:border-none ml-2"
                style={{width:'520px', maxWidth:'100%'}}
              />
            </div>
            {/* Téléphone */}
            <div className="flex flex-row items-center border-b border-[#ECECEC] h-[54px]">
              <label className="text-[#71717A] w-[160px] text-[15px] font-normal">Téléphone</label>
              <Input
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="Numéro de téléphone"
                className="h-[40px] rounded-none  font-bold border-none bg-transparent text-[15px] placeholder-[#D8D8D8]  text-slate-700  focus:ring-0 focus:border-none ml-2"
                style={{width:'520px', maxWidth:'100%'}}
              />
            </div>
            {/* Adresse */}
            <div className="flex flex-row items-center border-b border-[#ECECEC] h-[54px]">
              <label className="text-[#71717A] w-[160px] text-[15px] font-normal">Adresse</label>
              <Input
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Ajouter une adresse"
                className="h-[40px] font-bold rounded-none border-none bg-transparent text-[15px] placeholder-[#D8D8D8] text-slate-700 focus:ring-0 focus:border-none ml-2"
                style={{width:'520px', maxWidth:'100%'}}
              />
            </div>
          </div>
          {/* Contrôle du compte */}
          <div className="px-12 pt-6 pb-1">
            <span className="text-xs text-[#F17922] font-semibold">Contrôle du compte</span>
          </div>
          <div className="flex flex-row items-center border-b border-[#ECECEC] h-[54px] px-12">
            <label className="text-[#595959] w-[160px] text-[15px] font-normal">Rôle</label>
            <div className="flex-1 flex items-center relative" ref={roleDropdownRef}>
              <div
                className="ml-2 text-[#71717A] text-[15px] font-semibold cursor-pointer select-none bg-transparent outline-none border-none focus:ring-0
                 focus:outline-none min-w-[220px] max-w-[300px] h-[40px] flex items-center"
                onClick={() => setShowRoleDropdown((v) => !v)}
              >
                {role ? role : 'Choisissez un rôle'}
              </div>
              {showRoleDropdown && (
                <div className="absolute top-full left-0 z-20 bg-white rounded-xl shadow-lg border border-[#ECECEC] min-w-[220px] max-w-[300px] mt-1">
                  {roleOptions.map((option) => (
                    <div
                      key={option.value}
                      className="px-4 py-2 text-[15px] text-[#232323] hover:bg-[#FFF3E3] hover:text-[#F17922] cursor-pointer rounded-xl"
                      onMouseDown={() => { setRole(option.value); setShowRoleDropdown(false); }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[#71717A] font-bold text-2xl ml-2">›</span>
          </div>
          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-6 px-12 pb-6">
            <Button
              type="button"
              onClick={onCancel}
              className="h-[32px] cursor-pointer text-[#9796A1] px-12 rounded-[10px] bg-[#ECECEC] text-[13px] items-center 
              justify-center hover:bg-gray-100 min-w-[120px]"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="h-[32px] cursor-pointer px-12 rounded-[10px] bg-[#F17922] hover:bg-[#F17922]/90 text-white 
              text-[13px] min-w-[230px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
      <UserCredentialsModal
        open={showCredentialsModal}
        email={createdUserCredentials?.email || ''}
        password={createdUserCredentials?.password || ''}
        onClose={() => {
          setShowCredentialsModal(false);
          if (onSuccess && createdUserCredentials) {
            onSuccess({
              email: createdUserCredentials.email,
              password: createdUserCredentials.password
            });
          }
        }}
      />
    </div>
  )
}
