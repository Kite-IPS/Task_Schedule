import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";

export const useUserAuth = () => {
    const { user, loading, clearUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Don't do anything while loading
        if(loading) return;
        
        // Don't do anything if user is authenticated
        if(user) return;

        // Only clear and redirect if not loading and no user
        if(!loading && !user){
            clearUser();
            navigate('/login', { replace: true });
        }
    }, [user, loading, navigate, clearUser]);

    return { user, loading, isAuthenticated: !!user };
}