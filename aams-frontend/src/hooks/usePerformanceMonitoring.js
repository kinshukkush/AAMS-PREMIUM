/**
 * Performance Monitoring Hook
 * Tracks and logs Web Vitals and performance metrics
 */

import { useEffect } from 'react';

/**
 * Track Core Web Vitals
 */
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('📊 LCP (Largest Contentful Paint):', lastEntry.renderTime || lastEntry.loadTime, 'ms');
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        console.log('📊 FID (First Input Delay):', entry.processingDuration, 'ms');
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          console.log('📊 CLS (Cumulative Layout Shift):', clsValue);
        }
      });
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // Paint timing
    window.addEventListener('load', () => {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        console.log(`📊 ${entry.name}:`, entry.startTime.toFixed(2), 'ms');
      });
    });

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);
};

/**
 * Track page load performance
 */
export const usePageLoadMetrics = () => {
  useEffect(() => {
    window.addEventListener('load', () => {
      const perfData = performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;

      console.log('⏱️  Page Load Metrics:');
      console.log(`  • Total Load Time: ${pageLoadTime}ms`);
      console.log(`  • Connect Time: ${connectTime}ms`);
      console.log(`  • Render Time: ${renderTime}ms`);
      console.log(`  • DOM Content Loaded: ${domContentLoaded}ms`);

      // Warn if metrics are slow
      if (pageLoadTime > 3000) {
        console.warn('⚠️  Slow page load detected (>3s)');
      }
      if (connectTime > 1000) {
        console.warn('⚠️  Slow network detected (>1s)');
      }
    });
  }, []);
};

/**
 * Monitor bundle size (in development)
 */
export const useBundleSizeMonitoring = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      const cssResources = resources.filter(r => r.name.endsWith('.css'));

      console.log('📦 Resource Loading:');
      jsResources.forEach(r => {
        const sizeMB = (r.transferSize / 1024 / 1024).toFixed(2);
        console.log(`  • ${r.name.split('/').pop()}: ${sizeMB}MB (${r.duration.toFixed(2)}ms)`);
      });
    }
  }, []);
};

/**
 * Log memory usage (Chrome only)
 */
export const useMemoryMonitoring = () => {
  useEffect(() => {
    if (performance.memory) {
      const memoryUsage = {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
        totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
        jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
      };

      console.log('💾 Memory Usage:');
      console.log(`  • Used: ${memoryUsage.usedJSHeapSize}MB`);
      console.log(`  • Total: ${memoryUsage.totalJSHeapSize}MB`);
      console.log(`  • Limit: ${memoryUsage.jsHeapSizeLimit}MB`);

      // Set interval to monitor memory
      const interval = setInterval(() => {
        const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        if (used > memoryUsage.usedJSHeapSize * 1.5) {
          console.warn(`⚠️  Memory usage increased to ${used}MB`);
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, []);
};

/**
 * Comprehensive performance monitoring hook
 */
export const useComprehensivePerformanceMonitoring = () => {
  usePerformanceMonitoring();
  usePageLoadMetrics();
  useBundleSizeMonitoring();
  useMemoryMonitoring();
};

export default {
  usePerformanceMonitoring,
  usePageLoadMetrics,
  useBundleSizeMonitoring,
  useMemoryMonitoring,
  useComprehensivePerformanceMonitoring
};
