import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Form, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import { CompetitionsService, ParticipationsService, LeaguesService, ClubsService } from '../../../services/firestoreService';
import type { Competition, Club, League } from '../../../types';

const CompetitionParticipationsTab: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('');
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [participations, setParticipations] = useState<Array<{ athleteId: string; clubId: string }>>([]);

  useEffect(() => {
    const loadBase = async () => {
      try {
        setLoading(true);
        const [comps, leags, cls] = await Promise.all([
          CompetitionsService.getAllCompetitions(),
          LeaguesService.getAllLeagues(),
          ClubsService.getAllClubs()
        ]);
        setCompetitions(comps);
        setLeagues(leags);
        setClubs(cls);

        if (comps.length > 0) setSelectedCompetitionId(comps[0].id);
      } catch (e) {
        console.error('Failed to load base data', e);
        setError('فشل في تحميل البيانات الأساسية');
      } finally {
        setLoading(false);
      }
    };
    loadBase();
  }, []);

  useEffect(() => {
    const loadParticipations = async () => {
      if (!selectedCompetitionId) return;
      try {
        setLoading(true);
        const parts = await ParticipationsService.getParticipationsByCompetition(selectedCompetitionId);
        // Normalize
        const arr = parts.map(p => ({ athleteId: p.athleteId, clubId: p.clubId }));
        setParticipations(arr);
      } catch (e) {
        console.error('Failed to load participations', e);
        setError('فشل في تحميل المشاركات');
      } finally {
        setLoading(false);
      }
    };
    loadParticipations();
  }, [selectedCompetitionId]);

  const clubsByLeague = useMemo(() => {
    const map: Record<string, Club[]> = {};
    clubs.forEach(c => {
      if (!c.leagueId) return;
      if (!map[c.leagueId]) map[c.leagueId] = [];
      map[c.leagueId].push(c);
    });
    return map;
  }, [clubs]);

  const aggregations = useMemo(() => {
    // { leagueId: { totalClubs: number, totalAthletes: number, clubs: { clubId: count } } }
    const byLeague: Record<string, { totalClubs: number; totalAthletes: number; clubs: Record<string, number> }> = {};

    participations.forEach(p => {
      const club = clubs.find(c => c.id === p.clubId);
      if (!club || !club.leagueId) return;
      const lid = String(club.leagueId);
      if (!byLeague[lid]) byLeague[lid] = { totalClubs: 0, totalAthletes: 0, clubs: {} };
      byLeague[lid].clubs[club.id] = (byLeague[lid].clubs[club.id] || 0) + 1;
      byLeague[lid].totalAthletes += 1;
    });

    // Count clubs per league (only those with at least one athlete)
    Object.keys(byLeague).forEach(lid => {
      byLeague[lid].totalClubs = Object.keys(byLeague[lid].clubs).length;
    });

    return byLeague;
  }, [participations, clubs]);

  const filteredLeagueIds = useMemo(() => {
    const all = Object.keys(aggregations);
    return selectedLeagueId ? all.filter(id => id === selectedLeagueId) : all;
  }, [aggregations, selectedLeagueId]);

  const leagueName = (id: string) => leagues.find(l => l.id === id)?.nameAr || `رابطة (${id})`;
  const clubName = (id: string) => clubs.find(c => c.id === id)?.nameAr || `نادي (${id})`;

  if (loading) return (
    <div className="text-center py-5"><Spinner animation="border" /><div className="mt-2">جاري التحميل...</div></div>
  );

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-secondary text-white">
        <h5 className="mb-0 text-center" dir="rtl">مشاركات البطولات</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" dir="rtl">{error}</Alert>}

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="d-block text-end" dir="rtl">اختر البطولة</Form.Label>
              <Form.Select
                value={selectedCompetitionId}
                onChange={(e) => setSelectedCompetitionId(e.target.value)}
                className="text-end"
                dir="rtl"
              >
                {competitions.map(c => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="d-block text-end" dir="rtl">تصفية حسب الرابطة</Form.Label>
              <Form.Select
                value={selectedLeagueId}
                onChange={(e) => setSelectedLeagueId(e.target.value)}
                className="text-end"
                dir="rtl"
              >
                <option value="">جميع الرابطات</option>
                {leagues.map(l => (
                  <option key={l.id} value={l.id}>{l.nameAr}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {filteredLeagueIds.length === 0 ? (
          <div className="text-center text-muted" dir="rtl">لا توجد مشاركات مسجلة</div>
        ) : (
          filteredLeagueIds.map(lid => (
            <Card className="mb-3" key={lid}>
              <Card.Header className="d-flex justify-content-between align-items-center" dir="rtl">
                <div className="fw-bold">{leagueName(lid)}</div>
                <div>
                  <Badge bg="info" className="me-2">أندية مشاركة: {aggregations[lid].totalClubs}</Badge>
                  <Badge bg="primary">عدد الرياضيين: {aggregations[lid].totalAthletes}</Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr>
                      <th className="text-center">#</th>
                      <th className="text-end">الرابطة</th>
                      <th className="text-end">النادي</th>
                      <th className="text-center">عدد الرياضيين</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(aggregations[lid].clubs)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cid, count], idx) => (
                        <tr key={cid}>
                          <td className="text-center">{idx + 1}</td>
                          <td className="text-end" dir="rtl">{leagueName(lid)}</td>
                          <td className="text-end" dir="rtl">{clubName(cid)}</td>
                          <td className="text-center">{count}</td>
                        </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))
        )}
      </Card.Body>
    </Card>
  );
};

export default CompetitionParticipationsTab;
