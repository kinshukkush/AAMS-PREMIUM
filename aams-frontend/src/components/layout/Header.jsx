import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Menu, Bell, User } from 'lucide-react';

export function Header({ onMenuClick, user, notifications, onNotifications }) {
  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={clsx(
        'sticky top-0 z-40',
        'bg-white dark:bg-dark-900 border-b border-neutral-200 dark:border-dark-700',
        'h-16 lg:h-20'
      )}
    >
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left: Menu Button & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-dark-800 rounded-lg"
          >
            <Menu size={20} className="text-neutral-600 dark:text-neutral-300" />
          </button>

          <h1 className="hidden lg:block text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            AAMS
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotifications}
            className="relative p-2 hover:bg-neutral-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
          >
            <Bell size={20} className="text-neutral-600 dark:text-neutral-300" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </motion.button>

          {/* User Profile */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 pl-4 border-l border-neutral-200 dark:border-dark-700"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {user?.role || 'User'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
