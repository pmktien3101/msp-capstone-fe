"use client";

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: string;
  rememberMe?: boolean;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleLoginButton = ({ 
  onSuccess, 
  onError, 
  text = "Sign in with Google",
  rememberMe = false 
}: GoogleLoginButtonProps) => {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { googleLogin } = useUser();

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          locale: 'en', // Force English language
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with', // Force "Sign in with Google" text
            shape: 'rectangular',
            logo_alignment: 'left',
            locale: 'en', // Force English
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      const errorMsg = 'No credential received from Google';
      console.error(errorMsg);
      toast.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    try {
      console.log('✅ Received Google credential');
      console.log('📤 Calling useUser.googleLogin...');
      console.log('🔑 Token preview:', response.credential.substring(0, 50) + '...');
      
      // Use useUser.googleLogin instead of authService directly
      // This ensures Zustand store is updated with user data
      const result = await googleLogin(response.credential, rememberMe);

      if (result.success) {
        console.log('✅ Google login successful! User data saved to store.');
        toast.success(result.message || 'Login successful!');
        onSuccess?.();
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        console.error('❌ Google login failed:', result.error);
        toast.error(result.error || 'Google login failed');
        onError?.(result.error || 'Google login failed');
      }
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      const errorMsg = error.message || 'An error occurred during Google login';
      toast.error(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div ref={googleButtonRef} style={{ opacity: isLoading ? 0.5 : 1 }} />
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#666',
          fontSize: '14px',
          fontWeight: 500
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Signing in...
        </div>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
