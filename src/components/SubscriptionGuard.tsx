
import React, { useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier?: 'CORE' | 'PRO';
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  requiredTier = 'CORE'
}) => {
  const { isSubscribed, subscriptionTier, loading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    if (!loading && !hasAccess() && location.pathname !== '/subscription') {
      navigate('/subscription');
    }
  }, [loading, isSubscribed, subscriptionTier, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess()) {
    // Return null since we're redirecting
    return null;
  }

  return <>{children}</>;
};
