"use client"
import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LoginCredentials } from '@/types/auth';

 
interface LoginFormProps {
 
  onSubmit: (data: LoginCredentials) => void;
 
  isLoading?: boolean;
}

 
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
   
  
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
 
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  /**
   * Valide le formulaire avant soumission
   */
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { email: '', password: '' };
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Champ Email */}
      <div>
        <div className="flex items-center border border-gray-300 rounded-2xl overflow-hidden">
          <div className="pl-3 pr-2 text-gray-800">
            <User size={22} strokeWidth={1.5} />
          </div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="email"
            className="w-full py-3 pr-3 border-0 focus:outline-none focus:ring-0 text-gray-800"
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>
      
      {/* Champ Password */}
      <div>
        <div className="flex items-center border border-gray-300 rounded-2xl overflow-hidden">
          <div className="pl-3 pr-2 text-gray-800">
            <Lock size={22} strokeWidth={1.5} />
          </div>
          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="current-password"
            className="w-full py-3 pr-3 border-0 focus:outline-none focus:ring-0 text-gray-800"
          />
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>
      
      {/* Bouton de connexion */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="w-44 py-3 px-4 bg-[#F17922] text-white font-sofia-medium rounded-2xl transition-all duration-300 hover:bg-[#F17922]/90 focus:outline-none focus:ring-2 focus:ring-[#F17922] focus:ring-opacity-50"
        >
          {isLoading ? "Chargement..." : "Connexion"}
        </button>
      </div>
    </form>
  );
};

export default LoginForm; 