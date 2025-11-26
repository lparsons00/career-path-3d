// src/components/utils/memoryMonitor.ts
import { logger } from './logger';
import { isMobile } from './pathUtils';

/**
 * Monitors memory usage and provides warnings when memory is low
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor | null = null;
  private checkInterval: number | null = null;
  private lowMemoryCallbacks: Set<() => void> = new Set();

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  startMonitoring() {
    if (!isMobile()) return; // Only monitor on mobile
    
    // Check memory every 5 seconds
    this.checkInterval = window.setInterval(() => {
      this.checkMemory();
    }, 5000);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkMemory() {
    // @ts-ignore - performance.memory is not in all browsers
    const memory = (performance as any).memory;
    if (!memory) return;

    const usedMB = memory.usedJSHeapSize / 1048576;
    const totalMB = memory.totalJSHeapSize / 1048576;
    const limitMB = memory.jsHeapSizeLimit / 1048576;
    const usagePercent = (usedMB / limitMB) * 100;

    logger.info('MemoryMonitor', 'Memory check', {
      usedMB: usedMB.toFixed(2),
      totalMB: totalMB.toFixed(2),
      limitMB: limitMB.toFixed(2),
      usagePercent: usagePercent.toFixed(2)
    });

    // Warn if memory usage is above 80%
    if (usagePercent > 80) {
      logger.warn('MemoryMonitor', 'High memory usage detected', {
        usagePercent: usagePercent.toFixed(2)
      });
      
      // Notify callbacks
      this.lowMemoryCallbacks.forEach(callback => {
        try {
          callback();
        } catch (err) {
          logger.error('MemoryMonitor', 'Error in low memory callback', { error: err });
        }
      });
    }
  }

  onLowMemory(callback: () => void) {
    this.lowMemoryCallbacks.add(callback);
    return () => this.lowMemoryCallbacks.delete(callback);
  }

  dispose() {
    this.stopMonitoring();
    this.lowMemoryCallbacks.clear();
  }
}

