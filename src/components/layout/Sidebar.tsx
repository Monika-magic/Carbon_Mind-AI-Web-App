import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  Leaf,
  TrendingUp,
  Trophy,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '../../store';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Activities', href: '/activities', icon: Activity },
  { name: 'AI Coach', href: '/coach', icon: Leaf },
  { name: 'Insights', href: '/insights', icon: TrendingUp },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        className="hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col z-30"
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <motion.div
              initial={false}
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                  CarbonMind
                </span>
              )}
            </motion.div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={`
                        group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${
                          isActive
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {item.name}
                        </motion.span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-auto"
            >
              <div className="rounded-2xl bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-secondary-500/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Eco Tip of the Day
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Taking shorter showers can save up to 350 kg of CO2 per year!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.aside>

      <motion.div
        initial={false}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30"
      >
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-2">
          <nav className="flex justify-around">
            {navigation.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium
                    transition-colors
                    ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </motion.div>
    </>
  );
}
