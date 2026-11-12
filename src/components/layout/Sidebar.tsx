import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, ClipboardList, BookOpen,
  GraduationCap, FileText, BarChart3, Settings,
  HelpCircle, User, ChevronLeft, ChevronRight, Sparkles,
  Menu, X
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/calendar', label: 'Exam Calendar', icon: Calendar },
  { path: '/assignments', label: 'Assignments', icon: ClipboardList },
  { path: '/planner', label: 'Study Planner', icon: BookOpen },
  { path: '/subjects', label: 'Subjects', icon: GraduationCap },
  { path: '/resources', label: 'Notes & Resources', icon: FileText },
  { path: '/analytics', label: 'Performance', icon: BarChart3 },
];

const bottomNavItems = [
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-[56px] border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-blue-primary)] flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)] tracking-tight">ExamPulse</span>
            <span className="text-[10px] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-tight">Academic Hub</span>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium
                transition-all duration-150 group relative
                ${isActive
                  ? 'bg-[rgba(99,154,226,0.15)] text-[#8CB8F0] font-semibold border border-[rgba(99,154,226,0.25)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--color-text-primary)]'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2 : 1.6} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none z-50 shadow-dropdown">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="px-2 py-3 border-t border-[var(--color-border)] space-y-0.5">
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-[rgba(99,154,226,0.15)] text-[#8CB8F0] font-semibold border border-[rgba(99,154,226,0.25)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--color-text-primary)]'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.6} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Collapse toggle (desktop) */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium w-full
            text-[var(--color-text-secondary)]
            hover:bg-[rgba(255,255,255,0.04)]
            hover:text-[var(--color-text-primary)]
            transition-all duration-150"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          {collapsed ? <ChevronRight className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 lg:hidden
          bg-[var(--color-surface)] border-r border-[var(--color-border)]
          w-[240px] transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <button
          onClick={onMobileClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)]"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col flex-shrink-0
          bg-[var(--color-surface)] border-r border-[var(--color-border)]
          transition-all duration-300 h-screen sticky top-0
          ${collapsed ? 'w-[60px]' : 'w-[220px]'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
