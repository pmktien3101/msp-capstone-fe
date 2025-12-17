export interface Member {
  id: string;
  pmId?: string; // Project-Member ID for removal
  name: string;
  role: string;
  avatar: string;
  email: string;
  avatarUrl?: string | null;
  leftAt?: string | null; // Track if member has left the project
}
export interface Participant {
  id: string;
  role: string;
  image: string;
  email: string;
  name: string;
}
