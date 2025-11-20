// Authentication helper functions

export interface User {
  gebruikerId: number;
  gebruikerNaam: string;
  naam: string;
  gebruikerTypeId: number;
  gebruikerType: {
    gebruikerTypeId: number;
    typeNaam: string;
  };
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  const sessionId = localStorage.getItem('sessionId');
  return sessionId ? parseInt(sessionId) : null;
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
  return !!getSession() && !!getUser();
}

export async function logout() {
  const sessionId = getSession();
  
  if (sessionId) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  localStorage.removeItem('sessionId');
  localStorage.removeItem('user');
  
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export function getUserType(): string | null {
  const user = getUser();
  return user?.gebruikerType.typeNaam || null;
}

export function isAdmin(): boolean {
  return getUserType() === 'Admin';
}

export function isBalie(): boolean {
  return getUserType() === 'Balie';
}

export function isStudent(): boolean {
  return getUserType() === 'Student';
}
