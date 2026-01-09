import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, BellIcon, UserCircleIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { MetahodosCircles } from '../ui/MetahodosCircles';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick?: () => void;
}

/**
 * Header - Top navigation bar
 * Styled according to Metahodos design system
 */
export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logout effettuato');
      navigate('/login');
    } catch (error) {
      toast.error('Errore durante il logout');
    }
  }

  return (
    <header className="bg-metahodos-navy text-white h-16 sticky top-0 z-50 shadow-md">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left section: Menu button (mobile) + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-metahodos-navy-light transition-colors"
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-col items-start">
            {/* Three colored circles above the title */}
            <MetahodosCircles size="sm" className="mb-1" />

            {/* App Name */}
            <span className="text-base font-semibold tracking-wide">
              METAHODOS.AGILE.AI
            </span>
          </div>
        </div>

        {/* Right section: Notifications + User menu */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-md hover:bg-metahodos-navy-light transition-colors relative"
            aria-label="Notifications"
          >
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-metahodos-orange rounded-full"></span>
          </button>

          {/* User menu dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 rounded-md hover:bg-metahodos-navy-light transition-colors flex items-center gap-2"
              aria-label="User menu"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-6 w-6" />
              )}
              <span className="hidden md:inline text-sm">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
              </span>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  <div className="px-4 py-2 border-b border-metahodos-gray-200">
                    <p className="text-sm font-medium text-metahodos-navy truncate">
                      {currentUser?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-metahodos-text-muted truncate">
                      {currentUser?.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-metahodos-text-primary hover:bg-metahodos-gray-100 flex items-center gap-2"
                  >
                    <ArrowRightEndOnRectangleIcon className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
