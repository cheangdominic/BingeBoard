import { Link } from "react-router-dom";
import TopNavbar from './landing/TopNavbar.jsx';
import Footer from './landing/Footer.jsx';
import BottomNavbar from "../components/BottomNavbar.jsx";
import { useAuth } from '../context/AuthContext';

function NotFound() {
  const { user } = useAuth();

  const homeLink = user ? "/home" : "/";

  return (
    <>
      {!user && <TopNavbar />}
      <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8 bg-[#1e1e1e]">
        <div className="text-center">
          <p className="text-base font-semibold text-[#ebbd34]">404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-blue-400 sm:text-7xl">
            Page not found
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-[#ffffff] sm:text-xl/8">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to={homeLink}
              className="rounded-md bg-[#1963da] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#ebbd34] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 transition"
            >
              Return to the Home page
            </Link>
          </div>
        </div>
      </main>
      {user ? <BottomNavbar /> : <Footer />}
    </>
  );
}

export default NotFound;