// FileDropzone.jsx — منطقة رفع ملف PDF مع Drag & Drop

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

/**
 * FileDropzone
 * props:
 *   onFileSelect(base64, fileName, fileSizeMB) — يُستدعى بعد تحويل الملف
 *   maxSizeMB — الحد الأقصى للحجم
 *   disabled — تعطيل المنطقة
 */
export default function FileDropzone({ onFileSelect, maxSizeMB = 10, disabled = false }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const [converting, setConverting] = useState(false)

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        // نزيل الـ prefix "data:application/pdf;base64,"
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('فشل في قراءة الملف'))
      reader.readAsDataURL(file)
    })
  }

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      setError(null)

      // معالجة الملفات المرفوضة
      if (rejectedFiles && rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('يُقبل ملف PDF فقط')
        } else if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`حجم الملف يتجاوز الحد المسموح (${maxSizeMB} ميغا)`)
        } else {
          setError('الملف غير صالح — حاول مجدداً')
        }
        return
      }

      if (!acceptedFiles || acceptedFiles.length === 0) return

      const selectedFile = acceptedFiles[0]

      // تحقق إضافي من الحجم
      const sizeMB = selectedFile.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        setError(`حجم الملف (${sizeMB.toFixed(1)} ميغا) يتجاوز الحد المسموح (${maxSizeMB} ميغا)`)
        return
      }

      setConverting(true)
      try {
        const base64 = await convertToBase64(selectedFile)
        setFile({
          name: selectedFile.name,
          sizeMB: sizeMB.toFixed(2),
          base64,
        })
        onFileSelect(base64, selectedFile.name, sizeMB)
      } catch (err) {
        setError('فشل في معالجة الملف — حاول مجدداً')
        console.error('FileDropzone convert error:', err)
      } finally {
        setConverting(false)
      }
    },
    [maxSizeMB, onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
    disabled: disabled || converting,
  })

  const handleRemove = (e) => {
    e.stopPropagation()
    setFile(null)
    setError(null)
    onFileSelect(null, null, null)
  }

  // ألوان الحدود بحسب الحالة
  const getBorderColor = () => {
    if (error || isDragReject) return 'border-red-500'
    if (isDragActive) return 'border-[#FF6B35]'
    if (file) return 'border-green-500'
    return 'border-[#30363D] hover:border-[#FF6B35]'
  }

  const getBgColor = () => {
    if (isDragActive) return 'bg-[#FF6B35]/5'
    if (file) return 'bg-green-500/5'
    if (error) return 'bg-red-500/5'
    return 'bg-[#161B22]'
  }

  return (
    <div className="w-full" dir="rtl">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                ${getBorderColor()} ${getBgColor()}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                min-h-[180px] flex flex-col items-center justify-center gap-4 p-8
              `}
            >
              <input {...getInputProps()} />

              {converting ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[#8B949E] text-sm font-medium" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
                    جاري معالجة الملف...
                  </p>
                </div>
              ) : (
                <>
                  <motion.div
                    animate={isDragActive ? { scale: 1.15, rotate: -5 } : { scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Upload
                      className={`w-12 h-12 transition-colors duration-300 ${
                        isDragActive ? 'text-[#FF6B35]' : 'text-[#8B949E]'
                      }`}
                    />
                  </motion.div>

                  <div className="text-center">
                    <p
                      className={`font-semibold text-base transition-colors duration-300 ${
                        isDragActive ? 'text-[#FF6B35]' : 'text-[#E6EDF3]'
                      }`}
                      style={{ fontFamily: 'Cairo, sans-serif' }}
                    >
                      {isDragActive ? 'أفلت الملف هنا' : 'اسحب ملف PDF هنا أو اضغط للاختيار'}
                    </p>
                    <p className="text-[#8B949E] text-sm mt-1" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
                      PDF فقط — حتى {maxSizeMB} ميغابايت
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* رسالة الخطأ */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* حالة: ملف محدد */
          <motion.div
            key="file-selected"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="w-full rounded-2xl border-2 border-green-500/50 bg-green-500/5 p-5 flex items-center gap-4"
          >
            {/* أيقونة الملف */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-400" />
            </div>

            {/* معلومات الملف */}
            <div className="flex-1 min-w-0 text-right">
              <p
                className="text-[#E6EDF3] font-medium truncate text-sm"
                style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
              >
                {file.name}
              </p>
              <p className="text-[#8B949E] text-xs mt-0.5" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
                {file.sizeMB} ميغابايت
              </p>
            </div>

            {/* أيقونة النجاح */}
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />

            {/* زر الإزالة */}
            <button
              onClick={handleRemove}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#30363D] hover:bg-red-500/20 hover:text-red-400 text-[#8B949E] flex items-center justify-center transition-all duration-200"
              title="إزالة الملف"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
