import { useState } from "react";
import logo from '../../assets/BingeBoard Icon.svg';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

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
    }
    

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      console.log('Response:', response);
      console.log('Response Data:', data);
      
      if (response.ok) {
        console.log('Login successful', data);
        window.location.href = '/home';
      } else {
        console.log('Login failed', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-10 w-auto" src={logo} alt="BingeBoard Logo" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-[#ffffff]">Sign In to Your Account</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-[#ffffff]">Password</label>
              <div className="text-sm">
                <a href="/forgotpassword" className="font-semibold text-[#1963da] hover:text-[#ebbd34]">Forgot password?</a>
              </div>
            </div>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 ${errors.password ? 'outline-red-500' : 'outline-gray-400'} placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-sm text-[#1963da] hover:text-[#ebbd34]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-[#1963da] px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-[#ebbd34] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1963da]"
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-[#a3a3a3]">
          Not a member?
          <a href="/signup" className="font-semibold text-[#1963da] hover:text-[#ebbd34]"> Sign up now</a>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;