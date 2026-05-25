import React from 'react'

/**
 * SummaryViewer — عرض الملخص بتصميم ورقي احترافي
 *
 * props:
 *   summaryData   : object  — JSON من Gemini
 *   showKeyPoints : boolean — إظهار/إخفاء النقاط الرئيسية
 *
 * هيكل summaryData:
 * {
 *   type: 'summary',
 *   subject: 'اسم المادة',
 *   targetPages: 2,
 *   sections: [
 *     { title: '...', content: '...', keyPoints: ['...', '...'] }
 *   ],
 *   finalNote: '...'
 * }
 */
export default function SummaryViewer({ summaryData, showKeyPoints }) {
  if (!summaryData) return null

  const {
    subject    = '',
    targetPages,
    sections   = [],
    finalNote,
  } = summaryData

  const pageLabel =
    targetPages === 1 ? 'صفحة واحدة'
    : targetPages === 2 ? 'صفحتان'
    : targetPages === 3 ? 'ثلاث صفحات'
    : ''

  return (
    /*
     * id="summary-content" مطلوب لـ pdfExport و imageExport
     * الخلفية بيضاء + نص أسود دائماً لضمان جودة التصدير
     */
    <div
      id="summary-content"
      dir="rtl"
      style={{
        background:  '#FFFFFF',
        color:       '#1a1a1a',
        fontFamily:  "'Noto Sans Arabic', 'Cairo', sans-serif",
        padding:     '40px 48px',
        borderRadius: '12px',
        maxWidth:    '860px',
        margin:      '0 auto',
        lineHeight:  '1.85',
        boxShadow:   '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* ─── ترويسة ─── */}
      <div
        style={{
          borderBottom: '3px solid #FF6B35',
          paddingBottom: '20px',
          marginBottom:  '36px',
          textAlign:     'center',
        }}
      >
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px', letterSpacing: '1px' }}>
          ExamGen AI — ملخص أكاديمي
        </p>

        <h1
          style={{
            fontSize:    '26px',
            fontWeight:  '800',
            color:       '#0D1117',
            margin:      '0 0 6px',
            fontFamily:  'Cairo, sans-serif',
          }}
        >
          ملخص مادة {subject}
        </h1>

        {pageLabel && (
          <span
            style={{
              display:       'inline-block',
              background:    'rgba(255,107,53,0.1)',
              color:         '#FF6B35',
              fontSize:      '13px',
              fontWeight:    '600',
              padding:       '3px 14px',
              borderRadius:  '20px',
              border:        '1px solid rgba(255,107,53,0.3)',
            }}
          >
            {pageLabel}
          </span>
        )}
      </div>

      {/* ─── المحاور ─── */}
      {sections.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888' }}>لا توجد محاور</p>
      )}

      {sections.map((section, index) => (
        <div
          key={index}
          style={{
            marginBottom: '32px',
            paddingBottom: index < sections.length - 1 ? '28px' : '0',
            borderBottom:  index < sections.length - 1 ? '1px solid #E8E8E8' : 'none',
          }}
        >
          {/* عنوان المحور */}
          <h2
            style={{
              fontSize:     '17px',
              fontWeight:   '700',
              color:        '#1a1a1a',
              marginBottom: '12px',
              paddingRight: '14px',
              borderRight:  '4px solid #FF6B35',
              lineHeight:   '1.5',
              fontFamily:   'Cairo, sans-serif',
            }}
          >
            <span style={{ color: '#FF6B35', marginLeft: '6px' }}>
              {String(index + 1).padStart(2, '0')}.
            </span>
            {section.title || ''}
          </h2>

          {/* محتوى المحور */}
          {section.content && (
            <p
              style={{
                fontSize:   '15px',
                color:      '#2d2d2d',
                marginBottom: showKeyPoints && section.keyPoints?.length ? '14px' : '0',
                textAlign:  'justify',
              }}
            >
              {section.content}
            </p>
          )}

          {/* النقاط الرئيسية */}
          {showKeyPoints && (section.keyPoints || []).length > 0 && (
            <div
              style={{
                background:   '#F7F9FC',
                border:       '1px solid #E0E4EA',
                borderRadius: '8px',
                padding:      '14px 18px',
              }}
            >
              <p
                style={{
                  fontSize:     '12px',
                  fontWeight:   '700',
                  color:        '#555',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                النقاط الرئيسية
              </p>

              <ul style={{ margin: 0, paddingRight: '0', listStyle: 'none' }}>
                {(section.keyPoints || []).map((point, pIdx) => (
                  <li
                    key={pIdx}
                    style={{
                      fontSize:     '14px',
                      color:        '#333',
                      marginBottom: '6px',
                      display:      'flex',
                      alignItems:   'flex-start',
                      gap:          '8px',
                    }}
                  >
                    <span
                      style={{
                        color:      '#FF6B35',
                        fontWeight: '700',
                        flexShrink: 0,
                        marginTop:  '2px',
                      }}
                    >
                      ◆
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* ─── ملاحظة ختامية ─── */}
      {finalNote && (
        <div
          style={{
            borderTop:   '2px solid #E0E0E0',
            paddingTop:  '18px',
            marginTop:   '8px',
            background:  '#FAFAFA',
            borderRadius: '0 0 8px 8px',
            padding:     '16px 20px',
          }}
        >
          <p style={{ fontSize: '13px', color: '#666', fontStyle: 'italic', margin: 0 }}>
            <strong style={{ color: '#444', fontStyle: 'normal' }}>ملاحظة: </strong>
            {finalNote}
          </p>
        </div>
      )}

      {/* ─── تذييل ─── */}
      <div
        style={{
          marginTop:   '32px',
          paddingTop:  '14px',
          borderTop:   '1px solid #E8E8E8',
          textAlign:   'center',
        }}
      >
        <p style={{ fontSize: '11px', color: '#AAA', margin: 0 }}>
          تم إنشاء هذا الملخص بواسطة ExamGen AI
        </p>
      </div>
    </div>
  )
}
