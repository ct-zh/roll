import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, History, Palette } from 'lucide-react';
import { SlotItem, ThemeConfig, HistoryRecord, SlotMachineProps } from '../types';
import { LotteryEngine } from '../lib/lottery';
import { HistoryStorage } from '../lib/storage';
import { ThemeManager } from '../lib/theme';
import Wheel from './Wheel';
import Lever from './Lever';

/**
 * 老虎机主组件
 * 整合转盘、拨杆和主界面布局
 */
export const SlotMachine: React.FC<SlotMachineProps> = ({
  items,
  onSpin,
  isSpinning,
  theme
}) => {
  const [selectedItem, setSelectedItem] = useState<SlotItem | undefined>();
  const [lastResult, setLastResult] = useState<SlotItem | undefined>();
  const [showResult, setShowResult] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [recentResults, setRecentResults] = useState<string[]>([]);

  // 加载历史记录
  useEffect(() => {
    const records = HistoryStorage.getRecords();
    const recent = records.slice(0, 3).map(r => r.itemId);
    setRecentResults(recent);
    setSpinCount(records.length);
  }, []);

  // 处理拨杆拉动
  const handleLeverPull = useCallback(() => {
    if (isSpinning || !items || items.length === 0) {
      return;
    }

    try {
      // 使用防重复算法进行抽取
      const result = LotteryEngine.antiRepeatRandomSelect(items, recentResults, 2);
      
      setSelectedItem(result);
      setShowResult(false);
      
      // 通知父组件开始旋转
      onSpin(result);
    } catch (error) {
      console.error('抽取失败:', error);
    }
  }, [items, recentResults, isSpinning, onSpin]);

  // 处理转盘旋转完成
  const handleSpinComplete = useCallback((result: SlotItem) => {
    setLastResult(result);
    setShowResult(true);
    
    // 创建历史记录
    const record = LotteryEngine.createHistoryRecord(result);
    HistoryStorage.addRecord(record);
    
    // 更新最近结果
    setRecentResults(prev => [result.id, ...prev.slice(0, 2)]);
    setSpinCount(prev => prev + 1);
  }, []);

  // 获取主题相关的样式
  const getThemeStyles = () => {
    return {
      background: theme.id === 'classic' 
        ? `radial-gradient(circle at center, ${theme.colors.background}, ${theme.colors.primary}20)`
        : theme.id === 'modern'
        ? `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.primary}10)`
        : theme.id === 'dark'
        ? `radial-gradient(circle at center, ${theme.colors.background}, ${theme.colors.secondary}10)`
        : `linear-gradient(45deg, ${theme.colors.background}, ${theme.colors.primary}10, ${theme.colors.secondary}10)`,
      border: `4px solid ${theme.colors.primary}`,
      boxShadow: theme.id === 'dark' 
        ? `0 0 40px ${theme.colors.secondary}40`
        : `0 8px 32px ${theme.colors.primary}30`
    };
  };

  const machineStyles = getThemeStyles();

  // 渲染结果显示






  // 渲染功能按钮
  const renderActionButtons = () => (
    <div className="absolute top-4 right-4 flex flex-col space-y-2">
      <motion.button
        className="p-3 rounded-full backdrop-blur-md border-2 transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: `${theme.colors.primary}20`,
          borderColor: theme.colors.primary,
          color: theme.colors.text
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="主题切换"
      >
        <Palette size={20} />
      </motion.button>
      
      <motion.button
        className="p-3 rounded-full backdrop-blur-md border-2 transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: `${theme.colors.secondary}20`,
          borderColor: theme.colors.secondary,
          color: theme.colors.text
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="配置设置"
      >
        <Settings size={20} />
      </motion.button>
      
      <motion.button
        className="p-3 rounded-full backdrop-blur-md border-2 transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: `${theme.colors.accent}20`,
          borderColor: theme.colors.accent,
          color: theme.colors.text
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="历史记录"
      >
        <History size={20} />
      </motion.button>
    </div>
  );



  if (!items || items.length === 0) {
    return (
      <div className="relative w-full max-w-4xl mx-auto h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎰</div>
          <div className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
            欢迎使用幸运转盘
          </div>
          <div className="text-lg opacity-70" style={{ color: theme.colors.text }}>
            请先配置转盘项目开始游戏
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* 老虎机主体 */}
      <div className="relative h-96 md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden">

        

        
        {/* 主要内容区域 */}
        <div className="relative h-full flex items-center justify-center px-8 py-12">
          {/* 转盘区域 */}
          <Wheel
            items={items}
            selectedItem={selectedItem}
            isSpinning={isSpinning}
            theme={theme}
            onSpinComplete={handleSpinComplete}
          />
          
          {/* 拨杆区域 */}
          <div className="ml-8">
            <Lever
              onPull={handleLeverPull}
              isDisabled={isSpinning}
              theme={theme}
            />
          </div>
        </div>
        

        
        {/* 功能按钮 */}
        {renderActionButtons()}
        

      </div>
    </div>
  );
};

export default SlotMachine;