import React, { useEffect, useMemo, useState } from 'react';
import { Nav, Card, ListGroup, Spinner, Form, Badge } from 'react-bootstrap';
import ChatRoom from './ChatRoom';
import { db } from '../../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ChatService, type ChatMessage } from '../../services/chatService';

interface ChatHubProps {
  clubId: string;
  currentUserId: string;
  currentUserName?: string;
  currentUserRole: 'coach' | 'athlete';
}

interface PersonItem {
  id: string;
  name: string;
  role: 'coach' | 'athlete';
}

const ChatHub: React.FC<ChatHubProps> = ({ clubId, currentUserId, currentUserName, currentUserRole }) => {
  const [activeTab, setActiveTab] = useState<'group' | 'private'>('group');
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [selected, setSelected] = useState<PersonItem | null>(null);
  const [search, setSearch] = useState('');
  const [lastMsgByPerson, setLastMsgByPerson] = useState<Record<string, ChatMessage | null>>({});
  const [readTsByPerson, setReadTsByPerson] = useState<Record<string, number>>({});

  const privateTabTitle = currentUserRole === 'coach' ? 'الرياضيون' : 'المدرب';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (currentUserRole === 'coach') {
          // Fetch athletes of this club
          const qy = query(collection(db, 'users'), where('role', '==', 'athlete'), where('clubId', '==', clubId));
          const snap = await getDocs(qy);
          const items: PersonItem[] = snap.docs.map(d => {
            const x = d.data() as any;
            return {
              id: d.id,
              name: (x.firstNameAr || x.firstName || '') + ' ' + (x.lastNameAr || x.lastName || ''),
              role: 'athlete',
            };
          });
          setPeople(items);
        } else {
          // athlete: fetch club's coach
          const qy = query(collection(db, 'users'), where('role', '==', 'coach'), where('clubId', '==', clubId));
          const snap = await getDocs(qy);
          const items: PersonItem[] = snap.docs.map(d => {
            const x = d.data() as any;
            return {
              id: d.id,
              name: (x.firstNameAr || x.firstName || '') + ' ' + (x.lastNameAr || x.lastName || ''),
              role: 'coach',
            };
          });
          setPeople(items);
        }
      } catch (e) {
        console.warn('Failed to load people for chat hub', e);
        setPeople([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clubId, currentUserRole]);

  const threadKey = useMemo(() => {
    if (!selected) return undefined;
    const a = currentUserRole === 'coach' ? currentUserId : selected.id;
    const b = currentUserRole === 'coach' ? selected.id : currentUserId;
    // ثابت لتوليد مفتاح موحّد
    return `coach_${a}_athlete_${b}`;
  }, [selected, currentUserId, currentUserRole]);

  // اشتراكات آخر رسالة ووقت القراءة لكل شخص في القائمة
  useEffect(() => {
    const unsubs: Array<() => void> = [];
    people.forEach((p) => {
      const a = currentUserRole === 'coach' ? currentUserId : p.id;
      const b = currentUserRole === 'coach' ? p.id : currentUserId;
      const tk = `coach_${a}_athlete_${b}`;
      // آخر رسالة
      const u1 = ChatService.subscribeLastMessage(clubId, tk, (msg) => {
        setLastMsgByPerson((prev) => ({ ...prev, [p.id]: msg }));
      });
      unsubs.push(u1);
      // وقت قراءة المستخدم الحالي
      const u2 = ChatService.subscribeThreadReadTs(clubId, tk, String(currentUserId), (ts) => {
        setReadTsByPerson((prev) => ({ ...prev, [p.id]: ts }));
      });
      unsubs.push(u2);
    });
    return () => { unsubs.forEach((f) => f && f()); };
  }, [people, clubId, currentUserId, currentUserRole]);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return people;
    return people.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  }, [people, search]);

  const formatTime = (ts?: number) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      return `${hh}:${mm}`;
    } catch { return ''; }
  };

  return (
    <div className="container my-4" dir="rtl">
      <Card className="shadow-sm">
        <Card.Header>
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab((k as any) || 'group')} className="justify-content-end">
            <Nav.Item>
              <Nav.Link eventKey="group">المجموعة</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="private">{privateTabTitle}</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          {activeTab === 'group' && (
            <ChatRoom clubId={clubId} senderId={currentUserId} senderName={currentUserName} senderRole={currentUserRole} />
          )}
          {activeTab === 'private' && (
            <div className="row">
              <div className="col-12 col-md-4 mb-3">
                <Card className="h-100">
                  <Card.Header className="bg-light">{privateTabTitle}</Card.Header>
                  <Card.Body style={{ maxHeight: 420, overflowY: 'auto' }}>
                    <Form className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder={`ابحث عن ${currentUserRole === 'coach' ? 'رياضي' : 'مدرب' }...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        dir="rtl"
                      />
                    </Form>
                    {loading ? (
                      <div className="text-center"><Spinner animation="border" /></div>
                    ) : filtered.length === 0 ? (
                      <div className="text-muted text-center">لا يوجد عناصر لعرضها</div>
                    ) : (
                      <ListGroup>
                        {filtered.map(p => {
                          const last = lastMsgByPerson[p.id];
                          const readTs = readTsByPerson[p.id] || 0;
                          const isUnread = last && last.createdAtTs && last.senderId !== currentUserId && (last.createdAtTs > readTs);
                          return (
                            <ListGroup.Item
                              key={p.id}
                              action
                              active={selected?.id === p.id}
                              onClick={() => setSelected(p)}
                              className="text-end d-flex justify-content-between align-items-start"
                            >
                              <div className="ms-2 text-start" style={{ minWidth: 72 }}>
                                {last?.createdAtTs ? <small className="text-muted">{formatTime(last.createdAtTs)}</small> : null}
                                {isUnread ? <div><Badge bg="danger">غير مقروء</Badge></div> : null}
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center justify-content-end">
                                  <i className={`fas ${p.role === 'coach' ? 'fa-user-tie' : 'fa-user'} ms-2`}></i>
                                  <strong>{p.name}</strong>
                                </div>
                                <div className="text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {last?.text ? last.text : 'لا رسائل'}
                                </div>
                              </div>
                            </ListGroup.Item>
                          );
                        })}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </div>
              <div className="col-12 col-md-8">
                {!selected ? (
                  <div className="alert alert-info text-end">اختر {currentUserRole === 'coach' ? 'رياضيًا' : 'مدربًا'} لبدء محادثة خاصة</div>
                ) : (
                  <ChatRoom clubId={clubId} senderId={currentUserId} senderName={currentUserName} senderRole={currentUserRole} threadKey={threadKey} />
                )}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ChatHub;
