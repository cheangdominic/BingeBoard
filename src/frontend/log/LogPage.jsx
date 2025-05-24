/**
 * @file LogPage.jsx
 * @description A React component that serves as the main page for logging watched shows.
 * This page is protected and requires user authentication. If the user is not logged in,
 * they are redirected to the login page. It primarily renders a `ShowGrid` component for
 * users to interact with and log shows, along with a `BottomNavbar` for navigation.
 */

// Import the BottomNavbar component for consistent navigation.
import BottomNavbar from "../../components/BottomNavbar.jsx";
// Import the ShowGrid component, which is the main content for this page, allowing users to log shows.
import ShowGrid from "./ShowGrid.jsx";
// Import useEffect hook from React for side effects, such as checking authentication status.
import { useEffect } from 'react';
// Import useNavigate hook from react-router-dom for programmatic navigation (e.g., redirecting).
import { useNavigate } from 'react-router-dom';
// Import useAuth custom hook to access authentication context (user state and loading status).
import { useAuth } from "../../context/AuthContext";
// Import LoadingSpinner component to display while authentication status is being determined.
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

/**
 * @function LogPage
 * @description A React functional component that renders the page for logging TV shows.
 * It ensures that only authenticated users can access this page.
 * While the authentication status is loading, it displays a loading spinner.
 * If the user is authenticated, it shows the `ShowGrid` for logging and the `BottomNavbar`.
 *
 * @returns {JSX.Element | null} The rendered LogPage component, a loading spinner, or null if redirecting.
 */
function LogPage() {
    /**
     * `user`: The authenticated user object from the AuthContext. Null if not authenticated.
     * `loading`: Boolean indicating if the authentication status is currently being loaded.
     * @type {{user: object|null, loading: boolean}}
     */
    const { user, loading } = useAuth();
    /**
     * `navigate`: Function from `react-router-dom` used for programmatic navigation.
     * @type {function}
     */
    const navigate = useNavigate();

    /**
     * `useEffect` hook to handle redirection for unauthenticated users.
     * If the authentication check is complete (`!loading`) and no user is authenticated (`!user`),
     * it navigates the user to the '/login' page.
     * This effect runs when `user`, `loading`, or `navigate` changes.
     */
    useEffect(() => {
        if (!loading && !user) { // If authentication check is done and user is not logged in
            navigate('/login');   // Redirect to the login page
        }
    }, [user, loading, navigate]); // Dependencies for the effect

    /**
     * If the authentication status is still loading, render the `LoadingSpinner` component.
     * This provides visual feedback to the user that something is happening.
     */
    if (loading) {
        return <LoadingSpinner />;
    }

    /**
     * If there's no authenticated user (after loading is complete), return null.
     * This prevents rendering the page content briefly before the `useEffect` hook redirects.
     * The redirection is handled by the `useEffect` above.
     */
    if (!user) {
        return null;
    }

    // If the user is authenticated and loading is complete, render the main content of the LogPage.
    return (
        <>
            {/* Render the ShowGrid component, which likely allows users to search for and log shows. */}
            <ShowGrid />
            {/* Render the BottomNavbar component for application navigation. */}
            <BottomNavbar />
        </>
    );
}

// Export the LogPage component as the default export of this module.
export default LogPage;