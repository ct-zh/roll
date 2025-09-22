import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Image, Type, Save, RotateCcw } from 'lucide-react';
import { ConfigModalProps, SlotItem, DEFAULT_ITEMS } from '../types';
import { SlotItemStorage } from '../lib/storage';
import { LotteryEngine } from '../lib/lottery';
import Modal from './Modal';

/**
 * 配置弹框组件
 * 用于管理转盘项目的添加、编辑、删除
 */
export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  items,
  onItemsChange
}) => {
  const [editingItem, setEditingItem] = useState<SlotItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    type: 'text' as 'text' | 'image-text',
    imageUrl: '',
    weight: 1
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 重置表单
  const resetForm = () => {
    setFormData({
      text: '',
      type: 'text',
      imageUrl: '',
      weight: 1
    });
    setEditingItem(null);
    setIsEditing(false);
    setValidationErrors([]);
  };

  // 验证表单
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.text.trim()) {
      errors.push('项目文案不能为空');
    }
    
    if (formData.text.length > 20) {
      errors.push('项目文案不能超过20个字符');
    }
    
    if (formData.weight <= 0) {
      errors.push('权重必须大于0');
    }
    
    if (formData.weight > 100) {
      errors.push('权重不能超过100');
    }
    
    if (formData.type === 'image-text' && formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      errors.push('图片URL格式不正确');
    }
    
    // 检查重复文案（编辑时排除自己）
    const existingTexts = items
      .filter(item => editingItem ? item.id !== editingItem.id : true)
      .map(item => item.text.toLowerCase());
    
    if (existingTexts.includes(formData.text.toLowerCase())) {
      errors.push('项目文案不能重复');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // 验证URL格式
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 开始编辑项目
  const startEdit = (item: SlotItem) => {
    setEditingItem(item);
    setFormData({
      text: item.text,
      type: item.type,
      imageUrl: item.imageUrl || '',
      weight: item.weight
    });
    setIsEditing(true);
    setValidationErrors([]);
  };

  // 开始添加新项目
  const startAdd = () => {
    resetForm();
    setIsEditing(true);
  };

  // 保存项目
  const saveItem = () => {
    if (!validateForm()) {
      return;
    }

    const newItem: SlotItem = {
      id: editingItem?.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: formData.text.trim(),
      type: formData.type,
      imageUrl: formData.type === 'image-text' ? formData.imageUrl : undefined,
      weight: formData.weight,
      isDefault: false
    };

    let updatedItems: SlotItem[];
    
    if (editingItem) {
      // 编辑现有项目
      updatedItems = items.map(item => 
        item.id === editingItem.id ? newItem : item
      );
    } else {
      // 添加新项目
      updatedItems = [...items, newItem];
    }

    // 更新自定义项目存储
    const customItems = updatedItems.filter(item => !item.isDefault);
    SlotItemStorage.saveCustomItems(customItems);
    
    onItemsChange(updatedItems);
    resetForm();
  };

  // 删除项目
  const deleteItem = (item: SlotItem) => {
    if (item.isDefault) {
      return; // 不能删除默认项目
    }

    const updatedItems = items.filter(i => i.id !== item.id);
    
    // 更新自定义项目存储
    const customItems = updatedItems.filter(item => !item.isDefault);
    SlotItemStorage.saveCustomItems(customItems);
    
    onItemsChange(updatedItems);
  };

  // 重置为默认配置
  const resetToDefault = () => {
    if (confirm('确定要重置为默认配置吗？这将删除所有自定义项目。')) {
      SlotItemStorage.saveCustomItems([]);
      onItemsChange(DEFAULT_ITEMS);
    }
  };

  // 获取配置验证结果
  const configValidation = LotteryEngine.validateWheelConfig(items);

  // 渲染项目列表
  const renderItemList = () => (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className="flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: item.isDefault ? 'var(--color-accent)' : 'var(--color-primary)'
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          {/* 项目预览 */}
          <div className="flex-shrink-0">
            {item.type === 'image-text' && item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.text}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {item.type === 'image-text' ? '🖼️' : '📝'}
              </div>
            )}
          </div>

          {/* 项目信息 */}
          <div className="flex-1">
            <div className="font-medium" style={{ color: 'var(--color-text)' }}>
              {item.text}
            </div>
            <div className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
              权重: {item.weight} • 类型: {item.type === 'text' ? '纯文案' : '图片+文案'}
              {item.isDefault && ' • 默认项目'}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-2">
            <motion.button
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onClick={() => startEdit(item)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="编辑"
            >
              <Edit3 size={16} style={{ color: 'var(--color-background)' }} />
            </motion.button>
            
            {!item.isDefault && (
              <motion.button
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--color-secondary)' }}
                onClick={() => deleteItem(item)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="删除"
              >
                <Trash2 size={16} style={{ color: 'var(--color-text)' }} />
              </motion.button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  // 渲染编辑表单
  const renderEditForm = () => (
    <motion.div
      className="space-y-4 p-6 rounded-lg border-2"
      style={{
        backgroundColor: 'var(--color-background)',
        borderColor: 'var(--color-primary)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
        {editingItem ? '编辑项目' : '添加新项目'}
      </h3>

      {/* 项目文案 */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          项目文案 *
        </label>
        <input
          type="text"
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border-2 transition-colors"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-accent)',
            color: 'var(--color-text)'
          }}
          placeholder="请输入项目文案"
          maxLength={20}
        />
      </div>

      {/* 项目类型 */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          项目类型
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="text"
              checked={formData.type === 'text'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' })}
              className="text-blue-600"
            />
            <Type size={16} style={{ color: 'var(--color-text)' }} />
            <span style={{ color: 'var(--color-text)' }}>纯文案</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="image-text"
              checked={formData.type === 'image-text'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'image-text' })}
              className="text-blue-600"
            />
            <Image size={16} style={{ color: 'var(--color-text)' }} />
            <span style={{ color: 'var(--color-text)' }}>图片+文案</span>
          </label>
        </div>
      </div>

      {/* 图片URL */}
      {formData.type === 'image-text' && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            图片URL
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 transition-colors"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-accent)',
              color: 'var(--color-text)'
            }}
            placeholder="请输入图片URL"
          />
        </div>
      )}

      {/* 权重 */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          权重 (1-100)
        </label>
        <input
          type="number"
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 1 })}
          className="w-full px-4 py-2 rounded-lg border-2 transition-colors"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-accent)',
            color: 'var(--color-text)'
          }}
          min={1}
          max={100}
        />
        <div className="text-xs mt-1 opacity-70" style={{ color: 'var(--color-text)' }}>
          权重越高，被抽中的概率越大
        </div>
      </div>

      {/* 验证错误 */}
      {validationErrors.length > 0 && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary)' }}>
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
            请修正以下错误：
          </div>
          <ul className="text-sm space-y-1" style={{ color: 'var(--color-text)' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex space-x-3">
        <motion.button
          className="flex-1 btn-base btn-primary"
          onClick={saveItem}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Save size={16} className="mr-2" />
          保存
        </motion.button>
        <motion.button
          className="flex-1 btn-base btn-secondary"
          onClick={resetForm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          取消
        </motion.button>
      </div>
    </motion.div>
  );

  // 渲染配置验证信息
  const renderValidationInfo = () => {
    if (configValidation.isValid && configValidation.warnings.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        {configValidation.errors.length > 0 && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary)' }}>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              配置错误：
            </div>
            <ul className="text-sm space-y-1" style={{ color: 'var(--color-text)' }}>
              {configValidation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {configValidation.warnings.length > 0 && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-accent)' }}>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              配置建议：
            </div>
            <ul className="text-sm space-y-1" style={{ color: 'var(--color-text)' }}>
              {configValidation.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="转盘配置">
      <div className="space-y-6">
        {/* 配置验证信息 */}
        {renderValidationInfo()}
        
        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <motion.button
            className="btn-base btn-primary"
            onClick={startAdd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} className="mr-2" />
            添加项目
          </motion.button>
          
          <motion.button
            className="btn-base btn-secondary"
            onClick={resetToDefault}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw size={16} className="mr-2" />
            重置默认
          </motion.button>
        </div>

        {/* 编辑表单 */}
        <AnimatePresence>
          {isEditing && renderEditForm()}
        </AnimatePresence>

        {/* 项目列表 */}
        <div>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            当前项目 ({items.length})
          </h3>
          {renderItemList()}
        </div>

        {/* 概率预览 */}
        <div>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            抽取概率预览
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LotteryEngine.calculateProbabilities(items).map((prob) => (
              <div
                key={prob.id}
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {prob.text}
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                  {prob.probabilityText}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfigModal;