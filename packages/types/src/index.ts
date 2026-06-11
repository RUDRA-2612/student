export type Role = 'STUDENT' | 'ADMIN' | 'SUPERADMIN';

export interface UserSession {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: Role;
}
