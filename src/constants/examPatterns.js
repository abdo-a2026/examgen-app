// src/constants/examPatterns.js — 8 أنماط (بعد حذف نصف السنة)

export const EXAM_PATTERNS = [
  {
    id: 'wizari',
    name: 'وزاري',
    description: 'أسئلة بأسلوب وزارة التربية العراقية',
    icon: 'GraduationCap',
  },
  {
    id: 'mcq',
    name: 'اختيار من متعدد',
    description: 'أربعة خيارات لكل سؤال',
    icon: 'ListChecks',
  },
  {
    id: 'trueFalse',
    name: 'صح وخطأ',
    description: 'عبارات يحكم عليها الطالب',
    icon: 'CheckCircle',
  },
  {
    id: 'definitions',
    name: 'تعريفات ومفاهيم',
    description: 'عرّف، اذكر، سمِّ',
    icon: 'BookOpen',
  },
  {
    id: 'analytical',
    name: 'علل وفسّر',
    description: 'أسئلة تحليلية استنتاجية',
    icon: 'Lightbulb',
  },
  {
    id: 'comparison',
    name: 'مقارنة',
    description: 'جداول مقارنة بين المفاهيم',
    icon: 'LayoutList',
  },
  {
    id: 'university',
    name: 'جامعي',
    description: 'أسلوب الجامعات والمعاهد العراقية',
    icon: 'Landmark',
  },
  {
    id: 'bank',
    name: 'بنك أسئلة',
    description: 'مزيج من كل الأنواع',
    icon: 'Database',
  },
]

export const VALID_PATTERN_IDS = EXAM_PATTERNS.map((p) => p.id)
