import { STORAGE_KEYS, SlotItem, HistoryRecord, AppConfig, DEFAULT_APP_CONFIG, DEFAULT_ITEMS } from '../types';

/**
 * 本地存储管理器
 * 提供统一的本地存储操作接口
 */
export class StorageManager {
  /**
   * 保存数据到本地存储
   * @param key 存储键
   * @param data 要保存的数据
   */
  static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('保存数据到本地存储失败:', error);
    }
  }

  /**
   * 从本地存储加载数据
   * @param key 存储键
   * @param defaultValue 默认值
   * @returns 加载的数据或默认值
   */
  static load<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error('从本地存储加载数据失败:', error);
      return defaultValue;
    }
  }

  /**
   * 从本地存储删除数据
   * @param key 存储键
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('从本地存储删除数据失败:', error);
    }
  }

  /**
   * 清空所有应用相关的本地存储数据
   */
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.remove(key);
    });
  }

  /**
   * 检查本地存储是否可用
   * @returns 是否可用
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 转盘项目存储管理器
 */
export class SlotItemStorage {
  /**
   * 获取所有转盘项目
   * @returns 转盘项目列表
   */
  static getItems(): SlotItem[] {
    const defaultItems = StorageManager.load(STORAGE_KEYS.SLOT_ITEMS, DEFAULT_ITEMS);
    const customItems = StorageManager.load(STORAGE_KEYS.CUSTOM_ITEMS, []);
    return [...defaultItems, ...customItems];
  }

  /**
   * 保存自定义转盘项目
   * @param items 自定义项目列表
   */
  static saveCustomItems(items: SlotItem[]): void {
    StorageManager.save(STORAGE_KEYS.CUSTOM_ITEMS, items);
  }

  /**
   * 获取自定义转盘项目
   * @returns 自定义项目列表
   */
  static getCustomItems(): SlotItem[] {
    return StorageManager.load(STORAGE_KEYS.CUSTOM_ITEMS, []);
  }

  /**
   * 添加自定义转盘项目
   * @param item 要添加的项目
   */
  static addCustomItem(item: SlotItem): void {
    const customItems = this.getCustomItems();
    customItems.push(item);
    this.saveCustomItems(customItems);
  }

  /**
   * 删除自定义转盘项目
   * @param itemId 要删除的项目ID
   */
  static removeCustomItem(itemId: string): void {
    const customItems = this.getCustomItems();
    const filteredItems = customItems.filter(item => item.id !== itemId);
    this.saveCustomItems(filteredItems);
  }

  /**
   * 更新自定义转盘项目
   * @param updatedItem 更新后的项目
   */
  static updateCustomItem(updatedItem: SlotItem): void {
    const customItems = this.getCustomItems();
    const index = customItems.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      customItems[index] = updatedItem;
      this.saveCustomItems(customItems);
    }
  }
}

/**
 * 历史记录存储管理器
 */
export class HistoryStorage {
  /**
   * 获取所有历史记录
   * @returns 历史记录列表
   */
  static getRecords(): HistoryRecord[] {
    return StorageManager.load(STORAGE_KEYS.HISTORY_RECORDS, []);
  }

  /**
   * 保存历史记录
   * @param records 历史记录列表
   */
  static saveRecords(records: HistoryRecord[]): void {
    StorageManager.save(STORAGE_KEYS.HISTORY_RECORDS, records);
  }

  /**
   * 添加新的历史记录
   * @param record 新记录
   */
  static addRecord(record: HistoryRecord): void {
    const records = this.getRecords();
    records.unshift(record); // 添加到开头，最新的在前面
    
    // 限制历史记录数量，最多保存100条
    if (records.length > 100) {
      records.splice(100);
    }
    
    this.saveRecords(records);
  }

  /**
   * 清空所有历史记录
   */
  static clearRecords(): void {
    this.saveRecords([]);
  }

  /**
   * 获取统计信息
   * @returns 统计信息
   */
  static getStatistics() {
    const records = this.getRecords();
    const totalCount = records.length;
    
    // 统计各项目的命中次数
    const itemStats = records.reduce((stats, record) => {
      stats[record.result] = (stats[record.result] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    // 计算命中率
    const itemRates = Object.entries(itemStats).map(([item, count]) => ({
      item,
      count,
      rate: totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0.0'
    }));

    return {
      totalCount,
      itemStats,
      itemRates
    };
  }
}

/**
 * 应用配置存储管理器
 */
export class ConfigStorage {
  /**
   * 获取应用配置
   * @returns 应用配置
   */
  static getConfig(): AppConfig {
    return StorageManager.load(STORAGE_KEYS.APP_CONFIG, DEFAULT_APP_CONFIG);
  }

  /**
   * 保存应用配置
   * @param config 应用配置
   */
  static saveConfig(config: AppConfig): void {
    StorageManager.save(STORAGE_KEYS.APP_CONFIG, config);
  }

  /**
   * 更新应用配置的部分字段
   * @param updates 要更新的字段
   */
  static updateConfig(updates: Partial<AppConfig>): void {
    const currentConfig = this.getConfig();
    const newConfig = { ...currentConfig, ...updates };
    this.saveConfig(newConfig);
  }

  /**
   * 获取当前主题ID
   * @returns 当前主题ID
   */
  static getCurrentTheme(): string {
    return StorageManager.load(STORAGE_KEYS.CURRENT_THEME, 'classic');
  }

  /**
   * 设置当前主题
   * @param themeId 主题ID
   */
  static setCurrentTheme(themeId: string): void {
    StorageManager.save(STORAGE_KEYS.CURRENT_THEME, themeId);
    
    // 同时更新应用配置中的主题
    this.updateConfig({ currentTheme: themeId });
  }

  /**
   * 重置为默认配置
   */
  static resetToDefault(): void {
    this.saveConfig(DEFAULT_APP_CONFIG);
    StorageManager.save(STORAGE_KEYS.CURRENT_THEME, 'classic');
  }
}

/**
 * 数据迁移和初始化工具
 */
export class DataMigration {
  /**
   * 初始化应用数据
   * 在应用首次启动时调用
   */
  static initializeApp(): void {
    // 检查是否是首次启动
    const isFirstRun = !StorageManager.load('app_initialized', false);
    
    if (isFirstRun) {
      // 初始化默认数据
      StorageManager.save(STORAGE_KEYS.SLOT_ITEMS, DEFAULT_ITEMS);
      ConfigStorage.saveConfig(DEFAULT_APP_CONFIG);
      HistoryStorage.saveRecords([]);
      SlotItemStorage.saveCustomItems([]);
      
      // 标记已初始化
      StorageManager.save('app_initialized', true);
      
      console.log('应用数据初始化完成');
    }
  }

  /**
   * 检查数据版本并进行必要的迁移
   */
  static checkAndMigrate(): void {
    const currentVersion = '1.0.0';
    const storedVersion = StorageManager.load('data_version', '0.0.0');
    
    if (storedVersion !== currentVersion) {
      console.log(`数据版本从 ${storedVersion} 升级到 ${currentVersion}`);
      
      // 这里可以添加数据迁移逻辑
      // 例如：修改数据结构、添加新字段等
      
      StorageManager.save('data_version', currentVersion);
    }
  }

  /**
   * 导出所有应用数据
   * @returns 应用数据的JSON字符串
   */
  static exportData(): string {
    const data = {
      slotItems: SlotItemStorage.getItems(),
      customItems: SlotItemStorage.getCustomItems(),
      historyRecords: HistoryStorage.getRecords(),
      appConfig: ConfigStorage.getConfig(),
      currentTheme: ConfigStorage.getCurrentTheme(),
      exportTime: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入应用数据
   * @param jsonData 要导入的JSON数据
   * @returns 是否导入成功
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // 验证数据格式
      if (!data.slotItems || !data.appConfig) {
        throw new Error('数据格式不正确');
      }
      
      // 导入数据
      if (data.customItems) {
        SlotItemStorage.saveCustomItems(data.customItems);
      }
      
      if (data.historyRecords) {
        HistoryStorage.saveRecords(data.historyRecords);
      }
      
      if (data.appConfig) {
        ConfigStorage.saveConfig(data.appConfig);
      }
      
      if (data.currentTheme) {
        ConfigStorage.setCurrentTheme(data.currentTheme);
      }
      
      console.log('数据导入成功');
      return true;
    } catch (error) {
      console.error('数据导入失败:', error);
      return false;
    }
  }
}