// src/utils/logger.ts (Enhanced for production safety)
interface LogConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  enabled: boolean;
}

class ProductionLogger {
  private config: LogConfig;

  constructor() {
    // In production, default to 'error' level only
    // In development, show more info
    this.config = {
      level: import.meta.env.PROD ? 'error' : 'info',
      enabled: true
    };
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    return this.config.enabled && levels.indexOf(level) <= levels.indexOf(this.config.level);
  }

  error(context: string, message: string, data?: any) {
    if (this.shouldLog('error')) {
      // In production, sanitize error data
      const safeData = import.meta.env.PROD ? this.sanitizeData(data) : data;
      console.error(`[ERROR] ${context}: ${message}`, safeData || '');
    }
  }

  warn(context: string, message: string, data?: any) {
    if (this.shouldLog('warn')) {
      const safeData = import.meta.env.PROD ? this.sanitizeData(data) : data;
      console.warn(`[WARN] ${context}: ${message}`, safeData || '');
    }
  }

  info(context: string, message: string, data?: any) {
    if (this.shouldLog('info')) {
      const safeData = import.meta.env.PROD ? this.sanitizeData(data) : data;
      console.info(`[INFO] ${context}: ${message}`, safeData || '');
    }
  }

  debug(context: string, message: string, data?: any) {
    // Debug only in development or if explicitly enabled
    if ((import.meta.env.DEV || this.config.level === 'debug') && this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${context}: ${message}`, data || '');
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // Remove any potentially sensitive information in production
    const safeData = { ...data };
    
    // Remove sensitive fields
    delete safeData.userAgent;
    delete safeData.url;
    delete safeData.stack;
    delete safeData.filename;
    delete safeData.lineno;
    delete safeData.colno;
    
    return safeData;
  }

  // Enable more verbose logging for debugging
  enableDebugMode() {
    this.config.level = 'debug';
    console.info('[LOGGER] Debug mode enabled');
  }
}

export const logger = new ProductionLogger();

// Helper function to check if debug is allowed
export const allowDebug = (): boolean => {
  if (import.meta.env.DEV) return true;
  
  if (typeof window === 'undefined') return false;
  
  const isLocalhost = window.location.hostname === 'localhost';
  const hasDebugParam = window.location.search.includes('debug=true');
  
  return isLocalhost || (hasDebugParam && import.meta.env.VITE_ALLOW_DEBUG === 'true');
};

// Enable debug mode if allowed
if (allowDebug()) {
  logger.enableDebugMode();
}