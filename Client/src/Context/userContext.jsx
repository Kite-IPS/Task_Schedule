import React, { createContext, useEffect, useState } from 'react'
import axiosInstance from '../Utils/axiosInstance';
import { API_PATH } from '../Utils/apiPath';
export const UserContext = createContext({
  user: null,
  updateUser: () => { },
  clearUser: () => { },
  loading: true
});
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUserProfile = async () => {
      const accessToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${ accessToken }`;
        const response = await axiosInstance.get(API_PATH.AUTH.INFO);
        const userData = {
          ...response.data,
          token: accessToken
        };
        setUser(userData);
      } catch (error) {
        console.log("Unauthorized", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);
  const updateUser = (userData) => {
    setUser(userData);
    setLoading(false);
  }
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
  return (
    <UserContext.Provider value={{ user, updateUser, clearUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}
export default UserProvider