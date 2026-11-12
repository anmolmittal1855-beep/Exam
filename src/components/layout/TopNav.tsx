import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search, Bell, Menu, User,
  ChevronRight, X, Check, AlertTriangle, Info, Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

const routeLabels: Record<string, string> = {
  '/': 'Overview',
  '/calendar': 'Exam Calendar',
  '/assignments': 'Assignments',
  '/planner': 'Study Planner',
  '/subjects': 'Subjects',
  '/resources': 'Notes & Resources',
  '/analytics': 'Performance Analytics',
  '/settings': 'Settings',
};

interface TopNavProps {
  onMobileMenuToggle: () => void;
}

export default function TopNav({ onMobileMenuToggle }: TopNavProps) {
  const location = useLocation();
  const { notifications, markNotificationRead, markAllNotificationsRead, profile } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const currentRoute = routeLabels[location.pathname] || 'ExamPulse';
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const notifIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-coral-muted)]" />;
      case 'urgent': return <Zap className="w-3.5 h-3.5 text-[#C47A9A]" />;
      case 'success': return <Check className="w-3.5 h-3.5 text-[var(--color-green-muted)]" />;
      default: return <Info className="w-3.5 h-3.5 text-[var(--color-blue-primary)]" />;
    }
  };

  return (
    <header className="h-[56px] flex items-center justify-between px-4 lg:px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 rounded-lg hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.06)] text-[var(--color-text-secondary)]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-[13px]">
          <Link to="/" className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-dark-text-primary)] transition-colors font-medium">
            ExamPulse
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]" />
          <span className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
            {currentRoute}
          </span>
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        {searchOpen ? (
          <div className="relative">
            <input
              ref={searchRef}
              type="search"
              placeholder="Search exams, subjects, assignments..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-[200px] sm:w-[280px] text-[12.5px] !py-1.5 !px-3 !pr-8 shadow-xs"
              onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
              onKeyDown={e => { if (e.key === 'Escape') { setSearchQuery(''); setSearchOpen(false); } }}
            />
            <button
              onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[12px] text-[var(--color-text-secondary)] hover:border-[var(--color-blue-primary)] transition-all mr-1 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span>Quick search...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-[var(--color-text-secondary)] font-mono ml-2 shadow-xs">⌘K</kbd>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="sm:hidden btn btn-ghost btn-icon"
              title="Search"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="btn btn-ghost btn-icon relative"
            title="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[var(--color-coral-muted)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[340px] bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
                <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[var(--color-blue-primary)] hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] text-[13px]">
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 8).map(n => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] ${!n.read ? 'bg-[var(--color-blue-light)]/30 dark:bg-[rgba(101,157,225,0.05)]' : ''}`}
                    >
                      <div className="mt-0.5 flex-shrink-0">{notifIcon(n.type)}</div>
                      <div className="min-w-0">
                        <p className={`text-[12px] font-medium ${!n.read ? 'text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]' : 'text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-[var(--color-blue-primary)] mt-1.5 flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors ml-1"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--color-blue-light)] dark:bg-[rgba(101,157,225,0.15)] flex items-center justify-center">
              <span className="text-[11px] font-semibold text-[var(--color-blue-primary)]">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block text-[13px] font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
              {profile.name}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-[220px] bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-border)] dark:border-[var(--color-dark-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">{profile.name}</p>
                <p className="text-[11px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mt-0.5">{profile.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:bg-[rgba(0,0,0,0.03)] dark:hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--color-text-primary)] dark:hover:text-[var(--color-dark-text-primary)] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile & Settings
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
