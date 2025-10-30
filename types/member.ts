export interface Member {
  id: string;
  pmId?: string; // Project-Member ID for removal
  name: string;
  role: string;
  avatar: string;
  email: string;
}
export interface Participant {
  id: string;
  role: string;
  image: string;
  email: string;
  name: string;
}
