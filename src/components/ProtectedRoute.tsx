
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to MedNexusOS</h1>
          <p className="text-gray-600 mb-6">
            Your AI-powered oral exam study companion. Sign in to start practicing and improving your oral exam skills.
          </p>
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Get Started
          </Button>
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
