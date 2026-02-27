import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.png';
import {
  HiAcademicCap,
  HiDocumentText,
  HiPhotograph,
  HiPlay,
  HiCollection,
  HiUserGroup,
  HiHeart,
  HiChat,
  HiBell,
  HiBookmark,
  HiSun,
  HiMoon,
  HiArrowRight,
  HiGlobe,
} from 'react-icons/hi';

export default function Landing() {
  const { darkMode, toggleTheme } = useTheme();

  const features = [
    { icon: HiDocumentText, title: 'Share PDFs', desc: 'Upload study notes, cheat sheets, and textbook summaries for your classmates.' },
    { icon: HiPhotograph, title: 'Share Images', desc: 'Upload diagrams, whiteboard photos, and visual study aids.' },
    { icon: HiPlay, title: 'YouTube Videos', desc: 'Paste any YouTube link and it auto-embeds for easy viewing.' },
    { icon: HiCollection, title: 'YouTube Playlists', desc: 'Share entire course playlists with a single link.' },
  ];

  const socialFeatures = [
    { icon: HiHeart, title: 'Like & React', desc: 'Show appreciation for helpful content' },
    { icon: HiChat, title: 'Comments', desc: 'Discuss and ask questions on posts' },
    { icon: HiUserGroup, title: 'Follow Students', desc: 'Build your study network' },
    { icon: HiBell, title: 'Notifications', desc: 'Stay updated on interactions' },
    { icon: HiBookmark, title: 'Bookmarks', desc: 'Save posts for later revision' },
    { icon: HiGlobe, title: 'Explore', desc: 'Discover content across all subjects' },
  ];

  const subjects = [
    { name: 'Mathematics', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { name: 'Science', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    { name: 'Programming', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    { name: 'History', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    { name: 'Physics', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    { name: 'Chemistry', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
    { name: 'Biology', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { name: 'Engineering', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  ];

  return (
    <div className="min-h-screen bg-ig-bg dark:bg-ig-bg-dark transition-colors duration-200">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ig-bg/95 dark:bg-ig-bg-dark/95 backdrop-blur-sm border-b border-ig-separator dark:border-ig-separator-dark">
        <div className="max-w-[975px] mx-auto px-4 h-[60px] flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold text-ig-text dark:text-ig-text-light flex items-center gap-2">
            <img src={logoImg} alt="Scholars Hub" className="w-8 h-8 rounded-full object-cover" />
            Scholars<span className="gradient-text"> Hub</span>
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-ig-text-2 hover:text-ig-text dark:hover:text-ig-text-light transition-colors"
            >
              {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>
            <Link
              to="/login"
              className="text-ig-primary hover:text-ig-primary-hover font-semibold text-sm transition-colors"
            >
              Log in
            </Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-1.5">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-[975px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Mockup / Visual */}
          <div className="hidden lg:block flex-1 max-w-[380px]">
            <div className="relative">
              <div className="bg-ig-gradient-vivid rounded-3xl p-[2px]">
                <div className="bg-ig-bg dark:bg-ig-bg-dark rounded-3xl p-6">
                  <div className="space-y-3">
                    {/* Mock post preview */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-ig-gradient" />
                      <div>
                        <div className="h-2.5 w-20 bg-gray-200 dark:bg-ig-bg-elevated rounded" />
                        <div className="h-2 w-14 bg-gray-100 dark:bg-ig-bg-elevated rounded mt-1" />
                      </div>
                    </div>
                    <div className="h-36 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300 rounded-lg" />
                    <div className="flex gap-3">
                      <HiHeart className="w-5 h-5 text-ig-error" />
                      <HiChat className="w-5 h-5 text-ig-text-2" />
                      <HiBookmark className="w-5 h-5 text-ig-text-2 ml-auto" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-2.5 w-full bg-gray-200 dark:bg-ig-bg-elevated rounded" />
                      <div className="h-2.5 w-3/4 bg-gray-100 dark:bg-ig-bg-elevated rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Text */}
          <div className="flex-1 text-center lg:text-left max-w-[500px]">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-ig-text dark:text-ig-text-light leading-tight">
              Share knowledge,{' '}
              <span className="gradient-text">inspire learning</span>
            </h1>
            <p className="mt-4 text-base text-ig-text-2 leading-relaxed">
              Upload study notes, videos, and resources. Connect with students worldwide.
              Like Instagram, but built for education.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 lg:justify-start justify-center">
              <Link to="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                Get Started
                <HiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="text-ig-text-2 hover:text-ig-text dark:hover:text-ig-text-light font-semibold transition-colors flex items-center gap-2"
              >
                Already have an account?
              </Link>
            </div>

            {/* Subject pills */}
            <div className="mt-8 flex flex-wrap gap-2 lg:justify-start justify-center">
              {subjects.map((s) => (
                <span key={s.name} className={`subject-badge ${s.color} px-3 py-1`}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-ig-bg-2 dark:bg-ig-bg-dark-2 border-t border-b border-ig-separator dark:border-ig-separator-dark">
        <div className="max-w-[975px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ig-text dark:text-ig-text-light">
              4 Ways to Share Knowledge
            </h2>
            <p className="mt-3 text-ig-text-2 max-w-xl mx-auto text-sm">
              Whether it's a PDF, an image, or a YouTube video — Scholars Hub makes sharing effortless.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card p-5 text-center group hover:shadow-ig transition-shadow">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-ig-bg-2 dark:bg-ig-bg-elevated flex items-center justify-center group-hover:bg-ig-gradient group-hover:text-white transition-all">
                  <f.icon className="w-7 h-7 text-ig-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-ig-text dark:text-ig-text-light mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-ig-text-2 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Features */}
      <section className="py-16 px-4">
        <div className="max-w-[975px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ig-text dark:text-ig-text-light">
              Built for Student Communities
            </h2>
            <p className="mt-3 text-ig-text-2 max-w-xl mx-auto text-sm">
              All the social features you need to connect, collaborate, and learn with peers.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {socialFeatures.map((f) => (
              <div key={f.title} className="card p-4 text-center hover:shadow-ig transition-shadow">
                <f.icon className="w-7 h-7 text-ig-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm text-ig-text dark:text-ig-text-light mb-0.5">
                  {f.title}
                </h3>
                <p className="text-xs text-ig-text-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 border-t border-ig-separator dark:border-ig-separator-dark">
        <div className="max-w-[500px] mx-auto text-center">
          <div className="bg-ig-gradient-vivid rounded-2xl p-[1px]">
            <div className="bg-ig-bg dark:bg-ig-bg-dark-2 rounded-2xl p-10">
              <HiAcademicCap className="w-12 h-12 text-ig-primary mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-bold text-ig-text dark:text-ig-text-light mb-3">
                Ready to Start Sharing?
              </h2>
              <p className="text-ig-text-2 text-sm mb-6">
                Join students who are already sharing notes, videos, and study materials. It's completely free.
              </p>
              <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
                Sign up — it's free
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-ig-separator dark:border-ig-separator-dark">
        <div className="max-w-[975px] mx-auto flex flex-col items-center gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="Scholars Hub" className="w-6 h-6 rounded-full object-cover" />
              <span className="font-heading font-bold text-sm text-ig-text dark:text-ig-text-light">
                Scholars<span className="gradient-text"> Hub</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-xs text-ig-text-2 hover:text-ig-text dark:hover:text-ig-text-light transition-colors">
                Log in
              </Link>
              <Link to="/register" className="text-xs text-ig-text-2 hover:text-ig-text dark:hover:text-ig-text-light transition-colors">
                Sign up
              </Link>
            </div>
          </div>
          <div className="text-center text-xs text-ig-text-2 space-y-1">
            <p>&copy; {new Date().getFullYear()} Scholars Hub. Learn together, grow together.</p>
            <p>
              Developed by <span className="font-semibold text-ig-text dark:text-ig-text-light">Nitish Kumar Sahu</span>
              {' · '}
              Report issues:{' '}
              <a href="mailto:nitishkumarshah92@gmail.com" className="text-ig-primary hover:underline">
                nitishkumarshah92@gmail.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
