import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chicken.turbodeliveryapp.com';

interface Client {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string;
  addresses?: any[];
  image?: string | null;
  created_at: string;
  updated_at: string;
  entity_status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'NEW';
  birth_day?: string | null;
  orderHistory?: Array<{
    id: string;
    date: string;
    total: number;
    paymentMethod: string;
    status: string;
  }>;
  [key: string]: any;
}

interface IdentificationTabProps {
  client: Client;
  fullName: string;
  formatDate: (date: string) => string;
}

export function IdentificationTab({ client, fullName, formatDate }: IdentificationTabProps) {
  const [firstName, setFirstName] = useState(client.first_name || '')
  const [lastName, setLastName] = useState(client.last_name || '')
  const [displayName, setDisplayName] = useState(fullName)
  const [previewImage, setPreviewImage] = useState<string | null>(client.image || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    setDisplayName(`${firstName} ${lastName}`)
  }, [firstName, lastName])

  const handleSave = () => {
 
  }

 
  const handleNameChange = (value: string) => {
    setDisplayName(value)
    
    // Séparer le nom complet en prénom et nom
    const nameParts = value.trim().split(' ')
    if (nameParts.length > 0) {
      // Le premier élément est le prénom
      setFirstName(nameParts[0])
      
      // Le reste est le nom de famille
      if (nameParts.length > 1) {
        setLastName(nameParts.slice(1).join(' '))
      } else {
        setLastName('')
      }
    }
  }

  const handlePhotoClick = () => {
    // Déclencher le clic sur l'input file caché
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      
      // Simuler un chargement
      setTimeout(() => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewImage(reader.result as string)
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      }, 800) 
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="space-y-4 w-full lg:w-1/3">
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-light text-[#9796A1]">Nom et prénom</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="p-2 px-3 border-2 border-[#3C3C434A] rounded-2xl text-sm focus:border-orange-500 focus:outline-none"
            onBlur={handleSave}
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-light text-[#9796A1]">Date d&apos;inscription</label>
          <input
            type="text"
            value={formatDate(client.created_at)}
            readOnly
            className="p-2 px-3 border-2 border-[#3C3C434A] rounded-2xl text-sm"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-light text-[#9796A1]">Connecté sur l&apos;application</label>
          <div className="mt-1">
            <span className={`inline-block px-3 py-1.5 text-xs font-light rounded-xl ${
              client.entity_status === 'ACTIVE' 
                ? 'bg-[#4FCBBA] text-white' 
                : client.entity_status === 'NEW'
                ? 'bg-[#FBD2B5] text-slate-700'
                : client.entity_status === 'BLOCKED'
                ? 'bg-red-100 text-red-800'
                : client.entity_status === 'INACTIVE'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {client.entity_status === 'ACTIVE' ? 'Connecté' : 
               client.entity_status === 'NEW' ? 'Nouveau' :
               client.entity_status === 'BLOCKED' ? 'Bloqué' :
               client.entity_status === 'INACTIVE' ? 'Inactif' :
               client.entity_status}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-light text-[#9796A1]">Image de profil</label>
          <div className="w-60 h-30 bg-[#F4F4F4] rounded-xl flex flex-col items-center justify-center mt-1 overflow-hidden">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-[#F17922] border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-xs text-gray-500">Chargement...</span>
              </div>
            ) : previewImage ? (
              <div className="relative w-full h-full">
                <Image 
                  src={previewImage.startsWith('http') || previewImage.startsWith('/') ? previewImage : `${API_URL}/${previewImage}`} 
                  alt="Photo de profil" 
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                <div className="absolute inset-0 flex items-end justify-start p-2 gap-2 bg-opacity-0 hover:bg-opacity-0 pointer-events-none">
                  <button 
                    onClick={handlePhotoClick}
                    className="bg-[#D9D9D9] cursor-pointer text-gray-800 text-xs font-medium py-1 px-3 rounded-md pointer-events-auto"
                  >
                    Changer la photo
                  </button>
                  {/* Place ici les boutons corbeille/édition si existants */}
                  {/* <button className="...">Corbeille</button> */}
                  {/* <button className="...">Édition</button> */}
                </div>
              </div>
            ) : (
              <div className="flex flex-row gap-2 w-full items-center justify-start p-2">
                <button 
                  onClick={handlePhotoClick}
                  className="bg-[#D9D9D9] cursor-pointer text-gray-800 text-xs font-medium py-1 px-3 rounded-md"
                >
                  Ajouter une photo
                </button>
                {/* Place ici les boutons corbeille/édition si existants */}
                {/* <button className="...">Corbeille</button> */}
                {/* <button className="...">Édition</button> */}
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block w-2/3"></div>
    </div>
  )
}
