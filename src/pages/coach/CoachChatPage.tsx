import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatHub from '../../components/chat/ChatHub';
import { UsersService } from '../../services/firestoreService';

const CoachChatPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [senderId, setSenderId] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const user = await UsersService.getCurrentUserWithDetails();
      if (user) {
        setSenderId(user.id);
        setSenderName(user.firstNameAr || user.firstName || 'مدرب');
      } else {
        const fallback = UsersService.getCurrentUser();
        setSenderId(fallback?.id || `coach-${Date.now()}`);
        setSenderName(fallback?.firstNameAr || fallback?.firstName || 'مدرب');
      }
    };
    load();
  }, []);

  if (!clubId) {
    return <div className="container my-4" dir="rtl"><div className="alert alert-danger">معرّف النادي غير متوفر في المسار.</div></div>;
  }

  return (
    <main className="flex-grow-1">
      {senderId ? (
        <ChatHub clubId={clubId} currentUserId={senderId} currentUserName={senderName} currentUserRole="coach" />
      ) : (
        <div className="container my-4" dir="rtl"><div className="alert alert-info">جاري تحميل هوية المستخدم…</div></div>
      )}
    </main>
  );
};

export default CoachChatPage;
