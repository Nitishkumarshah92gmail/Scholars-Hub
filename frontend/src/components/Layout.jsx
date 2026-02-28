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
  HiDotsHorizontal,
  HiX,
} from 'react-icons/hi';

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Mobile bottom nav: Home, Search, Create, Notifications, Profile
  const mobileBottomItems = [
    navItems[0], // Home
    navItems[1], // Search
    navItems[2], // Create
    navItems[5], // Notifications
    navItems[6], // Profile
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

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-ig-bg dark:bg-ig-bg-dark border-b border-ig-separator dark:border-ig-separator-dark z-30 flex items-center justify-between px-4 py-2.5">
        <h1
          className="text-xl font-heading font-bold text-ig-text dark:text-ig-text-light flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <img src={logoImg} alt="Scholars Hub" className="w-7 h-7 rounded-full object-cover" />
          <span>
            Scholars<span className="gradient-text"> Hub</span>
          </span>
        </h1>
        <NavLink
          to="/dashboard/notifications"
          className={({ isActive }) =>
            `p-2 rounded-lg transition-colors relative ${isActive ? 'text-ig-text dark:text-ig-text-light' : 'text-ig-text dark:text-ig-text-light opacity-70'}`
          }
        >
          <HiOutlineBell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-ig-badge text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>
      </header>

      {/* Mobile More Menu — Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          {/* Slide-in panel */}
          <div className="relative ml-auto w-72 h-full bg-ig-bg dark:bg-ig-bg-dark shadow-xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ig-separator dark:border-ig-separator-dark">
              <span className="font-semibold text-ig-text dark:text-ig-text-light">More</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-ig-text dark:text-ig-text-light hover:bg-gray-100 dark:hover:bg-ig-bg-elevated">
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              {/* All nav items accessible from More menu */}
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-gray-100 dark:bg-ig-bg-elevated font-semibold' : 'hover:bg-gray-100 dark:hover:bg-ig-bg-elevated'} text-ig-text dark:text-ig-text-light`}
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? <item.activeIcon className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
                      <span>{item.label}</span>
                      {item.badge > 0 && (
                        <span className="ml-auto bg-ig-badge text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              <div className="border-t border-ig-separator/30 dark:border-ig-separator-dark/30 my-2" />

              {/* External Links */}
              <a href="https://notebooklm.google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-ig-bg-elevated text-ig-text dark:text-ig-text-light">
                <HiOutlineBookOpen className="w-5 h-5" />
                <span>NotebookLM</span>
              </a>
              <a href="https://www.atlas.org/core/d0273839-eb53-46ff-ad44-df3cc4dc504a/space" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-ig-bg-elevated text-ig-text dark:text-ig-text-light">
                <HiOutlineLightBulb className="w-5 h-5" />
                <span>AI Tool</span>
              </a>
              <a href="https://nptel.ac.in/courses" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-ig-bg-elevated text-ig-text dark:text-ig-text-light">
                <HiOutlineAcademicCap className="w-5 h-5" />
                <span>NPTEL Courses</span>
              </a>

              <div className="border-t border-ig-separator/30 dark:border-ig-separator-dark/30 my-2" />

              {/* Theme Toggle */}
              <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-ig-bg-elevated text-ig-text dark:text-ig-text-light w-full">
                {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {/* Logout */}
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-ig-bg-elevated text-ig-error w-full">
                <HiLogout className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </div>

            {/* User info at bottom of menu */}
            <div className="px-3 py-3 border-t border-ig-separator/30 dark:border-ig-separator-dark/30">
              <div
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-ig-bg-elevated cursor-pointer"
                onClick={() => { navigate(`/dashboard/profile/${user?._id}`); setMobileMenuOpen(false); }}
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-ig-text dark:text-ig-text-light">{user?.name}</p>
                  <p className="text-xs text-ig-text-2 truncate">{user?.school || 'Student'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-[245px] xl:ml-[335px] pb-16 md:pb-0 pt-14 md:pt-0">
        <div className="max-w-[630px] mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* AI ChatBot */}
      <ChatBot />

      {/* Mobile Bottom Nav — Instagram-style */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ig-bg dark:bg-ig-bg-dark border-t border-ig-separator dark:border-ig-separator-dark z-30 flex justify-around py-2 px-1 safe-area-pb">
        {mobileBottomItems.map((item) => (
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
        {/* 3-dot More button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors text-ig-text dark:text-ig-text-light opacity-60"
        >
          <HiDotsHorizontal className="w-7 h-7" />
        </button>
      </nav>
    </div>
  );
}
