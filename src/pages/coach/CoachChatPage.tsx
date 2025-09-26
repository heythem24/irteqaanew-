import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import ChatHub from '../../components/chat/ChatHub';
import { UsersService } from '../../services/firestoreService';

const CoachChatPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [senderId, setSenderId] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const navigate = useNavigate();

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
    <>
      <header className="bg-light border-bottom">
        <div className="container py-2 d-flex justify-content-between align-items-center" dir="rtl">
          <div>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-right ms-1"></i>
              عودة
            </Button>
          </div>
          <div className="text-muted small">دردشة النادي</div>
        </div>
      </header>
      <main className="flex-grow-1">
        {senderId ? (
          <ChatHub clubId={clubId} currentUserId={senderId} currentUserName={senderName} currentUserRole="coach" />
        ) : (
          <div className="container my-4" dir="rtl"><div className="alert alert-info">جاري تحميل هوية المستخدم…</div></div>
        )}
      </main>
    </>
  );
};

export default CoachChatPage;
