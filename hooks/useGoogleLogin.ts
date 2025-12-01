import { useState } from 'react';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export const useGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async (idToken: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const result = await authService.googleLogin(idToken, rememberMe);

      if (result.success) {
        toast.success(result.message || 'Login successful!');
        router.push('/dashboard');
        return { success: true };
      } else {
        toast.error(result.error || 'Google login failed');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMsg = error.message || 'An error occurred during Google login';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    isLoading
  };
};
