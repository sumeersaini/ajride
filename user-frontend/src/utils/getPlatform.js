export const getPlatform = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return "iOS";

  // Android detection
  if (/android/i.test(ua)) return "Android";

  // Desktop detection
  if (/Win|Mac|Linux/.test(navigator.platform)) return "Desktop";

  // Fallback
  return "Web";
};

export const getBrowser = () => {
  const ua = navigator.userAgent;

  if (/edg/i.test(ua)) return "Edge";
  if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) return "Safari";
  if (/opr\//i.test(ua)) return "Opera";

  return "Unknown";
};
