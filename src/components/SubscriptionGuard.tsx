
import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SubscriptionModal } from './SubscriptionModal';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier?: 'CORE' | 'PRO';
  fallback?: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  requiredTier = 'CORE',
  fallback 
}) => {
  const { isSubscribed, subscriptionTier, loading } = useSubscription();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAccess = () => {
    if (!isSubscribed) return false;
    
    if (requiredTier === 'CORE') {
      return subscriptionTier === 'CORE' || subscriptionTier === 'PRO';
    }
    
    if (requiredTier === 'PRO') {
      return subscriptionTier === 'PRO';
    }
    
    return false;
  };

  if (!hasAccess()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Lock className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Subscription Required
        </h3>
        <p className="text-gray-600 mb-4">
          This feature requires a {requiredTier} subscription to access.
        </p>
        <Button 
          onClick={() => setShowSubscriptionModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          View Plans
        </Button>
        
        <SubscriptionModal 
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </div>
    );
  }

  return <>{children}</>;
};
