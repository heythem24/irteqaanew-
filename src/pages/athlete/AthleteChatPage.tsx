import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatHub from '../../components/chat/ChatHub';
import { UsersService } from '../../services/firestoreService';

const AthleteChatPage: React.FC = () => {
  const { clubId, athleteId } = useParams<{ clubId: string; athleteId: string }>();
  const [senderId, setSenderId] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const user = await UsersService.getCurrentUserWithDetails();
      if (user) {
        setSenderId(user.id);
        setSenderName(user.firstNameAr || user.firstName || 'رياضي');
      } else {
        const fallback = UsersService.getCurrentUser();
        setSenderId(fallback?.id || athleteId || `athlete-${Date.now()}`);
        setSenderName(fallback?.firstNameAr || fallback?.firstName || 'رياضي');
      }
    };
    load();
  }, [athleteId]);

  if (!clubId) {
    return <div className="container my-4" dir="rtl"><div className="alert alert-danger">معرّف النادي غير متوفر في المسار.</div></div>;
  }

  return (
    <main className="flex-grow-1">
      {senderId ? (
        <ChatHub clubId={clubId} currentUserId={senderId} currentUserName={senderName} currentUserRole="athlete" />
      ) : (
        <div className="container my-4" dir="rtl"><div className="alert alert-info">جاري تحميل هوية المستخدم…</div></div>
      )}
    </main>
  );
};

export default AthleteChatPage;
