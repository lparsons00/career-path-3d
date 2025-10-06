// src/utils/performance.ts
import { logger } from './logger';

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface NavigationTiming {
  domContentLoadedEventEnd?: number;
  loadEventEnd?: number;
  navigationStart?: number;
  [key: string]: any;
}

export const monitorPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Log vital performance metrics
    window.addEventListener('load', () => {
      try {
        // Safe navigation timing access
        const navigationEntries = performance.getEntriesByType('navigation');
        const navigation = navigationEntries[0] as NavigationTiming | undefined;
        
        if (navigation && navigation.navigationStart) {
          const domContentLoaded = navigation.domContentLoadedEventEnd 
            ? `${navigation.domContentLoadedEventEnd - navigation.navigationStart}ms`
            : 'N/A';
            
          const fullLoad = navigation.loadEventEnd 
            ? `${navigation.loadEventEnd - navigation.navigationStart}ms`
            : 'N/A';

          logger.info('Performance', 'Page load metrics', {
            domContentLoaded,
            fullLoad,
            navigationTimingAvailable: true
          });
        } else {
          // Fallback to performance.timing (deprecated but widely supported)
          const timing = performance.timing;
          if (timing && timing.navigationStart) {
            const domContentLoaded = timing.domContentLoadedEventEnd 
              ? `${timing.domContentLoadedEventEnd - timing.navigationStart}ms`
              : 'N/A';
              
            const fullLoad = timing.loadEventEnd 
              ? `${timing.loadEventEnd - timing.navigationStart}ms`
              : 'N/A';

            logger.info('Performance', 'Page load metrics (legacy API)', {
              domContentLoaded,
              fullLoad,
              navigationTimingAvailable: false
            });
          } else {
            logger.warn('Performance', 'Navigation timing not available');
          }
        }

        // Monitor memory if available (Chrome/Edge only)
        const extendedPerformance = performance as ExtendedPerformance;
        if (extendedPerformance.memory) {
          const memory = extendedPerformance.memory;
          logger.info('Performance', 'Memory usage', {
            used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
            total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
            limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`
          });
        }

        // Log additional performance metrics
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
          logger.info('Performance', `Paint timing: ${entry.name}`, {
            duration: `${Math.round(entry.duration)}ms`
          });
        });

      } catch (error) {
        logger.error('Performance', 'Failed to capture performance metrics', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Log First Contentful Paint if available
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          logger.info('Performance', 'First Contentful Paint', {
            duration: `${Math.round(entry.startTime)}ms`
          });
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      logger.debug('Performance', 'PerformanceObserver not supported');
    }
  } else {
    logger.warn('Performance', 'Performance API not available');
  }
};

// Additional performance utilities
export const measureFunction = <T>(name: string, fn: () => T): T => {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    logger.debug('Performance', `Function ${name} executed`, {
      duration: `${Math.round(duration)}ms`
    });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error('Performance', `Function ${name} failed`, {
      duration: `${Math.round(duration)}ms`,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

export const getPerformanceMetrics = () => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  try {
    const metrics: any = {};
    
    // Navigation timing
    const navigationEntries = performance.getEntriesByType('navigation');
    const navigation = navigationEntries[0] as NavigationTiming | undefined;
    
    if (navigation && navigation.navigationStart) {
      metrics.navigation = {
        domContentLoaded: navigation.domContentLoadedEventEnd 
          ? navigation.domContentLoadedEventEnd - navigation.navigationStart 
          : null,
        fullLoad: navigation.loadEventEnd 
          ? navigation.loadEventEnd - navigation.navigationStart 
          : null
      };
    }

    // Memory usage (Chrome/Edge only)
    const extendedPerformance = performance as ExtendedPerformance;
    if (extendedPerformance.memory) {
      metrics.memory = {
        used: Math.round(extendedPerformance.memory.usedJSHeapSize / 1048576),
        total: Math.round(extendedPerformance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(extendedPerformance.memory.jsHeapSizeLimit / 1048576)
      };
    }

    return metrics;
  } catch (error) {
    logger.error('Performance', 'Failed to get performance metrics', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
};