// src/components/exam/AnswerSheet.jsx
// ورقة الأجوبة النموذجية المنفصلة — قابلة للتصدير

import React from 'react'

/* مستخرج الإجابات من كل نمط */
function extractAnswers(examData) {
  if (!examData) return []

  const {
    examType = 'wizari',
    questions = [],
    sections = [],
  } = examData

  const answers = []

  if (examType === 'bank') {
    sections.forEach((sec) => {
      ;(sec.questions || []).forEach((q, qi) => {
        const ans = q.modelAnswer || q.answer || q.correctAnswer || ''
        const correct = q.correct
        if (ans || correct !== undefined) {
          answers.push({
            number: q.number || qi + 1,
            section: sec.sectionName || sec.title || '',
            text: q.text || q.question || q.statement || '',
            answer: ans,
            correct,
            correction: q.correction,
            explanation: q.explanation,
            type: q.type || sec.type || examType,
          })
        }
      })
    })
    return answers
  }

  questions.forEach((q, qi) => {
    const base = {
      number: q.number || qi + 1,
      section: '',
      type: examType,
    }

    if (examType === 'wizari' || examType === 'midterm') {
      // partA
      if (q.partA) {
        const subs = q.partA.subParts || q.partA.subQuestions || []
        if (subs.length > 0) {
          subs.forEach((sub, si) => {
            answers.push({
              ...base,
              number: `${base.number}أ-${si + 1}`,
              text: sub.text || sub.question || '',
              answer: sub.answer || sub.modelAnswer || '',
            })
          })
        } else {
          answers.push({
            ...base,
            number: `${base.number}أ`,
            text: q.partA.text || q.partA.question || '',
            answer: q.partA.answer || q.partA.modelAnswer || '',
          })
        }
      }
      // partB
      if (q.partB) {
        const subs = q.partB.subParts || q.partB.subQuestions || []
        subs.forEach((sub, si) => {
          answers.push({
            ...base,
            number: `${base.number}ب-${si + 1}`,
            text: sub.text || sub.question || '',
            answer: sub.answer || sub.modelAnswer || '',
          })
        })
      }
      return
    }

    if (examType === 'university') {
      ;(q.parts || []).forEach((part, pi) => {
        answers.push({
          ...base,
          number: `${base.number}${part.label || ['أ', 'ب', 'ج'][pi]}`,
          text: part.text || part.question || '',
          answer: part.modelAnswer || part.answer || '',
        })
      })
      return
    }

    answers.push({
      ...base,
      text: q.text || q.question || q.statement || q.term || '',
      answer: q.modelAnswer || q.answer || q.correctAnswer || '',
      correct: q.correct,
      correction: q.correction,
      explanation: q.explanation,
      choices: q.choices,
    })
  })

  return answers
}

/* ═══════════════════════════════════════════════════════════════
   AnswerSheet — المكوّن الرئيسي
═══════════════════════════════════════════════════════════════ */
export default function AnswerSheet({ examData }) {
  if (!examData) return null

  const answers = extractAnswers(examData)
  const subject = examData.subject || 'الامتحان'

  return (
    <div
      id="answer-sheet"
      dir="rtl"
      style={{
        fontFamily: "'Noto Sans Arabic', 'Arial', sans-serif",
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '24px 32px',
        maxWidth: '794px',
        margin: '0 auto',
        lineHeight: '1.8',
        fontSize: '14px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── ترويسة ورقة الأجوبة ── */}
      <div style={{
        borderBottom: '3px double #000',
        paddingBottom: '12px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          fontFamily: "'Cairo', sans-serif",
          marginBottom: '4px',
        }}>
          الأجوبة النموذجية
        </h1>
        <p style={{ fontSize: '14px', color: '#333' }}>مادة: {subject}</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          ExamGen AI — للاستخدام التعليمي فقط
        </p>
      </div>

      {/* ── الأجوبة ── */}
      {answers.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>لا توجد أجوبة نموذجية محفوظة</p>
      ) : (
        <div>
          {answers.map((item, i) => (
            <div key={i} style={{
              marginBottom: '16px',
              paddingBottom: '14px',
              borderBottom: i < answers.length - 1 ? '1px dashed #ccc' : 'none',
            }}>
              {/* رقم السؤال والنص */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '48px', color: '#1d4ed8' }}>
                  ({item.number})
                </span>
                <p style={{ fontWeight: '600', flex: 1, margin: 0 }}>
                  {item.section && <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '8px' }}>[{item.section}]</span>}
                  {item.text}
                </p>
              </div>

              {/* الجواب */}
              <div style={{ paddingRight: '56px' }}>
                {/* MCQ — يعرض الخيار الصحيح */}
                {item.choices && item.correct !== undefined && (
                  <div style={{ color: '#166534', fontWeight: '600' }}>
                    ✓ الجواب الصحيح: ({item.correct}){' '}
                    {typeof item.choices === 'object' && !Array.isArray(item.choices)
                      ? item.choices[item.correct] || ''
                      : ''}
                    {item.explanation && (
                      <div style={{ fontWeight: 'normal', fontSize: '13px', color: '#374151', marginTop: '2px' }}>
                        التفسير: {item.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* صح وخطأ */}
                {item.correct !== undefined && !item.choices && (
                  <div>
                    <span style={{
                      fontWeight: '600',
                      color: (item.correct === true || item.correct === 'صح') ? '#166534' : '#991b1b',
                    }}>
                      {(item.correct === true || item.correct === 'صح') ? '✓ صحيحة' : '✗ خاطئة'}
                    </span>
                    {item.correction && (
                      <span style={{ color: '#374151', marginRight: '8px', fontSize: '13px' }}>
                        — التصحيح: {item.correction}
                      </span>
                    )}
                  </div>
                )}

                {/* الجواب النصي */}
                {item.answer && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    borderRight: '4px solid #16a34a',
                    paddingRight: '12px',
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    fontSize: '13px',
                    color: '#166534',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-line',
                  }}>
                    {item.answer}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── تذييل ── */}
      <div style={{
        borderTop: '1px solid #ccc',
        marginTop: '24px',
        paddingTop: '10px',
        fontSize: '11px',
        color: '#888',
        textAlign: 'center',
      }}>
        ExamGen AI — الأجوبة النموذجية للاستخدام التعليمي فقط
      </div>
    </div>
  )
}
