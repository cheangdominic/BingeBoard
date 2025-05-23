/**
 * @file useAuth.js
 * @description A custom React hook to determine the authentication status of the user.
 * This hook makes an API call to check if the user is authenticated and updates its state accordingly.
 */

// Import useEffect and useState hooks from React
import { useEffect, useState } from "react";

/**
 * Custom React hook `useAuth` for checking user authentication status.
 *
 * On component mount, this hook sends a request to the `/api/check-auth` endpoint
 * to determine if the current user is authenticated. It maintains an internal
 * state `isAuthenticated` which is initially `null`, then updated to `true` or `false`
 * based on the API response.
 *
 * @returns {boolean | null} The authentication status:
 *  - `null` if the authentication check is in progress.
 *  - `true` if the user is authenticated.
 *  - `false` if the user is not authenticated or an error occurred during the check.
 */
function useAuth() {
    /**
     * State variable to store the authentication status.
     * Initialized to `null` to indicate that the authentication check has not yet completed.
     * @type {[boolean | null, function(boolean | null): void]}
     */
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    /**
     * `useEffect` hook to perform the authentication check when the component mounts.
     * The empty dependency array `[]` ensures this effect runs only once after the initial render.
     */
    useEffect(() => {
        /**
         * Asynchronous function to fetch the authentication status from the API.
         * It calls the `/api/check-auth` endpoint and updates the `isAuthenticated` state
         * with the `authenticated` boolean value from the JSON response.
         * @async
         */
        const checkAuth = async () => {
            try {
                // Fetch the authentication status from the backend API endpoint
                const result = await fetch("/api/check-auth");
                // Parse the JSON response from the API
                const data = await result.json();
                // Update the isAuthenticated state based on the 'authenticated' field in the response
                setIsAuthenticated(data.authenticated);
            } catch (error) {
                // If an error occurs during the fetch (e.g., network issue, API down),
                // log the error and set isAuthenticated to false as a fallback.
                console.error("Error checking authentication status:", error);
                setIsAuthenticated(false);
            }
        };

        // Call the checkAuth function to initiate the authentication check
        checkAuth();
    }, []); // Empty dependency array ensures this effect runs only once on mount

    // Return the current authentication status
    return isAuthenticated;
}

// Export the useAuth hook as the default export of this module
export default useAuth;