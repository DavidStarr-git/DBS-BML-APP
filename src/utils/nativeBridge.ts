
import { Capacitor } from '@capacitor/core';
import * as audioNative from './audioNative';

/**
 * NativeBridge handles the transition between Web and Native App environments.
 * It implements the logic provided for Android permissions in a hybrid-compatible way.
 */
export const NativeBridge = {
  /**
   * Checks the current permission status without triggering a prompt.
   */
  async checkPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
    if (Capacitor.isNativePlatform()) {
      // In native, we'd ideally use a Capacitor plugin, but for now we'll assume 'prompt' 
      // if we can't check easily, or just use the web API check.
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: 'microphone' as any });
        return status.state as 'granted' | 'denied' | 'prompt';
      }
    } catch (e) {
      console.error("Permission query not supported", e);
    }
    
    return 'prompt';
  },

  /**
   * Checks and requests microphone permissions.
   * On Web: Uses navigator.mediaDevices.getUserMedia
   * On App (Android/iOS): Uses Capacitor's native permission bridge
   */
  async requestMicrophonePermission(): Promise<boolean> {
    // 1. Check if we are running in a native app context
    if (Capacitor.isNativePlatform()) {
      console.log("Running in Native App context - requesting Android/iOS permissions");
      return await audioNative.requestPermissions();
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
  },

  /**
   * Start recording audio.
   */
  async startRecording(fileName: string): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      return await audioNative.startRecording(fileName);
    }
    return false; // Web handles this via MediaRecorder in RecordingPage
  },

  /**
   * Stop recording audio.
   */
  async stopRecording(): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      return await audioNative.stopRecording();
    }
    return null;
  },

  /**
   * Export to Downloads/Documents.
   */
  async exportToDownloads(base64Data: string, fileName: string): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      return await audioNative.exportToDownloads(base64Data, fileName);
    }
    return false;
  }
};
