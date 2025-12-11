/**
 * 快速體驗 - 創建案件頁面（優化版）
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Progress,
  Space,
  Typography,
  Tabs,
  Collapse,
  message,
  Alert,
} from 'antd';
import {
  LockOutlined,
} from '@ant-design/icons';
import { useSessionStore } from '@/store/sessionStore';
import { useCaseStore } from '@/store/caseStore';
import { validateStatement } from '@/utils/validate';
import { MAX_IMAGE_COUNT } from '@/utils/constants';
import { localStore } from '@/utils/storage';
import BearJudge from '@/components/business/BearJudge';
import StatementInput from '@/components/business/StatementInput';
import FileUpload from '@/components/business/FileUpload';
import KeyboardShortcuts from '@/components/common/KeyboardShortcuts';
import GuideTooltip from '@/components/common/GuideTooltip';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useKeyboardNavigation } from '@/hooks/useAccessibility';
import SEO from '@/components/common/SEO';
import './Create.less';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const DRAFT_STORAGE_KEY = 'quick_case_draft';

interface CaseDraft {
  plaintiffStatement: string;
  defendantStatement: string;
  evidenceUrls: string[];
}

const QuickExperienceCreate = () => {
  const navigate = useNavigate();
  const { session, createSession } = useSessionStore();
  const { createQuickCase, isLoading } = useCaseStore();

  const { width } = useWindowSize();
  // 布局模式：'horizontal' | 'vertical'（根據屏幕寬度自動切換）
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical'>(
    width >= 768 ? 'horizontal' : 'vertical'
  );
  const [plaintiffStatement, setPlaintiffStatement] = useState('');
  const [defendantStatement, setDefendantStatement] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<any[]>([]);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | null>(null);

  // 根據屏幕寬度自動切換布局
  useEffect(() => {
    setLayoutMode(width >= 768 ? 'horizontal' : 'vertical');
  }, [width]);

  // 初始化Session
  useEffect(() => {
    if (!session) {
      createSession().catch(() => {
        // Session創建失敗，靜默處理（用戶仍可繼續使用）
      });
    }
  }, [session, createSession]);

  // 自動保存草稿
  useEffect(() => {
    const timer = setInterval(() => {
      if (plaintiffStatement || defendantStatement) {
        const draft: CaseDraft = {
          plaintiffStatement,
          defendantStatement,
          evidenceUrls: evidenceFiles.map((f: any) => f.url || '').filter(Boolean),
        };
        localStore.set(DRAFT_STORAGE_KEY, draft);
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(null), 3000);
      }
    }, 30000); // 每30秒保存一次

    return () => {
      clearInterval(timer);
    };
  }, [plaintiffStatement, defendantStatement, evidenceFiles]);

  // 恢復草稿
  useEffect(() => {
    const draft = localStore.get<CaseDraft>(DRAFT_STORAGE_KEY);
    if (draft) {
      setPlaintiffStatement(draft.plaintiffStatement || '');
      setDefendantStatement(draft.defendantStatement || '');
      // 證據文件需要重新上傳，不恢復
    }
  }, []);

  // 計算完成度
  const calculateProgress = useCallback(() => {
    let progress = 0;
    const plaintiffValid = validateStatement(plaintiffStatement).valid;
    const defendantValid = validateStatement(defendantStatement).valid;

    if (plaintiffValid) progress += 50;
    if (defendantValid) progress += 50;

    return progress;
  }, [plaintiffStatement, defendantStatement]);

  const progress = calculateProgress();
  const canSubmit = progress === 100;

  // 鍵盤快捷鍵（使用useMemo優化）
  const shortcuts = useMemo(
    () => [
      {
        key: 'ctrl+s',
        description: '保存草稿',
        action: () => {
          const draft: CaseDraft = {
            plaintiffStatement,
            defendantStatement,
            evidenceUrls: evidenceFiles.map((f: any) => f.url || '').filter(Boolean),
          };
          localStore.set(DRAFT_STORAGE_KEY, draft);
          message.success('草稿已保存');
        },
      },
      {
        key: 'ctrl+enter',
        description: '提交案件',
        action: () => {
          if (canSubmit) {
            handleSubmit();
          }
        },
      },
    ],
    [plaintiffStatement, defendantStatement, evidenceFiles, canSubmit]
  );

  // 鍵盤導航支持
  useKeyboardNavigation(
    () => {
      if (canSubmit) {
        handleSubmit();
      }
    },
    undefined,
    undefined,
    undefined,
    canSubmit
  );

  // 處理提交
  const handleSubmit = async () => {
    if (!canSubmit) {
      message.warning('請完成雙方陳述後再提交');
      return;
    }

    if (!session) {
      message.error('Session未初始化，請刷新頁面重試');
      return;
    }

    try {
      // 創建案件（快速體驗模式）
      const result = await createQuickCase({
        plaintiff_statement: plaintiffStatement.trim(),
        defendant_statement: defendantStatement.trim(),
        evidence_urls: [], // 證據將在案件創建後上傳
      });

      // 如果返回了session_id，更新Session
      if (result.session_id) {
        sessionStorage.set(result.session_id);
      }

      // 如果有證據文件，上傳證據
      const filesToUpload = evidenceFiles
        .filter((f: any) => f.originFileObj)
        .map((f: any) => f.originFileObj as File);

      if (filesToUpload.length > 0) {
        try {
          const { uploadEvidence } = await import('@/services/api/case');
          await uploadEvidence(result.case.id, filesToUpload, session.session_id);
          message.success('證據上傳成功');
        } catch (uploadError: any) {
          // 證據上傳失敗不阻止流程，只提示
          message.warning(uploadError.message || '證據上傳失敗，但案件已創建');
        }
      }

      // 清除草稿
      localStore.remove(DRAFT_STORAGE_KEY);

      // 跳轉到判決結果頁面（使用案件ID）
      navigate(`/quick-experience/result/${result.case.id}`);
    } catch (error: any) {
      message.error(error.message || '提交失敗，請稍後再試');
    }
  };


  return (
    <>
      <SEO
        title="快速體驗 - 創建案件"
        description="填寫雙方陳述，立即獲得AI判決"
        keywords="快速體驗,創建案件,AI判決"
      />
      <div className="quick-experience-create" role="main" aria-label="快速體驗創建案件頁面">
        {/* 跳過鏈接（可訪問性） */}
        <a href="#input-section" className="skip-link">
          跳過到輸入區域
        </a>

        {/* 引導區域 */}
        <AnimatedWrapper animation="fade" delay={100}>
          <section className="guide-section" aria-labelledby="guide-title">
            <BearJudge size="medium" animated />
            <Title level={2} id="guide-title" className="guide-title">
              請雙方分別填寫陳述
            </Title>
            <Text className="guide-subtitle">我們會公正、溫暖地幫助你們解決問題</Text>
          </section>
        </AnimatedWrapper>

      {/* 自動保存提示 */}
      {autoSaveStatus === 'saved' && (
        <Alert
          message="已自動保存"
          type="success"
          showIcon
          closable
          style={{ margin: '16px auto', maxWidth: 1200 }}
        />
      )}

        {/* 單人雙角色輸入區域 */}
        <AnimatedWrapper animation="slide" direction="up" delay={200} trigger="intersection">
          <section id="input-section" className="input-section" aria-labelledby="input-section-title">
            <div className="container">
              {/* 布局選擇器 */}
              <div className="layout-selector" role="group" aria-label="布局選擇">
                <Tabs
                  activeKey={layoutMode}
                  onChange={(key) => setLayoutMode(key as 'horizontal' | 'vertical')}
                  items={[
                    { key: 'horizontal', label: '左右分屏' },
                    { key: 'vertical', label: '上下分屏' },
                  ]}
                  aria-label="選擇布局模式"
                />
              </div>

              {/* 輸入區域 */}
              <div className={`input-area ${layoutMode}`} role="group" aria-label="雙方陳述輸入區域">
                {/* 角色A輸入區 */}
                <AnimatedWrapper animation="fade" delay={300} trigger="intersection">
                  <Card
                    className="statement-card plaintiff-card"
                    role="article"
                    aria-labelledby="plaintiff-title"
                    tabIndex={0}
                  >
                    <div className="card-header">
                      <span className="role-badge role-a" aria-hidden="true">
                        角色A
                      </span>
                      <Title level={4} id="plaintiff-title" className="card-title">
                        角色A的陳述
                      </Title>
                    </div>

                    <StatementInput
                      value={plaintiffStatement}
                      onChange={setPlaintiffStatement}
                      label="角色A的陳述"
                      role="plaintiff"
                      showGuide={true}
                      onValidationChange={() => {
                        // 驗證狀態變化處理
                      }}
                    />
                  </Card>
                </AnimatedWrapper>

                {/* 中間分隔區域 */}
                <div className="divider" aria-hidden="true">
                  <BearJudge size="small" animated />
                </div>

                {/* 角色B輸入區 */}
                <AnimatedWrapper animation="fade" delay={400} trigger="intersection">
                  <Card
                    className="statement-card defendant-card"
                    role="article"
                    aria-labelledby="defendant-title"
                    tabIndex={0}
                  >
                    <div className="card-header">
                      <span className="role-badge role-b" aria-hidden="true">
                        角色B
                      </span>
                      <Title level={4} id="defendant-title" className="card-title">
                        角色B的陳述
                      </Title>
                    </div>

                    <StatementInput
                      value={defendantStatement}
                      onChange={setDefendantStatement}
                      label="角色B的陳述"
                      role="defendant"
                      showGuide={true}
                      onValidationChange={() => {
                        // 驗證狀態變化處理
                      }}
                    />
                  </Card>
                </AnimatedWrapper>
              </div>
            </div>
          </section>
        </AnimatedWrapper>

      {/* 證據上傳區域（可選） */}
      <section className="evidence-section">
        <div className="container">
          <Collapse defaultActiveKey={[]}>
            <Panel header="上傳證據（可選）" key="evidence">
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                最多3張圖片或1個視頻，單個文件不超過5MB
              </Text>
              <FileUpload
                value={evidenceFiles}
                onChange={setEvidenceFiles}
                maxCount={MAX_IMAGE_COUNT}
              />
            </Panel>
          </Collapse>
        </div>
      </section>

      {/* 註冊引導區域 */}
      {showRegisterPrompt && (
        <section className="register-prompt-section">
          <div className="container">
            <Alert
              message={
                <Space>
                  <LockOutlined />
                  <span>註冊後可保存記錄</span>
                </Space>
              }
              description="註冊後可查看歷史判決、生成和好方案、執行追蹤"
              type="info"
              action={
                <Space>
                  <Button size="small" onClick={() => navigate('/auth/register')}>
                    立即註冊
                  </Button>
                  <Button size="small" type="text" onClick={() => setShowRegisterPrompt(false)}>
                    關閉
                  </Button>
                </Space>
              }
              closable
              onClose={() => setShowRegisterPrompt(false)}
            />
          </div>
        </section>
      )}

      {/* 鍵盤快捷鍵支持 */}
      <KeyboardShortcuts shortcuts={shortcuts} showHelp={true} />

        {/* 提交區域 */}
        <AnimatedWrapper animation="slide" direction="up" delay={500} trigger="intersection">
          <section className="submit-section" aria-labelledby="submit-section-title">
            <div className="container">
              {canSubmit && (
                <div className="progress-display" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                  <Progress percent={progress} status="success" />
                  <Text>已完成 {progress}%</Text>
                </div>
              )}

              <div className="submit-actions">
                <GuideTooltip
                  content="提示：按 Ctrl+Enter 可快速提交案件，按 Ctrl+K 查看所有快捷鍵"
                  storageKey="quick_submit_guide"
                  placement="top"
                >
                  <Button
                    type="primary"
                    size="large"
                    loading={isLoading}
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    className="submit-button"
                    aria-label={canSubmit ? '提交案件' : '請完成雙方陳述後再提交'}
                    aria-describedby="submit-hints"
                  >
                    {isLoading ? 'AI正在分析中...' : '提交案件'}
                  </Button>
                </GuideTooltip>

                <div id="submit-hints" className="submit-hints">
                  <Text type="secondary">提交後，AI將自動分析並生成判決</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    預計等待時間：30-60秒
                  </Text>
                </div>
              </div>
            </div>
          </section>
        </AnimatedWrapper>
      </div>
    </>
  );
};

export default QuickExperienceCreate;

