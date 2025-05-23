/**
 * @file SignupForm.jsx
 * @description A React component that renders a signup form for new users.
 * It handles form input, validation, submission, and displays error messages.
 */

// Import useState hook from React for managing component state (form data and errors).
import { useState } from "react";
// Import useNavigate hook from react-router-dom for programmatic navigation after successful signup.
import { useNavigate } from "react-router-dom";
// Import the application logo image.
import logo from '../../assets/BingeBoard Icon.svg';

/**
 * @function SignupForm
 * @description A React functional component that provides a user interface for signing up.
 * It includes fields for username, email, password, and password confirmation.
 * It performs client-side validation and submits data to a backend API.
 *
 * @returns {JSX.Element} The rendered SignupForm component.
 */
function SignupForm() {
  // `useNavigate` hook for redirecting the user after successful signup.
  const navigate = useNavigate();

  // State for form data (username, email, password, confirmPassword).
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // State for validation errors for each form field.
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  /**
   * Handles changes in form input fields.
   * Updates the `formData` state with the new value and clears any existing validation error for that field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input field.
   */
  const handleChange = (e) => {
    const { name, value } = e.target; // Destructure field name and value.
    // Update formData state.
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // If there was an error for this field, clear it as the user is typing.
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validates the form data.
   * Checks for required fields, valid email format, password length, and password confirmation matching.
   * Updates the `errors` state with any validation messages.
   * @returns {boolean} `true` if the form is valid, `false` otherwise.
   */
  const validateForm = () => {
    let valid = true; // Assume form is valid initially.
    const newErrors = { username: '', email: '', password: '', confirmPassword: '' }; // Initialize new errors object.

    // Validate username.
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    }

    // Validate email.
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { // Regex for basic email validation.
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    // Validate password.
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) { // Check for minimum password length.
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    // Validate confirm password.
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (formData.password !== formData.confirmPassword) { // Check if passwords match.
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    // Update the errors state with any new validation messages.
    setErrors(newErrors);
    return valid; // Return the overall validity of the form.
  };

  /**
   * Handles the form submission for signup.
   * Prevents default form submission, validates the form, and if valid,
   * sends a POST request to the '/api/signup' endpoint with the user's details.
   * On successful signup, it resets the form, reloads the page (potentially to update auth state),
   * and navigates to the '/home' page.
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission.
    // If form validation fails, do not proceed.
    if (!validateForm()) return;

    try {
      // Send a POST request to the signup API endpoint.
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify JSON content type.
        },
        body: JSON.stringify({ // Send username, email, and password.
          username: formData.username,
          email: formData.email,
          password: formData.password
          // `confirmPassword` is not typically sent to the backend.
        }),
        credentials: 'include', // Include cookies if the backend sets any upon signup (e.g., session).
      });

      // Parse the JSON response from the server.
      const data = await response.json();
      
      // Check if the response status is OK and the `success` flag in data is true.
      if (response.ok && data.success) {
        // Reset form data to clear the fields.
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        // Reload the window. This might be intended to refresh authentication state
        // or redirect through server-side logic after signup. For SPAs, this is often
        // handled by updating context and using client-side navigation without a full reload.
        window.location.reload(); 
        // Navigate to the home page after successful signup and reload.
        navigate('/home');
      } else {
        // If signup failed, show an alert with the message from the server or a default message.
        alert(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      // Catch any network errors or issues with the fetch request itself.
      console.error('Error during signup:', error);
      alert('An error occurred during signup. Please check the console.');
    }
  };

  // Render the signup form.
  return (
    // Main container for the signup form page, styled for centering and padding.
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* Header section with logo and title. */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-10 w-auto" src={logo} alt="BingeBoard Logo" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-[#ffffff]">Sign Up for an Account</h2>
      </div>

      {/* Form container. */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* `noValidate` disables default browser validation, allowing custom validation via `validateForm`. */}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Username input field section. */}
          <div>
            <label htmlFor="username" className="block text-sm/6 font-medium text-[#ffffff]">Username</label>
            <div className="mt-1">
              <input
                type="text"
                name="username"
                id="username"
                autoComplete="username" // Helps with browser autofill.
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter Username"
                // Dynamic class for input field styling, including error state outline.
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 ${errors.username ? 'outline-red-500' : 'outline-gray-400'} placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6`}
              />
              {/* Display username validation error if it exists. */}
              {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
            </div>
          </div>

          {/* Email input field section. */}
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-[#ffffff]">Email address</label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 ${errors.email ? 'outline-red-500' : 'outline-gray-400'} placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Password input field section. */}
          <div>
            <label htmlFor="password" className="block text-sm/6 font-medium text-[#ffffff]">Password</label>
            <div className="mt-1">
              <input
                type="password" // Input type is "password" to mask characters.
                name="password"
                id="password"
                autoComplete="new-password" // Hint for password managers to generate/save a new password.
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password (min 6 characters)"
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 ${errors.password ? 'outline-red-500' : 'outline-gray-400'} placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
          </div>

          {/* Confirm Password input field section. */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-[#ffffff]">Confirm Password</label>
            <div className="mt-1">
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                autoComplete="new-password" // Also "new-password" as it's related to the new password being set.
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 ${errors.confirmPassword ? 'outline-red-500' : 'outline-gray-400'} placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6`}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Submit button section. */}
          <div className="pt-2">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-[#1963da] px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-[#ebbd34] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1963da]"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Link to login page for users who already have an account. */}
        <p className="mt-10 text-center text-sm/6 text-[#a3a3a3]">
          Already have an account?
          <a href="/login" className="font-semibold text-[#1963da] hover:text-[#ebbd34]"> Log in now</a>
        </p>
      </div>
    </div>
  );
}

// Export the SignupForm component as the default export of this module.
export default SignupForm;