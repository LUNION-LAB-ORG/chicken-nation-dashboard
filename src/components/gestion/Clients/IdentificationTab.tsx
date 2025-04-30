import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Client {
  createdAt: string
  isConnected: boolean
  firstName: string
  lastName: string
  profilePicture?: string
}

interface IdentificationTabProps {
  client: Client
  fullName: string
  formatDate: (date: string) => string
}

export function IdentificationTab({ client, fullName, formatDate }: IdentificationTabProps) {
  const [firstName, setFirstName] = useState(client.firstName)
  const [lastName, setLastName] = useState(client.lastName)
  const [displayName, setDisplayName] = useState(fullName)
  const [previewImage, setPreviewImage] = useState<string | null>(client.profilePicture || null)
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
            value={formatDate(client.createdAt)}
            readOnly
            className="p-2 px-3 border-2 border-[#3C3C434A] rounded-2xl text-sm"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-light text-[#9796A1]">Connecté sur l&apos;application</label>
          <div className="mt-1">
            <span className={`inline-block px-3 py-1.5 text-xs font-light rounded-xl ${
              client.isConnected 
                ? 'bg-[#4FCBBA] text-white' 
                : 'bg-[#FBD2B5] text-slate-700'
            }`}>
              {client.isConnected ? 'Connecté' : 'Pas connecté'}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-light text-[#9796A1]">Image de profil</label>
          <div className="w-60 h-30 bg-[#F4F4F4] rounded-xl flex items-center justify-center mt-1 overflow-hidden">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-[#F17922] border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-xs text-gray-500">Chargement...</span>
              </div>
            ) : previewImage ? (
              <div className="relative w-full h-full">
                <Image 
                  src={previewImage} 
                  alt="Photo de profil" 
                  layout="fill" 
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                  <button 
                    onClick={handlePhotoClick}
                    className="bg-[#D9D9D9] cursor-pointer text-gray-800 text-xs font-medium py-1 px-3 rounded-md"
                  >
                    Changer la photo
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handlePhotoClick}
                className="bg-[#D9D9D9] cursor-pointer text-gray-800 text-xs font-medium py-1 px-3 rounded-md"
              >
                Ajouter une photo
              </button>
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
