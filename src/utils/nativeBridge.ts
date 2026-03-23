
import { Capacitor } from '@capacitor/core';

/**
 * NativeBridge handles the transition between Web and Native App environments.
 * It implements the logic provided for Android permissions in a hybrid-compatible way.
 */
export const NativeBridge = {
  /**
   * Checks and requests microphone permissions.
   * On Web: Uses navigator.mediaDevices.getUserMedia
   * On App (Android/iOS): Uses Capacitor's native permission bridge
   */
  async requestMicrophonePermission(): Promise<boolean> {
    // 1. Check if we are running in a native app context
    if (Capacitor.isNativePlatform()) {
      console.log("Running in Native App context - requesting Android/iOS permissions");
      
      // Note: This is where the Java code logic you provided is implemented 
      // via the Capacitor bridge. Capacitor handles the ContextCompat.checkSelfPermission
      // and ActivityCompat.requestPermissions calls for us.
      try {
        // We use the web API first as Capacitor's bridge often hooks into this
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        return true;
      } catch (err) {
        console.error("Native permission request failed:", err);
        return false;
      }
    }

    // 2. Standard Web implementation
    console.log("Running in Web context");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      return true;
    } catch (err) {
      console.error("Web permission request failed:", err);
      return false;
    }
  }
};
