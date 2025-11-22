import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { subscriptionService } from '@/services/subscriptionService';
import { userService } from '@/services/userService';
import { UserRole } from '@/lib/rbac';
import { SubscriptionResponse } from '@/types/subscription';

export const useSubscription = () => {
  const { user, hasRole } = useAuth();


  const [subscription, setSubscription] = useState<SubscriptionResponse | null | undefined>(undefined);

  useEffect(() => {
    const fetchSubscription = async () => {   
      if (!user?.userId) {
        setSubscription(null);
        return;
      }

      try {
        let result;

        // Business Owner
        if (hasRole(UserRole.BUSINESS_OWNER)) {
          result = await subscriptionService.getActiveSubscriptionByUserIdWithUsage(user.userId);
        }

        // Project Manager
        if (hasRole(UserRole.PROJECT_MANAGER)) {
          const userDetail = await userService.getUserDetailById(user.userId);

          const ownerId =
            userDetail.success && userDetail.data?.managedBy
              ? userDetail.data.managedBy
              : user.userId;

          result = await subscriptionService.getActiveSubscriptionByUserIdWithUsage(ownerId);
        }

        // result?.data có thể null → OK
        setSubscription(result?.data ?? null);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(undefined);
      }
    };

    fetchSubscription();
  }, [user?.userId, user?.role]);

  return subscription;
};
