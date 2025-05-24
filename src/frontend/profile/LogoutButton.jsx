/**
 * @file LogoutButton.jsx
 * @description A React component that provides a button for users to log out of the application.
 */

/**
 * @function LogoutButton
 * @description A React functional component that renders a "Logout" button.
 * When clicked, it sends a POST request to the '/api/logout' endpoint to terminate the user's session.
 * On successful logout, it redirects the user to the '/login' page.
 *
 * @returns {JSX.Element} The rendered LogoutButton component.
 */
function LogoutButton() {
  /**
   * Handles the logout process when the button is clicked.
   * Makes an asynchronous POST request to the logout API endpoint.
   * If successful, it redirects the user to the login page by changing `window.location.href`.
   * If an error occurs, it shows an alert and logs the error to the console.
   * @async
   */
  const handleLogout = async () => {
    try {
      // Send a POST request to the backend logout endpoint.
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Specify content type, though body is not sent for logout.
        credentials: 'include' // Important: Sends cookies (like session cookies) with the request.
      });

      // Parse the JSON response from the server.
      const data = await response.json();

      // Check if the logout was successful based on the 'success' field in the response.
      if (data.success) {
        // Redirect the user to the login page by directly manipulating the browser's location.
        // This causes a full page reload. For SPA navigation without reload,
        // `useNavigate` from `react-router-dom` and `useAuth` context's logout method would be preferred.
        window.location.href = '/login';
      } else {
        // If the server indicates logout was not successful (though usually logout should succeed or error out).
        // This block might be for specific error messages from the backend.
        // alert(data.message || 'Logout failed. Please try again.'); // Optionally show server message
      }
    } catch (error) {
      // Handle network errors or other issues with the fetch request.
      alert('An error occurred during logout.'); // Show a generic error alert to the user.
      console.error(error); // Log the detailed error to the console.
    }
  };

  // Render the logout button.
  return (
    // Container div for centering the button (optional, depends on where it's used).
    <div className="flex items-center justify-center">
      {/* The logout button element. */}
      <button
        onClick={handleLogout} // Call `handleLogout` function when the button is clicked.
        // Styling for the button using Tailwind CSS classes.
        // Includes padding, background color, hover effects, text styling, rounded corners, shadow, and transition.
        className="px-4 py-2 bg-blue-500 hover:bg-amber-400 hover:text-black text-white font-semibold rounded-md shadow-sm transition-colors duration-200"
      >
        Logout
      </button>
    </div>
  );
}

// Export the LogoutButton component as the default export of this module.
export default LogoutButton;