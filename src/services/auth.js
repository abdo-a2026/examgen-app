import { auth, db } from '../config/firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuthStore } from '../store/authStore'
import { useRequestsStore } from '../store/requestsStore'

// Provider مرة واحدة عند تحميل الملف
const provider = new GoogleAuthProvider()

// تسجيل الدخول بـ Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (error) {
    console.error('signInWithGoogle error:', error)
    const code = error.code || ''
    if (code.includes('popup-closed')) {
      throw new Error('أغلقت نافذة تسجيل الدخول')
    }
    if (code.includes('popup-blocked')) {
      throw new Error(
        'تم حجب النافذة المنبثقة — اسمح بالنوافذ المنبثقة في المتصفح'
      )
    }
    if (code.includes('network')) {
      throw new Error('تحقق من اتصالك بالإنترنت')
    }
    throw new Error('فشل تسجيل الدخول — حاول مجدداً')
  }
}

// تسجيل الخروج مع تصفير كل الحالة
export async function signOut() {
  try {
    await firebaseSignOut(auth)
    useAuthStore.getState().clearUser()

    // إصلاح المرحلة 6: تصفير requestsStore عند تسجيل الخروج
    useRequestsStore.getState().setRequests([])
    useRequestsStore.getState().setLastDoc(null)
    useRequestsStore.getState().setHasMore(false)
  } catch (error) {
    console.error('signOut error:', error)
    throw error
  }
}

// مستمع تغيير حالة المصادقة
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

// إنشاء المستخدم في Firestore إذا لم يكن موجوداً
export async function createUserIfNotExists(firebaseUser) {
  try {
    const ref = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      return snap.data()
    }

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      plan: 'free',
      planExpiresAt: null,
      createdAt: serverTimestamp(),
      dailyUsage: {
        count: 0,
        resetAt: serverTimestamp(),
      },
    }

    await setDoc(ref, userData)
    return userData
  } catch (error) {
    console.error('createUserIfNotExists error:', error)
    throw error
  }
}

// جلب Firebase ID Token للباك اند
export async function getFirebaseToken() {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('المستخدم غير مسجل الدخول')
    return await user.getIdToken()
  } catch (error) {
    console.error('getFirebaseToken error:', error)
    throw error
  }
}
