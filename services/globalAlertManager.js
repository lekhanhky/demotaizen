// Global alert manager để hiển thị full-screen alert từ bất kỳ đâu
let alertCallback = null;

export const setAlertCallback = (callback) => {
  alertCallback = callback;
};

export const showFullScreenAlert = (monitor) => {
  if (alertCallback) {
    alertCallback(monitor);
  } else {
    console.warn('Alert callback not set');
  }
};
