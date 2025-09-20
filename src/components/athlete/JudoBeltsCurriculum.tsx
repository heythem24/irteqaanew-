import React, { useState } from 'react';
import { Card, Badge, Accordion, Nav } from 'react-bootstrap';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card className="mb-3 shadow-sm border-0">
    <Card.Header className="bg-white" dir="rtl">
      <h5 className="mb-0 d-flex align-items-center gap-2"><i className="fas fa-book-open text-primary"></i> {title}</h5>
    </Card.Header>
    <Card.Body dir="rtl" className="pt-3">
      {children}
    </Card.Body>
  </Card>
);

const JudoBeltsCurriculum: React.FC = () => {
  const [subTab, setSubTab] = useState<'belts' | 'explain'>('belts');
  const tabsGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  return (
    <div>
      {/* Sub-tabs header */}
      <Card className="shadow-lg mb-4 border-0">
        <Card.Header className="p-0" style={{ background: tabsGradient }}>
          <Nav variant="tabs" className="border-0 justify-content-center">
            <Nav.Item>
              <Nav.Link
                active={subTab === 'belts'}
                onClick={() => setSubTab('belts')}
                className={`px-4 py-3 fw-bold ${subTab === 'belts' ? 'bg-white text-primary shadow' : ''}`}
                style={{
                  border: 'none',
                  borderRadius: '0.5rem 0.5rem 0 0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  backgroundColor: subTab === 'belts' ? 'white' : 'transparent',
                  color: subTab === 'belts' ? '#0d6efd' : 'rgba(255,255,255,0.9)'
                }}
                dir="rtl"
              >
                <i className="fas fa-layer-group me-2"></i>
                الأحزمة
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={subTab === 'explain'}
                onClick={() => setSubTab('explain')}
                className={`px-4 py-3 fw-bold ${subTab === 'explain' ? 'bg-white text-primary shadow' : ''}`}
                style={{
                  border: 'none',
                  borderRadius: '0.5rem 0.5rem 0 0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  backgroundColor: subTab === 'explain' ? 'white' : 'transparent',
                  color: subTab === 'explain' ? '#0d6efd' : 'rgba(255,255,255,0.9)'
                }}
                dir="rtl"
              >
                <i className="fas fa-info-circle me-2"></i>
                شروحات تفصيلية للتقنيات
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
      </Card>
      {subTab === 'belts' && (
      <>
      {/* White Belt - 6° KYU */}
      <Card className="mb-4 border-0 shadow">
        <div style={{ height: '4px', background: 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)' }} />
        <Card.Body dir="rtl">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h4 className="mb-2">
              <i className="fas fa-medal me-2 text-secondary"></i>
              منهاج الحزام الأبيض (6° KYU) — مدة تقديرية: شهر واحد
            </h4>
            <div className="d-flex gap-2">
              <Badge bg="light" text="dark">مبتدئ</Badge>
              <Badge bg="secondary">أبيض</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Section title="المفاهيم الأساسية والحركات">
        <ul className="mb-3">
          <li><strong>أوكِمي (Ukemi) — فن السقوط الآمن:</strong> سقوط أمامي (Mae-ukemi)، سقوط خلفي (Ushiro-ukemi)، سقوط جانبي (Yoko-ukemi)، سقوط دَحْرَجي أمامي (Mae-mawari-ukemi).</li>
          <li><strong>شيسِي (Shisei) — الوضعيات:</strong> شِيزِنتاي (وضعية طبيعية)، جِيجوتاي (وضعية دفاعية منخفضة).</li>
          <li><strong>كومي-كاتا (Kumi-kata):</strong> طرق وأماكن المسك الصحيحة بالبدلة.</li>
          <li><strong>كوزوشي (Kuzushi):</strong> إخلال التوازن كمدخل أساسي لكل رمية.</li>
          <li><strong>شين-تاي (Shin-tai) — حركة الجسم:</strong> آيومي-آشي (خطوات متعاقبة)، تسُغي-آشي (خطوات متتابعة).</li>
          <li><strong>تاي-ساباكي (Tai-sabaki) — تدوير الجسم:</strong> دوران أمامي (Mae-mawari-sabaki)، دوران خلفي (Ushiro-mawari-sabaki).</li>
          <li><strong>أوتشيكومي (Uchikomi) — تدريبات الدخول:</strong> تسكوري (التموضع)، كوزوشي (الإخلال)، غاكي (الإسقاط).</li>
          <li><strong>الاتجاهات:</strong> مِيغي = يمين، هيداري = يسار.</li>
          <li><strong>الأدوار:</strong> توري = المنفّذ، أُكي = المتلقي.</li>
          <li><strong>ميثاق أخلاق الجودو:</strong> الأدب، الشجاعة، الإخلاص، الشرف، التواضع، الاحترام، ضبط النفس، الصداقة.</li>
        </ul>
      </Section>

      <Section title="تقنيات الإسقاط (Nage-waza)">
        <ol className="mb-0">
          <li>دي-آشي-باراي (De-ashi-barai) — كنس القدم المتقدمة</li>
          <li>أو-سوتو-غاري (O-soto-gari) — الحصاد الخارجي الكبير</li>
          <li>أو-غوشي (O-goshi) — رمية الورك الكبرى</li>
          <li>هِيِزا-غورُوما (Hiza-guruma) — عجلة الركبة</li>
          <li>أُكي-غوشي (Uki-goshi) — رمية الورك العائمة</li>
          <li>إيبّون-سِئي-ناغِه (Ippon-seoi-nage) — رمية حمل الكتف الكاملة</li>
        </ol>
      </Section>

      <Section title="تقنيات التثبيت الأرضي (Katame-waza / Osae-komi)">
        <ol className="mb-0">
          <li>هون-كيسا-غاتامي (Hon-kesa-gatame) — تثبيت الحزام الجانبي الأساسي</li>
          <li>يوكو-شيهو-غاتامي (Yoko-shiho-gatame) — تثبيت الأربعة اتجاهات الجانبي</li>
          <li>كامي-شيهو-غاتامي (Kami-shiho-gatame) — تثبيت الأربعة اتجاهات العلوي</li>
          <li>تاتي-شيهو-غاتامي (Tate-shiho-gatame) — تثبيت الأربعة اتجاهات الطولي</li>
          <li>أوشيرو-كيسا-غاتامي (Ushiro-kesa-gatame) — تثبيت كيسا-غاتامي الخلفي</li>
        </ol>
      </Section>

      {/* Yellow Belt - 5° KYU */}
      <Card className="mt-5 mb-4 border-0 shadow">
        <div style={{ height: '4px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }} />
        <Card.Body dir="rtl">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h4 className="mb-2">
              <i className="fas fa-medal me-2 text-warning"></i>
              منهاج الحزام الأصفر (5° KYU) — مدة تقديرية: شهران
            </h4>
            <div className="d-flex gap-2">
              <Badge bg="light" text="dark">أساسي</Badge>
              <Badge bg="warning" text="dark">أصفر</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Section title="تقنيات الوقوف — الإسقاط (Tachi-waza / Nage-waza)">
        <ol className="mb-0">
          <li>دي-آشي-باراي (De-ashi-barai)</li>
          <li>هِيِزا-غورُوما (Hiza-guruma)</li>
          <li>ساسائي-تسوري-كومي-آشي (Sasae-tsuri-komi-ashi) — دعم/رفع/سحب القدم</li>
          <li>أُكي-غوشي (Uki-goshi)</li>
          <li>أو-سوتو-غاري (O-soto-gari)</li>
          <li>أو-غوشي (O-goshi)</li>
          <li>إيبّون-سِئي-ناغِه (Ippon-seoi-nage)</li>
        </ol>
      </Section>

      <Section title="الجوانب النظرية">
        <ul className="mb-0">
          <li>نبذة تاريخية عن الجودو</li>
          <li>مصطلحات أساسية في الجودو</li>
          <li>مبادئ عامة من قانون التحكيم وقواعد المنافسة</li>
        </ul>
      </Section>

      <Section title="تقنيات الأرض — التثبيت (Ne-waza / Osae-komi-waza)">
        <ol className="mb-0">
          <li>هون-كيسا-غاتامي (Hon-kesa-gatame)</li>
          <li>يوكو-شيهو-غاتامي (Yoko-shiho-gatame)</li>
          <li>تاتي-شيهو-غاتامي (Tate-shiho-gatame)</li>
          <li>كامي-شيهو-غاتامي (Kami-shiho-gatame)</li>
          <li>كاتا-غاتامي (Kata-gatame) — تثبيت الكتف</li>
          <li>أوشيرو-كيسا-غاتامي (Ushiro-kesa-gatame)</li>
        </ol>
      </Section>

      <Section title="ميثاق الأخلاق في الجودو">
        <div className="d-flex flex-wrap gap-2">
          {['الأدب','الشجاعة','الإخلاص','الشرف','التواضع','الاحترام','ضبط النفس','الصداقة'].map((v) => (
            <Badge key={v} bg="light" text="dark" className="px-3 py-2">{v}</Badge>
          ))}
        </div>
      </Section>

      {/* Orange Belt - 4° KYU */}
      <Card className="mt-5 mb-4 border-0 shadow">
        <div style={{ height: '4px', background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }} />
        <Card.Body dir="rtl">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h4 className="mb-2">
              <i className="fas fa-medal me-2" style={{ color: '#f97316' }}></i>
              منهاج الحزام البرتقالي (4° KYU) — مدة تقديرية: 3 أشهر
            </h4>
            <div className="d-flex gap-2">
              <Badge bg="light" text="dark">متوسط (1)</Badge>
              <Badge bg="warning" text="dark">برتقالي</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Section title="تقنيات الإسقاط (Nage-waza)">
        <ol className="mb-0">
          <li>موروته-سِئي-ناغِه (Morote-seoi-nage) + إيري-سِئي-ناغِه (Iri seoi-nage) — رميات الكتف (ذراعان/دخول)</li>
          <li>تسوري-كومي-غوشي (Tsuri-komi-goshi) — رمية الورك بالرفع والسحب</li>
          <li>سودي-تسوري-كومي-غوشي (Sode-tsuri-komi-goshi) — رمية الورك بسحب نقاب الكم</li>
          <li>كو-أوتشي-غاري (Ko-uchi-gari) — حصد داخلي صغير</li>
          <li>أو-أوتشي-غاري (O-uchi-gari) — حصد داخلي كبير</li>
          <li>هاراي-غوشي (Harai-goshi) — كنس الورك</li>
          <li>كوشي-غورُوما (Koshi-guruma) — دولاب الورك</li>
          <li>سِئي-أوتوشي (Seoi-otoshi) — إسقاط سِئي (هبوط على الركبة/الجلوس)</li>
        </ol>
      </Section>

      <Section title="تقنيات الأرض — التثبيت (Osae-komi-waza)">
        <ol className="mb-0">
          <li>كاتا-غاتامي (Kata-gatame) — تثبيت الكتف</li>
          <li>ماكورا-كيسا-غاتامي (Makura-kesa-gatame) — كيسا-غاتامي مع وسادة/دعامة</li>
          <li>كوزوريه-كيسا-غاتامي (Kuzure-kesa-gatame) — كيسا-غاتامي مُعدّل</li>
          <li>كوزوريه-يوكو-شيهو-غاتامي (Kuzure-yoko-shiho-gatame) — أربعة اتجاهات جانبية (معدّلة)</li>
          <li>كوزوريه-كامي-شيهو-غاتامي (Kuzure-kami-shiho-gatame) — أربعة اتجاهات علوية (معدّلة)</li>
          <li>كوزوريه-تاتي-شيهو-غاتامي (Kuzure-tate-shiho-gatame) — أربعة اتجاهات طولية (معدّلة)</li>
        </ol>
      </Section>

      <Section title="تدريبات أرضية مكملة">
        <ul className="mb-0">
          <li>تدريبات الدخول، الانقلاب، القَلْب، والتجاوزات في الأرض</li>
          <li>طرق التحرر من التثبيت من وضعيات مختلفة: على الظهر، على البطن، وعلى أربع</li>
        </ul>
      </Section>

      <Section title="الجوانب النظرية">
        <ul className="mb-0">
          <li>نبذة تاريخية موجزة عن الجودو</li>
          <li>مصطلحات إضافية في الجودو (Lexique)</li>
          <li>لمحة عن القوانين والتنظيم (Règlement)</li>
        </ul>
      </Section>

      {/* Green Belt - 3° KYU */}
      <Card className="mt-5 mb-4 border-0 shadow">
        <div style={{ height: '4px', background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' }} />
        <Card.Body dir="rtl">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h4 className="mb-2">
              <i className="fas fa-medal me-2" style={{ color: '#10b981' }}></i>
              منهاج الحزام الأخضر (3° KYU) — مدة تقديرية: 6 أشهر
            </h4>
            <div className="d-flex gap-2">
              <Badge bg="light" text="dark">متوسط (2)</Badge>
              <Badge bg="success">أخضر</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Section title="تقنيات الإسقاط (Nage-waza)">
        <ol className="mb-0">
          <li>تاي-أوتوشي (Tai-otoshi) + كُبي-ناغِه (Kubi-nage) — إسقاط الجسم + رمية العنق</li>
          <li>كو-سوتو-غاري (Ko-soto-gari) — حصد خارجي صغير</li>
          <li>أوكوري-آشي-باراي (Okuri-ashi-barai) — كنس القدمين المتتابع</li>
          <li>أو-سوتو-أوتوشي (O-soto-otoshi) — إسقاط خارجي كبير</li>
          <li>أُتشي-ماتا (Uchi-mata) — فخذ داخلي</li>
          <li>هانيه-غوشي (Hane-goshi) — ورك نابض</li>
          <li>سوتو-ماكي-كومي (Soto-maki-komi) — لف خارجي مع السقوط</li>
          <li>أو-سوتو-غاكي (O-soto-gake) — تعليقة/خطّاف خارجي كبير</li>
          <li>أو-سوتو-غورُوما (O-soto-guruma) — دولاب خارجي كبير</li>
          <li>كو-سوتو-غاكي (Ko-soto-gake) — خطّاف خارجي صغير</li>
        </ol>
      </Section>

      <Section title="تقنيات الخنق (Shime-waza)">
        <ol className="mb-0">
          <li>كاتا-جوجي-جِمِه (Kata-juji-jime) — خنق التقاطع أحادي القبضة</li>
          <li>غياكو-جوجي-جِمِه (Gyaku-juji-jime) — خنق التقاطع المعكوس</li>
          <li>نامي-جوجي-جِمِه (Nami-juji-jime) — خنق التقاطع العادي</li>
          <li>موروته-جِمِه (Morote-jime) — خنق بالقبضتين</li>
          <li>هداكا-جِمِه (Hadaka-jime) — خنق العنق من الخلف</li>
          <li>أوكوري-إيري-جِمِه (Okuri-eri-jime) — خنق منزلِق بالطية</li>
          <li>كاتا-ها-جِمِه (Kata-ha-jime) — خنق الجناح الأحادي</li>
          <li>سودي-غورُوما-جِمِه (Sode-guruma-jime) — خنق كمّي (إيزيكيل)</li>
          <li>آشي-غاتامي-جِمِه (Ashi-gatame-jime) — خنق بتثبيت الساق</li>
          <li>آشي-غاتامي-سانكاكو-جِمِه (Ashi-gatame-sankaku-jime) — خنق مثلث الساق</li>
        </ol>
      </Section>

      <Section title="الكاتا — السلسلة الأولى من نَغي نو كاتا (Nage no Kata)">
        <p className="mb-2">قسم تقنيات اليد (Te-waza):</p>
        <ul className="mb-0">
          <li>أوكي-أوتوشي (Uki-otoshi)</li>
          <li>إيبّون-سِئي-ناغِه (Ippon-seoi-nage)</li>
          <li>كاتا-غورُوما (Kata-guruma)</li>
        </ul>
      </Section>

      {/* Blue Belt - 2° KYU */}
      <Card className="mt-5 mb-4 border-0 shadow">
        <div style={{ height: '4px', background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' }} />
        <Card.Body dir="rtl">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h4 className="mb-2">
              <i className="fas fa-medal me-2 text-primary"></i>
              منهاج الحزام الأزرق (2° KYU) — مدة تقديرية: 6 أشهر
            </h4>
            <div className="d-flex gap-2">
              <Badge bg="light" text="dark">متقدم (1)</Badge>
              <Badge bg="primary">أزرق</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Section title="تقنيات الإسقاط (Nage-waza)">
        <ol className="mb-0">
          <li>كاتا-غورُوما (Kata-guruma) — دولاب الكتف</li>
          <li>آشي-غورُوما (Ashi-guruma) — دولاب الساق</li>
          <li>أو-غورُوما (O-guruma) — دولاب كبير</li>
          <li>هاراي-تسوري-كومي-آشي (Harai-tsuri-komi-ashi) — كنس مع رفع وسحب للقدم</li>
          <li>سومي-غايشي (Sumi-gaeshi) — قلب الزاوية</li>
          <li>توموئي-ناغِه (Tomoe-nage) — رمية الدائرة (التقلّب على الظهر)</li>
          <li>يوكو-توموئي-ناغِه (Yoko-tomoe-nage) — توموئي جانبية</li>
          <li>تسوري-غوشي (Tsuri-goshi) — رمية الورك بالرفع</li>
          <li>يوكو-واكاري (Yoko-wakare) — انفصال جانبي</li>
          <li>يوكو-غاكي (Yoko-gake) — خطّاف جانبي</li>
          <li>سومي-أوتوشي (Sumi-otoshi) — إسقاط الزاوية</li>
        </ol>
      </Section>

      <Section title="تقنيات مفاصل — كانسِتسو وازا (Kansetsu-waza)">
        <ol className="mb-0">
          <li>أُدي-هائشيغي أُدي-غارامي (Ude-haeshigi-ude-garami) — ليّ الذراع (كي-مورا)</li>
          <li>أُدي-هائشيغي جوجي-غاتامي (Ude-haeshigi-juji-gatame) — قفل الذراع المتقاطع (جوجي)</li>
          <li>أُدي-هائشيغي أُدي-غاتامي (Ude-haeshigi-ude-gatame) — تمطيط الذراع</li>
          <li>أُدي-هائشيغي واكي-غاتامي (Ude-haeshigi-waki-gatame) — قفل الذراع بالإبط</li>
          <li>أُدي-هائشيغي هِزا-غاتامي (Ude-haeshigi-hiza-gatame) — قفل الذراع بالركبة</li>
          <li>أُدي-هائشيغي هارا-غاتامي (Ude-haeshigi-hara-gatame) — قفل الذراع بالبطن</li>
          <li>أُدي-هائشيغي سانكاكو-غاتامي (Ude-haeshigi-sankaku-gatame) — قفل الذراع بالمثلث</li>
          <li>أُدي-هائشيغي آشي-غارامي (Ude-haeshigi-ashi-garami) — تشابك الذراع بالساق</li>
        </ol>
      </Section>

      <Section title="تدريبات أرضية مكملة">
        <ul className="mb-0">
          <li>تدريبات الدخول/الانقلاب/الالتفاف/التحرر على الأرض من وضعيات: على الظهر، على البطن، على أربع</li>
        </ul>
      </Section>

      <Section title="الكاتا — السلسلة الثانية من نَغي نو كاتا (Nage no Kata)">
        <p className="mb-2">قسم تقنيات الورك (Koshi-waza):</p>
        <ul className="mb-0">
          <li>أُكي-غوشي (Uki-goshi)</li>
          <li>هاراي-غوشي (Harai-goshi)</li>
          <li>تسوري-كومي-غوشي (Tsuri-komi-goshi)</li>
        </ul>
      </Section>

      {/* Brown Belt - 1° KYU */}
      <Card className="mt-5 mb-4 border-0 shadow">
        <div style={{ height: '4px', background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' }} />
        <Card.Body dir="rtl">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h4 className="mb-2">
              <i className="fas fa-medal me-2" style={{ color: '#8b5cf6' }}></i>
              منهاج الحزام البني (1° KYU) — مدة تقديرية: 6 أشهر
            </h4>
            <div className="d-flex gap-2">
              <Badge bg="light" text="dark">متقدم (2)</Badge>
              <Badge bg="secondary">بني</Badge>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Section title="تقنيات الوقوف — الإسقاط (Tachi/Nage-waza)">
        <ol className="mb-0">
          <li>أُ-تسوري-غوشي (U-tsuri-goshi) — نقل/رفع إلى الورك</li>
          <li>أوشيرو-غوشي (Ushiro-goshi) — ورك خلفي</li>
          <li>أُرا-ناغِه (Ura-nage) — رمية خلفية</li>
          <li>يوكو-أوتوشي (Yoko-otoshi) — إسقاط جانبي</li>
          <li>تاني-أوتوشي (Tani-otoshi) — إسقاط الوادي (خلفي)</li>
          <li>يوكو-غورُوما (Yoko-guruma) — دولاب جانبي</li>
          <li>تي-غورُوما (Te-guruma) — دولاب اليد</li>
          <li>سُكوي-ناغِه (Sukui-nage) — رمية الاغتراف</li>
          <li>أُتشي-ماتا-سُكِشي (Uchi-mata-sukashi) — تفادي/مُجافاة أُتشي-ماتا</li>
          <li>أوكي-أوتوشي (Uki-otoshi)</li>
          <li>أوكي-وازا (Uki-waza) — تقنية الطفو (الجلوس/الهبوط)</li>
        </ol>
      </Section>

      <Section title="تمارين الأرض والمراجعة العامة">
        <ul className="mb-2">
          <li>تدريبات الدخول/الانقلاب/الالتفاف/التحرر على الأرض: على الظهر، على البطن، وعلى أربع</li>
          <li>مراجعة شاملة لكل البرنامج ومنهجية التدريب</li>
        </ul>
        <p className="mb-2">طرق التدريب (Keiko):</p>
        <div className="d-flex flex-wrap gap-2">
          {['تاندوكو-رينشُو (Tandoku-renshū)','أوتشي-كومي (Uchi-komi)','ناغي-كومي (Nage-komi)','كاكاري-غييكو (Kakari-geiko)','ياكوسوكو-غييكو (Yaku-soku-geiko)','راندوري (Randori)','شياي (Shiai)'].map(v => (
            <Badge key={v} bg="light" text="dark" className="px-3 py-2">{v}</Badge>
          ))}
        </div>
      </Section>
      </>
      )}
      {subTab === 'explain' && (
        <>
          <Card className="mt-1 border-0 shadow-sm">
            <Card.Header className="bg-white" dir="rtl">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <i className="fas fa-info-circle text-secondary"></i>
                شروحات تفصيلية للتقنيات
              </h5>
            </Card.Header>
            <Card.Body dir="rtl">
              <Accordion alwaysOpen>
                <Accordion.Item eventKey="u-tsuri-goshi">
                  <Accordion.Header>أُ-تسوري-غوشي (U-tsuri-goshi)</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li><strong>المعنى الحرفي:</strong> أُتسوري: تبديل/تغيير — غوشي: وسط</li>
                      <li><strong>دخول الحركة:</strong> مُضاد/عكسي</li>
                      <li><strong>الوصف الشكلي:</strong> يقوم الخصم بأداء (هاراي غوشي) فيلتقطه المهاجم ويرفعه بقوة ليثبّته على خصره ثم يُسقطه.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="ushiro-goshi">
                  <Accordion.Header>أوشيرو-غوشي (Ushiro-goshi)</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li><strong>المعنى الحرفي:</strong> أوشيرو = خلفي — غوشي = وسط</li>
                      <li><strong>دخول الحركة:</strong> مُضاد/عكسي</li>
                      <li><strong>الوصف الشكلي:</strong> حركة مضادة لهاني-غوشي؛ يلتقط المهاجم الخصم من خصره ويرفعه ثم يُسقطه.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="ura-nage">
                  <Accordion.Header>أُرا-ناغي (Ura-nage)</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li><strong>المعنى الحرفي:</strong> أورا = ظهري/خلفي — ناغي = رمية</li>
                      <li><strong>دخول الحركة:</strong> التفافي</li>
                      <li><strong>كوزوشي:</strong> أمامي</li>
                      <li><strong>الوصف الشكلي:</strong> يلتف المهاجم خلف الخصم ويمسك بظهره ليلقيه للخلف على كتفيه.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="yoko-otoshi">
                  <Accordion.Header>يوكو-أوتوشي (Yoko-otoshi)</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li><strong>المعنى الحرفي:</strong> يوكو = جانبي — أوتوشي = إسقاط</li>
                      <li><strong>دخول الحركة:</strong> جانبي</li>
                      <li><strong>كوزوشي:</strong> جانبي</li>
                      <li><strong>الوصف الشكلي:</strong> ينزلق المهاجم إلى جانب الخصم ليخلّ توازنه ويجذبه معه إلى الأرض بشكل جانبي.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="tani-otoshi">
                  <Accordion.Header>تاني-أوتوشي (Tani-otoshi)</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li><strong>المعنى الحرفي:</strong> تاني = وادٍ — أوتوشي = إسقاط</li>
                      <li><strong>دخول الحركة:</strong> شبه التفافي</li>
                      <li><strong>كوزوشي:</strong> خلفي</li>
                      <li><strong>الوصف الشكلي:</strong> يضع المهاجم ساقه خلف قدمي الخصم ليعرقله ويدفعه فيسقطا معًا.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="yoko-guruma">
                  <Accordion.Header>يوكو-غورُما (Yoko-guruma)</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li><strong>المعنى الحرفي:</strong> يوكو = جانبي — غوروما = عجلة</li>
                      <li><strong>دخول الحركة:</strong> دوراني</li>
                      <li><strong>كوزوشي:</strong> أمامي/جانبي</li>
                      <li><strong>الوصف الشكلي:</strong> يضع المهاجم رجله بين رجلي الخصم ثم يسقط ويجذبه معه بشكل دوراني.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="sukui-nage">
                  <Accordion.Header>سُكوي-ناغي (Sukui-nage)</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li><strong>المعنى الحرفي:</strong> سوكوي = غَرْف/جرف — ناغي = رمية</li>
                      <li><strong>دخول الحركة:</strong> دوران</li>
                      <li><strong>كوزوشي:</strong> خلفي</li>
                      <li><strong>الوصف الشكلي:</strong> يرفع المهاجم رجل الخصم عن الأرض بحركة اغتراف فيسقط على ظهره.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="uchi-mata-sukashi">
                  <Accordion.Header>أُتشي-ماتا-سُكَشي (Uchi-mata-sukashi)</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li><strong>المعنى الحرفي:</strong> أُتشي = داخلي — ماتا = ما بين الفخذين — غايشي/سُكَشي = مضاد/تفادٍ</li>
                      <li><strong>دخول الحركة:</strong> مُضاد</li>
                      <li><strong>الوصف الشكلي:</strong> يدخل الخصم بأُتشي-ماتا فيضرب المهاجم رجل الارتكاز أو يتفادى ويُسقطه.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="uki-otoshi">
                  <Accordion.Header>أُوكي-أوتوشي (Uki-otoshi)</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li><strong>المعنى الحرفي:</strong> أُوكي = يطفو/طفو — أوتوشي = إسقاط</li>
                      <li><strong>دخول الحركة:</strong> مباشر</li>
                      <li><strong>كوزوشي:</strong> أمامي</li>
                      <li><strong>الوصف الشكلي:</strong> يسحب المهاجم الخصم للخلف ثم يُسقطه بالنزول على ركبته.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="uki-waza">
                  <Accordion.Header>أُوكي-وازا (Uki-waza)</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li><strong>المعنى الحرفي:</strong> أُوكي = يطفو — وازا = أسلوب/تقنية</li>
                      <li><strong>دخول الحركة:</strong> مباشر</li>
                      <li><strong>كوزوشي:</strong> أمامي</li>
                      <li><strong>الوصف الشكلي:</strong> عند تقدّم الخصم، يسقط المهاجم للخلف جاذبًا معه الخصم ليسقطا معًا.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default JudoBeltsCurriculum;
