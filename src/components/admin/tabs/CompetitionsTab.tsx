import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  Table, 
  Row, 
  Col, 
  Alert, 
  Spinner, 
  Badge,
  Modal
} from 'react-bootstrap';
import { CompetitionsService, LeaguesService, ParticipationsService, UsersService, ClubsService, PairingsService, CompetitionOrganizersService } from '../../../services/firestoreService';
import { uploadToCloudinary } from '../../../services/cloudinaryService';
import type { Competition, League, CompetitionStatus, CompetitionLevel, User, Club, CompetitionOrganizer, OrganizerRole, PairMatch } from '../../../types';
import { CATEGORIES } from '../../../utils/categoryUtils';

const CompetitionsTab: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    leagueId: '',
    place: '',
    placeAr: '',
    description: '',
    descriptionAr: '',
    level: 'league' as CompetitionLevel,
    wilayaId: '',
    startDate: '',
    endDate: '',
    status: 'upcoming' as CompetitionStatus,
    categories: [] as string[],
    weights: {} as Record<string, { male: string[]; female: string[] }>,
    image: ''
    ,
    registrationDeadline: ''
  });

  // UI state
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompetitions, setLoadingCompetitions] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [competitionToDelete, setCompetitionToDelete] = useState<string | null>(null);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  // Pairings state
  const [showPairingsModal, setShowPairingsModal] = useState(false);
  const [pairingCompetition, setPairingCompetition] = useState<Competition | null>(null);
  const [loadingPairings, setLoadingPairings] = useState(false);
  const [participantsForPairing, setParticipantsForPairing] = useState<Array<{ athlete: User; club?: Club }>>([]);
  const [generatedMatches, setGeneratedMatches] = useState<PairMatch[]>([]);
  const [leaguesMap, setLeaguesMap] = useState<Record<string, League>>({});
  // Organizers modal state
  const [showOrganizersModal, setShowOrganizersModal] = useState(false);
  const [orgCompetition, setOrgCompetition] = useState<Competition | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [organizers, setOrganizers] = useState<CompetitionOrganizer[]>([]);
  const [orgForm, setOrgForm] = useState<{ username: string; password: string; role: OrganizerRole | ''; mat?: 1 | 2 | 3 }>({ username: '', password: '', role: '' });

  // الفئات المطابقة لصفحة المدرب
  const availableCategories = [
    'مصغر',
    'براعم صغار',
    'براعم', 
    'أصاغر',
    'صغار',
    'ناشئين',
    'أواسط',
    'أكابر'
  ];

  // Load data on mount
  useEffect(() => {
    loadCompetitions();
    loadLeagues();
  }, []);

  const loadCompetitions = async () => {
    try {
      setLoadingCompetitions(true);
      const data = await CompetitionsService.getAllCompetitions();
      setCompetitions(data);
    } catch (error) {
      console.error('Error loading competitions:', error);
      setAlert({ type: 'danger', message: 'فشل في تحميل البطولات' });
    } finally {
      setLoadingCompetitions(false);
    }
  };

  // Organizers handlers
  const openOrganizersModal = async (comp: Competition) => {
    setOrgCompetition(comp);
    setShowOrganizersModal(true);
    await loadOrganizers(comp.id);
  };

  const loadOrganizers = async (competitionId: string) => {
    try {
      setOrgLoading(true);
      const items = await CompetitionOrganizersService.listByCompetition(competitionId);
      setOrganizers(items);
    } catch (e) {
      console.error('Failed to load organizers:', e);
      setAlert({ type: 'danger', message: 'فشل في تحميل منظمي البطولة' });
    } finally {
      setOrgLoading(false);
    }
  };

  const handleCreateOrganizer = async () => {
    if (!orgCompetition) return;
    if (!orgForm.username || !orgForm.password || !orgForm.role) {
      setAlert({ type: 'danger', message: 'يرجى ملء اسم المستخدم وكلمة المرور واختيار الدور' });
      return;
    }
    if (orgForm.role === 'table_official' && !orgForm.mat) {
      setAlert({ type: 'danger', message: 'يرجى اختيار البساط لمسؤول الطاولة' });
      return;
    }
    try {
      setOrgLoading(true);
      await CompetitionOrganizersService.createOrganizer({
        competitionId: orgCompetition.id,
        username: orgForm.username,
        password: orgForm.password,
        role: orgForm.role as OrganizerRole,
        mat: orgForm.role === 'table_official' ? (orgForm.mat as 1|2|3) : undefined,
        isActive: true
      } as any);
      setOrgForm({ username: '', password: '', role: '' });
      await loadOrganizers(orgCompetition.id);
      setAlert({ type: 'success', message: 'تم إضافة المنظم بنجاح' });
    } catch (e) {
      console.error('Failed to create organizer:', e);
      setAlert({ type: 'danger', message: 'فشل في إضافة المنظم' });
    } finally {
      setOrgLoading(false);
    }
  };

  const handleDeleteOrganizer = async (id: string) => {
    if (!orgCompetition) return;
    try {
      setOrgLoading(true);
      await CompetitionOrganizersService.deleteOrganizer(id);
      await loadOrganizers(orgCompetition.id);
      setAlert({ type: 'success', message: 'تم حذف المنظم' });
    } catch (e) {
      console.error('Failed to delete organizer:', e);
      setAlert({ type: 'danger', message: 'فشل في حذف المنظم' });
    } finally {
      setOrgLoading(false);
    }
  };

  // Open Pairings Modal
  const openPairingsModal = async (comp: Competition) => {
    try {
      setPairingCompetition(comp);
      setShowPairingsModal(true);
      setLoadingPairings(true);
      const [parts, users, clubs, leagues] = await Promise.all([
        ParticipationsService.getParticipationsByCompetition(comp.id),
        UsersService.getAllUsers(),
        ClubsService.getAllClubs(),
        LeaguesService.getAllLeagues()
      ]);
      const clubsMap = new Map<string, Club>();
      clubs.forEach((c: Club) => clubsMap.set(c.id, c));
      const usersMap = new Map<string, User>();
      users.forEach((u: User) => usersMap.set(u.id, u));
      const rows: Array<{ athlete: User; club?: Club }> = [];
      parts.forEach((p) => {
        const a = usersMap.get(p.athleteId);
        if (!a) return;
        rows.push({ athlete: a, club: a.clubId ? clubsMap.get(a.clubId) : undefined });
      });
      setParticipantsForPairing(rows);
      setGeneratedMatches([]);
      const lmap: Record<string, League> = {};
      leagues.forEach((l: League) => { lmap[l.id] = l; });
      setLeaguesMap(lmap);
    } catch (e) {
      console.error('Failed to load participants for pairing:', e);
      setAlert({ type: 'danger', message: 'فشل في تحميل المشاركين لهذه البطولة' });
    } finally {
      setLoadingPairings(false);
    }
  };

  // ملاحظة: تمت إزالة دالة shuffleArray غير المستخدمة

  // توليد شجرة أدوار كاملة مع احتساب الـ Bye والوصل بين المباريات
  const generatePairings = () => {
    // يمكن مستقبلاً تمرير ترتيب (Seeding) كمصفوفة معرفات رياضيين لتُمنح الـ Byes للأعلى تصنيفاً
    const seeding: string[] = []; // TODO: ربط لاحقاً من الواجهة الإدارية عند توفر التصنيف

    // انسخ ثم اخلط القائمة (إن لم يوجد تصنيف)
    const list = participantsForPairing.slice();
    if (seeding.length === 0) {
      // لا يوجد تصنيف -> قرعة عشوائية كاملة
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    } else {
      // يوجد تصنيف -> ضع الرياضيين حسب الترتيب، والبقية بعدها (مع خلط فرعي للبقية)
      const seededSet = new Set(seeding);
      const seeded = list.filter(x => seededSet.has(x.athlete.id));
      const others = list.filter(x => !seededSet.has(x.athlete.id));
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }
      list.splice(0, list.length, ...seeded, ...others);
    }

    const N = list.length;
    if (N === 0) {
      setGeneratedMatches([]);
      return;
    }
    // اختر الهدف T = أكبر قوة للعدد 2 بحيث T <= N (نقلل إلى T عبر تصفيات تمهيدية)
    let T = 1; while ((T << 1) <= N) T <<= 1; // 2,4,8,16...
    const prelimCount = N - T; // عدد مباريات التصفيات = N - T
    // الجولات: إن كان هناك تصفيات، تبدأ بـ prelimCount ثم T/2 ... 1
    const roundCounts: number[] = [];
    if (prelimCount > 0) roundCounts.push(prelimCount);
    { let c = T >> 1; while (c >= 1) { roundCounts.push(c); c >>= 1; } }

    // إجمالي مباريات الشجرة الرئيسية + التصفيات
    const totalMatches = (T - 1) + prelimCount;
    const matches: PairMatch[] = new Array(totalMatches);
    const baseIndexPerRound: number[] = [];
    let cursor = 0;
    for (let rIdx = 0; rIdx < roundCounts.length; rIdx++) {
      baseIndexPerRound[rIdx] = cursor;
      const count = roundCounts[rIdx];
      for (let pos = 0; pos < count; pos++) {
        const globalIndex = cursor + pos;
        // حساب nextIndex/nextSlot
        let nextIndex: number | undefined;
        let nextSlot: 1 | 2 | undefined;
        if (prelimCount > 0 && rIdx === 0) {
          // كل مباراة تصفية تتجه مباشرة إلى المباراة المناظرة في الدور الرئيسي الأول في الخانة 1
          nextIndex = (roundCounts.length > 1) ? (cursor + count) + pos : undefined; // baseIndexPerRound[1] يساوي cursor+count هنا
          nextSlot = 1;
        } else {
          nextIndex = rIdx < roundCounts.length - 1 ? (baseIndexPerRound[rIdx + 1] ?? (cursor + count)) + Math.floor(pos / 2) : undefined;
          nextSlot = (rIdx < roundCounts.length - 1) ? ((pos % 2 === 0) ? 1 : 2) : undefined;
        }
        // from1/from2: من الجولة السابقة
        let from1: number | undefined;
        let from2: number | undefined;
        if (rIdx > 0) {
          const prevBase = baseIndexPerRound[rIdx - 1];
          if (prelimCount > 0 && rIdx === 1) {
            // الدور الرئيسي الأول: أول prelimCount مباريات تأتي من التصفيات 1:1 في from1
            if (pos < prelimCount) {
              from1 = baseIndexPerRound[0] + pos;
              from2 = undefined; // الطرف الثاني لاعب مباشر
            } else {
              // بقية المباريات تأتي من نفس الدور السابق (الدور الرئيسي لا يوجد قبله تصفيات لهذه المواقع)
              from1 = undefined;
              from2 = undefined;
            }
          } else {
            // ربط قياسي 2->1 للأدوار اللاحقة
            from1 = prevBase + (pos * 2);
            from2 = prevBase + (pos * 2 + 1);
          }
        }
        matches[globalIndex] = {
          athlete1Id: '',
          athlete2Id: undefined,
          mat: undefined,
          status: 'pending',
          winnerId: null,
          round: rIdx + 1,
          nextIndex,
          nextSlot,
          from1,
          from2,
        } as PairMatch;
      }
      cursor += count;
    }
    const maxRound = roundCounts.length; // النهائي هو round = maxRound (قد يزيد بوجود تصفيات)

    // دورة البسطات 1 -> 2 -> 3 -> 1 -> ...
    const nextMat = (() => {
      let idx = 0;
      const mats: Array<1 | 2 | 3> = [1, 2, 3];
      return () => {
        const m = mats[idx];
        idx = (idx + 1) % mats.length;
        return m;
      };
    })();
    // قسم اللاعبين: تصفيات وتمرير مباشر للدور الرئيسي الأول
    const pool = list.slice();
    const prelimPlayers = pool.splice(0, prelimCount * 2); // 2 لكل مباراة تصفية
    // أنشئ مباريات التصفيات (إن وجدت)
    if (prelimCount > 0) {
      const prelimBase = baseIndexPerRound[0];
      for (let i = 0; i < prelimCount; i++) {
        const a = prelimPlayers[i * 2];
        const b = prelimPlayers[i * 2 + 1];
        const gIdx = prelimBase + i;
        matches[gIdx].athlete1Id = a?.athlete.id || '';
        matches[gIdx].athlete2Id = b?.athlete.id || '';
        matches[gIdx].mat = nextMat();
        matches[gIdx].status = 'pending';
        matches[gIdx].winnerId = null;
      }
    }

    // ملء مباريات الدور الرئيسي الأول:
    const mainR1Index = prelimCount > 0 ? 1 : 0;
    const r1Base = baseIndexPerRound[mainR1Index];
    const r1Count = roundCounts[mainR1Index];
    let directIdx = 0;
    for (let pos = 0; pos < r1Count; pos++) {
      const gIdx = r1Base + pos;
      if (prelimCount > 0 && pos < prelimCount) {
        // هذا المكان يستقبل فائز تصفية في خانة 1، والخانة الأخرى لاعب مباشر
        // الربط تم بالفعل عند بناء الشجرة: from1 لهذه المباراة و nextIndex للتصفية
        // ضع اللاعب المباشر في الخانة الثانية
        const direct = pool[directIdx++];
        if (direct) matches[gIdx].athlete2Id = direct.athlete.id;
        matches[gIdx].mat = matches[gIdx].mat ?? nextMat();
      } else {
        // مباراة بين لاعبين مباشرين
        const a = pool[directIdx++];
        const b = pool[directIdx++];
        if (a) matches[gIdx].athlete1Id = a.athlete.id;
        if (b) matches[gIdx].athlete2Id = b.athlete.id;
        matches[gIdx].mat = matches[gIdx].mat ?? nextMat();
      }
      matches[gIdx].status = 'pending';
      matches[gIdx].winnerId = null;
    }

    // أضف مباراة البرونزية بين خاسري نصف النهائي إن وُجد نهائي (P >= 4)
    if (T >= 4 && maxRound >= 2) {
      const semiBase = baseIndexPerRound[maxRound - 2];
      const semiCount = roundCounts[maxRound - 2]; // يجب أن تكون 2
      const bronzeIndex = matches.length;
      matches.push({
        athlete1Id: '',
        athlete2Id: undefined,
        status: 'pending',
        winnerId: null,
        round: maxRound, // نفس رقم النهائي لأغراض الترتيب، لكن بفصل stage
        stage: 'bronze',
        from1: semiBase + 0,
        from2: semiBase + 1
      } as PairMatch);
      for (let s = 0; s < semiCount; s++) {
        const sIdx = semiBase + s;
        matches[sIdx].loserNextIndex = bronzeIndex;
        matches[sIdx].loserNextSlot = (s === 0 ? 1 : 2);
      }
      // اضبط البُسُط للنهائي والبرونزية بحيث يلعبان بالتوازي
      const finalIndex = baseIndexPerRound[maxRound - 1]; // النهائي فهرسه ثابت في آخر جولة
      if (typeof finalIndex === 'number' && matches[finalIndex]) {
        matches[finalIndex].mat = 1; // النهائي على البساط 1
      }
      if (matches[bronzeIndex]) {
        // اجعل البرونزية على بساط مختلف عن النهائي
        const finalMat = matches[finalIndex]?.mat || 1;
        matches[bronzeIndex].mat = finalMat === 1 ? 2 : 1;
      }
    }

    // توزيع البُسط على كل المباريات التي لم تُحدد بعد (مثل ربع النهائي/نصف النهائي)
    const rr = (() => {
      let idx = 0;
      const mats: Array<1 | 2 | 3> = [1, 2, 3];
      return () => {
        const m = mats[idx];
        idx = (idx + 1) % mats.length;
        return m;
      };
    })();
    for (let rIdx = 0; rIdx < roundCounts.length; rIdx++) {
      const base = baseIndexPerRound[rIdx];
      const count = roundCounts[rIdx];
      for (let pos = 0; pos < count; pos++) {
        const gi = base + pos;
        if (!matches[gi].mat) {
          matches[gi].mat = rr();
        }
      }
    }

    setGeneratedMatches(matches);
  };

  const savePairings = async () => {
    if (!pairingCompetition) return;
    try {
      if (generatedMatches.length === 0) {
        setAlert({ type: 'danger', message: 'لم يتم توليد قرعة بعد' });
        return;
      }
      setLoadingPairings(true);
      await PairingsService.createOrReplacePairings(pairingCompetition.id, generatedMatches);
      setAlert({ type: 'success', message: 'تم حفظ القرعة بنجاح' });
    } catch (e) {
      console.error('Failed to save pairings:', e);
      setAlert({ type: 'danger', message: 'فشل في حفظ القرعة' });
    } finally {
      setLoadingPairings(false);
    }
  };

  // تنسيق التاريخ بشكل آمن مهما كان النوع (Date أو string أو undefined)
  const formatDateAr = (value: unknown): string => {
    try {
      if (!value) return '-';
      const d = value instanceof Date ? value : new Date(value as any);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('ar-DZ');
    } catch {
      return '-';
    }
  };

  const loadLeagues = async () => {
    try {
      const data = await LeaguesService.getAllLeagues();
      setLeagues(data);
    } catch (error) {
      console.error('Error loading leagues:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
    // عند إزالة فئة احذف أوزانها
    if (!checked) {
      setFormData(prev => {
        const next = { ...prev } as any;
        if (next.weights) {
          const w = { ...next.weights };
          delete w[category];
          next.weights = w;
        }
        return next;
      });
    }
  };

  const getWeightsForCategory = (categoryAr: string) => {
    const spec = CATEGORIES.find(c => c.nameAr === categoryAr);
    return spec?.weights || { male: [], female: [] };
  };

  const toggleWeight = (categoryAr: string, gender: 'male' | 'female', weight: string, checked: boolean) => {
    setFormData(prev => {
      const current = prev.weights?.[categoryAr] || { male: [], female: [] };
      const list = new Set(current[gender]);
      if (checked) list.add(weight); else list.delete(weight);
      const updated = { ...prev.weights, [categoryAr]: { ...current, [gender]: Array.from(list) } };
      return { ...prev, weights: updated };
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const result = await uploadToCloudinary(file, { folder: 'competitions' });
      // Debug: طباعة رابط الصورة النهائية
      console.debug('Cloudinary upload (competitions):', result);
      setFormData(prev => ({ ...prev, image: result.secure_url }));
      setAlert({ type: 'success', message: 'تم رفع الصورة بنجاح' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setAlert({ type: 'danger', message: 'فشل في رفع الصورة' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nameAr || !formData.startDate || !formData.endDate) {
      setAlert({ type: 'danger', message: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    try {
      setLoading(true);
      
      const competitionData: Omit<Competition, 'id' | 'createdAt'> = {
        name: formData.name || formData.nameAr,
        nameAr: formData.nameAr,
        leagueId: formData.leagueId || undefined,
        place: formData.place || undefined,
        placeAr: formData.placeAr || undefined,
        description: formData.description || undefined,
        descriptionAr: formData.descriptionAr || undefined,
        level: formData.level || undefined,
        wilayaId: formData.wilayaId ? Number(formData.wilayaId) : undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline) : undefined,
        status: formData.status,
        categories: formData.categories,
        weights: Object.keys(formData.weights || {}).length ? formData.weights : undefined,
        image: formData.image || undefined,
        isActive: true
      };

      if (editingCompetition) {
        await CompetitionsService.updateCompetition(editingCompetition.id, competitionData);
        setAlert({ type: 'success', message: 'تم تحديث البطولة بنجاح' });
        setEditingCompetition(null);
      } else {
        await CompetitionsService.createCompetition(competitionData);
        setAlert({ type: 'success', message: 'تم إنشاء البطولة بنجاح' });
      }

      // Reset form
      setFormData({
        name: '',
        nameAr: '',
        leagueId: '',
        place: '',
        placeAr: '',
        description: '',
        descriptionAr: '',
        level: 'league',
        wilayaId: '',
        startDate: '',
        endDate: '',
        status: 'upcoming',
        categories: [],
        weights: {},
        image: ''
        ,
        registrationDeadline: ''
      });
      
      // Reload competitions
      loadCompetitions();
    } catch (error) {
      console.error('Error saving competition:', error);
      setAlert({ type: 'danger', message: 'فشل في حفظ البطولة' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (competition: Competition) => {
    setEditingCompetition(competition);
    setFormData({
      name: competition.name,
      nameAr: competition.nameAr,
      leagueId: competition.leagueId || '',
      place: competition.place || '',
      placeAr: competition.placeAr || '',
      description: competition.description || '',
      descriptionAr: competition.descriptionAr || '',
      level: competition.level || 'league',
      wilayaId: competition.wilayaId ? String(competition.wilayaId) : '',
      startDate: competition.startDate.toISOString().split('T')[0],
      endDate: competition.endDate.toISOString().split('T')[0],
      status: competition.status,
      categories: competition.categories,
      weights: competition.weights || {},
      image: competition.image || ''
      ,
      registrationDeadline: competition.registrationDeadline ? competition.registrationDeadline.toISOString().split('T')[0] : ''
    });
  };

  const handleDelete = async () => {
    if (!competitionToDelete) return;
    
    try {
      setLoading(true);
      await CompetitionsService.deleteCompetition(competitionToDelete);
      setAlert({ type: 'success', message: 'تم حذف البطولة بنجاح' });
      loadCompetitions();
    } catch (error) {
      console.error('Error deleting competition:', error);
      setAlert({ type: 'danger', message: 'فشل في حذف البطولة' });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setCompetitionToDelete(null);
    }
  };

  const cancelEdit = () => {
    setEditingCompetition(null);
    setFormData({
      name: '',
      nameAr: '',
      leagueId: '',
      place: '',
      placeAr: '',
      description: '',
      descriptionAr: '',
      level: 'league',
      wilayaId: '',
      startDate: '',
      endDate: '',
      status: 'upcoming',
      categories: [],
      weights: {},
      image: ''
      ,
      registrationDeadline: ''
    });
  };

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { variant: string; text: string }> = {
      upcoming: { variant: 'primary', text: 'قادمة' },
      ongoing: { variant: 'success', text: 'جارية' },
      finished: { variant: 'secondary', text: 'منتهية' }
    };
    const key = (status || '').toLowerCase();
    const config = statusMap[key] || { variant: 'dark', text: 'غير معروف' };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  return (
    <div>
      {/* Alert */}
      {alert && (
        <Alert 
          variant={alert.type} 
          dismissible 
          onClose={() => setAlert(null)}
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}

      {/* Competition Form */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0 text-center" dir="rtl">
            <i className="fas fa-trophy me-2"></i>
            {editingCompetition ? 'تعديل البطولة' : 'إضافة بطولة جديدة'}
          </h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">
                    اسم البطولة (عربي) *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => handleInputChange('nameAr', e.target.value)}
                    className="text-end"
                    dir="rtl"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">
                    اسم البطولة (إنجليزي)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Descriptions */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">وصف البطولة (عربي)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.descriptionAr}
                    onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
                    className="text-end"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">وصف البطولة (إنجليزي)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Level */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">مستوى البطولة</Form.Label>
                  <Form.Select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value as CompetitionLevel)}
                    className="text-end"
                    dir="rtl"
                  >
                    <option value="national">وطنية</option>
                    <option value="regional">جهوية</option>
                    <option value="league">تابعة لرابطة</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">الحالة</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="text-end"
                    dir="rtl"
                  >
                    <option value="upcoming">قادمة</option>
                    <option value="ongoing">جارية</option>
                    <option value="finished">منتهية</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">الرابطة</Form.Label>
                  <Form.Select
                    value={formData.leagueId}
                    onChange={(e) => handleInputChange('leagueId', e.target.value)}
                    className="text-end"
                    dir="rtl"
                  >
                    <option value="">اختر الرابطة</option>
                    {leagues.map(league => (
                      <option key={league.id} value={league.id}>
                        {league.nameAr}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">
                    المكان (عربي)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.placeAr}
                    onChange={(e) => handleInputChange('placeAr', e.target.value)}
                    className="text-end"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">
                    المكان (إنجليزي)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.place}
                    onChange={(e) => handleInputChange('place', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">
                    تاريخ البداية *
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">
                    تاريخ النهاية *
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">
                    رقم الولاية (اختياري)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.wilayaId}
                    onChange={(e) => handleInputChange('wilayaId', e.target.value)}
                    min="1"
                    max="58"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Registration deadline */}
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-end d-block" dir="rtl">
                    موعد انتهاء التسجيل (اختياري)
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Categories Selection */}
            <Form.Group className="mb-3">
              <Form.Label className="text-end d-block" dir="rtl">الفئات</Form.Label>
              <Row>
                {availableCategories.map(category => (
                  <Col md={3} key={category} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      id={`category-${category}`}
                      label={category}
                      checked={formData.categories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                      className="text-end"
                      dir="rtl"
                    />
                  </Col>
                ))}
              </Row>
            </Form.Group>

            {/* Weights per selected Category */}
            {formData.categories.length > 0 && (
              <Card className="mb-3">
                <Card.Header className="bg-light">
                  <strong>الأوزان حسب الفئة</strong>
                </Card.Header>
                <Card.Body>
                  {formData.categories.map(categoryAr => {
                    const weights = getWeightsForCategory(categoryAr);
                    const selected = formData.weights?.[categoryAr] || { male: [], female: [] };
                    return (
                      <div key={categoryAr} className="mb-4" dir="rtl">
                        <h6 className="text-end">{categoryAr}</h6>
                        <Row>
                          <Col md={6}>
                            <div className="mb-2 fw-bold text-end">ذكور</div>
                            <Row>
                              {weights.male.length === 0 ? (
                                <div className="text-muted text-end">لا توجد أوزان معرفة لهذه الفئة</div>
                              ) : weights.male.map(w => (
                                <Col key={`m-${categoryAr}-${w}`} md={4} className="mb-2">
                                  <Form.Check
                                    type="checkbox"
                                    id={`w-${categoryAr}-m-${w}`}
                                    label={w}
                                    className="text-end"
                                    checked={selected.male.includes(w)}
                                    onChange={(e) => toggleWeight(categoryAr, 'male', w, e.target.checked)}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </Col>
                          <Col md={6}>
                            <div className="mb-2 fw-bold text-end">إناث</div>
                            <Row>
                              {weights.female.length === 0 ? (
                                <div className="text-muted text-end">لا توجد أوزان معرفة لهذه الفئة</div>
                              ) : weights.female.map(w => (
                                <Col key={`f-${categoryAr}-${w}`} md={4} className="mb-2">
                                  <Form.Check
                                    type="checkbox"
                                    id={`w-${categoryAr}-f-${w}`}
                                    label={w}
                                    className="text-end"
                                    checked={selected.female.includes(w)}
                                    onChange={(e) => toggleWeight(categoryAr, 'female', w, e.target.checked)}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </Col>
                        </Row>
                      </div>
                    );
                  })}
                </Card.Body>
              </Card>
            )}

            {/* Image Upload */}
            <Form.Group className="mb-3">
              <Form.Label className="text-end d-block" dir="rtl">صورة البطولة</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <Spinner animation="border" size="sm" />
                )}
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="معاينة" 
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    className="rounded"
                  />
                )}
              </div>
            </Form.Group>

            <div className="text-center">
              {editingCompetition && (
                <Button 
                  variant="secondary" 
                  onClick={cancelEdit}
                  className="me-2"
                  disabled={loading}
                >
                  إلغاء
                </Button>
              )}
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading || uploadingImage}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    {editingCompetition ? 'تحديث البطولة' : 'حفظ البطولة'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Competitions List */}
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0 text-center" dir="rtl">
            <i className="fas fa-list me-2"></i>
            قائمة البطولات
          </h5>
        </Card.Header>
        <Card.Body>
          {loadingCompetitions ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">جاري تحميل البطولات...</div>
            </div>
          ) : competitions.length === 0 ? (
            <div className="text-center py-4 text-muted">
              لا توجد بطولات مسجلة
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="text-center" dir="rtl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الصورة</th>
                    <th>اسم البطولة</th>
                    <th>الحالة</th>
                    <th>المكان</th>
                    <th>تاريخ البداية</th>
                    <th>تاريخ النهاية</th>
                    <th>انتهاء التسجيل</th>
                    <th>الفئات</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {competitions.map((competition, index) => (
                    <tr key={competition.id}>
                      <td>{index + 1}</td>
                      <td>
                        {competition.image ? (
                          <img 
                            src={competition.image}
                            alt={competition.nameAr}
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            className="rounded"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/vite.svg'; }}
                          />
                        ) : (
                          <i className="fas fa-image text-muted"></i>
                        )}
                      </td>
                      <td className="text-end" dir="rtl">{competition.nameAr}</td>
                      <td>{getStatusBadge(competition.status)}</td>
                      <td className="text-end" dir="rtl">{competition.placeAr || '-'}</td>
                      <td>{formatDateAr(competition.startDate)}</td>
                      <td>{formatDateAr(competition.endDate)}</td>
                      <td>{formatDateAr(competition.registrationDeadline)}</td>
                      <td className="text-end" dir="rtl">
                        {competition.categories.length > 0 ? (
                          <div>
                            {competition.categories.slice(0, 2).map(cat => (
                              <Badge key={cat} bg="light" text="dark" className="me-1 mb-1">
                                {cat}
                              </Badge>
                            ))}
                            {competition.categories.length > 2 && (
                              <Badge bg="secondary">+{competition.categories.length - 2}</Badge>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(competition)}
                          className="me-1"
                          disabled={loading}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setCompetitionToDelete(competition.id);
                            setShowDeleteModal(true);
                          }}
                          disabled={loading}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                        <Button
                          variant="outline-dark"
                          size="sm"
                          className="ms-1"
                          onClick={() => openOrganizersModal(competition)}
                          disabled={loading}
                          title="منظمو البطولة"
                        >
                          <i className="fas fa-users-cog"></i>
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="ms-1"
                          onClick={() => openPairingsModal(competition)}
                          disabled={loading}
                          title="القرعة العشوائية"
                        >
                          <i className="fas fa-random"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title dir="rtl">تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body dir="rtl">
          هل أنت متأكد من حذف هذه البطولة؟ لا يمكن التراجع عن هذا الإجراء.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                جاري الحذف...
              </>
            ) : (
              'حذف'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Organizers Modal */}
      <Modal show={showOrganizersModal} onHide={() => setShowOrganizersModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title dir="rtl">منظمو البطولة — {orgCompetition?.nameAr}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orgLoading ? (
            <div className="text-center py-4"><Spinner animation="border" /><div className="mt-2">جاري التحميل...</div></div>
          ) : (
            <div dir="rtl">
              <div className="card p-3 mb-3">
                <h6 className="mb-3 text-end">إضافة منظم جديد</h6>
                <div className="row g-2">
                  <div className="col-md-3">
                    <label className="form-label d-block text-end">اسم المستخدم</label>
                    <input className="form-control text-end" value={orgForm.username} onChange={(e)=>setOrgForm(prev=>({ ...prev, username: e.target.value }))} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label d-block text-end">كلمة المرور</label>
                    <input type="password" className="form-control text-end" value={orgForm.password} onChange={(e)=>setOrgForm(prev=>({ ...prev, password: e.target.value }))} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label d-block text-end">الدور</label>
                    <select className="form-select text-end" value={orgForm.role} onChange={(e)=>setOrgForm(prev=>({ ...prev, role: e.target.value as OrganizerRole }))}>
                      <option value="">اختر الدور</option>
                      <option value="table_official">مسؤول الطاولة</option>
                      <option value="supervisor">مشرف البطولة</option>
                    </select>
                  </div>
                  {orgForm.role === 'table_official' && (
                    <div className="col-md-3">
                      <label className="form-label d-block text-end">البساط</label>
                      <div className="btn-group d-flex" role="group">
                        {[1,2,3].map(m => (
                          <button key={m} type="button" className={`btn ${orgForm.mat===m? 'btn-primary':'btn-outline-primary'}`} onClick={()=>setOrgForm(prev=>({ ...prev, mat: m as 1|2|3 }))}> {m} </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-end mt-3">
                  <Button variant="success" onClick={handleCreateOrganizer} disabled={orgLoading}><i className="fas fa-plus me-2"></i>إضافة</Button>
                </div>
              </div>

              <div className="table-responsive">
                <Table striped bordered hover className="text-center" dir="rtl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>اسم المستخدم</th>
                      <th>الدور</th>
                      <th>البساط</th>
                      <th>نشط</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizers.length === 0 ? (
                      <tr><td colSpan={6} className="text-muted">لا يوجد منظّمون بعد</td></tr>
                    ) : organizers.map((o, i) => (
                      <tr key={o.id}>
                        <td>{i+1}</td>
                        <td className="text-end">{o.username}</td>
                        <td>{o.role === 'table_official' ? 'مسؤول الطاولة' : 'مشرف البطولة'}</td>
                        <td>{o.role === 'table_official' ? (o.mat || '-') : '-'}</td>
                        <td>{o.isActive ? 'نعم' : 'لا'}</td>
                        <td>
                          <Button variant="outline-danger" size="sm" onClick={()=>handleDeleteOrganizer(o.id)} disabled={orgLoading}><i className="fas fa-trash"></i></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Pairings Modal */}
      <Modal show={showPairingsModal} onHide={() => setShowPairingsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title dir="rtl">القرعة العشوائية — {pairingCompetition?.nameAr}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingPairings ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">جاري تحميل المشاركين...</div>
            </div>
          ) : participantsForPairing.length === 0 ? (
            <Alert variant="warning" dir="rtl">لا يوجد مشاركون مسجلون في هذه البطولة.</Alert>
          ) : (
            <div dir="rtl">
              <div className="d-flex justify-content-end mb-3 gap-2">
                <Button variant="outline-primary" onClick={generatePairings}><i className="fas fa-shuffle me-2"></i>توليد قرعة عشوائية</Button>
                <Button variant="success" onClick={savePairings} disabled={generatedMatches.length === 0}><i className="fas fa-save me-2"></i>حفظ القرعة</Button>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="mb-2">قائمة المشاركين ({participantsForPairing.length})</h6>
                  <div className="list-group" style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {participantsForPairing.map(p => {
                      const l = p.club?.leagueId ? leaguesMap[p.club.leagueId] : undefined;
                      return (
                        <div key={p.athlete.id} className="list-group-item d-flex justify-content-between">
                          <span>{(p.athlete.firstNameAr || p.athlete.firstName || '')} {(p.athlete.lastNameAr || p.athlete.lastName || '')}</span>
                          <small className="text-muted">{(p.club?.nameAr || p.club?.name || '-')}{l ? ` — ${l.wilayaNameAr || l.nameAr}` : ''}</small>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-2">المواجهات المتولدة ({generatedMatches.length})</h6>
                  {generatedMatches.length === 0 ? (
                    <div className="text-muted">لم يتم توليد قرعة بعد.</div>
                  ) : (
                    <div className="list-group" style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {generatedMatches.map((m, idx) => {
                        const a1 = participantsForPairing.find(r => r.athlete.id === m.athlete1Id)?.athlete;
                        const a2 = m.athlete2Id ? participantsForPairing.find(r => r.athlete.id === m.athlete2Id)?.athlete : undefined;
                        const c1 = a1?.clubId ? participantsForPairing.find(r => r.athlete.id === m.athlete1Id)?.club : undefined;
                        const c2 = a2?.clubId ? participantsForPairing.find(r => r.athlete.id === m.athlete2Id!)?.club : undefined;
                        const l1 = c1?.leagueId ? leaguesMap[c1.leagueId] : undefined;
                        const l2 = c2?.leagueId ? leaguesMap[c2.leagueId] : undefined;
                        return (
                          <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="text-end flex-grow-1">
                              <div className="fw-bold">{a1 ? `${a1.firstNameAr || a1.firstName || ''} ${a1.lastNameAr || a1.lastName || ''}` : 'غير معروف'}</div>
                              <div className="text-muted small">{(c1?.nameAr || c1?.name || '—')}{l1 ? ` — ${l1.wilayaNameAr || l1.nameAr}` : ''}</div>
                            </div>
                            <div className="mx-3 fw-bold">VS</div>
                            <div className="text-end flex-grow-1">
                              {a2 ? (
                                <>
                                  <div className="fw-bold">{`${a2.firstNameAr || a2.firstName || ''} ${a2.lastNameAr || a2.lastName || ''}`}</div>
                                  <div className="text-muted small">{(c2?.nameAr || c2?.name || '—')}{l2 ? ` — ${l2.wilayaNameAr || l2.nameAr}` : ''}</div>
                                </>
                              ) : (
                                <div className="text-muted">باي (يتأهل تلقائياً)</div>
                              )}
                            </div>
                            <div className="ms-3">
                              <span className="badge bg-primary">البساط {m.mat || 1}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPairingsModal(false)}>إغلاق</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CompetitionsTab;
