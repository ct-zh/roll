import React from 'react';
import { motion } from 'framer-motion';
import { HistoryModalProps, HistoryRecord } from '../types';
import Modal from './Modal';

/**
 * 历史记录弹框组件
 * 显示抽取历史记录列表
 */
export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  records
}) => {

  // 格式化时间为详细格式
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };







  // 渲染历史记录列表
  const renderHistoryList = () => {
    if (records.length === 0) {
      return (
        <div className="text-center py-8" style={{ color: 'var(--color-text)' }}>
          暂无历史记录
        </div>
      );
    }

    // 按时间倒序排列
    const sortedRecords = [...records].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
      <div className="space-y-3">
        {sortedRecords.map((record, index) => (
          <motion.div
            key={record.id}
            className="flex items-center justify-between p-4 rounded-lg border-2"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-accent)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-4">
              {/* 序号 */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-background)' }}
              >
                {index + 1}
              </div>
              
              {/* 结果信息 */}
              <div>
                <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {record.result}
                </div>
                <div className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                  {formatTime(record.timestamp)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };



  return (
    <Modal isOpen={isOpen} onClose={onClose} title="历史记录">
      <div className="space-y-6">
        {/* 历史记录列表 */}
        {renderHistoryList()}
      </div>
    </Modal>
  );
};

export default HistoryModal;