export type AdminRole = 'Operator' | 'Engineering Lead' | 'Viewer';

export interface AdminSession {
  role: AdminRole;
}

export async function getSession(): Promise<AdminSession> {
  // Change to 'Viewer' to test the denied-access state.
  return {
    role: 'Engineering Lead',
  };
}
