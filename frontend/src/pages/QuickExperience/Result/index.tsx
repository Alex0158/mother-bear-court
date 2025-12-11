/**
 * 快速體驗 - 判決結果頁面（優化版）
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Space,
  Collapse,
  Spin,
  Alert,
  message,
} from 'antd';
import {
  QuestionCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useJudgmentStore } from '@/store/judgmentStore';
import { getJudgmentByCaseId } from '@/services/api/judgment';
import type { Judgment } from '@/types/judgment';
import BearJudge from '@/components/business/BearJudge';
import ResponsibilityRatio from '@/components/business/ResponsibilityRatio';
import JudgmentViewer from '@/components/business/JudgmentViewer';
import Skeleton from '@/components/common/Skeleton';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { usePolling } from '@/hooks/usePolling';
import { POLLING_INTERVAL } from '@/utils/constants';
import SEO from '@/components/common/SEO';
import './Result.less';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const QuickExperienceResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoading, error } = useJudgmentStore();

  const [judgment, setJudgment] = useState<Judgment | null>(null);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(true);

  // 獲取判決（支持輪詢）
  const fetchJudgment = async (): Promise<Judgment | null> => {
    if (!id) {
      message.error('案件ID不存在');
      navigate('/quick-experience/create');
      return null;
    }

    try {
      const judgmentData = await getJudgmentByCaseId(id);
      if (judgmentData) {
        setJudgment(judgmentData);
        return judgmentData;
      }
      return null;
    } catch (error: any) {
      // 如果是404，繼續輪詢
      if (error.code === 'HTTP_404' || error.code === 'JUDGMENT_NOT_FOUND') {
        return null;
      }
      // 其他錯誤，停止輪詢
      console.error('Failed to fetch judgment:', error);
      return null;
    }
  };

  // 初始獲取
  useEffect(() => {
    fetchJudgment();
  }, [id]);

  // 輪詢判決狀態（如果判決尚未生成）
  const { startPolling, stopPolling } = usePolling(
    fetchJudgment,
    POLLING_INTERVAL,
    (data) => data !== null // 找到判決時停止
  );

  useEffect(() => {
    if (!judgment && id) {
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [judgment, id, startPolling, stopPolling]);

  if (isLoading && !judgment) {
    return (
      <div className="loading-container">
        <Skeleton type="card" rows={5} />
      </div>
    );
  }

  if (error && !judgment) {
    return (
      <div className="error-container">
        <Alert message="獲取判決失敗" description={error} type="error" showIcon />
        <Button type="primary" onClick={() => navigate('/quick-experience/create')}>
          返回創建頁面
        </Button>
      </div>
    );
  }

  if (!judgment) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="判決正在生成中，請稍候..." />
        <Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
          預計等待時間：30-60秒
        </Text>
      </div>
    );
  }

  const { responsibility_ratio } = judgment;

  // 使用useMemo優化計算
  const responsibilityRatioMemo = useMemo(() => responsibility_ratio, [responsibility_ratio]);

  return (
    <>
      <SEO
        title="判決結果 - 快速體驗"
        description={`責任分比例：角色A ${responsibility_ratio.plaintiff}%，角色B ${responsibility_ratio.defendant}%`}
        keywords="判決結果,責任分比例,AI判決"
      />
      <div className="quick-experience-result" role="main" aria-label="判決結果頁面">
        {/* 跳過鏈接（可訪問性） */}
        <a href="#judgment-section" className="skip-link">
          跳過到判決內容
        </a>

        {/* 判決結果標題區域 */}
        <AnimatedWrapper animation="fade" delay={100}>
          <section className="result-header" aria-labelledby="result-title">
            <BearJudge size="large" animated />
            <Title level={1} id="result-title" className="result-title">
              判決結果
            </Title>
            <Text className="result-subtitle">基於AI分析的公正判決</Text>
          </section>
        </AnimatedWrapper>

        {/* 判決摘要卡片 */}
        <AnimatedWrapper animation="slide" direction="up" delay={200} trigger="intersection">
          <section className="summary-section" aria-labelledby="summary-title">
            <div className="container">
              <Collapse defaultActiveKey={['summary']}>
                <Panel header={<span id="summary-title">判決摘要</span>} key="summary">
                  <div className="summary-content">
                    {judgment.summary && (
                      <div className="summary-item" role="article">
                        <QuestionCircleOutlined className="summary-icon" aria-hidden="true" />
                        <Text className="summary-text">{judgment.summary}</Text>
                      </div>
                    )}
                  </div>
                </Panel>
              </Collapse>
            </div>
          </section>
        </AnimatedWrapper>

        {/* 責任分比例展示 */}
        <AnimatedWrapper animation="scale" delay={300} trigger="intersection">
          <section className="responsibility-section" aria-labelledby="responsibility-title">
            <div className="container">
              <Card className="responsibility-card">
                <Title level={3} id="responsibility-title" className="section-title">
                  責任分比例
                </Title>
                <ResponsibilityRatio
                  ratio={responsibilityRatioMemo}
                  showLabels={true}
                  size="large"
                />
              </Card>
            </div>
          </section>
        </AnimatedWrapper>

        {/* 完整判決書區域 */}
        <AnimatedWrapper animation="fade" delay={400} trigger="intersection">
          <section id="judgment-section" className="judgment-section" aria-labelledby="judgment-title">
            <div className="container">
              <JudgmentViewer
                content={judgment.judgment_content}
                title="完整判決書"
                onShare={() => {
                  message.info('分享功能開發中');
                }}
                onFavorite={() => {
                  message.info('收藏功能需要註冊後使用');
                }}
                showActions={true}
              />
            </div>
          </section>
        </AnimatedWrapper>

        {/* 操作區域 */}
        <AnimatedWrapper animation="slide" direction="up" delay={500} trigger="intersection">
          <section className="actions-section" aria-labelledby="actions-title">
            <div className="container">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* 主要操作 */}
                <div className="primary-actions" role="group" aria-label="主要操作">
                  <Button
                    type="primary"
                    size="large"
                    icon={<LockOutlined />}
                    disabled
                    onClick={() => navigate('/auth/register')}
                    aria-label="生成和好方案，需要註冊"
                    aria-describedby="register-prompt"
                  >
                    生成和好方案（需註冊）
                  </Button>
                  <Button
                    size="large"
                    icon={<LockOutlined />}
                    disabled
                    aria-label="保存記錄，需要註冊"
                    aria-describedby="register-prompt"
                  >
                    保存記錄（需註冊）
                  </Button>
                </div>
              </Space>
            </div>
          </section>
        </AnimatedWrapper>

        {/* 註冊引導 */}
        {showRegisterPrompt && (
          <AnimatedWrapper animation="slide" direction="up" delay={600} trigger="intersection">
            <section className="register-prompt-section" aria-labelledby="register-prompt">
              <div className="container">
                <Alert
                  id="register-prompt"
                  message="想要保存記錄和獲得更多功能？"
                  description="註冊後可查看歷史判決、生成和好方案、執行追蹤"
                  type="info"
                  action={
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => navigate('/auth/register')}
                        aria-label="立即註冊"
                      >
                        立即註冊
                      </Button>
                      <Button
                        onClick={() => setShowRegisterPrompt(false)}
                        aria-label="稍後再說"
                      >
                        稍後再說
                      </Button>
                    </Space>
                  }
                  closable
                  onClose={() => setShowRegisterPrompt(false)}
                />
              </div>
            </section>
          </AnimatedWrapper>
        )}
      </div>
    </>
  );
};

export default QuickExperienceResult;

