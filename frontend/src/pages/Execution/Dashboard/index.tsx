/**
 * 執行看板頁面
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Progress,
  Empty,
  Spin,
  message,
} from 'antd';
import {
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { ExecutionStatus } from '@/services/api/execution';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import SEO from '@/components/common/SEO';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import './Dashboard.less';

const { Title, Text } = Typography;

const ExecutionDashboard = () => {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState<ExecutionStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      // 這裡應該調用獲取所有執行狀態的API
      // 暫時使用空數組
      setExecutions([]);
    } catch (error: any) {
      message.error(error.message || '獲取執行狀態失敗');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: '待開始' },
      in_progress: { color: 'processing', text: '執行中' },
      completed: { color: 'success', text: '已完成' },
      skipped: { color: 'warning', text: '已跳過' },
    };
    const config = map[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <ProtectedRoute>
      <SEO
        title="執行看板 - 熊媽媽法庭"
        description="查看所有執行中的和好方案"
      />
      <div className="execution-dashboard-page" role="main" aria-label="執行看板頁面">
        <AnimatedWrapper animation="fade" delay={100}>
          <div className="page-header" aria-labelledby="dashboard-title">
            <Title level={2} id="dashboard-title">
              執行看板
            </Title>
            <Text type="secondary">追蹤和好方案的執行情況</Text>
          </div>
        </AnimatedWrapper>

        <Spin spinning={loading} tip="加載中...">
          {executions.length === 0 ? (
            <AnimatedWrapper animation="fade" delay={200}>
              <Empty description="暫無執行中的方案" aria-label="空狀態：暫無執行中的方案" />
            </AnimatedWrapper>
          ) : (
            <AnimatedWrapper animation="fade" delay={200} trigger="intersection">
              <Row gutter={[24, 24]} role="list" aria-label="執行方案列表">
                {executions.map((execution, index) => (
                  <Col xs={24} sm={12} md={8} key={execution.plan_id}>
                  <AnimatedWrapper
                    animation="slide"
                    direction="up"
                    delay={index * 50}
                    trigger="intersection"
                  >
                    <Card
                      className="execution-card"
                      hoverable
                      role="article"
                      aria-labelledby={`execution-${execution.plan_id}`}
                      tabIndex={0}
                      actions={[
                        <Button
                          key="checkin"
                          type="link"
                          icon={<PlayCircleOutlined />}
                          onClick={() => navigate(`/execution/${execution.plan_id}/checkin`)}
                          aria-label={`為方案 ${execution.plan_id.substring(0, 8)} 打卡`}
                        >
                          打卡
                        </Button>,
                      ]}
                    >
                    <div className="execution-header">
                      <Space>
                        {getStatusTag(execution.status)}
                        <Text strong>方案 #{execution.plan_id.substring(0, 8)}</Text>
                      </Space>
                    </div>

                    <div className="execution-progress">
                      <Progress
                        percent={execution.progress}
                        status={execution.status === 'completed' ? 'success' : 'active'}
                      />
                    </div>

                    <div className="execution-records">
                      <Text type="secondary">
                        已記錄 {execution.records.length} 次打卡
                      </Text>
                    </div>
                    </Card>
                  </AnimatedWrapper>
                </Col>
              ))}
              </Row>
            </AnimatedWrapper>
          )}
        </Spin>
      </div>
    </ProtectedRoute>
  );
};

export default ExecutionDashboard;

