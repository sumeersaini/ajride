// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [merchantStatus, setMerchantStatus] = useState(null);
  const [client, setClient] = useState(null); // Optional: role/identity
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      console.log("currentUser",currentUser?.user_metadata?.role)
      setUser(currentUser);
      setAccessToken(session?.access_token ?? null);
      setMerchantStatus(currentUser?.user_metadata?.merchant ?? 0);
      setClient(currentUser?.user_metadata?.role ?? null);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);
      setAccessToken(session?.access_token ?? null);
      setMerchantStatus(currentUser?.user_metadata?.merchant ?? 0);
      setClient(currentUser?.user_metadata?.role ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      accessToken,
      merchantStatus,
      client,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
