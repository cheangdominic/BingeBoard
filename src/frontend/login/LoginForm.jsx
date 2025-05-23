/**
 * @file LoginForm.jsx
 * @description A React component that renders a login form.
 * It handles form input, validation, submission, and displays error messages.
 */

// Import useState hook from React for managing component state (form data, errors, password visibility).
import { useState } from "react";
// Import the application logo image.
import logo from '../../assets/BingeBoard Icon.svg';

/**
 * @function LoginForm
 * @description A React functional component that provides a user interface for logging in.
 * It includes fields for email and password, password visibility toggle, form validation,
 * and submission to a backend API.
 *
 * @returns {JSX.Element} The rendered LoginForm component.
 */
function LoginForm() {
  // State for form data (email and password).
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // State for validation errors for each form field.
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // State to toggle password visibility (show/hide).
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles changes in form input fields.
   * Updates the `formData` state with the new value and clears any existing validation error for that field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input field.
   */
  const handleChange = (e) => {
    const { name, value } = e.target; // Destructure field name and value from the event target.
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
   * Checks for required fields and valid email format.
   * Updates the `errors` state with any validation messages.
   * @returns {boolean} `true` if the form is valid, `false` otherwise.
   */
  const validateForm = () => {
    let valid = true; // Assume form is valid initially.
    const newErrors = { ...errors }; // Copy existing errors to update.

    // Validate email field.
    if (!formData.email.trim()) { // Check if email is empty or only whitespace.
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { // Check for valid email format using regex.
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    // Validate password field.
    if (!formData.password) { // Check if password is empty.
      newErrors.password = 'Password is required';
      valid = false;
    }
    
    // Update the errors state with any new validation messages.
    setErrors(newErrors);
    return valid; // Return the overall validity of the form.
  };

  /**
   * Handles the form submission.
   * Prevents default form submission, validates the form, and if valid,
   * sends a POST request to the '/api/login' endpoint with the form data.
   * On successful login, it redirects the user to the '/home' page.
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default browser form submission.
    // If form validation fails, do not proceed with submission.
    if (!validateForm()) return;

    try {
      // Send a POST request to the login API endpoint.
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include', // Include cookies (e.g., session cookie) in the request.
        headers: {
          'Content-Type': 'application/json', // Specify that the request body is JSON.
        },
        body: JSON.stringify({ // Convert form data to JSON string.
          email: formData.email,
          password: formData.password
        }),
      });

      // Parse the JSON response from the server.
      const data = await response.json();

      // Log the raw response and parsed data for debugging.
      console.log('Response:', response);
      console.log('Response Data:', data);
      
      // Check if the response status is OK (e.g., 200-299).
      if (response.ok) {
        console.log('Login successful', data);
        // Redirect to the home page on successful login.
        // `window.location.href` causes a full page reload, which might be desired
        // to re-initialize context or state. For SPA navigation without reload,
        // `useNavigate` from `react-router-dom` would be used.
        window.location.href = '/home';
      } else {
        // If login failed, log the failure and the response data (which might contain error messages).
        console.log('Login failed', data);
        // TODO: Display error messages from `data` to the user (e.g., "Invalid credentials").
        // Example: setErrors(prev => ({ ...prev, form: data.message || 'Login failed' }));
      }
    } catch (error) {
      // Catch any network errors or issues with the fetch request itself.
      console.error('Error:', error);
      // TODO: Display a generic error message to the user.
      // Example: setErrors(prev => ({ ...prev, form: 'An unexpected error occurred.' }));
    }
  };

  // Render the login form.
  return (
    // Main container for the login form page, styled for centering and padding.
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* Header section with logo and title. */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-10 w-auto" src={logo} alt="BingeBoard Logo" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-[#ffffff]">Sign In to Your Account</h2>
      </div>

      {/* Form container. */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* `noValidate` attribute disables default browser validation, allowing custom validation. */}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Email input field section. */}
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-[#ffffff]">Email address</label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email" // Helps with browser autofill.
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                // Dynamic class for input field styling, including error state outline.
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 ${errors.email ? 'outline-red-500' : 'outline-gray-400'} placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6`}
              />
              {/* Display email validation error if it exists. */}
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Password input field section. */}
          <div>
            {/* Label and "Forgot password?" link. */}
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-[#ffffff]">Password</label>
              <div className="text-sm">
                <a href="/forgotpassword" className="font-semibold text-[#1963da] hover:text-[#ebbd34]">Forgot password?</a>
              </div>
            </div>
            {/* Password input field with show/hide toggle. */}
            <div className="mt-1 relative"> {/* `relative` for positioning the show/hide button. */}
              <input
                type={showPassword ? "text" : "password"} // Dynamically set input type.
                name="password"
                id="password"
                autoComplete="current-password" // Helps with browser autofill for current password.
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 ${errors.password ? 'outline-red-500' : 'outline-gray-400'} placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6`}
              />
              {/* Button to toggle password visibility. */}
              <button
                type="button" // Important: `type="button"` prevents form submission.
                onClick={() => setShowPassword(prev => !prev)} // Toggle `showPassword` state.
                className="absolute inset-y-0 right-3 flex items-center text-sm text-[#1963da] hover:text-[#ebbd34]" // Positioned inside the input field.
              >
                {showPassword ? "Hide" : "Show"} {/* Dynamically set button text. */}
              </button>
              {/* Display password validation error if it exists. */}
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
          </div>

          {/* Submit button section. */}
          <div className="pt-2">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-[#1963da] px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-[#ebbd34] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1963da]"
            >
              Sign in
            </button>
          </div>
        </form>

        {/* Link to signup page for users who don't have an account. */}
        <p className="mt-10 text-center text-sm/6 text-[#a3a3a3]">
          Not a member?
          <a href="/signup" className="font-semibold text-[#1963da] hover:text-[#ebbd34]"> Sign up now</a>
        </p>
      </div>
    </div>
  );
}

// Export the LoginForm component as the default export of this module.
export default LoginForm;