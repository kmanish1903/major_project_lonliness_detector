let deferredPrompt: any;

export const setupPWAInstall = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
};

export const promptPWAInstall = async () => {
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  deferredPrompt = null;
  return outcome === 'accepted';
};

export const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches;
};
