import { SlotItem, HistoryRecord } from '../types';

/**
 * 随机抽取算法工具类
 */
export class LotteryEngine {
  /**
   * 基于权重的随机抽取算法
   * @param items 转盘项目列表
   * @returns 抽中的项目
   */
  static weightedRandomSelect(items: SlotItem[]): SlotItem {
    if (!items || items.length === 0) {
      throw new Error('转盘项目列表不能为空');
    }

    // 计算总权重
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    
    if (totalWeight <= 0) {
      throw new Error('转盘项目总权重必须大于0');
    }

    // 生成随机数
    let random = Math.random() * totalWeight;
    
    // 根据权重选择项目
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }
    
    // 兜底返回最后一项（理论上不应该执行到这里）
    return items[items.length - 1];
  }

  /**
   * 简单随机抽取（等概率）
   * @param items 转盘项目列表
   * @returns 抽中的项目
   */
  static simpleRandomSelect(items: SlotItem[]): SlotItem {
    if (!items || items.length === 0) {
      throw new Error('转盘项目列表不能为空');
    }

    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }

  /**
   * 带有防重复机制的随机抽取
   * @param items 转盘项目列表
   * @param recentResults 最近的抽取结果
   * @param avoidRecentCount 避免重复的最近结果数量
   * @returns 抽中的项目
   */
  static antiRepeatRandomSelect(
    items: SlotItem[], 
    recentResults: string[] = [], 
    avoidRecentCount: number = 2
  ): SlotItem {
    if (!items || items.length === 0) {
      throw new Error('转盘项目列表不能为空');
    }

    // 如果项目数量少于或等于避免重复数量，直接使用权重抽取
    if (items.length <= avoidRecentCount) {
      return this.weightedRandomSelect(items);
    }

    // 获取最近的结果ID
    const recentIds = recentResults.slice(0, avoidRecentCount);
    
    // 过滤掉最近抽中的项目
    const availableItems = items.filter(item => !recentIds.includes(item.id));
    
    // 如果没有可用项目，使用全部项目
    const targetItems = availableItems.length > 0 ? availableItems : items;
    
    return this.weightedRandomSelect(targetItems);
  }

  /**
   * 计算转盘旋转角度
   * @param items 转盘项目列表
   * @param selectedItem 选中的项目
   * @param baseRotations 基础旋转圈数
   * @returns 旋转角度（度）
   */
  static calculateRotationAngle(
    items: SlotItem[], 
    selectedItem: SlotItem, 
    baseRotations: number = 5
  ): number {
    if (!items || items.length === 0) {
      return 0;
    }

    // 找到选中项目的索引
    const selectedIndex = items.findIndex(item => item.id === selectedItem.id);
    if (selectedIndex === -1) {
      console.warn('选中的项目不在转盘列表中');
      return baseRotations * 360;
    }

    // 计算每个项目占用的角度
    const anglePerItem = 360 / items.length;
    
    // 计算目标角度（指针指向12点方向，所以需要调整）
    const targetAngle = selectedIndex * anglePerItem;
    
    // 添加基础旋转圈数和随机偏移
    const randomOffset = (Math.random() - 0.5) * anglePerItem * 0.8; // 80%的随机偏移
    const totalAngle = baseRotations * 360 + (360 - targetAngle) + randomOffset;
    
    return totalAngle;
  }

  /**
   * 生成转盘项目的位置信息
   * @param items 转盘项目列表
   * @param radius 转盘半径
   * @returns 项目位置信息数组
   */
  static generateItemPositions(items: SlotItem[], radius: number = 150) {
    if (!items || items.length === 0) {
      return [];
    }

    const anglePerItem = 360 / items.length;
    
    return items.map((item, index) => {
      const angle = index * anglePerItem;
      const radian = (angle * Math.PI) / 180;
      
      // 计算项目在转盘上的位置
      const x = Math.cos(radian - Math.PI / 2) * radius;
      const y = Math.sin(radian - Math.PI / 2) * radius;
      
      return {
        item,
        index,
        angle,
        radian,
        x,
        y,
        // CSS transform 用的角度
        transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`
      };
    });
  }

  /**
   * 验证转盘配置
   * @param items 转盘项目列表
   * @returns 验证结果
   */
  static validateWheelConfig(items: SlotItem[]) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查项目数量
    if (!items || items.length === 0) {
      errors.push('转盘项目列表不能为空');
      return { isValid: false, errors, warnings };
    }

    if (items.length < 2) {
      warnings.push('转盘项目数量少于2个，建议增加更多项目');
    }

    if (items.length > 20) {
      warnings.push('转盘项目数量超过20个，可能影响显示效果');
    }

    // 检查权重
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight <= 0) {
      errors.push('转盘项目总权重必须大于0');
    }

    // 检查项目内容
    items.forEach((item, index) => {
      if (!item.id) {
        errors.push(`第${index + 1}个项目缺少ID`);
      }
      
      if (!item.text || item.text.trim() === '') {
        errors.push(`第${index + 1}个项目缺少文案`);
      }
      
      if (item.weight <= 0) {
        errors.push(`第${index + 1}个项目权重必须大于0`);
      }
      
      if (item.type === 'image-text' && !item.imageUrl) {
        warnings.push(`第${index + 1}个项目类型为图片+文案但缺少图片URL`);
      }
    });

    // 检查重复ID
    const ids = items.map(item => item.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push('存在重复的项目ID');
    }

    // 检查重复文案
    const texts = items.map(item => item.text);
    const uniqueTexts = new Set(texts);
    if (texts.length !== uniqueTexts.size) {
      warnings.push('存在重复的项目文案');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 创建历史记录
   * @param selectedItem 选中的项目
   * @returns 历史记录对象
   */
  static createHistoryRecord(selectedItem: SlotItem): HistoryRecord {
    return {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemId: selectedItem.id,
      timestamp: new Date().toISOString(),
      result: selectedItem.text
    };
  }

  /**
   * 计算抽取概率
   * @param items 转盘项目列表
   * @returns 每个项目的概率信息
   */
  static calculateProbabilities(items: SlotItem[]) {
    if (!items || items.length === 0) {
      return [];
    }

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    
    return items.map(item => ({
      id: item.id,
      text: item.text,
      weight: item.weight,
      probability: totalWeight > 0 ? (item.weight / totalWeight) * 100 : 0,
      probabilityText: totalWeight > 0 ? `${((item.weight / totalWeight) * 100).toFixed(1)}%` : '0%'
    }));
  }

  /**
   * 模拟多次抽取（用于测试）
   * @param items 转盘项目列表
   * @param count 抽取次数
   * @returns 抽取结果统计
   */
  static simulateMultipleDraws(items: SlotItem[], count: number = 1000) {
    if (!items || items.length === 0 || count <= 0) {
      return {};
    }

    const results: Record<string, number> = {};
    
    // 初始化计数器
    items.forEach(item => {
      results[item.id] = 0;
    });

    // 进行多次抽取
    for (let i = 0; i < count; i++) {
      try {
        const selected = this.weightedRandomSelect(items);
        results[selected.id]++;
      } catch (error) {
        console.error('模拟抽取失败:', error);
        break;
      }
    }

    // 计算实际概率
    const statistics = items.map(item => {
      const actualCount = results[item.id] || 0;
      const actualProbability = (actualCount / count) * 100;
      const expectedProbability = this.calculateProbabilities(items)
        .find(p => p.id === item.id)?.probability || 0;
      
      return {
        id: item.id,
        text: item.text,
        weight: item.weight,
        expectedProbability: expectedProbability.toFixed(1) + '%',
        actualCount,
        actualProbability: actualProbability.toFixed(1) + '%',
        deviation: Math.abs(actualProbability - expectedProbability).toFixed(1) + '%'
      };
    });

    return {
      totalDraws: count,
      statistics,
      summary: {
        totalItems: items.length,
        averageDeviation: (statistics.reduce((sum, stat) => 
          sum + parseFloat(stat.deviation.replace('%', '')), 0) / items.length).toFixed(1) + '%'
      }
    };
  }
}

/**
 * 转盘动画控制器
 */
export class WheelAnimationController {
  private element: HTMLElement | null = null;
  private isSpinning: boolean = false;
  private currentRotation: number = 0;
  private animationId: number | null = null;

  constructor(element: HTMLElement | null) {
    this.element = element;
  }

  /**
   * 开始旋转动画
   * @param targetAngle 目标角度
   * @param duration 动画持续时间（毫秒）
   * @param easing 缓动函数
   * @returns Promise，动画完成时resolve
   */
  spin(
    targetAngle: number, 
    duration: number = 3000,
    easing: (t: number) => number = this.easeOutCubic
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.element) {
        reject(new Error('转盘元素不存在'));
        return;
      }

      if (this.isSpinning) {
        reject(new Error('转盘正在旋转中'));
        return;
      }

      this.isSpinning = true;
      const startTime = Date.now();
      const startRotation = this.currentRotation;
      const totalRotation = targetAngle;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        this.currentRotation = startRotation + totalRotation * easedProgress;
        
        if (this.element) {
          this.element.style.transform = `rotate(${this.currentRotation}deg)`;
        }

        if (progress < 1) {
          this.animationId = requestAnimationFrame(animate);
        } else {
          this.isSpinning = false;
          this.animationId = null;
          resolve();
        }
      };

      this.animationId = requestAnimationFrame(animate);
    });
  }

  /**
   * 停止旋转动画
   */
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isSpinning = false;
  }

  /**
   * 重置转盘位置
   */
  reset(): void {
    this.stop();
    this.currentRotation = 0;
    if (this.element) {
      this.element.style.transform = 'rotate(0deg)';
    }
  }

  /**
   * 获取当前旋转状态
   */
  getState() {
    return {
      isSpinning: this.isSpinning,
      currentRotation: this.currentRotation
    };
  }

  /**
   * 缓动函数：三次方缓出
   */
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * 缓动函数：弹性缓出
   */
  private easeOutElastic(t: number): number {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  /**
   * 缓动函数：回弹缓出
   */
  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
}