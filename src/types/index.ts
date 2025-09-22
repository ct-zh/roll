// 转盘项目数据结构
export interface SlotItem {
  id: string;           // 唯一标识符
  type: 'text' | 'image-text'; // 项目类型
  text: string;         // 显示文案
  imageUrl?: string;    // 图片URL（可选）
  weight: number;       // 权重，影响抽中概率
  isDefault: boolean;   // 是否为默认配置项目
}

// 历史记录数据结构
export interface HistoryRecord {
  id: string;           // 记录唯一标识
  itemId: string;       // 抽中项目的ID
  timestamp: string;    // 抽取时间戳
  result: string;       // 抽取结果文案
}

// 应用配置数据结构
export interface AppConfig {
  id: string;           // 配置标识
  activeItems: string[]; // 当前激活的项目ID列表
  currentTheme: string; // 当前选中的主题ID
  settings: {
    animationDuration: number; // 动画持续时间
    soundEnabled: boolean;     // 是否启用音效
    vibrationEnabled: boolean; // 是否启用震动反馈（移动端）
  };
  uiState: {
    configModalOpen: boolean;  // 配置弹框是否打开
    historyModalOpen: boolean; // 历史记录弹框是否打开
  };
}

// 主题配置数据结构
export interface ThemeConfig {
  id: string;           // 主题唯一标识
  name: string;         // 主题显示名称
  colors: {
    primary: string;    // 主色调
    secondary: string;  // 辅助色
    background: string; // 背景色
    text: string;       // 文字色
    accent: string;     // 强调色
  };
  animations: {
    wheelSpin: string;  // 转盘旋转动画类型
    leverPull: string;  // 拉杆动画类型
    resultShow: string; // 结果展示动画类型
  };
  sounds: {
    spin: string;       // 转盘音效文件
    win: string;        // 中奖音效文件
    click: string;      // 点击音效文件
  };
}

// 本地存储键值定义
export const STORAGE_KEYS = {
  SLOT_ITEMS: 'slot_items',        // 转盘项目列表
  HISTORY_RECORDS: 'history_records', // 历史记录
  APP_CONFIG: 'app_config',        // 应用配置
  CUSTOM_ITEMS: 'custom_items',    // 用户自定义项目
  CURRENT_THEME: 'current_theme',  // 当前选中主题
  THEME_CONFIGS: 'theme_configs'   // 主题配置列表
} as const;

// 默认配置数据
export const DEFAULT_ITEMS: SlotItem[] = [
  {
    id: 'default_1',
    type: 'text',
    text: '大吉大利',
    weight: 1,
    isDefault: true
  },
  {
    id: 'default_2', 
    type: 'text',
    text: '再来一次',
    weight: 1,
    isDefault: true
  },
  {
    id: 'default_3',
    type: 'text', 
    text: '恭喜发财',
    weight: 1,
    isDefault: true
  },
  {
    id: 'default_4',
    type: 'text',
    text: '心想事成',
    weight: 1,
    isDefault: true
  },
  {
    id: 'default_5',
    type: 'text',
    text: '万事如意',
    weight: 1,
    isDefault: true
  },
  {
    id: 'default_6',
    type: 'text',
    text: '好运连连',
    weight: 1,
    isDefault: true
  }
];

// 默认应用配置
export const DEFAULT_APP_CONFIG: AppConfig = {
  id: 'default_config',
  activeItems: DEFAULT_ITEMS.map(item => item.id),
  currentTheme: 'classic',
  settings: {
    animationDuration: 3000,
    soundEnabled: true,
    vibrationEnabled: true
  },
  uiState: {
    configModalOpen: false,
    historyModalOpen: false
  }
};

// 主题类型定义
export type ThemeId = 'classic' | 'modern' | 'dark' | 'rainbow';

// 动画类型定义
export type AnimationType = 'classic-spin' | 'modern-spin' | 'dark-spin' | 'rainbow-spin';

// 组件Props类型定义
export interface SlotMachineProps {
  items: SlotItem[];
  onSpin: (result: SlotItem) => void;
  isSpinning: boolean;
  theme: ThemeConfig;
}

export interface WheelProps {
  items: SlotItem[];
  selectedItem?: SlotItem;
  isSpinning: boolean;
  theme: ThemeConfig;
  onSpinComplete: (item: SlotItem) => void;
}

export interface LeverProps {
  onPull: () => void;
  isDisabled: boolean;
  theme: ThemeConfig;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
}

export interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SlotItem[];
  onItemsChange: (items: SlotItem[]) => void;
}

export interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HistoryRecord[];
}