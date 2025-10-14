import React, { createContext, useEffect, useState, useCallback } from 'react'
import axiosInstance from '../Utils/axiosInstance';
import { API_PATH } from '../Utils/apiPath';

export const UserContext = createContext({
    user: null,
    updateUser: () => {},
    clearUser: () => {},
    loading: true
});

const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use useCallback to memoize clearUser so it doesn't change on every render
    const clearUser = useCallback(() => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        delete axiosInstance.defaults.headers.common['Authorization'];
    }, []);

    // Use useCallback to memoize updateUser
    const updateUser = useCallback((userData) => {
        setUser(userData);
        if (userData.token) {
            // Token should already be stored in login, but ensure it's set
            if (!localStorage.getItem('token') && !sessionStorage.getItem('token')) {
                localStorage.setItem('token', userData.token);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            // Check both localStorage and sessionStorage
            const accessToken = localStorage.getItem("token") || sessionStorage.getItem("token");
        
            if(!accessToken){
                setLoading(false);
                return;
            }

            try {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
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
    }, [clearUser]); // Only depends on clearUser now, which is memoized
    
    return (
        <UserContext.Provider value={{user, updateUser, clearUser, loading}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider