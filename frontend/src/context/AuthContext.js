import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../api/apiService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: useEffectが実行されました。token:", token);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("AuthContext: トークンをデコードしました:", decoded);
        if (decoded.exp * 1000 > Date.now()) {
           apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
           // ★★★ トークンからユーザー名も復元 ★★★
           setUser({ id: decoded.sub, username: decoded.username });
           console.log("AuthContext: ユーザー情報を復元しました:", { id: decoded.sub, username: decoded.username });
        } else {
            console.log("AuthContext: トークンが期限切れです。");
            handleLogout();
        }
      } catch (error) {
        console.error("AuthContext: トークンのデコードに失敗しました。", error);
        handleLogout();
      }
    }
    setLoading(false);
  }, [token]);

  const handleLogin = (newToken, userData) => {
    console.log("AuthContext: handleLoginが呼び出されました。");
    console.log("AuthContext: 受け取ったトークン:", newToken);
    console.log("AuthContext: 受け取ったユーザーデータ:", userData);
    localStorage.setItem('token', newToken);
    setUser(userData);
    setToken(newToken); // このstate更新がuseEffectをトリガーする
    apiService.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const handleLogout = () => {
    console.log("AuthContext: handleLogoutが呼び出されました。");
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete apiService.defaults.headers.common['Authorization'];
  };

  const auth = { user, token, loading, login: handleLogin, logout: handleLogout };

  return (
    <AuthContext.Provider value={auth}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
