import { ref, onChildAdded, push, serverTimestamp, query, orderByChild, limitToLast, type Unsubscribe as RTUnsubscribe, onValue, set } from 'firebase/database';
import { realtimeDb, auth } from '../config/firebase';

export type ChatMessage = {
  id?: string;
  senderId: string;
  senderUid?: string; // uid من Firebase Auth للتحقق الأمني
  senderName?: string;
  senderRole?: 'coach' | 'athlete' | 'staff' | 'unknown';
  text: string;
  createdAt?: number | object; // server timestamp placeholder
  createdAtTs?: number; // local timestamp for ordering
};

export class ChatService {
  static roomBase(clubId: string, threadKey?: string) {
    return threadKey
      ? ref(realtimeDb, `chatRooms/${clubId}/dm/${threadKey}`)
      : ref(realtimeDb, `chatRooms/${clubId}`);
  }

  static messagesQuery(clubId: string, threadKey?: string) {
    const base = threadKey
      ? `chatRooms/${clubId}/dm/${threadKey}/messages`
      : `chatRooms/${clubId}/messages`;
    // استخدم createdAtTs للترتيب الفوري + serverTimestamp للتوافق
    return query(ref(realtimeDb, base), orderByChild('createdAtTs'), limitToLast(200));
  }

  static subscribeToMessages(
    clubId: string,
    onNew: (msg: ChatMessage) => void,
    options?: { threadKey?: string }
  ): RTUnsubscribe {
    const q = this.messagesQuery(clubId, options?.threadKey);
    const unsub = onChildAdded(q, (snap) => {
      const val = snap.val() as ChatMessage;
      onNew({ ...val, id: snap.key || undefined });
    });
    return unsub;
  }

  static async sendMessage(
    clubId: string,
    msg: Omit<ChatMessage, 'id' | 'createdAt'>,
    options?: { threadKey?: string }
  ) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('غير موثّق. يرجى إعادة المحاولة بعد ثوانٍ.');
    }
    const path = options?.threadKey
      ? `chatRooms/${clubId}/dm/${options.threadKey}/messages`
      : `chatRooms/${clubId}/messages`;
    const messagesRef = ref(realtimeDb, path);
    await push(messagesRef, {
      ...msg,
      senderUid: user.uid,
      createdAt: serverTimestamp(),
      createdAtTs: Date.now(),
    });
  }

  // آخر رسالة في خيط خاص (للإظهار في القائمة)
  static subscribeLastMessage(
    clubId: string,
    threadKey: string,
    onLast: (msg: ChatMessage | null) => void
  ): RTUnsubscribe {
    const q = query(ref(realtimeDb, `chatRooms/${clubId}/dm/${threadKey}/messages`), orderByChild('createdAtTs'), limitToLast(1));
    return onChildAdded(q, (snap) => {
      const val = snap.val() as ChatMessage;
      onLast({ ...val, id: snap.key || undefined });
    });
  }

  // مؤشر القراءة: يخزن لكل مستخدم آخر وقت قراءة للخيط الخاص
  static subscribeThreadReadTs(
    clubId: string,
    threadKey: string,
    uid: string,
    onReadTs: (ts: number) => void
  ): RTUnsubscribe {
    const r = ref(realtimeDb, `chatRooms/${clubId}/dm/${threadKey}/reads/${uid}/lastReadTs`);
    return onValue(r, (snap) => {
      const v = snap.val();
      onReadTs(typeof v === 'number' ? v : 0);
    });
  }

  static async setThreadReadTs(
    clubId: string,
    threadKey: string,
    uid: string,
    ts: number
  ): Promise<void> {
    const r = ref(realtimeDb, `chatRooms/${clubId}/dm/${threadKey}/reads/${uid}/lastReadTs`);
    await set(r, ts);
  }
}
