import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, ListGroup, Badge, Modal, Spinner } from 'react-bootstrap';
import {
  migrateLocalStorageToFirestore,
  clearLocalStorageData,
  createLocalStorageBackup,
  checkLocalStorageData,
  exportAllData
} from '../../utils/dataMigration';
import type { MigrationResult } from '../../utils/dataMigration';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface DataMigrationPanelProps {
  clubId: string;
}

const DataMigrationPanel: React.FC<DataMigrationPanelProps> = ({ clubId }) => {
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<{ [key: string]: number }>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [backup, setBackup] = useState<{ [key: string]: any } | null>(null);

  // فحص بيانات localStorage عند تحميل المكون
  useEffect(() => {
    const data = checkLocalStorageData();
    setLocalStorageData(data);
  }, []);

  // تنفيذ النقل
  const handleMigration = async () => {
    setIsLoading(true);
    setMigrationResult(null);

    try {
      // إنشاء نسخة احتياطية أولاً
      const backupData = createLocalStorageBackup();
      setBackup(backupData);

      // تنفيذ النقل
      const result = await migrateLocalStorageToFirestore(clubId);
      setMigrationResult(result);

      // تحديث بيانات localStorage بعد النقل
      const updatedData = checkLocalStorageData();
      setLocalStorageData(updatedData);

    } catch (error) {
      console.error('خطأ في النقل:', error);
      setMigrationResult({
        success: false,
        migratedKeys: [],
        errors: [{ key: 'general', error: String(error) }],
        totalItems: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // مسح localStorage بعد النقل الناجح
  const handleClearLocalStorage = () => {
    clearLocalStorageData();
    const updatedData = checkLocalStorageData();
    setLocalStorageData(updatedData);
    setShowConfirmModal(false);
  };

  // تصدير البيانات
  const handleExportData = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportAllData(`irteqaa-backup-${timestamp}.json`);
  };

  const hasLocalStorageData = Object.keys(localStorageData).length > 0;
  const totalItems = Object.values(localStorageData).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0" dir="rtl">
            <i className="fas fa-database me-2"></i>
            إدارة نقل البيانات إلى Firestore
          </h5>
        </Card.Header>
        <Card.Body dir="rtl">
          {/* حالة localStorage */}
          <div className="mb-4">
            <h6>حالة البيانات المحلية (localStorage):</h6>
            {hasLocalStorageData ? (
              <div className="mb-3">
                <Alert variant="info">
                  <i className="fas fa-info-circle me-2"></i>
                  يوجد {Object.keys(localStorageData).length} نوع من البيانات ({totalItems} عنصر إجمالي)
                </Alert>
                <ListGroup>
                  {Object.entries(localStorageData).map(([key, count]) => (
                    <ListGroup.Item key={key} className="d-flex justify-content-between align-items-center">
                      <span>{key}</span>
                      <Badge bg="primary" pill>{count}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            ) : (
              <Alert variant="success">
                <i className="fas fa-check-circle me-2"></i>
                لا توجد بيانات في localStorage - تم النقل بالفعل أو لا توجد بيانات
              </Alert>
            )}
          </div>

          {/* أزرار العمليات */}
          <div className="d-flex gap-2 flex-wrap mb-4">
            <Button 
              variant="primary" 
              onClick={handleMigration}
              disabled={!hasLocalStorageData || isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                  جار النقل...
                </>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt me-2"></i>
                  نقل البيانات إلى Firestore
                </>
              )}
            </Button>

            <Button 
              variant="info" 
              onClick={handleExportData}
              disabled={!hasLocalStorageData}
            >
              <i className="fas fa-download me-2"></i>
              تصدير نسخة احتياطية
            </Button>

            {migrationResult?.success && (
              <Button 
                variant="warning" 
                onClick={() => setShowConfirmModal(true)}
                disabled={isLoading}
              >
                <i className="fas fa-trash me-2"></i>
                مسح البيانات المحلية
              </Button>
            )}
          </div>

          {/* نتائج النقل */}
          {migrationResult && (
            <Card className={`border-${migrationResult.success ? 'success' : 'danger'}`}>
              <Card.Header className={`bg-${migrationResult.success ? 'success' : 'danger'} text-white`}>
                <h6 className="mb-0">
                  <i className={`fas fa-${migrationResult.success ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
                  نتائج النقل
                </h6>
              </Card.Header>
              <Card.Body>
                {migrationResult.success ? (
                  <Alert variant="success">
                    ✅ تم النقل بنجاح!
                    <ul className="mb-0 mt-2">
                      <li>المفاتيح المنقولة: {migrationResult.migratedKeys.length}</li>
                      <li>إجمالي العناصر: {migrationResult.totalItems}</li>
                    </ul>
                  </Alert>
                ) : (
                  <Alert variant="danger">
                    ❌ حدثت أخطاء أثناء النقل
                  </Alert>
                )}

                {migrationResult.migratedKeys.length > 0 && (
                  <div className="mb-3">
                    <h6>البيانات المنقولة بنجاح:</h6>
                    <ListGroup>
                      {migrationResult.migratedKeys.map(key => (
                        <ListGroup.Item key={key} className="d-flex align-items-center">
                          <i className="fas fa-check text-success me-2"></i>
                          {key}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}

                {migrationResult.errors.length > 0 && (
                  <div>
                    <h6>الأخطاء:</h6>
                    <ListGroup>
                      {migrationResult.errors.map((error, index) => (
                        <ListGroup.Item key={index} variant="danger">
                          <strong>{error.key}:</strong> {error.error}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>

      {/* Modal تأكيد الحذف */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title dir="rtl">تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body dir="rtl">
          <Alert variant="warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            هذا الإجراء سيحذف جميع البيانات من localStorage بشكل دائم.
          </Alert>
          <p>
            تأكد من أن النقل تم بنجاح قبل المتابعة. هل أنت متأكد من الحذف؟
          </p>
          {backup && (
            <small className="text-muted">
              تم إنشاء نسخة احتياطية تحتوي على {Object.keys(backup).length} نوع من البيانات.
            </small>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={handleClearLocalStorage}>
            <i className="fas fa-trash me-2"></i>
            نعم، احذف البيانات
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DataMigrationPanel;
