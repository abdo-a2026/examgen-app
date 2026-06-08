// ExamViewer.jsx — عرض ورقة الامتحان بتصميم وزاري وأنماط متعددة

import React from 'react'

/* ===================== عروض فرعية لكل نمط ===================== */

/** WizariView — هيكل وزارة التربية العراقية */
function WizariView({ questions = [], showAnswers }) {
  return (
    <div>
      {questions.map((q, qi) => (
        <div key={qi} className="mb-8">
          <div className="flex justify-between items-start mb-3">
            <span className="font-bold text-lg">
              س{qi + 1}:
              {q.marks && (
                <span className="mr-2 text-sm font-normal">({q.marks} درجة)</span>
              )}
            </span>
          </div>

          {/* الجزء A */}
          {q.partA && (
            <div className="mb-4">
              <p className="font-semibold mb-2">أ/ {q.partA.question}</p>
              {q.partA.subQuestions && q.partA.subQuestions.length > 0 && (
                <ol className="list-none pr-4 space-y-2">
                  {q.partA.subQuestions.map((sub, si) => (
                    <li key={si}>
                      <span className="font-medium">{si + 1}. </span>
                      {sub.question}
                      {showAnswers && sub.answer && (
                        <div className="mt-1 pr-4 text-green-700 border-r-2 border-green-400">
                          ✓ {sub.answer}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {showAnswers && q.partA.answer && (
                <div className="mt-2 pr-4 text-green-700 border-r-2 border-green-400">
                  ✓ {q.partA.answer}
                </div>
              )}
            </div>
          )}

          {/* الجزء B */}
          {q.partB && (
            <div className="mb-2">
              <p className="font-semibold mb-2">ب/ {q.partB.question}</p>
              {q.partB.subQuestions && q.partB.subQuestions.length > 0 && (
                <ol className="list-none pr-4 space-y-2">
                  {q.partB.subQuestions.map((sub, si) => (
                    <li key={si}>
                      <span className="font-medium">{si + 1}. </span>
                      {sub.question}
                      {showAnswers && sub.answer && (
                        <div className="mt-1 pr-4 text-green-700 border-r-2 border-green-400">
                          ✓ {sub.answer}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {showAnswers && q.partB.answer && (
                <div className="mt-2 pr-4 text-green-700 border-r-2 border-green-400">
                  ✓ {q.partB.answer}
                </div>
              )}
            </div>
          )}

          {/* سؤال بسيط بدون أجزاء */}
          {!q.partA && !q.partB && q.question && (
            <div>
              <p className="mb-2">{q.question}</p>
              {showAnswers && q.answer && (
                <div className="mt-2 pr-4 text-green-700 border-r-2 border-green-400">
                  ✓ {q.answer}
                </div>
              )}
            </div>
          )}

          {qi < questions.length - 1 && <hr className="mt-6 border-gray-300" />}
        </div>
      ))}
    </div>
  )
}

/** MCQView — اختيار من متعدد */
function MCQView({ questions = [], showAnswers }) {
  const optionLabels = ['أ', 'ب', 'ج', 'د']

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div key={qi}>
          <p className="font-semibold mb-3">
            {qi + 1}. {q.question}
          </p>
          <div className="space-y-2 pr-4">
            {(q.options || []).map((opt, oi) => {
              const isCorrect = showAnswers && (q.correctIndex === oi || q.correctAnswer === opt)
              return (
                <div
                  key={oi}
                  className={`flex items-start gap-3 p-2 rounded ${
                    isCorrect ? 'bg-green-50 text-green-800 font-medium' : ''
                  }`}
                >
                  <span className="font-bold min-w-[20px]">{optionLabels[oi]})</span>
                  <span>{opt}</span>
                  {isCorrect && <span className="mr-auto text-green-600">✓</span>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/** TrueFalseView — صح وخطأ */
function TrueFalseView({ questions = [], showAnswers }) {
  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="flex items-start gap-4">
          <span className="font-semibold min-w-[24px]">{qi + 1}.</span>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <p className="flex-1">{q.statement || q.question}</p>
              <span className="border border-gray-400 rounded px-3 py-1 min-w-[60px] text-center text-sm text-gray-500">
                ( )
              </span>
            </div>
            {showAnswers && (
              <div className="mt-1">
                {q.isTrue || q.answer === 'صح' || q.answer === true ? (
                  <span className="text-green-700 font-medium">✓ صحيحة</span>
                ) : (
                  <div>
                    <span className="text-red-700 font-medium">✗ خاطئة</span>
                    {q.correction && (
                      <span className="text-gray-700 mr-2">— التصحيح: {q.correction}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/** DefinitionsView — تعريفات ومفاهيم */
function DefinitionsView({ questions = [], showAnswers }) {
  const typeLabels = {
    define: 'عرّف',
    list: 'اذكر',
    name: 'سمِّ',
    explain: 'اشرح',
    mention: 'اذكر',
  }

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={qi}>
          <p className="font-semibold">
            {qi + 1}.{' '}
            {q.type && typeLabels[q.type] ? typeLabels[q.type] : ''}{' '}
            {q.term || q.question}:
          </p>
          {showAnswers && q.answer && (
            <div className="mt-2 pr-6 text-green-800 border-r-2 border-green-400 py-1">
              {q.answer}
            </div>
          )}
          {!showAnswers && (
            <div className="mt-2 pr-6 border-r-2 border-gray-300 h-10" />
          )}
        </div>
      ))}
    </div>
  )
}

/** AnalyticalView — علل وفسّر */
function AnalyticalView({ questions = [], showAnswers }) {
  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div key={qi}>
          <p className="font-semibold">
            {qi + 1}. {q.question}
          </p>
          {showAnswers && q.answer && (
            <div className="mt-2 pr-6 text-green-800 border-r-2 border-green-400 leading-relaxed py-1">
              {q.answer}
            </div>
          )}
          {!showAnswers && (
            <div className="mt-2 space-y-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="border-b border-gray-300 h-7" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/** ComparisonView — جداول مقارنة */
function ComparisonView({ questions = [], showAnswers }) {
  return (
    <div className="space-y-8">
      {questions.map((q, qi) => (
        <div key={qi}>
          <p className="font-semibold mb-3">
            {qi + 1}. {q.question}
          </p>
          {q.table && (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {(q.table.headers || []).map((h, hi) => (
                    <th
                      key={hi}
                      className="border border-gray-400 bg-gray-100 p-2 font-bold text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(q.table.rows || []).map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                      <td key={ci} className="border border-gray-400 p-2 text-center">
                        {showAnswers || ci === 0 ? cell : '...'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
}

/** UniversityView — جامعي */
function UniversityView({ questions = [], showAnswers }) {
  const partLabels = ['أ', 'ب', 'ج', 'د', 'هـ']

  return (
    <div className="space-y-8">
      {questions.map((q, qi) => (
        <div key={qi}>
          <div className="flex justify-between items-baseline mb-3">
            <p className="font-bold text-base">
              السؤال {qi + 1}:
            </p>
            {q.totalMarks && (
              <span className="text-sm text-gray-600">({q.totalMarks} درجة)</span>
            )}
          </div>

          {q.intro && <p className="mb-3 text-gray-700">{q.intro}</p>}

          {q.parts && q.parts.length > 0 ? (
            <div className="space-y-4 pr-4">
              {q.parts.map((part, pi) => (
                <div key={pi}>
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {partLabels[pi]}. {part.question}
                    </p>
                    {part.marks && (
                      <span className="text-sm text-gray-500">({part.marks} درجة)</span>
                    )}
                  </div>
                  {showAnswers && part.answer && (
                    <div className="mt-2 pr-6 text-green-800 border-r-2 border-green-400 py-1">
                      {part.answer}
                    </div>
                  )}
                  {!showAnswers && (
                    <div className="mt-2 space-y-1">
                      {[0, 1].map((i) => (
                        <div key={i} className="border-b border-gray-300 h-7" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="mb-2">{q.question}</p>
              {showAnswers && q.answer && (
                <div className="mt-2 pr-4 text-green-800 border-r-2 border-green-400 py-1">
                  {q.answer}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/** BankView — بنك أسئلة (مزيج) */
function BankView({ sections = [], showAnswers }) {
  const sectionTypeMap = {
    wizari: WizariView,
    mcq: MCQView,
    trueFalse: TrueFalseView,
    definitions: DefinitionsView,
    analytical: AnalyticalView,
    comparison: ComparisonView,
    university: UniversityView,
  }

  return (
    <div className="space-y-10">
      {sections.map((section, si) => {
        const SectionView = sectionTypeMap[section.type] || AnalyticalView
        return (
          <div key={si}>
            <div className="bg-gray-200 rounded px-4 py-2 mb-4">
              <h3 className="font-bold text-lg">{section.title || `القسم ${si + 1}`}</h3>
              {section.instructions && (
                <p className="text-sm text-gray-600 mt-1">{section.instructions}</p>
              )}
            </div>
            <SectionView questions={section.questions || []} showAnswers={showAnswers} />
          </div>
        )
      })}
    </div>
  )
}

/* ===================== Component الرئيسي ===================== */

/**
 * ExamViewer — يقرأ examData ويعرض العرض المناسب
 * props:
 *   examData (object) — JSON من الباك اند
 *   showAnswers (bool) — عرض الأجوبة النموذجية
 */
export default function ExamViewer({ examData, showAnswers = false }) {
  if (!examData) return null

  const {
    examType,
    subject,
    grade,
    semester,
    year,
    duration,
    totalMarks,
    instructions,
    questions = [],
    sections = [],
  } = examData

  const renderBody = () => {
    switch (examType) {
      case 'wizari':
      case 'midterm':
        return <WizariView questions={questions} showAnswers={showAnswers} />
      case 'mcq':
        return <MCQView questions={questions} showAnswers={showAnswers} />
      case 'trueFalse':
        return <TrueFalseView questions={questions} showAnswers={showAnswers} />
      case 'definitions':
        return <DefinitionsView questions={questions} showAnswers={showAnswers} />
      case 'analytical':
        return <AnalyticalView questions={questions} showAnswers={showAnswers} />
      case 'comparison':
        return <ComparisonView questions={questions} showAnswers={showAnswers} />
      case 'university':
        return <UniversityView questions={questions} showAnswers={showAnswers} />
      case 'bank':
        return <BankView sections={sections} showAnswers={showAnswers} />
      default:
        // fallback: عرض المحتوى كنص
        return (
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(examData, null, 2)}
          </div>
        )
    }
  }

  return (
    <div
      id="exam-content"
      dir="rtl"
      style={{
        fontFamily: 'Noto Sans Arabic, Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '40px',
        minHeight: '297mm',
        width: '100%',
        boxSizing: 'border-box',
        lineHeight: '1.8',
      }}
    >
      {/* ترويسة رسمية */}
      <div
        style={{
          borderBottom: '3px double #000',
          paddingBottom: '16px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '13px', marginBottom: '4px', color: '#333' }}>
          وزارة التربية العراقية
        </p>
        <h1
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '6px',
            fontFamily: 'Cairo, sans-serif',
          }}
        >
          {subject ? `امتحان مادة: ${subject}` : 'ورقة الامتحان'}
        </h1>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
            marginTop: '8px',
            padding: '0 20px',
          }}
        >
          <span>الصف: {grade || '___________'}</span>
          <span>الفصل: {semester || '___________'}</span>
          <span>المدة: {duration || '___________'}</span>
          <span>الدرجة الكاملة: {totalMarks || '___________'}</span>
        </div>
      </div>

      {/* تعليمات عامة */}
      {instructions && (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '24px',
            backgroundColor: '#f9f9f9',
            fontSize: '13px',
          }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>ملاحظة:</p>
          <p>{instructions}</p>
        </div>
      )}

      {/* جسم الامتحان */}
      <div style={{ fontSize: '14px' }}>{renderBody()}</div>

      {/* توقيع في النهاية */}
      <div
        style={{
          borderTop: '1px solid #ccc',
          marginTop: '40px',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#666',
        }}
      >
        <span>ExamGen AI — أداة تعليمية</span>
        <span>{year || new Date().getFullYear()}</span>
      </div>
    </div>
  )
}
