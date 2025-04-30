"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Input from '../../ui/Input'  
import Button from '../../ui/Button'  
import Textarea from '@/components/ui/textarea'  
import Select from '@/components/ui/Select' 
import Toggle from '@/components/ui/Toggle'
import { getAllCategories } from '@/services'
import { updateSupplementAvailability } from '@/services/dishService'
import { Dish } from '@/types/dish'
import { Category } from '@/services/categoryService'
import { ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EditSupplementProps {
  onCancel: () => void
  onSuccess?: (dish: Dish) => Promise<void>
  product: Dish | null
}

export default function EditSupplement({ onCancel, onSuccess, product }: EditSupplementProps) {
  const [formData, setFormData] = useState<{
    name: string;
    price: number;
    description?: string;
    image?: File;
    available: boolean;
    category: string;
  }>({
    name: '', 
    price: 0,
    description: '',
    image: undefined,
    available: true, 
    category: '',
  })
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Charger les catégories au chargement du composant
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
        toast.error('Impossible de charger les catégories')
      }
    }

    fetchCategories()
  }, [])

  // Initialiser le formulaire avec les données du supplément
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        description: product.description || '',
        image: undefined,
        available: product.available || false,
        category: product.category || 'DRINK',
      })
      
      if (product.image) {
        setImagePreview(product.image)
      }
    }
  }, [product])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom du supplément est requis'
    }
    
    if (formData.price <= 0) {
      errors.price = 'Le prix doit être supérieur à 0'
    }
    
    if (!formData.category) {
      errors.category = 'Veuillez sélectionner une catégorie'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } } | string
  ) => {
    if (typeof e === 'string') {
      // Gestion du Select pour la catégorie
      setFormData(prev => ({
        ...prev,
        category: e
      }))
      setFormErrors(prev => ({ ...prev, category: '' }))
    } else {
      // Gestion des inputs et textarea
      const { name, value } = e.target
      
      if (name === 'price') {
        // Convertir en nombre pour les champs de prix
        const numValue = value === '' ? 0 : Number(value)
        setFormData(prev => ({
          ...prev,
          [name]: numValue
        }))
        setFormErrors(prev => ({ ...prev, [name]: '' }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }))
        setFormErrors(prev => ({ ...prev, [name]: '' }))
      }
    }
  }

  const handleToggleChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !product) {
      toast.error('Veuillez corriger les erreurs du formulaire')
      return
    }
    
    setIsLoading(true)
    
    try {
      const fd = new FormData()
      fd.append('name', formData.name)
      fd.append('price', formData.price.toString())
      fd.append('category', formData.category)
      fd.append('available', formData.available ? 'true' : 'false')
      
      if (formData.description) {
        fd.append('description', formData.description)
      }
      
      if (formData.image instanceof File) {
        fd.append('image', formData.image)
      }
      
      // Récupérer le token
      const token = localStorage.getItem('chicken-nation-auth') 
        ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
        : null;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // URL de l'API
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      // Envoyer directement le FormData pour mettre à jour le supplément
      const response = await fetch(`${API_URL}/api/v1/supplements/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fd
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur API:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      const updatedSupplement = await response.json();
      toast.success('Supplément mis à jour avec succès')
      
      if (onSuccess) await onSuccess(updatedSupplement)
      onCancel()
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour le supplément'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Transformer les catégories en options pour le Select
  const categoryOptions = [
    { value: 'FOOD', label: 'Nourriture' },
    { value: 'DRINK', label: 'Boisson' },
    { value: 'ACCESSORY', label: 'Accessoire' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm text-[#595959] font-light mb-2">
          Nom du supplément
        </label>
        <Input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Nom du supplément"
          className={`w-full h-[42px] rounded-xl bg-white border ${formErrors.name ? 'border-red-500' : 'border-[#D8D8D8]'} px-4 text-[13px] placeholder-gray-400`}
        />
        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
      </div>

      {/* Prix */}
      <div className="w-full">
        <label className="block text-sm text-[#595959] font-light mb-2">
          Prix
        </label>
        <div className="relative w-full">
          <span className="absolute z-44 left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]">
            XOF
          </span>
          <Input
            name="price"
            type="number"
            value={formData.price.toString()}
            onChange={handleChange}
            min="0"
            step="1"
            placeholder="0"
            required
            className={`w-full h-[42px] rounded-xl bg-white border ${formErrors.price ? 'border-red-500' : 'border-[#D8D8D8]'} pl-13 pr-4 text-[13px] placeholder-gray-400`}
          />
        </div>
        {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
      </div>

      <div>
        <label className="block text-sm text-[#595959] font-light mb-2">
          Catégorie
        </label>
        <Select
          options={categoryOptions}
          value={formData.category}
          onChange={handleChange}
          placeholder="Sélectionnez une catégorie"
          className={`w-full h-[42px] rounded-xl bg-white border ${formErrors.category ? 'border-red-500' : 'border-[#D8D8D8]'} px-4 text-[13px]`}
        />
        {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
      </div>

      <div className="mt-4">
       <div className='flex-1 flex items-center justify-between'>
        <span>Disponible</span>
        <Toggle 
          checked={formData.available || false} 
          onChange={(checked) => handleToggleChange('available', checked)}
        />
        </div>

        <div>
          <label className="block text-sm text-[#595959] font-light mb-2">
            Photo du supplément
          </label>
          <div 
            className="w-[192px] h-[166px] border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => document.getElementById('supplement-image-upload')?.click()}
          >
            {imagePreview ? (
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image 
                  src={imagePreview.startsWith('data:') 
                    ? imagePreview // Si c'est un fichier local (data URL)
                    : imagePreview.startsWith('http') || imagePreview.startsWith('/') 
                      ? imagePreview // Si c'est une URL complète ou un chemin absolu
                      : `https://chicken.turbodeliveryapp.com/${imagePreview}`}  
                  alt="Aperçu du supplément"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                <p className="text-[11px] text-gray-500 text-center px-2">
                  Télécharger une image ici
                </p>
              </>
            )}
            <input 
              type="file" 
              id="supplement-image-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button
          type="button"
          onClick={onCancel}
          className="h-[32px] text-[#9796A1] px-12 rounded-[10px] bg-[#ECECEC] text-[13px] items-center justify-center hover:bg-gray-100 min-w-[160px]"
        >
          Annuler
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
          className="h-[32px] px-12 rounded-[10px] bg-[#F17922] hover:bg-[#F17922]/90 text-white text-[13px] min-w-[160px] lg:min-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Enregistrement...' : 'Mettre à jour'}
        </Button>
      </div>
    </form>
  )
}
