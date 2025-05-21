import BottomNavbar from "../../components/BottomNavbar.jsx";
import ShowGrid from "./ShowGrid.jsx";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

function LogPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <ShowGrid />
            <BottomNavbar />
        </>
    );
}

export default LogPage;
