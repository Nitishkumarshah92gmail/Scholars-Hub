import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import { getNotifications } from '../api';
import ChatBot from './ChatBot';
import logoImg from '../assets/logo.png';
import {
  HiHome,
  HiOutlineHome,
  HiSearch,
  HiOutlineSearch,
  HiPlusCircle,
  HiOutlinePlusCircle,
  HiUser,
  HiOutlineUser,
  HiBell,
  HiOutlineBell,
  HiBookmark,
  HiOutlineBookmark,
  HiLogout,
  HiSun,
  HiMoon,
  HiOutlineBookOpen,
  HiOutlineLightBulb,
  HiOutlineAcademicCap,
} from 'react-icons/hi';

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getNotifications()
      .then((res) => setUnreadCount(res.data.unreadCount))
      .catch(() => { });
    const interval = setInterval(() => {
      getNotifications()
        .then((res) => setUnreadCount(res.data.unreadCount))
        .catch(() => { });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: HiOutlineHome, activeIcon: HiHome, label: 'Home' },
    { to: '/dashboard/explore', icon: HiOutlineSearch, activeIcon: HiSearch, label: 'Search' },
    { to: '/dashboard/upload', icon: HiOutlinePlusCircle, activeIcon: HiPlusCircle, label: 'Create' },
    { to: '/dashboard/bookmarks', icon: HiOutlineBookmark, activeIcon: HiBookmark, label: 'Saved' },
    { to: '/dashboard/pdf-tools', icon: HiOutlineBookOpen, activeIcon: HiOutlineBookOpen, label: 'PDF Tools' },
    {
      to: '/dashboard/notifications',
      icon: HiOutlineBell,
      activeIcon: HiBell,
      label: 'Notifications',
      badge: unreadCount,
    },
    { to: `/dashboard/profile/${user?._id}`, icon: HiOutlineUser, activeIcon: HiUser, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ig-bg-2 dark:bg-ig-bg-dark">
      {/* Desktop Sidebar — Instagram-style */}
      <aside className="hidden md:flex flex-col w-[245px] xl:w-[335px] fixed h-full bg-ig-bg dark:bg-ig-bg-dark border-r border-ig-separator dark:border-ig-separator-dark z-30">
        {/* Logo */}
        <div className="px-6 pt-5 pb-3">
          <h1
            className="text-2xl font-heading font-bold text-ig-text dark:text-ig-text-light flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <img src={logoImg} alt="Scholars Hub" className="w-9 h-9 rounded-full object-cover" />
            <span>
              Scholars<span className="gradient-text"> Hub</span>
            </span>
          </h1>
        </div>

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5 scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <item.activeIcon className="w-6 h-6" />
                  ) : (
                    <item.icon className="w-6 h-6" />
                  )}
                  <span className="hidden xl:inline">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-ig-badge text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* External Links */}
          <div className="pt-2 mt-2 border-t border-ig-separator/30 dark:border-ig-separator-dark/30 space-y-0.5">
            <a href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer" className="nav-link w-full">
              <HiOutlineBookOpen className="w-6 h-6" />
              <span className="hidden xl:inline">NotebookLM</span>
            </a>
            <a href="https://www.atlas.org/core/d0273839-eb53-46ff-ad44-df3cc4dc504a/space" target="_blank" rel="noopener noreferrer" className="nav-link w-full">
              <HiOutlineLightBulb className="w-6 h-6" />
              <span className="hidden xl:inline">AI Tool</span>
            </a>
            <a href="https://nptel.ac.in/courses" target="_blank" rel="noopener noreferrer" className="nav-link w-full">
              <HiOutlineAcademicCap className="w-6 h-6" />
              <span className="hidden xl:inline">NPTEL Courses</span>
            </a>
          </div>
        </div>

        {/* Bottom section — always visible */}
        <div className="px-3 py-2 space-y-0.5 border-t border-ig-separator/30 dark:border-ig-separator-dark/30">
          <button onClick={toggleTheme} className="nav-link w-full">
            {darkMode ? <HiSun className="w-6 h-6" /> : <HiMoon className="w-6 h-6" />}
            <span className="hidden xl:inline">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={handleLogout} className="nav-link w-full text-ig-error hover:text-ig-error">
            <HiLogout className="w-6 h-6" />
            <span className="hidden xl:inline">Log out</span>
          </button>
        </div>

        {/* User info */}
        <div
          className="px-3 pb-2 cursor-pointer"
          onClick={() => navigate(`/dashboard/profile/${user?._id}`)}
        >
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ig-bg-elevated transition-colors">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0 hidden xl:block">
              <p className="font-semibold text-sm truncate text-ig-text dark:text-ig-text-light">{user?.name}</p>
              <p className="text-xs text-ig-text-2 truncate">{user?.school || 'Student'}</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="px-6 pb-2 hidden xl:block">
          <p className="text-[10px] text-ig-text-2 leading-relaxed">
            By <span className="font-semibold">Nitish Kumar Sahu</span> · <a href="mailto:nitishkumarshah92@gmail.com" className="text-ig-primary hover:underline">Report an issue</a>
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[245px] xl:ml-[335px] pb-16 md:pb-0">
        <div className="max-w-[630px] mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* AI ChatBot */}
      <ChatBot />

      {/* Mobile Bottom Nav — Instagram-style */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ig-bg dark:bg-ig-bg-dark border-t border-ig-separator dark:border-ig-separator-dark z-30 flex justify-around py-2 px-1 safe-area-pb">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${isActive
                ? 'text-ig-text dark:text-ig-text-light'
                : 'text-ig-text dark:text-ig-text-light opacity-60'
              }`
            }
          >
            {({ isActive }) => (
              <div className="relative">
                {isActive ? (
                  <item.activeIcon className="w-7 h-7" />
                ) : (
                  <item.icon className="w-7 h-7" />
                )}
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-ig-badge text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
