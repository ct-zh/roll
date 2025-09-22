import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { ThemeSelectorProps, ThemeId } from '../types';
import { ThemeManager, THEMES } from '../lib/theme';

/**
 * 主题选择器组件
 * 提供主题切换功能和主题预览
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null);

  // 获取主题预览信息
  const getThemePreview = (themeId: ThemeId) => {
    return ThemeManager.getThemePreview(themeId);
  };

  // 处理主题切换
  const handleThemeChange = (themeId: ThemeId) => {
    onThemeChange(themeId);
    setIsOpen(false);
  };

  // 获取主题图标
  const getThemeIcon = (themeId: ThemeId) => {
    switch (themeId) {
      case 'classic':
        return '🎰';
      case 'modern':
        return '💎';
      case 'dark':
        return '🌙';
      case 'rainbow':
        return '🌈';
      default:
        return '🎨';
    }
  };

  // 获取主题描述
  const getThemeDescription = (themeId: ThemeId) => {
    switch (themeId) {
      case 'classic':
        return '经典老虎机风格，金色红色配色';
      case 'modern':
        return '现代简约风格，蓝色渐变配色';
      case 'dark':
        return '暗黑科技风格，霓虹绿色配色';
      case 'rainbow':
        return '彩虹活泼风格，多彩渐变配色';
      default:
        return '主题描述';
    }
  };

  // 渲染主题预览卡片
  const renderThemeCard = (themeId: ThemeId, index: number) => {
    const theme = THEMES[themeId];
    const preview = getThemePreview(themeId);
    const isSelected = currentTheme === themeId;
    const isHovered = hoveredTheme === themeId;

    if (!theme || !preview) return null;

    return (
      <motion.div
        key={themeId}
        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
          isSelected ? 'ring-2 ring-offset-2' : ''
        }`}
        style={{
          backgroundColor: preview.backgroundColor,
          borderColor: isSelected ? preview.primaryColor : preview.secondaryColor,
          ringColor: preview.primaryColor
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleThemeChange(themeId)}
        onMouseEnter={() => setHoveredTheme(themeId)}
        onMouseLeave={() => setHoveredTheme(null)}
      >
        {/* 选中标识 */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: preview.primaryColor }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check size={14} style={{ color: preview.backgroundColor }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 主题图标 */}
        <div className="text-3xl mb-3 text-center">
          {getThemeIcon(themeId)}
        </div>

        {/* 主题名称 */}
        <div 
          className="text-lg font-bold text-center mb-2"
          style={{ color: preview.textColor }}
        >
          {theme.name}
        </div>

        {/* 主题描述 */}
        <div 
          className="text-sm text-center opacity-80 mb-3"
          style={{ color: preview.textColor }}
        >
          {getThemeDescription(themeId)}
        </div>

        {/* 颜色预览 */}
        <div className="flex justify-center space-x-2">
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ 
              backgroundColor: preview.primaryColor,
              borderColor: preview.textColor
            }}
          />
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ 
              backgroundColor: preview.secondaryColor,
              borderColor: preview.textColor
            }}
          />
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ 
              backgroundColor: preview.backgroundColor,
              borderColor: preview.textColor
            }}
          />
        </div>

        {/* 悬停效果 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: `linear-gradient(45deg, ${preview.primaryColor}20, ${preview.secondaryColor}20)`,
                border: `2px solid ${preview.primaryColor}`
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // 渲染主题选择器按钮
  const renderSelectorButton = () => {
    const currentThemeData = THEMES[currentTheme];
    
    return (
      <motion.button
        className="relative p-3 rounded-full backdrop-blur-md border-2 transition-all duration-200"
        style={{
          backgroundColor: `${currentThemeData.colors.primary}20`,
          borderColor: currentThemeData.colors.primary,
          color: currentThemeData.colors.text
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="切换主题"
      >
        <Palette size={20} />
        
        {/* 当前主题指示器 */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 text-xs flex items-center justify-center"
          style={{
            backgroundColor: currentThemeData.colors.secondary,
            borderColor: currentThemeData.colors.background,
            color: currentThemeData.colors.background
          }}
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          {getThemeIcon(currentTheme)}
        </motion.div>
      </motion.button>
    );
  };

  // 渲染主题选择面板
  const renderThemePanel = () => (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* 主题选择面板 */}
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl mx-4"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <div 
              className="bg-white/10 backdrop-blur-md rounded-2xl border-2 p-6 shadow-2xl"
              style={{
                borderColor: THEMES[currentTheme].colors.primary,
                backgroundColor: `${THEMES[currentTheme].colors.background}E6`
              }}
            >
              {/* 面板标题 */}
              <div className="text-center mb-6">
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{ color: THEMES[currentTheme].colors.text }}
                >
                  选择主题
                </h2>
                <p 
                  className="text-sm opacity-70"
                  style={{ color: THEMES[currentTheme].colors.text }}
                >
                  选择您喜欢的主题风格，实时预览效果
                </p>
              </div>

              {/* 主题网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {(Object.keys(THEMES) as ThemeId[]).map((themeId, index) => 
                  renderThemeCard(themeId, index)
                )}
              </div>

              {/* 快捷操作 */}
              <div className="flex justify-center space-x-4">
                <motion.button
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: THEMES[currentTheme].colors.primary,
                    color: THEMES[currentTheme].colors.background
                  }}
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  确定
                </motion.button>
                
                <motion.button
                  className="px-6 py-2 rounded-lg font-medium border-2 transition-colors"
                  style={{
                    borderColor: THEMES[currentTheme].colors.accent,
                    color: THEMES[currentTheme].colors.text
                  }}
                  onClick={() => {
                    ThemeManager.nextTheme();
                    onThemeChange(ThemeManager.getCurrentTheme().id as ThemeId);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  随机切换
                </motion.button>
              </div>

              {/* 主题特性说明 */}
              <div className="mt-6 text-center">
                <div 
                  className="text-xs opacity-60"
                  style={{ color: THEMES[currentTheme].colors.text }}
                >
                  主题会自动保存，下次访问时会记住您的选择
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative">
      {/* 主题选择器按钮 */}
      {renderSelectorButton()}
      
      {/* 主题选择面板 */}
      {renderThemePanel()}
    </div>
  );
};

export default ThemeSelector;