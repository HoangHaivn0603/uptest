import { useEffect, useState } from 'react';
import { loadStoredSession, loginUser, logoutUser, persistSession, registerUser } from '../utils/auth';

/**
 * Authentication hook with session/token persistence.
 */
export function useAuth() {
  const [session, setSession] = useState(() => loadStoredSession());
  const [isLoading, setIsLoading] = useState(false);

  const user = session?.user || null;
  const accessToken = session?.accessToken || null;

  useEffect(() => {
    persistSession(session);
  }, [session]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await loginUser(email, password);
      if (!result.success) {
        return { success: false, message: result.message || 'Email hoặc mật khẩu không chính xác.' };
      }
      setSession(result.session);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, name, phone, password) => {
    setIsLoading(true);
    try {
      const result = await registerUser(email, name, phone, password);
      if (!result.success) {
        return { success: false, message: result.message || 'Đăng ký thất bại.' };
      }
      setSession(result.session);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser(session);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    session,
    user,
    accessToken,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };
}
