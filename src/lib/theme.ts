import { ThemeConfig, ThemeId, STORAGE_KEYS } from '../types';
import { StorageManager } from './storage';

/**
 * 主题配置定义
 */
export const THEMES: Record<ThemeId, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: '经典主题',
    colors: {
      primary: '#FFD700',     // 金色
      secondary: '#DC143C',   // 红色
      background: '#1E3A8A',  // 深蓝色
      text: '#FFFFFF',        // 白色
      accent: '#C0C0C0'       // 银色
    },
    animations: {
      wheelSpin: 'classic-spin',
      leverPull: 'classic-pull',
      resultShow: 'classic-result'
    },
    sounds: {
      spin: '/sounds/classic-spin.mp3',
      win: '/sounds/classic-win.mp3',
      click: '/sounds/classic-click.mp3'
    }
  },
  modern: {
    id: 'modern',
    name: '现代主题',
    colors: {
      primary: '#667eea',     // 渐变蓝色起点
      secondary: '#764ba2',   // 渐变蓝色终点
      background: '#FFFFFF',  // 白色
      text: '#2D3748',        // 深灰色
      accent: '#E2E8F0'       // 浅灰色
    },
    animations: {
      wheelSpin: 'modern-spin',
      leverPull: 'modern-pull',
      resultShow: 'modern-result'
    },
    sounds: {
      spin: '/sounds/modern-spin.mp3',
      win: '/sounds/modern-win.mp3',
      click: '/sounds/modern-click.mp3'
    }
  },
  dark: {
    id: 'dark',
    name: '暗黑主题',
    colors: {
      primary: '#1A202C',     // 深紫色
      secondary: '#00FF88',   // 霓虹绿
      background: '#171923',  // 炭黑色
      text: '#A0AEC0',        // 银色
      accent: '#2D3748'       // 深灰色
    },
    animations: {
      wheelSpin: 'dark-spin',
      leverPull: 'dark-pull',
      resultShow: 'dark-result'
    },
    sounds: {
      spin: '/sounds/dark-spin.mp3',
      win: '/sounds/dark-win.mp3',
      click: '/sounds/dark-click.mp3'
    }
  },
  rainbow: {
    id: 'rainbow',
    name: '彩虹主题',
    colors: {
      primary: '#FF6B6B',     // 彩虹红
      secondary: '#4ECDC4',   // 彩虹青
      background: '#FFFFFF',  // 白色背景
      text: '#2C3E50',        // 深色文字
      accent: '#FFE66D'       // 彩虹黄
    },
    animations: {
      wheelSpin: 'rainbow-spin',
      leverPull: 'rainbow-pull',
      resultShow: 'rainbow-result'
    },
    sounds: {
      spin: '/sounds/rainbow-spin.mp3',
      win: '/sounds/rainbow-win.mp3',
      click: '/sounds/rainbow-click.mp3'
    }
  }
};

/**
 * 主题管理器
 * 负责主题的切换、应用和持久化
 */
export class ThemeManager {
  private static currentTheme: ThemeConfig = THEMES.classic;
  private static listeners: ((theme: ThemeConfig) => void)[] = [];

  /**
   * 初始化主题管理器
   */
  static initialize(): void {
    const savedThemeId = StorageManager.load(STORAGE_KEYS.CURRENT_THEME, 'classic') as ThemeId;
    this.setTheme(savedThemeId);
  }

  /**
   * 获取当前主题
   * @returns 当前主题配置
   */
  static getCurrentTheme(): ThemeConfig {
    return this.currentTheme;
  }

  /**
   * 获取所有可用主题
   * @returns 主题配置数组
   */
  static getAllThemes(): ThemeConfig[] {
    return Object.values(THEMES);
  }

  /**
   * 根据ID获取主题
   * @param themeId 主题ID
   * @returns 主题配置或undefined
   */
  static getThemeById(themeId: ThemeId): ThemeConfig | undefined {
    return THEMES[themeId];
  }

  /**
   * 设置主题
   * @param themeId 主题ID
   */
  static setTheme(themeId: ThemeId): void {
    const theme = THEMES[themeId];
    if (!theme) {
      console.warn(`主题 ${themeId} 不存在，使用默认主题`);
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(themeId);
    this.notifyListeners(theme);
  }

  /**
   * 应用主题到DOM
   * @param theme 主题配置
   */
  private static applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;
    
    // 应用颜色变量
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-accent', theme.colors.accent);
    
    // 设置主题类名
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${theme.id}`);
    
    // 应用特殊的主题样式
    this.applyThemeSpecificStyles(theme);
  }

  /**
   * 应用主题特定的样式
   * @param theme 主题配置
   */
  private static applyThemeSpecificStyles(theme: ThemeConfig): void {
    const root = document.documentElement;
    
    switch (theme.id) {
      case 'classic':
        // 经典主题：金属质感和闪烁效果
        root.style.setProperty('--shadow-glow', '0 0 20px rgba(255, 215, 0, 0.5)');
        root.style.setProperty('--border-style', '3px solid #FFD700');
        root.style.setProperty('--gradient-bg', 'linear-gradient(45deg, #1E3A8A, #3B82F6)');
        break;
        
      case 'modern':
        // 现代主题：柔和渐变
        root.style.setProperty('--shadow-glow', '0 4px 20px rgba(102, 126, 234, 0.3)');
        root.style.setProperty('--border-style', '2px solid #E2E8F0');
        root.style.setProperty('--gradient-bg', 'linear-gradient(135deg, #667eea, #764ba2)');
        break;
        
      case 'dark':
        // 暗黑主题：霓虹效果
        root.style.setProperty('--shadow-glow', '0 0 30px rgba(0, 255, 136, 0.6)');
        root.style.setProperty('--border-style', '2px solid #00FF88');
        root.style.setProperty('--gradient-bg', 'linear-gradient(45deg, #171923, #1A202C)');
        break;
        
      case 'rainbow':
        // 彩虹主题：彩色渐变
        root.style.setProperty('--shadow-glow', '0 0 25px rgba(255, 107, 107, 0.4)');
        root.style.setProperty('--border-style', '3px solid transparent');
        root.style.setProperty('--gradient-bg', 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)');
        break;
    }
  }

  /**
   * 保存主题到本地存储
   * @param themeId 主题ID
   */
  private static saveTheme(themeId: ThemeId): void {
    StorageManager.save(STORAGE_KEYS.CURRENT_THEME, themeId);
  }

  /**
   * 添加主题变更监听器
   * @param listener 监听器函数
   */
  static addThemeChangeListener(listener: (theme: ThemeConfig) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除主题变更监听器
   * @param listener 监听器函数
   */
  static removeThemeChangeListener(listener: (theme: ThemeConfig) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器主题已变更
   * @param theme 新主题
   */
  private static notifyListeners(theme: ThemeConfig): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('主题变更监听器执行失败:', error);
      }
    });
  }

  /**
   * 切换到下一个主题
   */
  static nextTheme(): void {
    const themes = Object.keys(THEMES) as ThemeId[];
    const currentIndex = themes.indexOf(this.currentTheme.id as ThemeId);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  /**
   * 切换到上一个主题
   */
  static previousTheme(): void {
    const themes = Object.keys(THEMES) as ThemeId[];
    const currentIndex = themes.indexOf(this.currentTheme.id as ThemeId);
    const prevIndex = currentIndex === 0 ? themes.length - 1 : currentIndex - 1;
    this.setTheme(themes[prevIndex]);
  }

  /**
   * 获取主题预览信息
   * @param themeId 主题ID
   * @returns 主题预览信息
   */
  static getThemePreview(themeId: ThemeId) {
    const theme = THEMES[themeId];
    if (!theme) return null;

    return {
      id: theme.id,
      name: theme.name,
      primaryColor: theme.colors.primary,
      secondaryColor: theme.colors.secondary,
      backgroundColor: theme.colors.background,
      textColor: theme.colors.text
    };
  }

  /**
   * 检查主题是否为暗色主题
   * @param themeId 主题ID
   * @returns 是否为暗色主题
   */
  static isDarkTheme(themeId?: ThemeId): boolean {
    const id = themeId || this.currentTheme.id;
    return id === 'dark';
  }

  /**
   * 获取主题对应的CSS类名
   * @param themeId 主题ID
   * @returns CSS类名
   */
  static getThemeClassName(themeId?: ThemeId): string {
    const id = themeId || this.currentTheme.id;
    return `theme-${id}`;
  }

  /**
   * 重置为默认主题
   */
  static resetToDefault(): void {
    this.setTheme('classic');
  }

  /**
   * 获取主题的动画配置
   * @param themeId 主题ID
   * @returns 动画配置
   */
  static getAnimationConfig(themeId?: ThemeId) {
    const theme = themeId ? THEMES[themeId] : this.currentTheme;
    return theme?.animations;
  }

  /**
   * 获取主题的音效配置
   * @param themeId 主题ID
   * @returns 音效配置
   */
  static getSoundConfig(themeId?: ThemeId) {
    const theme = themeId ? THEMES[themeId] : this.currentTheme;
    return theme?.sounds;
  }
}

/**
 * 主题工具函数
 */
export const themeUtils = {
  /**
   * 根据主题获取对比色
   * @param color 颜色值
   * @returns 对比色（黑色或白色）
   */
  getContrastColor(color: string): string {
    // 简单的对比度计算
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  },

  /**
   * 生成主题渐变CSS
   * @param theme 主题配置
   * @returns 渐变CSS字符串
   */
  generateGradient(theme: ThemeConfig): string {
    return `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
  },

  /**
   * 获取主题的阴影样式
   * @param theme 主题配置
   * @returns 阴影CSS字符串
   */
  getThemeShadow(theme: ThemeConfig): string {
    const color = theme.colors.primary;
    const alpha = theme.id === 'dark' ? '0.6' : '0.3';
    return `0 4px 20px ${color}${alpha.replace('0.', '')}`;
  }
};

// 导出默认主题
export const defaultTheme = THEMES.classic;