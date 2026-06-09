// src/components/exam/CurriculumSelector.jsx
// مكون اختيار المرحلة والصف والمادة من المنهج العراقي

import React from 'react'
import { ChevronDown } from 'lucide-react'
import { getStages, getGrades, getSubjects } from '../../constants/iraqiCurriculum'

const COLORS = {
  bg:            '#0D1117',
  card:          '#161B22',
  accent:        '#FF6B35',
  textPrimary:   '#E6EDF3',
  textSecondary: '#8B949E',
  border:        '#30363D',
}

/**
 * CurriculumSelector
 * @param {{ value: { stage: string, grade: string, subject: string }, onChange: Function }} props
 */
export default function CurriculumSelector({ value, onChange }) {
  const { stage = '', grade = '', subject = '' } = value || {}

  const stages   = getStages()
  const grades   = stage   ? getGrades(stage)        : []
  const subjects = (stage && grade) ? getSubjects(stage, grade) : []

  // ─── تغيير المرحلة — يصفّر الصف والمادة ────────────────────────────────
  const handleStageChange = (newStage) => {
    onChange({ stage: newStage, grade: '', subject: '' })
  }

  // ─── تغيير الصف — يصفّر المادة ──────────────────────────────────────────
  const handleGradeChange = (newGrade) => {
    onChange({ stage, grade: newGrade, subject: '' })
  }

  // ─── تغيير المادة ────────────────────────────────────────────────────────
  const handleSubjectChange = (newSubject) => {
    onChange({ stage, grade, subject: newSubject })
  }

  return (
    <div
      className="flex flex-col gap-4"
      style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
    >
      {/* ─── المرحلة ─── */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-semibold"
          style={{ color: COLORS.textSecondary }}
        >
          المرحلة الدراسية
          <span className="mr-1 text-xs" style={{ color: COLORS.accent }}>*</span>
        </label>
        <SelectField
          value={stage}
          onChange={handleStageChange}
          placeholder="اختر المرحلة..."
          options={stages}
        />
      </div>

      {/* ─── الصف ─── */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-semibold"
          style={{ color: stage ? COLORS.textSecondary : '#4A5568' }}
        >
          الصف الدراسي
          <span className="mr-1 text-xs" style={{ color: COLORS.accent }}>*</span>
        </label>
        <SelectField
          value={grade}
          onChange={handleGradeChange}
          placeholder={stage ? 'اختر الصف...' : 'اختر المرحلة أولاً'}
          options={grades}
          disabled={!stage}
        />
      </div>

      {/* ─── المادة ─── */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-semibold"
          style={{ color: grade ? COLORS.textSecondary : '#4A5568' }}
        >
          المادة الدراسية
          <span className="mr-1 text-xs" style={{ color: COLORS.accent }}>*</span>
        </label>
        <SelectField
          value={subject}
          onChange={handleSubjectChange}
          placeholder={grade ? 'اختر المادة...' : 'اختر الصف أولاً'}
          options={subjects}
          disabled={!grade}
        />
      </div>

      {/* ─── ملاحظة جامعي ─── */}
      <p
        className="text-xs leading-relaxed"
        style={{ color: COLORS.textSecondary }}
      >
        💡 للجامعيين والمحاضرات الخاصة — استخدم وضع رفع الملف
      </p>
    </div>
  )
}

/* ═══ مكوّن Select مساعد ═══════════════════════════════════════════════════ */
function SelectField({ value, onChange, placeholder, options, disabled = false }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          backgroundColor: disabled ? '#0D1117' : '#0D1117',
          border:          `2px solid ${value ? '#FF6B35' : disabled ? '#1E2530' : '#30363D'}`,
          color:           value ? '#E6EDF3' : '#8B949E',
          fontFamily:      'Noto Sans Arabic, sans-serif',
          cursor:          disabled ? 'not-allowed' : 'pointer',
          opacity:         disabled ? 0.5 : 1,
          minHeight:       '48px',
        }}
        onFocus={(e) => {
          if (!disabled) e.target.style.borderColor = '#FF6B35'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = value ? '#FF6B35' : '#30363D'
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* سهم Dropdown */}
      <div
        className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none"
        style={{ color: value ? '#FF6B35' : '#8B949E' }}
      >
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  )
}
