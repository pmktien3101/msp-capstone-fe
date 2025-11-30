
"use client";

import { useSubscription } from './useSubscription';
import { toast } from 'react-toastify';

interface LimitationCheckOptions {
  limitationType: string;
  itemName?: string; // e.g., "meeting", "project", "member"
}

export const useLimitationCheck = () => {
  const currentSubscription = useSubscription();

  const checkLimitation = (options: LimitationCheckOptions): boolean => {
    const { limitationType, itemName = limitationType.toLowerCase() } = options;

    if (currentSubscription?.package?.limitations) {
      const limitation = currentSubscription.package.limitations.find(
        (lim: any) => lim.limitationType === limitationType
      );

      if (limitation) {
        const { limitValue, usedValue, limitUnit } = limitation;

        // Check if limit reached
        if ((usedValue ?? 0) >= (limitValue ?? 0)) {
          toast.error(
            <div className="min-w-[420px] max-w-[520px] text-left">
              <p>Your current subscription has reached the <b>{itemName}</b> creation limit.</p>

              <p className="mt-2">
                Used: <b>{usedValue ?? 0} / {limitValue ?? 0}</b> {limitUnit || itemName + "s"}
              </p>

              <p className="mt-2">
                Please contact your Business Owner to upgrade the subscription plan.
              </p>
            </div>,
            {
              autoClose: 5000,
              // position: "top-center",
            }
         );  

          return false; // Limit reached, cannot create
        }
      }
    }

    return true; // No limit or limit not reached, can create
  };

  return { checkLimitation };
};

// Convenience hooks for specific limitation types
export const useMeetingLimitationCheck = () => {
  const { checkLimitation } = useLimitationCheck();
  const checkMeetingLimitation = (): boolean => 
    checkLimitation({ limitationType: 'NumberMeeting', itemName: 'meeting' });
  return { checkMeetingLimitation };
};

export const useProjectLimitationCheck = () => {
  const { checkLimitation } = useLimitationCheck();
  const checkProjectLimitation = (): boolean => 
    checkLimitation({ limitationType: 'NumberProject', itemName: 'project' });
  return { checkProjectLimitation };
};

export const useMemberLimitationCheck = () => {
  const { checkLimitation } = useLimitationCheck();
  const checkMemberLimitation = (): boolean => 
    checkLimitation({ limitationType: 'NumberMemberInOrganization', itemName: 'member' });
  return { checkMemberLimitation };
};

// Generic hook for checking member count limitations (for selecting members)
export const useMemberCountLimitationCheck = () => {
  const currentSubscription = useSubscription();

  const checkMemberCountLimitation = (
    limitationType: string,
    selectedCount: number,
    itemName: string = 'member'
  ): boolean => {
    if (currentSubscription?.package?.limitations) {
      const limitation = currentSubscription.package.limitations.find(
        (lim: any) => lim.limitationType === limitationType
      );

      if (limitation) {
        const { limitValue, limitUnit } = limitation;
        const maxAllowed = limitValue ?? 0;

        // Check if selected count exceeds limit
        if (selectedCount > maxAllowed) {
          toast.error(
            <div>
              <p>Cannot select {selectedCount} {itemName}.</p>
              <p>Your current plan allows a maximum of {maxAllowed} {limitUnit || itemName + "s"}.</p>
              <p>Please contact your Business Owner to upgrade the subscription plan.</p>
            </div>,
            {
              autoClose: 5000,
              // position: "top-center",
            }
          );
          return false; // Exceeded limit
        }
      }
    }

    return true; // Within limit or no limit
  };

  return { checkMemberCountLimitation };
};

// Convenience hook for checking members in meeting
export const useMemberInMeetingLimitationCheck = () => {
  const { checkMemberCountLimitation } = useMemberCountLimitationCheck();
  const checkMemberInMeetingLimit = (selectedCount: number): boolean =>
    checkMemberCountLimitation('NumberMemberInMeeting', selectedCount, 'thành viên');
  return { checkMemberInMeetingLimit };
};

// Convenience hook for checking members in project
export const useMemberInProjectLimitationCheck = () => {
  const { checkMemberCountLimitation } = useMemberCountLimitationCheck();
  const checkMemberInProjectLimit = (selectedCount: number): boolean =>
    checkMemberCountLimitation('NumberMemberInProject', selectedCount, 'thành viên');
  return { checkMemberInProjectLimit };
};
