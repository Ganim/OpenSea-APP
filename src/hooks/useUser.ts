/**
 * useUser Hook
 * Hook para gerenciar dados do usuário autenticado
 */

import type { User } from '@/types/';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export function useUser(): UseUserReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 300));

        const mockUser: User = {
          id: '1',
          username: 'joaosilva',
          email: 'joao@example.com',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          isSuperAdmin: false,
        };

        setUser(mockUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/fast-login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const logout = useCallback(async () => {
    try {
      // TODO: Call logout API
      await new Promise(resolve => setTimeout(resolve, 300));

      setUser(null);
      router.push('/fast-login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }, [router]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      // TODO: Call update API
      await new Promise(resolve => setTimeout(resolve, 300));

      setUser(prev => (prev ? { ...prev, ...data } : null));
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, []);

  return {
    user,
    isLoading,
    logout,
    updateUser,
  };
}
