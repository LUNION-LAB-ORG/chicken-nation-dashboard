"use client";

import React, { useEffect, useState } from "react";
import PersonnelHeader from "./PersonnelHeader";
import AddMember from './AddMember'
import EditMember from './EditMember'
import MemberView from './MemberView'
import PersonnelTabs from './PersonnelTabs'
import { getAllUsers, User } from '@/services/userService';
import toast from 'react-hot-toast';

export default function Personnel() {
  const [openAdd, setOpenAdd] = useState(false)
  const [selectedTab, setSelectedTab] = useState('Tous')
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tabs = ['Tous', 'Chicken Nation Angré', 'Chicken Nation Zone 4']
  // Ajout d'un état pour forcer le rechargement des données
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // État pour le membre sélectionné pour l'édition
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  // Fonction pour déclencher un rechargement des données
  const refreshUsers = () => {
    setRefreshTrigger(Date.now());
  };

  useEffect(() => {
    setLoading(true);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    getAllUsers()
      .then((users) => {
        // Transforme chaque user pour garantir la structure attendue partout
        const mapped = users.map((u) => ({
          id: u.id,
          fullname: u.fullname || u.name || '', // Garder fullname pour la compatibilité avec User
          name: u.fullname || u.name || '', // Garder name pour la compatibilité avec Member
          email: u.email,
          role: u.role,
          type: u.type || '',
          image: u.image
            ? u.image.startsWith('http')
              ? u.image
              : `${API_BASE_URL}/${u.image}`
            : '', // image toujours complète ou vide
          restaurant: u.restaurant,
          phone: u.phone || '',
          address: u.address || ''
        }));
        
        setUsers(mapped as User[]);
      })
      .catch((err) => {
        setError('Erreur lors du chargement des membres');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]); // Ajout de refreshTrigger comme dépendance pour recharger les données

  // Transformation pour l'affichage (adapter selon tes besoins UI)
  const members = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    image: u.image,
    restaurant: u.restaurant,
    phone: u.phone,
    address: u.address
  }));

  // Filtrer les membres en fonction de l'onglet sélectionné
  const filteredMembers = selectedTab === 'Tous' 
    ? users.map(u => ({
        id: u.id,
        name: u.name || u.fullname || '', // Garantir que name n'est jamais undefined
        email: u.email,
        role: u.role,
        image: u.image,
        restaurant: u.restaurant,
        phone: u.phone,
        address: u.address
      }))
    : users.filter(m => m.role === 'SuperAdmin' || m.restaurant === selectedTab)
        .map(u => ({
          id: u.id,
          name: u.name || u.fullname || '', // Garantir que name n'est jamais undefined
          email: u.email,
          role: u.role,
          image: u.image,
          restaurant: u.restaurant,
          phone: u.phone,
          address: u.address
        }))

  return (
    <div className="flex flex-col h-full w-full">
        <PersonnelHeader onAddPersonnel={() => setOpenAdd(true)} />
      <div className="flex-1 overflow-y-auto ">
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-2  ">
          <PersonnelTabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
          {loading ? (
            <div className="p-4 text-center text-gray-500">Chargement...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <MemberView 
              members={filteredMembers} 
              onRefresh={refreshUsers}
              onEdit={(member) => {
             
                const userMember: User = {
                  id: member.id,
                  fullname: member.name,
                  email: member.email,
                  role: member.role,
                  type: '',
                  image: member.image,
                  restaurant: member.restaurant,
                  phone: member.phone || '',
                  address: member.address || ''
                };
                setSelectedMember(userMember);
                setOpenAdd(true);
              }}
            />
          )}
        </div>
      </div>
      {openAdd && (
        selectedMember ? (
          <EditMember
            existingMember={selectedMember}
            onCancel={() => {
              setOpenAdd(false);
              setSelectedMember(null);
            }}
            onSuccess={(updatedMember) => {
              
              setUsers(prevUsers => 
                prevUsers.map(user => 
                  user.id === updatedMember.id ? {...user, ...updatedMember} : user
                )
              );
              
           
              setOpenAdd(false);
              setSelectedMember(null);
              refreshUsers();  
            }}
          />
        ) : (
          <AddMember 
            onCancel={() => setOpenAdd(false)}
            onSuccess={() => {
              setOpenAdd(false);
              refreshUsers(); 
            }}
          />
        )
      )}
    </div>
  );
}
