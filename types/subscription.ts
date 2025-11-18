
import { Package } from "./package";
import { UserDetail } from "./user";

export interface SubscriptionResponse {
  id: string;
  paymentMethod: string | null;
  transactionID: string | null;
  totalPrice: number;
  status: string;
  paidAt: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  packageId: string;
  package: Package;
  userId: string;
  user: UserDetail;
}

export interface CreateSubscriptionPayload {
  packageId: string;
  userId: string;
  returnUrl: string;
  cancelUrl: string;
}



