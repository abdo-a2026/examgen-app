// src/components/exam/ExamViewer.jsx
// عرض ورقة الامتحان بتصميم وزاري حقيقي — مُحدَّث للإصلاح 3

import React from 'react'

/* ═══════════════════════════════════════════════════════════════
   دوال مساعدة
═══════════════════════════════════════════════════════════════ */

// Fallback لأسماء المفاتيح المختلفة
function getQuestionText(q) {
  return q.text || q.question || q.statement || q.title || ''
}
function getQuestionAnswer(q) {
  return q.modelAnswer || q.answer || q.correctAnswer || ''
}
function getQuestionNumber(q, index) {
  return q.number || q.num || index + 1
}

/* ═══════════════════════════════════════════════════════════════
   ترويسة الورقة الرسمية
═══════════════════════════════════════════════════════════════ */
function ExamHeader({ examData }) {
  const {
    subject = '',
    grade   = '',
    session = 'امتحان اختبار',
    time    = 'ثلاث ساعات',
    totalMarks = 100,
    instruction = 'الإجابة عن خمسة أسئلة فقط ولكل سؤال 20 درجة',
  } = examData

  return (
    <>
      {/* ── الترويسة ثلاثية الأعمدة ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '8px',
        borderBottom: '2px solid #000',
        paddingBottom: '10px',
        marginBottom: '10px',
        fontSize: '12px',
        lineHeight: '1.7',
      }}>
        {/* يمين */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold' }}>جمهورية العراق</div>
          <div>وزارة التربية</div>
          <div>اللجنة الدائمة للامتحانات العامة</div>
          <div>{session} / {new Date().getFullYear()}-{new Date().getFullYear() - 1}</div>
        </div>

        {/* وسط — شعار مبسط */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '52px', height: '52px',
            border: '2px solid #000',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 'bold',
          }}>
            شعار
          </div>
        </div>

        {/* يسار */}
        <div style={{ textAlign: 'left' }}>
          <div>الدراسة: الإعدادية</div>
          {grade && <div>الصف: {grade}</div>}
          <div>الوقت: {time}</div>
          <div style={{ fontWeight: 'bold' }}>المادة: {subject || '___________'}</div>
        </div>
      </div>

      {/* ── اسم الطالب والرقم الامتحاني ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        border: '1px solid #000',
        padding: '6px 12px',
        marginBottom: '8px',
        fontSize: '12px',
      }}>
        <div>الرقم الامتحاني: _______________</div>
        <div>اسم الطالب: ___________________</div>
      </div>

      {/* ── ملاحظة ── */}
      <div style={{
        border: '1px solid #000',
        padding: '5px 12px',
        marginBottom: '16px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: '#f5f5f5',
      }}>
        ملاحظة: {instruction}
        {totalMarks && <span style={{ marginRight: '16px' }}>مجموع الدرجات: {totalMarks}</span>}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   WizariView — وزاري / نصف السنة
═══════════════════════════════════════════════════════════════ */
function WizariView({ questions = [], showAnswers }) {
  return (
    <div>
      {questions.map((q, qi) => {
        const qNum = getQuestionNumber(q, qi)
        const totalMarks = q.totalMarks || q.marks || 20

        // partB subParts أو subQuestions (دعم المفتاحين)
        const partBSubs = q.partB?.subParts || q.partB?.subQuestions || []
        const partBInstruction = q.partB?.instruction || q.partB?.text || ''

        return (
          <div key={qi} style={{ marginBottom: '24px' }}>
            {/* رقم السؤال والدرجة */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontSize: '15px' }}>
                س{qNum}:
              </strong>
              <span style={{ fontSize: '12px', color: '#555' }}>({totalMarks} درجة)</span>
            </div>

            {/* الجزء A */}
            {q.partA && (
              <div style={{ marginBottom: '12px', paddingRight: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: '600', marginBottom: '6px' }}>
                    أ- {q.partA.text || q.partA.question || q.partA.content || ''}
                  </p>
                  {q.partA.marks && (
                    <span style={{ fontSize: '12px', color: '#555' }}>({q.partA.marks} درجة)</span>
                  )}
                </div>

                {/* subParts أو subQuestions داخل partA */}
                {(q.partA.subParts || q.partA.subQuestions || []).map((sub, si) => (
                  <div key={si} style={{ paddingRight: '24px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{si + 1}. {sub.text || sub.question || sub.content || ''}</span>
                      {sub.marks && <span style={{ fontSize: '12px', color: '#555' }}>({sub.marks} درجة)</span>}
                    </div>
                    {showAnswers && (sub.answer || sub.modelAnswer) && (
                      <div style={{ paddingRight: '16px', color: '#166534', borderRight: '3px solid #16a34a', marginTop: '4px', fontSize: '13px' }}>
                        ✓ {sub.answer || sub.modelAnswer}
                      </div>
                    )}
                  </div>
                ))}

                {/* جواب partA المباشر */}
                {showAnswers && (q.partA.answer || q.partA.modelAnswer) && (
                  <div style={{ paddingRight: '16px', color: '#166534', borderRight: '3px solid #16a34a', marginTop: '6px', fontSize: '13px' }}>
                    ✓ {q.partA.answer || q.partA.modelAnswer}
                  </div>
                )}
              </div>
            )}

            {/* الجزء B */}
            {q.partB && (
              <div style={{ paddingRight: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>
                    ب- {partBInstruction}
                  </p>
                  {q.partB.marks && (
                    <span style={{ fontSize: '12px', color: '#555' }}>({q.partB.marks} درجة)</span>
                  )}
                </div>

                {partBSubs.map((sub, si) => (
                  <div key={si} style={{ paddingRight: '24px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{sub.number || si + 1}. {sub.text || sub.question || sub.content || ''}</span>
                      {sub.marks && <span style={{ fontSize: '12px', color: '#555' }}>({sub.marks} درجة)</span>}
                    </div>
                    {showAnswers && (sub.answer || sub.modelAnswer) && (
                      <div style={{ paddingRight: '16px', color: '#166534', borderRight: '3px solid #16a34a', marginTop: '4px', fontSize: '13px' }}>
                        ✓ {sub.answer || sub.modelAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* سؤال بسيط بدون أجزاء */}
            {!q.partA && !q.partB && (
              <div style={{ paddingRight: '16px' }}>
                <p>{getQuestionText(q)}</p>
                {showAnswers && getQuestionAnswer(q) && (
                  <div style={{ paddingRight: '16px', color: '#166534', borderRight: '3px solid #16a34a', marginTop: '6px', fontSize: '13px' }}>
                    ✓ {getQuestionAnswer(q)}
                  </div>
                )}
              </div>
            )}

            {qi < questions.length - 1 && (
              <hr style={{ borderTop: '1px dashed #ccc', marginTop: '16px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MCQView — اختيار من متعدد
═══════════════════════════════════════════════════════════════ */
function MCQView({ questions = [], showAnswers }) {
  return (
    <div style={{ lineHeight: '2' }}>
      {questions.map((q, qi) => {
        const qNum = getQuestionNumber(q, qi)
        const text = getQuestionText(q)
        // choices: كائن {أ: ..., ب: ..., ج: ..., د: ...} أو مصفوفة
        const choices = q.choices || {}
        const correct = q.correct || q.correctAnswer || ''

        const choiceEntries = typeof choices === 'object' && !Array.isArray(choices)
          ? Object.entries(choices)
          : (q.options || []).map((opt, i) => [['أ', 'ب', 'ج', 'د'][i] || i, opt])

        return (
          <div key={qi} style={{ marginBottom: '16px' }}>
            <p style={{ fontWeight: '600', marginBottom: '6px' }}>
              {qNum}. {text}
              {q.marks && <span style={{ fontSize: '12px', color: '#555', marginRight: '8px' }}>({q.marks} درجة)</span>}
            </p>
            <div style={{ paddingRight: '20px' }}>
              {choiceEntries.map(([label, value], oi) => {
                const isCorrect = showAnswers && (
                  correct === label || correct === value
                )
                return (
                  <div key={oi} style={{
                    padding: '2px 8px',
                    marginBottom: '3px',
                    borderRadius: '4px',
                    backgroundColor: isCorrect ? '#dcfce7' : 'transparent',
                    color: isCorrect ? '#166534' : 'inherit',
                    fontWeight: isCorrect ? '600' : 'normal',
                  }}>
                    {label}) {value}
                    {isCorrect && <span style={{ marginRight: '8px' }}>✓</span>}
                  </div>
                )
              })}
            </div>
            {showAnswers && q.explanation && (
              <div style={{ paddingRight: '20px', fontSize: '12px', color: '#555', marginTop: '4px' }}>
                التفسير: {q.explanation}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TrueFalseView — صح وخطأ
═══════════════════════════════════════════════════════════════ */
function TrueFalseView({ questions = [], showAnswers }) {
  return (
    <div>
      {questions.map((q, qi) => {
        const qNum = getQuestionNumber(q, qi)
        const text = getQuestionText(q)
        // correct: true/false أو 'صح'/'خطأ'
        const isTrue = q.correct === true || q.correct === 'صح' || q.correct === 'true'

        return (
          <div key={qi} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600', minWidth: '24px' }}>{qNum}.</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <p style={{ flex: 1 }}>{text}</p>
                <span style={{
                  border: '1px solid #000',
                  padding: '2px 16px',
                  minWidth: '60px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#666',
                }}>( )</span>
              </div>
              {showAnswers && (
                <div style={{ marginTop: '4px', fontSize: '13px' }}>
                  {isTrue ? (
                    <span style={{ color: '#166534', fontWeight: '600' }}>✓ صحيحة</span>
                  ) : (
                    <span>
                      <span style={{ color: '#991b1b', fontWeight: '600' }}>✗ خاطئة</span>
                      {q.correction && (
                        <span style={{ color: '#555', marginRight: '8px' }}>— التصحيح: {q.correction}</span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DefinitionsView — تعريفات ومفاهيم
═══════════════════════════════════════════════════════════════ */
function DefinitionsView({ questions = [], showAnswers }) {
  return (
    <div style={{ lineHeight: '2' }}>
      {questions.map((q, qi) => {
        const qNum  = getQuestionNumber(q, qi)
        const text  = getQuestionText(q)
        const ans   = getQuestionAnswer(q)
        const type  = q.type || 'عرّف'
        const term  = q.term || ''

        return (
          <div key={qi} style={{ marginBottom: '14px' }}>
            <p style={{ fontWeight: '600' }}>
              {qNum}. {type}: {term || text}
              {q.marks && <span style={{ fontSize: '12px', color: '#555', marginRight: '8px' }}>({q.marks} درجة)</span>}
            </p>
            {showAnswers && ans ? (
              <div style={{ paddingRight: '20px', color: '#166534', borderRight: '3px solid #16a34a', fontSize: '13px', paddingTop: '2px' }}>
                {ans}
              </div>
            ) : (
              <div style={{ paddingRight: '20px', borderRight: '3px solid #ccc', height: '32px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   AnalyticalView — علل وفسّر
═══════════════════════════════════════════════════════════════ */
function AnalyticalView({ questions = [], showAnswers }) {
  return (
    <div style={{ lineHeight: '2' }}>
      {questions.map((q, qi) => {
        const qNum = getQuestionNumber(q, qi)
        const text = getQuestionText(q)
        const ans  = getQuestionAnswer(q)

        return (
          <div key={qi} style={{ marginBottom: '16px' }}>
            <p style={{ fontWeight: '600' }}>
              {qNum}. {text}
              {q.marks && <span style={{ fontSize: '12px', color: '#555', marginRight: '8px' }}>({q.marks} درجة)</span>}
            </p>
            {showAnswers && ans ? (
              <div style={{ paddingRight: '20px', color: '#166534', borderRight: '3px solid #16a34a', fontSize: '13px', lineHeight: '1.8', paddingTop: '2px' }}>
                {ans}
              </div>
            ) : (
              <div>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ borderBottom: '1px solid #ccc', height: '28px', marginRight: '20px' }} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ComparisonView — جداول مقارنة
═══════════════════════════════════════════════════════════════ */
function ComparisonView({ questions = [], showAnswers }) {
  return (
    <div>
      {questions.map((q, qi) => {
        const qNum = getQuestionNumber(q, qi)
        const text = getQuestionText(q)

        return (
          <div key={qi} style={{ marginBottom: '24px' }}>
            <p style={{ fontWeight: '600', marginBottom: '10px' }}>
              {qNum}. {text}
              {q.marks && <span style={{ fontSize: '12px', color: '#555', marginRight: '8px' }}>({q.marks} درجة)</span>}
            </p>
            {q.table && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>
                    {(q.table.headers || []).map((h, hi) => (
                      <th key={hi} style={{
                        border: '1px solid #000',
                        backgroundColor: '#e5e7eb',
                        padding: '6px 10px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(q.table.rows || []).map((row, ri) => (
                    <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                        <td key={ci} style={{
                          border: '1px solid #000',
                          padding: '6px 10px',
                          textAlign: 'center',
                        }}>
                          {showAnswers || ci === 0 ? cell : '...'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   UniversityView — جامعي
═══════════════════════════════════════════════════════════════ */
function UniversityView({ questions = [], showAnswers }) {
  return (
    <div>
      {questions.map((q, qi) => {
        const qNum = getQuestionNumber(q, qi)

        return (
          <div key={qi} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong style={{ fontSize: '15px' }}>السؤال {qNum}:</strong>
              {q.totalMarks && <span style={{ fontSize: '12px', color: '#555' }}>({q.totalMarks} درجة)</span>}
            </div>

            {q.intro && <p style={{ marginBottom: '10px', color: '#374151' }}>{q.intro}</p>}

            {q.parts && q.parts.length > 0 ? (
              <div style={{ paddingRight: '16px' }}>
                {q.parts.map((part, pi) => {
                  const partText = part.text || part.question || part.content || ''
                  const partAns  = part.modelAnswer || part.answer || ''
                  const label    = part.label || ['أ', 'ب', 'ج', 'د'][pi] || `${pi + 1}`

                  return (
                    <div key={pi} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontWeight: '600' }}>{label}. {partText}</p>
                        {part.marks && <span style={{ fontSize: '12px', color: '#555' }}>({part.marks} درجة)</span>}
                      </div>
                      {part.type && <span style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>({part.type})</span>}
                      {showAnswers && partAns ? (
                        <div style={{ paddingRight: '16px', color: '#166534', borderRight: '3px solid #16a34a', fontSize: '13px', paddingTop: '2px' }}>
                          {partAns}
                        </div>
                      ) : (
                        <div>
                          {[0, 1].map((i) => (
                            <div key={i} style={{ borderBottom: '1px solid #ccc', height: '28px', marginRight: '16px' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div>
                <p>{getQuestionText(q)}</p>
                {showAnswers && getQuestionAnswer(q) && (
                  <div style={{ paddingRight: '16px', color: '#166534', borderRight: '3px solid #16a34a', fontSize: '13px', marginTop: '6px' }}>
                    {getQuestionAnswer(q)}
                  </div>
                )}
              </div>
            )}

            {qi < questions.length - 1 && <hr style={{ borderTop: '1px dashed #ccc', marginTop: '16px' }} />}
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BankView — بنك أسئلة
═══════════════════════════════════════════════════════════════ */
function BankView({ sections = [], showAnswers }) {
  const viewMap = {
    wizari:      WizariView,
    mcq:         MCQView,
    trueFalse:   TrueFalseView,
    definitions: DefinitionsView,
    analytical:  AnalyticalView,
    comparison:  ComparisonView,
    university:  UniversityView,
  }

  return (
    <div>
      {sections.map((section, si) => {
        // دعم المفتاحين: type من كل question أو من الـ section نفسها
        const firstQ    = (section.questions || [])[0] || {}
        const sectionType = section.type || firstQ.type || 'analytical'
        const SectionView = viewMap[sectionType] || AnalyticalView

        return (
          <div key={si} style={{ marginBottom: '28px' }}>
            <div style={{
              backgroundColor: '#e5e7eb',
              borderRadius: '6px',
              padding: '8px 14px',
              marginBottom: '14px',
            }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '15px', margin: 0 }}>
                {section.sectionName || section.title || `القسم ${si + 1}`}
              </h3>
              {section.marksPerQuestion && (
                <p style={{ fontSize: '12px', color: '#555', margin: '2px 0 0' }}>
                  ({section.marksPerQuestion} درجة لكل سؤال)
                </p>
              )}
            </div>
            <SectionView questions={section.questions || []} showAnswers={showAnswers} />
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ExamViewer — المكوّن الرئيسي
═══════════════════════════════════════════════════════════════ */
export default function ExamViewer({ examData, showAnswers = false }) {
  if (!examData) return null

  const {
    examType = 'wizari',
    questions = [],
    sections  = [],
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
        return (
          <pre style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(examData, null, 2)}
          </pre>
        )
    }
  }

  return (
    <div
      id="exam-content"
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
      {/* ── الترويسة الرسمية ── */}
      <ExamHeader examData={examData} />

      {/* ── جسم الأسئلة ── */}
      <div style={{ fontSize: '14px' }}>
        {renderBody()}
      </div>

      {/* ── تذييل ── */}
      <div style={{
        borderTop: '1px solid #ccc',
        marginTop: '32px',
        paddingTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#888',
      }}>
        <span>ExamGen AI — أداة تعليمية</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </div>
  )
}
