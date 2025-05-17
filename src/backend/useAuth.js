import { useEffect, useState } from "react";

function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const result = await fetch("/api/check-auth");
            const data = await result.json();
            setIsAuthenticated(data.authenticated);
        };

        checkAuth();
    }, []);

    return isAuthenticated;
}

export default useAuth;