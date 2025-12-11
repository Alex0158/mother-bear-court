/**
 * 設置頁面
 */

import { Card, Form, Switch, Button, Typography, message } from 'antd';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import SEO from '@/components/common/SEO';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import './Settings.less';

const { Title } = Typography;

const ProfileSettings = () => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    // TODO: 實現設置保存
    message.success('設置已保存');
  };

  return (
    <ProtectedRoute>
      <SEO
        title="設置 - 熊媽媽法庭"
        description="賬號設置和偏好設置"
      />
      <div className="profile-settings-page" role="main" aria-label="設置頁面">
        <AnimatedWrapper animation="fade" delay={100}>
          <Title level={2} id="settings-title">設置</Title>
        </AnimatedWrapper>

        <AnimatedWrapper animation="slide" direction="up" delay={200} trigger="intersection">
          <Card title="通知設置" role="article" aria-labelledby="settings-title">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              notification_enabled: true,
            }}
          >
            <Form.Item
              name="notification_enabled"
              label="啟用通知"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                保存設置
              </Button>
            </Form.Item>
          </Form>
          </Card>
        </AnimatedWrapper>
      </div>
    </ProtectedRoute>
  );
};

export default ProfileSettings;

