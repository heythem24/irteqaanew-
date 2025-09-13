@echo off
echo ========================================
echo نشر فهارس Firestore تلقائياً
echo ========================================

echo.
echo الخطوة 1: التحقق من تثبيت Firebase CLI...
firebase --version
if %errorlevel% neq 0 (
    echo تثبيت Firebase CLI...
    npm install -g firebase-tools
)

echo.
echo الخطوة 2: تسجيل الدخول إلى Firebase...
firebase login

echo.
echo الخطوة 3: ربط المشروع...
firebase use irteqaanew

echo.
echo الخطوة 4: نشر الفهارس...
firebase deploy --only firestore:indexes

echo.
echo ========================================
echo تم نشر الفهارس بنجاح!
echo ========================================
pause
