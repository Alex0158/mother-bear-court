/**
 * 個人資料頁面
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Upload,
  Avatar,
  Space,
  message,
  Spin,
} from 'antd';
import {
  UserOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { getProfile, updateProfile } from '@/services/api/user';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import SEO from '@/components/common/SEO';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import './Index.less';

const { Title } = Typography;

const ProfileIndex = () => {
  const [form] = Form.useForm();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profile = await getProfile();
      form.setFieldsValue(profile);
      updateUser(profile);
    } catch (error: any) {
      message.error(error.message || '獲取個人資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      const updatedUser = await updateProfile(values);
      updateUser(updatedUser);
      message.success('個人資料更新成功');
    } catch (error: any) {
      message.error(error.message || '更新失敗');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-index-page">
        <Spin size="large" tip="加載中..." />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <SEO
        title="個人資料 - 熊媽媽法庭"
        description="查看和編輯您的個人資料"
      />
      <div className="profile-index-page" role="main" aria-label="個人資料頁面">
        <AnimatedWrapper animation="fade" delay={100}>
          <Title level={2} id="profile-title">
            個人資料
          </Title>
        </AnimatedWrapper>

        <AnimatedWrapper animation="slide" direction="up" delay={200} trigger="intersection">
          <Card role="article" aria-labelledby="profile-title">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              aria-label="個人資料表單"
            >
            <Form.Item label="頭像">
              <Space>
                <Avatar
                  src={user?.avatar_url}
                  icon={<UserOutlined />}
                  size={64}
                />
                <Upload
                  name="avatar"
                  listType="text"
                  showUploadList={false}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>上傳頭像</Button>
                </Upload>
              </Space>
            </Form.Item>

            <Form.Item
              name="nickname"
              label="暱稱"
            >
              <Input placeholder="請輸入暱稱" maxLength={20} />
            </Form.Item>

            <Form.Item
              name="email"
              label="郵箱"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                aria-label="保存個人資料"
              >
                保存
              </Button>
            </Form.Item>
          </Form>
          </Card>
        </AnimatedWrapper>
      </div>
    </ProtectedRoute>
  );
};

export default ProfileIndex;

