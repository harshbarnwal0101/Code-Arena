import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CodeforceLink from '../CodeforceLink';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTitleClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-gray-800 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a 
              href="/"
              onClick={handleTitleClick}
              className="text-white text-xl font-bold cursor-pointer"
            >
              Competitive Arena
            </a>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {user && (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/problems"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                    >
                      Problems
                    </Link>
                    <Link
                      to="/contests"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                    >
                      Contests
                    </Link>
                    <Link
                      to="/leaderboard"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                    >
                      Leaderboard
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                <CodeforceLink />
                <div className="ml-4">
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar; 