import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LeverProps, ThemeConfig } from '../types';
import { ThemeManager } from '../lib/theme';

/**
 * 拨杆控制组件
 * 负责处理用户点击拨杆启动转盘的交互
 */
export const Lever: React.FC<LeverProps> = ({
  onPull,
  isDisabled,
  theme
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullCount, setPullCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const leverRef = useRef<HTMLDivElement>(null);

  // 初始化音效
  useEffect(() => {
    const soundConfig = ThemeManager.getSoundConfig(theme.id as any);
    if (soundConfig?.click) {
      audioRef.current = new Audio(soundConfig.click);
      audioRef.current.volume = 0.3;
    }
  }, [theme]);

  // 处理拨杆点击
  const handlePull = async () => {
    if (isDisabled || isPulling) {
      return;
    }

    setIsPulling(true);
    setPullCount(prev => prev + 1);

    // 播放音效
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.warn('音效播放失败:', error);
    }

    // 触发震动反馈（移动端）
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }

    // 延迟执行拉杆动作，让动画先播放
    setTimeout(() => {
      onPull();
      setIsPulling(false);
    }, 300);
  };

  // 获取主题相关的样式
  const getThemeStyles = () => {
    switch (theme.id) {
      case 'classic':
        return {
          leverBody: {
            background: `linear-gradient(45deg, ${theme.colors.secondary}, ${theme.colors.primary})`,
            boxShadow: `0 8px 20px ${theme.colors.secondary}40`
          },
          leverHandle: {
            background: theme.colors.accent,
            border: `3px solid ${theme.colors.primary}`
          },
          leverBase: {
            background: theme.colors.primary,
            border: `2px solid ${theme.colors.secondary}`
          }
        };
      case 'modern':
        return {
          leverBody: {
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
          },
          leverHandle: {
            background: '#FFFFFF',
            border: `2px solid ${theme.colors.accent}`
          },
          leverBase: {
            background: theme.colors.accent,
            border: `2px solid ${theme.colors.primary}`
          }
        };
      case 'dark':
        return {
          leverBody: {
            background: `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            boxShadow: `0 0 30px ${theme.colors.secondary}60`
          },
          leverHandle: {
            background: theme.colors.secondary,
            border: `2px solid ${theme.colors.accent}`,
            boxShadow: `0 0 15px ${theme.colors.secondary}80`
          },
          leverBase: {
            background: theme.colors.accent,
            border: `2px solid ${theme.colors.secondary}`
          }
        };
      case 'rainbow':
        return {
          leverBody: {
            background: `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent})`,
            boxShadow: '0 0 25px rgba(255, 107, 107, 0.4)'
          },
          leverHandle: {
            background: '#FFFFFF',
            border: `3px solid ${theme.colors.accent}`
          },
          leverBase: {
            background: theme.colors.accent,
            border: `2px solid ${theme.colors.primary}`
          }
        };
      default:
        return {
          leverBody: { background: theme.colors.primary },
          leverHandle: { background: theme.colors.accent },
          leverBase: { background: theme.colors.secondary }
        };
    }
  };

  const themeStyles = getThemeStyles();

  // 拨杆动画变体
  const leverVariants = {
    idle: {
      rotate: 0,
      scale: 1,
      y: 0
    },
    pulling: {
      rotate: 15,
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    released: {
      rotate: -5,
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    disabled: {
      opacity: 0.5,
      scale: 0.9
    }
  };

  // 手柄动画变体
  const handleVariants = {
    idle: {
      scale: 1,
      rotate: 0
    },
    pulling: {
      scale: 0.9,
      rotate: -10,
      transition: {
        duration: 0.2
      }
    },
    released: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // 获取当前动画状态
  const getCurrentState = () => {
    if (isDisabled) return 'disabled';
    if (isPulling) return 'pulling';
    return 'idle';
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* 拨杆主体 */}
      <motion.div
        ref={leverRef}
        className="relative cursor-pointer select-none"
        variants={leverVariants}
        animate={getCurrentState()}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        onClick={handlePull}
      >
        {/* 拨杆杆身 */}
        <div
          className="w-6 h-32 rounded-full relative overflow-hidden transition-all duration-300"
          style={themeStyles.leverBody}
        >
          {/* 拨杆高光效果 */}
          <div className="absolute top-0 left-1 w-2 h-full bg-white/30 rounded-full" />
          
          {/* 拨杆纹理 */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-0.5 bg-white/40"
                style={{ top: `${(i + 1) * 12}%` }}
              />
            ))}
          </div>
        </div>

        {/* 拨杆手柄 */}
        <motion.div
          className="absolute -top-2 -left-3 w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300"
          style={themeStyles.leverHandle}
          variants={handleVariants}
          animate={getCurrentState()}
        >
          {/* 手柄纹理 */}
          <div className="w-8 h-4 rounded-full bg-black/10 flex items-center justify-center">
            <div className="w-6 h-2 rounded-full bg-black/20" />
          </div>
        </motion.div>

        {/* 拨杆底座 */}
        <div
          className="absolute -bottom-2 -left-4 w-14 h-6 rounded-full transition-all duration-300"
          style={themeStyles.leverBase}
        >
          <div className="absolute top-1 left-2 w-10 h-2 rounded-full bg-white/20" />
        </div>

        {/* 点击效果 */}
        {isPulling && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: `${theme.colors.primary}40` }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.div>

      {/* 拨杆标签 */}
      <motion.div
        className="mt-4 text-center"
        animate={isPulling ? { scale: 1.1 } : { scale: 1 }}
      >
        <div
          className="text-sm font-bold mb-1"
          style={{ color: theme.colors.text }}
        >
          {isDisabled ? '转盘旋转中' : '点击拉杆'}
        </div>
        <div
          className="text-xs opacity-70"
          style={{ color: theme.colors.text }}
        >
          {isDisabled ? '请稍候...' : '开始抽奖'}
        </div>
      </motion.div>

      {/* 使用次数显示 */}
      {pullCount > 0 && (
        <motion.div
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${theme.colors.primary}20`,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.primary}40`
            }}
          >
            已使用 {pullCount} 次
          </div>
        </motion.div>
      )}

      {/* 主题特效 */}
      {theme.id === 'dark' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 20px ${theme.colors.secondary}40`,
              `0 0 30px ${theme.colors.secondary}60`,
              `0 0 20px ${theme.colors.secondary}40`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {theme.id === 'rainbow' && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full"
          animate={{
            background: [
              `conic-gradient(from 0deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent}, ${theme.colors.primary})`,
              `conic-gradient(from 120deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent}, ${theme.colors.primary})`,
              `conic-gradient(from 240deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent}, ${theme.colors.primary})`
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ opacity: 0.3 }}
        />
      )}

      {/* 禁用状态遮罩 */}
      {isDisabled && (
        <motion.div
          className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-spinner w-6 h-6" />
        </motion.div>
      )}
    </div>
  );
};

export default Lever;