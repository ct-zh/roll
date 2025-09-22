import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlotItem, ThemeConfig, WheelProps } from '../types';
import { LotteryEngine, WheelAnimationController } from '../lib/lottery';
import { ThemeManager } from '../lib/theme';

/**
 * 转盘组件
 * 负责显示转盘项目和执行旋转动画
 */
export const Wheel: React.FC<WheelProps> = ({
  items,
  selectedItem,
  isSpinning,
  theme,
  onSpinComplete
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const animationController = useRef<WheelAnimationController | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [itemPositions, setItemPositions] = useState<any[]>([]);

  // 初始化动画控制器
  useEffect(() => {
    if (wheelRef.current) {
      animationController.current = new WheelAnimationController(wheelRef.current);
    }
    return () => {
      animationController.current?.stop();
    };
  }, []);

  // 计算项目位置
  useEffect(() => {
    const positions = LotteryEngine.generateItemPositions(items, 120);
    setItemPositions(positions);
  }, [items]);

  // 处理旋转动画
  const handleSpin = useCallback(async (targetItem: SlotItem) => {
    if (!animationController.current || isSpinning) {
      return;
    }

    try {
      // 计算旋转角度
      const rotationAngle = LotteryEngine.calculateRotationAngle(items, targetItem, 5);
      
      // 获取动画配置
      const animationConfig = ThemeManager.getAnimationConfig(theme.id as any);
      const duration = theme.id === 'rainbow' ? 2000 : theme.id === 'modern' ? 2500 : 3000;
      
      // 执行旋转动画
      await animationController.current.spin(rotationAngle, duration);
      
      // 更新当前旋转角度
      setCurrentRotation(rotationAngle % 360);
      
      // 通知父组件动画完成
      onSpinComplete(targetItem);
    } catch (error) {
      console.error('转盘旋转动画失败:', error);
    }
  }, [items, theme, isSpinning, onSpinComplete]);

  // 监听选中项目变化，触发旋转
  useEffect(() => {
    if (selectedItem && isSpinning) {
      handleSpin(selectedItem);
    }
  }, [selectedItem, isSpinning, handleSpin]);

  // 获取主题相关的CSS类名
  const getThemeClasses = () => {
    const baseClasses = 'transition-all duration-300';
    switch (theme.id) {
      case 'classic':
        return `${baseClasses} shadow-theme`;
      case 'modern':
        return `${baseClasses} shadow-lg`;
      case 'dark':
        return `${baseClasses} shadow-theme`;
      case 'rainbow':
        return `${baseClasses} shadow-xl`;
      default:
        return baseClasses;
    }
  };

  // 获取项目的颜色
  const getItemColor = (index: number) => {
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.text
    ];
    return colors[index % colors.length];
  };

  // 渲染转盘项目
  const renderWheelItem = (position: any, index: number) => {
    const { item, angle, transform } = position;
    const isSelected = selectedItem?.id === item.id;
    const itemColor = getItemColor(index);
    
    return (
      <motion.div
        key={item.id}
        className={`absolute w-24 h-24 flex items-center justify-center rounded-lg border-2 ${
          isSelected ? 'border-yellow-400 bg-yellow-100' : 'border-white/30 bg-white/10'
        } backdrop-blur-sm transition-all duration-300`}
        style={{
          transform,
          backgroundColor: isSelected ? 'rgba(255, 255, 0, 0.2)' : `${itemColor}20`,
          borderColor: isSelected ? '#FBBF24' : `${itemColor}60`
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.05 }}
      >
        <div className="text-center p-2">
          {item.type === 'image-text' && item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.text}
              className="w-8 h-8 mx-auto mb-1 rounded object-cover"
            />
          )}
          <div 
            className={`text-xs font-medium ${
              ThemeManager.isDarkTheme(theme.id as any) ? 'text-white' : 'text-gray-800'
            }`}
            style={{ 
              fontSize: item.text.length > 6 ? '10px' : '12px',
              lineHeight: '1.2'
            }}
          >
            {item.text}
          </div>
        </div>
      </motion.div>
    );
  };

  // 渲染指针
  const renderPointer = () => (
    <motion.div
      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20"
      animate={isSpinning ? { scale: [1, 1.2, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
    >
      <div 
        className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent"
        style={{ borderBottomColor: theme.colors.secondary }}
      />
      <div 
        className="w-3 h-3 rounded-full -mt-1 mx-auto"
        style={{ backgroundColor: theme.colors.secondary }}
      />
    </motion.div>
  );

  // 渲染中心圆
  const renderCenter = () => (
    <motion.div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
      animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 2, repeat: isSpinning ? Infinity : 0, ease: "linear" }}
    >
      <div 
        className="w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.secondary
        }}
      >
        <div 
          className="w-8 h-8 rounded-full"
          style={{ backgroundColor: theme.colors.background }}
        />
      </div>
    </motion.div>
  );

  // 渲染转盘背景
  const renderWheelBackground = () => {
    const segmentAngle = 360 / items.length;
    
    return (
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {items.map((_, index) => {
          const rotation = index * segmentAngle;
          const color1 = getItemColor(index);
          const color2 = getItemColor(index + 1);
          
          return (
            <div
              key={index}
              className="absolute w-full h-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(from 0deg, ${color1}20, ${color2}20)`,
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`
              }}
            />
          );
        })}
      </div>
    );
  };

  if (!items || items.length === 0) {
    return (
      <div className="w-80 h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🎰</div>
          <div className="text-lg font-medium" style={{ color: theme.colors.text }}>
            暂无转盘项目
          </div>
          <div className="text-sm opacity-70" style={{ color: theme.colors.text }}>
            请先配置转盘项目
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* 转盘外圈装饰 */}
      <motion.div
        className={`absolute inset-0 rounded-full border-8 ${getThemeClasses()}`}
        style={{
          borderColor: theme.colors.primary,
          background: `conic-gradient(from 0deg, ${theme.colors.primary}40, ${theme.colors.secondary}40, ${theme.colors.accent}40, ${theme.colors.primary}40)`
        }}
        animate={isSpinning ? { rotate: -360 } : { rotate: 0 }}
        transition={{ duration: 4, repeat: isSpinning ? Infinity : 0, ease: "linear" }}
      />
      
      {/* 转盘主体 */}
      <motion.div
        ref={wheelRef}
        className="absolute inset-2 rounded-full relative overflow-hidden"
        style={{
          background: theme.colors.background,
          border: `4px solid ${theme.colors.accent}`
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* 转盘背景分段 */}
        {renderWheelBackground()}
        
        {/* 转盘项目 */}
        <AnimatePresence>
          {itemPositions.map((position, index) => renderWheelItem(position, index))}
        </AnimatePresence>
        
        {/* 中心圆 */}
        {renderCenter()}
      </motion.div>
      
      {/* 指针 */}
      {renderPointer()}
      
      {/* 旋转状态指示器 */}
      <AnimatePresence>
        {isSpinning && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm">
              <div className="loading-spinner w-4 h-4" />
              <span className="text-sm font-medium" style={{ color: theme.colors.text }}>
                转盘旋转中...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 转盘信息 */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-sm opacity-70" style={{ color: theme.colors.text }}>
          共 {items.length} 个选项
        </div>
        {selectedItem && !isSpinning && (
          <motion.div
            className="mt-2 px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${theme.colors.primary}20`,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.primary}40`
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            上次结果: {selectedItem.text}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wheel;