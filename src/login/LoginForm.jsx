import { useState } from "react";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img className="mx-auto h-10 w-auto" src="src/assets/BingeBoard Icon.svg" alt="BingeBoard Logo" />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Sign in to your account</h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" action="#" method="POST">
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Email address</label>
              <div className="mt-2">
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  required
                  placeholder="Enter Email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 outline-gray-400 placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Password</label>
                <div className="text-sm">
                  <a href="/forgotpassword" className="font-semibold text-[#1963da] hover:text-[#ebbd34]">Forgot password?</a>
                </div>
              </div>
              <div className="mt-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter Password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-2 outline-gray-400 placeholder:text-gray-400 focus:outline-2 focus:outline-[#1963da] sm:text-sm/6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-sm text-[#1963da] hover:text-[#ebbd34]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-[#1963da] px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-[#ebbd34] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1963da]"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?
            <a href="/signup" className="font-semibold text-[#1963da] hover:text-[#ebbd34]"> Sign up now</a>
          </p>
        </div>
      </div>
    </>
  );
}

export default LoginForm;
