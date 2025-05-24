/**
 * @file AuthContext.jsx
 * @description This file defines an authentication context and provider for managing user authentication state
 * across a React application. It includes functions for login, logout, and fetching user data.
 */

// Import React hooks: createContext for creating context, useContext for consuming context,
// useEffect for side effects, and useState for managing state.
import { createContext, useContext, useEffect, useState } from 'react';
// Import axios for making HTTP requests to the backend API.
import axios from 'axios';

/**
 * Authentication Context.
 * This context will hold the authentication state (user, loading status) and
 * authentication methods (login, logout, refreshUser).
 * @type {React.Context<object|null>}
 */
const AuthContext = createContext();

/**
 * AuthProvider component.
 * This component wraps parts of the application that need access to authentication state and methods.
 * It manages the user's authentication status, provides login/logout functionalities,
 * and fetches user data on initial load.
 *
 * @param {object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The child components that will have access to this context.
 * @returns {JSX.Element} The AuthContext.Provider wrapping the children components.
 */
export const AuthProvider = ({ children }) => {
  /**
   * State for the currently authenticated user object.
   * `null` if no user is authenticated.
   * @type {[object|null, function(object|null): void]}
   */
  const [user, setUser] = useState(null);
  /**
   * State to indicate if the initial user authentication check is in progress.
   * `true` while fetching, `false` otherwise.
   * @type {[boolean, function(boolean): void]}
   */
  const [loading, setLoading] = useState(true);

  /**
   * Logs in a user with the provided email and password.
   * Makes a POST request to the '/api/login' endpoint.
   * If login is successful, it fetches the user data to update the context.
   *
   * @async
   * @function login
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<object>} A promise that resolves with the API response data from the login attempt.
   * @throws {Error|object} Throws an error object (from API or a generic error) if the login fails.
   */
  const login = async (email, password) => {
    try {
      // Attempt to log in by sending credentials to the backend.
      const response = await axios.post('/api/login', { email, password });
      if (response.data.success) {
        // If login is successful, fetch the user's data to update the context.
        await fetchUser();
      }
      return response.data; // Return the response data from the API.
    } catch (error) {
      // If an error occurs, throw the error data from the response or the error itself.
      throw error.response?.data || error;
    }
  };

  /**
   * Logs out the current user.
   * Makes a POST request to the '/api/logout' endpoint.
   * On successful logout, sets the user state to `null`.
   *
   * @async
   * @function logout
   * @returns {Promise<void>} A promise that resolves when the logout process is complete.
   */
  const logout = async () => {
    try {
      // Send a request to the backend to invalidate the session.
      await axios.post('/api/logout');
      // Clear the user state in the context.
      setUser(null);
    } catch (error) {
      // Log any errors that occur during the logout process.
      console.error('Logout error:', error);
    }
  };

  /**
   * Fetches the current authenticated user's data from the '/api/user' endpoint.
   * Updates the `user` state with the fetched data or sets it to `null` if fetching fails.
   * Sets the `loading` state to `false` after the attempt.
   *
   * @async
   * @function fetchUser
   * @returns {Promise<void>} A promise that resolves when the user data fetch attempt is complete.
   */
  const fetchUser = async () => {
    try {
      // Request user data from the backend (expects the server to use session/cookie for auth).
      const { data } = await axios.get('/api/user');
      // Set the user state with the data received.
      setUser(data);
    } catch (error) {
      // If fetching user data fails (e.g., not authenticated, network error), set user to null.
      setUser(null);
    } finally {
      // Regardless of success or failure, set loading to false as the initial check is complete.
      setLoading(false);
    }
  };

  /**
   * `useEffect` hook to fetch user data when the `AuthProvider` component mounts.
   * This attempts to restore a user session if one exists.
   * The empty dependency array `[]` ensures this effect runs only once after the initial render.
   */
  useEffect(() => {
    fetchUser();
  }, []); // Empty dependency array: run only on mount.

  // Provide the authentication state and methods to child components via AuthContext.Provider.
  return (
    <AuthContext.Provider
      value={{
        user,        // The current user object or null.
        loading,     // Boolean indicating if initial auth check is loading.
        login,       // Function to log in a user.
        logout,      // Function to log out a user.
        refreshUser: fetchUser // Function to manually re-fetch user data.
      }}
    >
      {children} {/* Render the child components wrapped by the provider. */}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook `useAuth` to easily consume the `AuthContext`.
 * This hook provides a convenient way for components to access the authentication
 * state (user, loading) and methods (login, logout, refreshUser).
 *
 * @returns {object} The authentication context value, including `user`, `loading`,
 *                   `login`, `logout`, and `refreshUser`.
 * @throws {Error} If used outside of an `AuthProvider`.
 */
export const useAuth = () => useContext(AuthContext);