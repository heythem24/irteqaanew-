// ملف اختبار للتحقق من localStorage
console.log('=== فحص localStorage ===');

// فحص البيانات المحفوظة
const dynamicClubs = localStorage.getItem('dynamicClubs');
const users = localStorage.getItem('users');

console.log('البيانات في localStorage:');
console.log('dynamicClubs:', dynamicClubs ? JSON.parse(dynamicClubs) : 'غير موجود');
console.log('users:', users ? JSON.parse(users) : 'غير موجود');

// فحص جميع المفاتيح
console.log('جميع مفاتيح localStorage:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`${key}:`, localStorage.getItem(key));
}