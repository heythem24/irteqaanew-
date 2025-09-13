import React, { useEffect, useRef, useState } from 'react';
import { ChatService, type ChatMessage } from '../../services/chatService';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface ChatRoomProps {
  clubId: string;
  senderId: string;
  senderName?: string;
  senderRole?: 'coach' | 'athlete' | 'staff' | 'unknown';
  threadKey?: string; // مفتاح المحادثة الخاصة (اختياري)
}

const ChatRoom: React.FC<ChatRoomProps> = ({ clubId, senderId, senderName, senderRole = 'unknown', threadKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [name, setName] = useState<string>(senderName || '');
  const listRef = useRef<HTMLDivElement>(null);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    // افرغ الرسائل عند تبديل الغرفة (نادي/محادثة خاصة)
    setMessages([]);
  }, [clubId, threadKey]);

  useEffect(() => {
    const unsub = ChatService.subscribeToMessages(clubId, (msg) => {
      setMessages(prev => {
        if (msg.id && prev.some((p) => p.id === msg.id)) return prev; // منع التكرار
        return [...prev, msg];
      });
    }, { threadKey });
    return () => { unsub(); };
  }, [clubId, threadKey]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthed(!!user);
      setUid(user ? user.uid : null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    const finalName = name && name.trim() ? name.trim() : 'مستخدم';
    if (!text.trim()) return;
    if (!isAuthed) {
      setSendError('لم يتم التوثيق بعد. يرجى الانتظار لحظة…');
      return;
    }
    try {
      await ChatService.sendMessage(clubId, {
        senderId,
        senderName: finalName,
        senderRole,
        text: text.trim(),
      }, { threadKey });
      setText('');
      setSendError(null);
      if (!senderName && !name) setName(finalName);
    } catch (e) {
      setSendError((e as Error)?.message || 'تعذر إرسال الرسالة.');
    }
  };

  // حدّث وقت القراءة عند فتح خيط خاص أو استقبال رسائل جديدة
  useEffect(() => {
    if (!threadKey || !uid || !isAuthed) return;
    // عند كل تحديث للرسائل حدّث قراءة المستخدم الحالي
    const now = Date.now();
    ChatService.setThreadReadTs(clubId, threadKey, uid, now).catch(() => {});
  }, [messages, threadKey, uid, isAuthed, clubId]);

  return (
    <div className="container my-4" dir="rtl">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">الدردشة</h5>
          <div className="d-flex align-items-center gap-2">
            <input
              className="form-control form-control-sm"
              placeholder="اسمك الظاهر"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: 180 }}
            />
            <span className="badge bg-light text-dark">{senderRole === 'coach' ? 'مدرب' : senderRole === 'athlete' ? 'رياضي' : 'مستخدم'}</span>
          </div>
        </div>
        <div className="card-body" style={{ height: 420, overflowY: 'auto' }} ref={listRef}>
          {!isAuthed && (
            <div className="alert alert-warning" dir="rtl">يتم الآن تهيئة الاتصال الآمن بالدردشة… يرجى الانتظار.</div>
          )}
          {messages.length === 0 ? (
            <div className="text-center text-muted">لا توجد رسائل بعد. ابدأ بالمحادثة…</div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {messages.map((m, idx) => (
                <div key={(m.id ? `${m.id}` : `local-${idx}-${m.createdAtTs || ''}`)} className={`d-flex ${m.senderId === senderId ? 'justify-content-start' : 'justify-content-end'}`}>
                  <div className={`p-2 rounded ${m.senderId === senderId ? 'bg-primary text-white' : 'bg-light border'}`} style={{ maxWidth: '75%' }}>
                    <div className="small mb-1">
                      <strong>{m.senderName || 'مستخدم'}</strong>
                      {m.senderRole && <span className="ms-2 badge bg-secondary">{m.senderRole === 'coach' ? 'مدرب' : m.senderRole === 'athlete' ? 'رياضي' : 'مستخدم'}</span>}
                    </div>
                    <div>{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card-footer">
          {sendError && <div className="alert alert-danger mb-2" dir="rtl">{sendError}</div>}
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="اكتب رسالتك…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            />
            <button className="btn btn-primary" onClick={send} disabled={!isAuthed}>إرسال</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
