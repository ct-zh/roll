import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, History } from 'lucide-react';
import { SlotItem, ThemeConfig, HistoryRecord, ThemeId } from './types';
import { ThemeManager, THEMES } from './lib/theme';
import { SlotItemStorage, HistoryStorage, ConfigStorage, DataMigration } from './lib/storage';
import SlotMachine from './components/SlotMachine';
import ThemeSelector from './components/ThemeSelector';
import ConfigModal from './components/ConfigModal';
import HistoryModal from './components/HistoryModal';

/**
 * 主应用组件
 * 整合所有功能模块，管理全局状态
 */
function App() {
  // 状态管理
  const [items, setItems] = useState<SlotItem[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES.classic);
  const [isSpinning, setIsSpinning] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化应用
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 数据迁移和初始化
        DataMigration.initializeApp();
        DataMigration.checkAndMigrate();
        
        // 初始化主题管理器
        ThemeManager.initialize();
        
        // 加载转盘项目
        const loadedItems = SlotItemStorage.getItems();
        setItems(loadedItems);
        
        // 加载历史记录
        const loadedRecords = HistoryStorage.getRecords();
        setHistoryRecords(loadedRecords);
        
        // 加载当前主题
        const savedTheme = ThemeManager.getCurrentTheme();
        setCurrentTheme(savedTheme);
        
        // 应用主题
        ThemeManager.setTheme(savedTheme.id as ThemeId);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('应用初始化失败:', error);
        setIsInitialized(true); // 即使失败也要显示界面
      }
    };

    initializeApp();
  }, []);

  // 监听主题变化
  useEffect(() => {
    const handleThemeChange = (theme: ThemeConfig) => {
      setCurrentTheme(theme);
    };

    ThemeManager.addThemeChangeListener(handleThemeChange);
    
    return () => {
      ThemeManager.removeThemeChangeListener(handleThemeChange);
    };
  }, []);

  // 处理转盘开始旋转
  const handleSpin = (selectedItem: SlotItem) => {
    setIsSpinning(true);
    
    // 模拟转盘旋转时间
    const spinDuration = currentTheme.id === 'rainbow' ? 2000 : 
                        currentTheme.id === 'modern' ? 2500 : 3000;
    
    setTimeout(() => {
      setIsSpinning(false);
      
      // 刷新历史记录
      const updatedRecords = HistoryStorage.getRecords();
      setHistoryRecords(updatedRecords);
    }, spinDuration);
  };

  // 处理主题切换
  const handleThemeChange = (themeId: ThemeId) => {
    ThemeManager.setTheme(themeId);
    const newTheme = ThemeManager.getCurrentTheme();
    setCurrentTheme(newTheme);
  };

  // 处理转盘项目变更
  const handleItemsChange = (newItems: SlotItem[]) => {
    setItems(newItems);
  };



  // 渲染加载界面
  const renderLoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-4">🎰</div>
        <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          幸运转盘
        </div>
        <div className="loading-spinner mx-auto" />
        <div className="text-sm mt-4 opacity-70" style={{ color: 'var(--color-text)' }}>
          正在初始化应用...
        </div>
      </motion.div>
    </div>
  );

  // 渲染顶部导航栏
  const renderTopNavigation = () => (
    <motion.header
      className="fixed top-0 left-0 right-0 z-30 backdrop-blur-md border-b"
      style={{
        backgroundColor: `${currentTheme.colors.background}E6`,
        borderColor: `${currentTheme.colors.primary}40`
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-responsive py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl">🎰</div>
            <div>
              <h1 
                className="text-xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                幸运转盘
              </h1>
            </div>
          </motion.div>

          {/* 功能按钮组 */}
          <div className="flex items-center space-x-3">
            {/* 主题选择器 */}
            <ThemeSelector
              currentTheme={currentTheme.id as ThemeId}
              onThemeChange={handleThemeChange}
            />
            
            {/* 配置按钮 */}
            <motion.button
              className="p-3 rounded-full backdrop-blur-md border-2 transition-all duration-200"
              style={{
                backgroundColor: `${currentTheme.colors.secondary}20`,
                borderColor: currentTheme.colors.secondary,
                color: currentTheme.colors.text
              }}
              onClick={() => setIsConfigModalOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="配置设置"
            >
              <Settings size={20} />
            </motion.button>
            
            {/* 历史记录按钮 */}
            <motion.button
              className="p-3 rounded-full backdrop-blur-md border-2 transition-all duration-200 relative"
              style={{
                backgroundColor: `${currentTheme.colors.accent}20`,
                borderColor: currentTheme.colors.accent,
                color: currentTheme.colors.text
              }}
              onClick={() => setIsHistoryModalOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="历史记录"
            >
              <History size={20} />
              {/* 记录数量徽章 */}
              {historyRecords.length > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: currentTheme.colors.secondary,
                    color: currentTheme.colors.background
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  {historyRecords.length > 99 ? '99+' : historyRecords.length}
                </motion.div>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );

  // 渲染主要内容
  const renderMainContent = () => (
    <motion.main 
      className="pt-24 pb-8 container-responsive"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <SlotMachine
        items={items}
        onSpin={handleSpin}
        isSpinning={isSpinning}
        theme={currentTheme}
      />
    </motion.main>
  );

  // 渲染底部信息
  const renderFooter = () => (
    <motion.footer
      className="fixed bottom-0 left-0 right-0 backdrop-blur-md border-t py-3"
      style={{
        backgroundColor: `${currentTheme.colors.background}E6`,
        borderColor: `${currentTheme.colors.primary}40`
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    />
  );

  // 如果未初始化，显示加载界面
  if (!isInitialized) {
    return renderLoadingScreen();
  }

  return (
    <div className="min-h-screen transition-all duration-300">
      {/* 背景 */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: currentTheme.id === 'classic' 
            ? `radial-gradient(circle at center, ${currentTheme.colors.background}, ${currentTheme.colors.primary}10)`
            : currentTheme.id === 'modern'
            ? `linear-gradient(135deg, ${currentTheme.colors.background}, ${currentTheme.colors.primary}05)`
            : currentTheme.id === 'dark'
            ? `radial-gradient(circle at center, ${currentTheme.colors.background}, ${currentTheme.colors.secondary}05)`
            : `linear-gradient(45deg, ${currentTheme.colors.background}, ${currentTheme.colors.primary}05, ${currentTheme.colors.secondary}05)`
        }}
      />
      
      {/* 顶部导航 */}
      {renderTopNavigation()}
      
      {/* 主要内容 */}
      {renderMainContent()}
      
      {/* 底部信息 */}
      {renderFooter()}
      
      {/* 配置弹框 */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        items={items}
        onItemsChange={handleItemsChange}
      />
      
      {/* 历史记录弹框 */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        records={historyRecords}
      />
    </div>
  );
}

export default App;