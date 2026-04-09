import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Menu, X } from 'lucide-react';

export function Sidebar({ isOpen, onClose, children }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={clsx(
          'fixed left-0 top-0 h-screen w-64 bg-white dark:bg-dark-900',
          'border-r border-neutral-200 dark:border-dark-700',
          'z-50 lg:static lg:z-auto',
          'overflow-y-auto',
          !isOpen && 'lg:block'
        )}
      >
        <div className="flex items-center justify-between p-6 lg:hidden">
          <h1 className="text-xl font-bold text-primary-600">AAMS</h1>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-800 rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {children}
        </nav>
      </motion.aside>
    </>
  );
}

export function SidebarLink({ icon: Icon, label, active, ...props }) {
  return (
    <motion.a
      whileHover={{ x: 4 }}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        active
          ? 'bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-medium'
          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-800'
      )}
      {...props}
    >
      {Icon && <Icon size={20} />}
      <span>{label}</span>
    </motion.a>
  );
}

export default Sidebar;
