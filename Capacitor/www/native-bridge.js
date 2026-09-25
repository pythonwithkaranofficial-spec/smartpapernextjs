/**
 * Smart Paper AI - Capacitor Native Bridge
 * Handles hardware back-button, AdMob monetization, native file sharing,
 * status bar styling, and native Android life-cycle events.
 */

(function () {
  const isCapacitor = typeof window.Capacitor !== 'undefined';

  // State management
  let lastBackPressTime = 0;
  let bannerInitialized = false;
  let interstitialLoaded = false;
  let rewardedLoaded = false;

  // AdMob Test Configuration (can be updated via admob.config.json)
  const ADMOB_CONFIG = {
    bannerAdId: 'ca-app-pub-3940256099942544/6300978111',
    interstitialAdId: 'ca-app-pub-3940256099942544/1033173712',
    rewardedAdId: 'ca-app-pub-3940256099942544/5224354917'
  };

  /**
   * Initialize Native Android Capabilities
   */
  async function initNativeFeatures() {
    if (!isCapacitor) {
      console.log('[NativeBridge] Running in standard browser mode.');
      return;
    }

    const { App, StatusBar, SplashScreen, AdMob, Share, Filesystem } = window.Capacitor.Plugins;

    // 1. Configure Status Bar
    if (StatusBar) {
      try {
        await StatusBar.setStyle({ style: 'DARK' });
        await StatusBar.setBackgroundColor({ color: '#090d16' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (e) {
        console.warn('[NativeBridge] StatusBar init warning:', e);
      }
    }

    // 2. Hide Splash Screen smoothly once UI is loaded
    if (SplashScreen) {
      try {
        await SplashScreen.hide({ fadeOutDuration: 400 });
      } catch (e) {
        console.warn('[NativeBridge] SplashScreen hide warning:', e);
      }
    }

    // 3. Handle Hardware Back Button
    if (App) {
      App.addListener('backButton', ({ canGoBack }) => {
        // If a modal or sheet is open, check if custom back handler is registered
        if (window._smartPaperCustomBackHandler && window._smartPaperCustomBackHandler()) {
          return;
        }

        // If the webview has browser history, go back
        if (window.location.pathname !== '/' && window.location.pathname !== '/generate') {
          window.history.back();
          return;
        }

        // Double press to exit behavior on root pages
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
          App.exitApp();
        } else {
          lastBackPressTime = now;
          showNativeToast('Press back again to exit Smart Paper AI');
        }
      });
    }

    // 4. Initialize AdMob
    if (AdMob) {
      try {
        await AdMob.initialize({
          requestTrackingAuthorization: true,
          initializeForTesting: true
        });
        console.log('[NativeBridge] AdMob initialized successfully.');
      } catch (e) {
        console.warn('[NativeBridge] AdMob initialization note:', e);
      }
    }
  }

  /**
   * Minimal lightweight in-app toast notification for Android feedback
   */
  function showNativeToast(message) {
    const existing = document.getElementById('native-toast-msg');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'native-toast-msg';
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '9999px';
    toast.style.fontSize = '13px';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    toast.style.border = '1px solid rgba(255,255,255,0.15)';
    toast.style.zIndex = '999999';
    toast.style.pointerEvents = 'none';
    toast.style.transition = 'opacity 0.3s ease';
    toast.innerText = message;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 1800);
  }

  // Public bridge interface exposed on window
  window.SmartPaperNative = {
    isAvailable: isCapacitor,

    // AdMob: Banner Ads
    async showBanner(adId = ADMOB_CONFIG.bannerAdId) {
      if (!isCapacitor || !window.Capacitor.Plugins.AdMob) return;
      try {
        const { AdMob, BannerAdPosition, BannerAdSize } = window.Capacitor.Plugins;
        await AdMob.showBanner({
          adId: adId,
          adSize: BannerAdSize ? BannerAdSize.BANNER : 'BANNER',
          position: BannerAdPosition ? BannerAdPosition.BOTTOM_CENTER : 'BOTTOM_CENTER',
          margin: 0,
          isTesting: true
        });
        bannerInitialized = true;
      } catch (err) {
        console.warn('[AdMob Banner Error]:', err);
      }
    },

    async hideBanner() {
      if (!isCapacitor || !window.Capacitor.Plugins.AdMob) return;
      try {
        await window.Capacitor.Plugins.AdMob.hideBanner();
      } catch (err) {
        console.warn('[AdMob Hide Error]:', err);
      }
    },

    // AdMob: Interstitial Ads (Full screen)
    async showInterstitial(adId = ADMOB_CONFIG.interstitialAdId) {
      if (!isCapacitor || !window.Capacitor.Plugins.AdMob) return;
      try {
        const { AdMob } = window.Capacitor.Plugins;
        await AdMob.prepareInterstitial({ adId, isTesting: true });
        await AdMob.showInterstitial();
      } catch (err) {
        console.warn('[AdMob Interstitial Error]:', err);
      }
    },

    // AdMob: Rewarded Ads (Earn extra paper generation tokens)
    async showRewarded(onReward, adId = ADMOB_CONFIG.rewardedAdId) {
      if (!isCapacitor || !window.Capacitor.Plugins.AdMob) {
        if (typeof onReward === 'function') onReward({ amount: 1, type: 'paper_credit' });
        return;
      }
      try {
        const { AdMob } = window.Capacitor.Plugins;
        await AdMob.prepareRewardVideoAd({ adId, isTesting: true });
        const rewardItem = await AdMob.showRewardVideoAd();
        if (typeof onReward === 'function') {
          onReward(rewardItem);
        }
      } catch (err) {
        console.warn('[AdMob Rewarded Error]:', err);
      }
    },

    // Native Sharing Dialog (WhatsApp, Drive, Gmail, etc.)
    async share({ title, text, url, dialogTitle = 'Share Question Paper' }) {
      if (isCapacitor && window.Capacitor.Plugins.Share) {
        try {
          await window.Capacitor.Plugins.Share.share({
            title: title || 'Smart Paper Generator AI',
            text: text || 'Here is the CBSE Question Paper generated with Smart Paper AI.',
            url: url,
            dialogTitle: dialogTitle
          });
          return true;
        } catch (e) {
          console.warn('[Native Share Error]:', e);
        }
      } else if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          return true;
        } catch (e) {
          console.warn('[Web Share Error]:', e);
        }
      }
      return false;
    },

    // Native Toast helper
    toast: showNativeToast
  };

  // Run initialization on DOM content ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNativeFeatures);
  } else {
    initNativeFeatures();
  }
})();
