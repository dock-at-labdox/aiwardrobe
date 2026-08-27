export type AdminRole = 'Operator' | 'Engineering Lead' | 'Viewer';

export interface AdminSession {
  role: AdminRole;
}

export async function getSession(): Promise<AdminSession> {
  // Temporary mock. Replace this implementation when backend auth is available.
  return {
    role: 'Viewer',
  };
}
