import { motion } from 'framer-motion';

interface BadgeProps {
  icon: React.ReactNode;
  name: string;
  description?: string;
  earned?: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  icon,
  name,
  description,
  earned = false,
  earnedAt,
  size = 'md',
  className = '',
}: BadgeProps) {
  const sizes = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: earned ? 1.05 : 1 }}
      className={`
        relative flex flex-col items-center justify-center rounded-2xl
        transition-all duration-200
        ${earned
          ? 'bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-2 border-primary-400/50'
          : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 opacity-60'
        }
        ${sizes[size]}
        ${className}
      `}
    >
      <div
        className={`
          ${earned ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}
          ${iconSizes[size]}
        `}
      >
        {icon}
      </div>
      <span
        className={`
          mt-2 text-center font-medium
          ${earned
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-500 dark:text-gray-400'
          }
          ${size === 'sm' ? 'text-xs' : 'text-sm'}
        `}
      >
        {name}
      </span>
      {description && size !== 'sm' && (
        <span className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400 max-w-[100px]">
          {description}
        </span>
      )}
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 rounded-2xl">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            LOCKED
          </span>
        </div>
      )}
    </motion.div>
  );
}

interface BadgeListProps {
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    earned_at?: string;
  }>;
  allBadges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
  className?: string;
}

export function BadgeList({ badges, allBadges, className = '' }: BadgeListProps) {
  const earnedIds = new Set(badges.map((b) => b.id));

  return (
    <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 ${className}`}>
      {allBadges.map((badge) => (
        <Badge
          key={badge.id}
          icon={
            <span className="text-2xl">
              {badge.icon}
            </span>
          }
          name={badge.name}
          description={badge.description}
          earned={earnedIds.has(badge.id)}
          size="md"
        />
      ))}
    </div>
  );
}
