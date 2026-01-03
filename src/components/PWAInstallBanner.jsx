/**
 * PWAInstallBanner - Bass Academy
 * Shows an install prompt banner for PWA installation
 */

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const PWAInstallBanner = ({ isInstallable, onInstall, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage for previous dismissal
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const now = Date.now();
    
    // Show banner again after 7 days
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (now - dismissedTime > sevenDays) {
      setIsDismissed(false);
    } else {
      setIsDismissed(true);
    }
  }, []);

  // Show banner when installable and not dismissed
  useEffect(() => {
    if (isInstallable && !isDismissed) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isInstallable, isDismissed]);

  const handleInstall = async () => {
    const installed = await onInstall();
    if (installed) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-20 left-2 right-2 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm z-40"
      style={{ animation: 'fadeInUp 0.4s ease-out' }}
    >
      <div 
        className="glass-strong rounded-xl p-3 sm:p-4 border border-[var(--color-gold)]/30
                   shadow-lg shadow-black/20"
      >
        <div className="flex items-center gap-3">
          {/* Icon - smaller on mobile */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg gradient-gold flex items-center justify-center">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-primary-deep)]" />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--color-cream)] text-xs sm:text-sm">
              Instalar Bass Academy
            </h3>
            <p className="text-[10px] sm:text-xs text-[var(--color-primary-light)] line-clamp-1">
              Practica offline desde tu dispositivo
            </p>
          </div>
          
          {/* Buttons - inline on mobile */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-lg
                         bg-[var(--color-gold)] text-[var(--color-primary-deep)]
                         font-medium text-xs hover:bg-[var(--color-gold-light)]
                         transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-[var(--color-primary-light)]
                         hover:text-[var(--color-cream)] hover:bg-[var(--color-primary-dark)]/50
                         transition-colors duration-200"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;
