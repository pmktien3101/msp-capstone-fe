import { Limitation, LimitationUsage } from "./limitation";

export interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingCycle: number;
  isDeleted: boolean;
  limitations: LimitationUsage[] | null;
}