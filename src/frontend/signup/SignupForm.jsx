import { useState } from "react";
import logo from '../../assets/BingeBoard Icon.svg';

function SignupForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:3001/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during signup');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-10 w-auto" src={logo} alt="BingeBoard Logo" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-[#ffffff]">Sign Up for an Account</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm/6 font-medium text-[#ffffff]">Username</label>
            <div className="mt-1">
              <input
                type="text"
                name="username"
                id="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter Username"
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 ${errors.username ? 'outline-red-500' : 'outline-gray-400'} placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6`}
              />
              {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
            </div>
          </div>

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

          <div>
            <label htmlFor="password" className="block text-sm/6 font-medium text-[#ffffff]">Password</label>
            <div className="mt-1">
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password (min 6 characters)"
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 ${errors.password ? 'outline-red-500' : 'outline-gray-400'} placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-[#ffffff]">Confirm Password</label>
            <div className="mt-1">
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 ${errors.confirmPassword ? 'outline-red-500' : 'outline-gray-400'} placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6`}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-[#1963da] px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-[#ebbd34] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1963da]"
            >
              Sign Up
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-[#a3a3a3]">
          Already have an account?
          <a href="/login" className="font-semibold text-[#1963da] hover:text-[#ebbd34]"> Log in now</a>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;