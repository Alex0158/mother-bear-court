/**
 * 文件上傳組件（增強版）
 */

import { Upload, message, Progress, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useState, useCallback } from 'react';
import {
  MAX_FILE_SIZE,
  MAX_IMAGE_COUNT,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from '@/utils/constants';
import { formatFileSize } from '@/utils/format';
import { uploadEvidence } from '@/services/api/case';
import './FileUpload.less';

const { Text } = Typography;

interface FileUploadProps {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  maxCount?: number;
  accept?: string;
  disabled?: boolean;
  caseId?: string; // 案件ID，如果提供則實際上傳文件
  sessionId?: string; // Session ID（快速體驗模式）
  onUploadComplete?: (evidences: Array<{ id: string; file_url: string; file_type: string }>) => void; // 上傳完成回調
}

const FileUpload = ({
  value = [],
  onChange,
  maxCount = MAX_IMAGE_COUNT,
  accept = 'image/*,video/*',
  disabled = false,
  caseId,
  sessionId,
  onUploadComplete,
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // 實際上傳文件
  const handleActualUpload = useCallback(
    async (files: File[]) => {
      if (!caseId) {
        return;
      }

      try {
        setUploading(true);
        const evidences = await uploadEvidence(caseId, files, sessionId);
        
        // 更新文件列表，添加已上傳的文件信息
        const newFileList: UploadFile[] = files.map((file, index) => {
          const evidence = evidences[index];
          return {
            uid: evidence.id || file.name + Date.now(),
            name: file.name,
            status: 'done',
            url: evidence.file_url,
            response: evidence,
          } as UploadFile;
        });

        const updatedFileList = [...value, ...newFileList];
        onChange?.(updatedFileList);
        onUploadComplete?.(evidences);
        message.success(`成功上傳 ${files.length} 個文件`);
      } catch (error: any) {
        message.error(error.message || '文件上傳失敗');
        throw error;
      } finally {
        setUploading(false);
      }
    },
    [caseId, sessionId, value, onChange, onUploadComplete]
  );

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    // 檢查文件類型
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      message.error('只支持 JPG、PNG、GIF 圖片或 MP4 視頻格式');
      return Upload.LIST_IGNORE;
    }

    // 檢查文件大小
    if (file.size > MAX_FILE_SIZE) {
      message.error(`文件大小不能超過 ${formatFileSize(MAX_FILE_SIZE)}`);
      return Upload.LIST_IGNORE;
    }

    // 檢查文件數量
    if (value.length >= maxCount) {
      message.error(`最多只能上傳 ${maxCount} 個文件`);
      return Upload.LIST_IGNORE;
    }

    // 如果有caseId，則實際上傳；否則只做本地預覽
    if (caseId) {
      // 實際上傳模式：阻止自動上傳，稍後統一處理
      return false;
    } else {
      // 本地預覽模式：阻止自動上傳
      return false;
    }
  };

  const handleChange: UploadProps['onChange'] = async (info) => {
    const { fileList, file } = info;

    // 如果是新文件且狀態為uploading，開始上傳
    if (file.status === 'uploading' && file.originFileObj && caseId) {
      try {
        setUploadProgress((prev) => ({
          ...prev,
          [file.uid]: 50, // 開始上傳
        }));

        // 實際上傳文件
        await handleActualUpload([file.originFileObj]);

        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[file.uid];
          return newProgress;
        });
      } catch (error) {
        // 上傳失敗，從列表中移除
        const newFileList = fileList.filter((item) => item.uid !== file.uid);
        onChange?.(newFileList);
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[file.uid];
          return newProgress;
        });
        return;
      }
    }

    // 本地預覽模式：只更新文件列表
    if (!caseId) {
      // 為本地文件創建預覽URL
      const updatedFileList = fileList.map((item) => {
        if (item.originFileObj && !item.url && !item.preview) {
          const url = URL.createObjectURL(item.originFileObj);
          return {
            ...item,
            url,
            preview: url,
          };
        }
        return item;
      });
      onChange?.(updatedFileList);
      return;
    }

    // 實際上傳模式：更新文件列表
    onChange?.(fileList);
  };

  const handleRemove = (file: UploadFile) => {
    const newFileList = value.filter((item) => item.uid !== file.uid);
    onChange?.(newFileList);
  };

  const handlePreview = (file: UploadFile) => {
    if (file.url || file.preview) {
      window.open(file.url || file.preview, '_blank');
    }
  };

  return (
    <div className="file-upload-wrapper">
      <Upload
        fileList={value}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onRemove={handleRemove}
        onPreview={handlePreview}
        accept={accept}
        disabled={disabled}
        listType="picture-card"
        maxCount={maxCount}
        className="evidence-upload"
      >
        {value.length < maxCount && (
          <div className="upload-button">
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>上傳</div>
          </div>
        )}
      </Upload>

      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="upload-progress">
          {Object.entries(uploadProgress).map(([uid, percent]) => (
            <div key={uid} className="progress-item">
              <Progress percent={percent} size="small" />
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="file-list-info">
          <Text type="secondary">
            已上傳 {value.length} / {maxCount} 個文件
          </Text>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

