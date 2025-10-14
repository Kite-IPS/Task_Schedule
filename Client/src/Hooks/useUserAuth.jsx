import { useContext, useEffect } from "react";
import { UserContext } from "../Context/userContext";
import { useNavigate } from "react-router-dom";

export const useUserAuth = () => {
    const { user, loading, clearUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Wait for loading to complete
        if(loading) return;
        
        // If no user, clear and redirect
        if(!user){
            clearUser();
            navigate('/login', { replace: true });
        }
    }, [user, loading, navigate, clearUser]);
    
    return { user, loading };
}