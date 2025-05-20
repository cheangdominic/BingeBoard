import BottomNavbar from "../../components/BottomNavbar.jsx";
import ShowGrid from "./ShowGrid.jsx";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

function LogPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    return (
        <>
            <ShowGrid />
            <BottomNavbar />
        </>
    );
}

export default LogPage;