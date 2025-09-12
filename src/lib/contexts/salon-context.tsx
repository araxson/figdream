'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Salon {
  id: string;
  name: string;
  slug: string;
}

interface SalonContextType {
  currentSalon: Salon | null;
  salons: Salon[];
  isAdmin: boolean;
  isLoading: boolean;
  selectSalon: (salonId: string) => void;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export function SalonProvider({ children }: { children: ReactNode }) {
  const [currentSalon, setCurrentSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserSalonData();
  }, []);

  const loadUserSalonData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get user role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role, salon_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole) {
        setIsLoading(false);
        return;
      }

      const isAdminUser = userRole.role === 'admin';
      setIsAdmin(isAdminUser);

      if (isAdminUser) {
        // Admin: Load all salons
        const { data: allSalons } = await supabase
          .from('salons')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('name');

        if (allSalons && allSalons.length > 0) {
          setSalons(allSalons);
          
          // Check if there's a saved preference
          const savedSalonId = localStorage.getItem('admin_selected_salon');
          const savedSalon = allSalons.find(s => s.id === savedSalonId);
          
          if (savedSalon) {
            setCurrentSalon(savedSalon);
          } else {
            // Default to first salon
            setCurrentSalon(allSalons[0]);
            localStorage.setItem('admin_selected_salon', allSalons[0].id);
          }
        }
      } else if (userRole.salon_id) {
        // Owner/Staff: Load their salon
        const { data: salon } = await supabase
          .from('salons')
          .select('id, name, slug')
          .eq('id', userRole.salon_id)
          .single();

        if (salon) {
          setCurrentSalon(salon);
          setSalons([salon]);
        }
      }
    } catch (error) {
      console.error('Error loading salon data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSalon = (salonId: string) => {
    if (!isAdmin) return;
    
    const salon = salons.find(s => s.id === salonId);
    if (salon) {
      setCurrentSalon(salon);
      localStorage.setItem('admin_selected_salon', salonId);
      // Refresh the current page with new salon context
      router.refresh();
    }
  };

  return (
    <SalonContext.Provider value={{
      currentSalon,
      salons,
      isAdmin,
      isLoading,
      selectSalon
    }}>
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const context = useContext(SalonContext);
  if (context === undefined) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
}