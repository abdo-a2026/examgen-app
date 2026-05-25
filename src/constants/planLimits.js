// planLimits.js — حدود كل خطة ومستويات الصعوبة

export const PLAN_LIMITS = {
  free: {
    dailyRequests: 3,
    maxFileSizeMB: 10,
  },
  subscribed: {
    dailyRequests: 20,
    maxFileSizeMB: 20,
  },
}

export const DIFFICULTY_LEVELS = [
  {
    id: 'easy',
    name: 'سهل',
    description: 'أسئلة أساسية تناسب المراجعة السريعة',
    color: 'text-green-400',
    activeBg: 'bg-green-500',
  },
  {
    id: 'medium',
    name: 'متوسط',
    description: 'أسئلة متوازنة تغطي المادة كاملاً',
    color: 'text-orange-400',
    activeBg: 'bg-orange-500',
  },
  {
    id: 'hard',
    name: 'صعب',
    description: 'أسئلة تحليلية تحتاج فهماً عميقاً',
    color: 'text-red-400',
    activeBg: 'bg-red-500',
  },
]
