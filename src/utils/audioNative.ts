import { VoiceRecorder, RecordingData } from 'capacitor-voice-recorder';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/**
 * Request microphone permission for Capacitor.
 */
export const requestPermissions = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return true;

  try {
    const hasPermission = await VoiceRecorder.hasAudioRecordingPermission();

    if (!hasPermission.value) {
      const result = await VoiceRecorder.requestAudioRecordingPermission();
      return result.value;
    }

    return true;
  } catch (err) {
    console.error('Permission request failed:', err);
    return false;
  }
};

/**
 * Start recording audio.
 */
export const startRecording = async (fileName: string): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Recording not supported on web in this bridge');
    return false;
  }

  try {
    const canRecord = await VoiceRecorder.canDeviceVoiceRecord();
    if (!canRecord.value) {
      console.error('Device cannot record voice');
      return false;
    }

    const granted = await requestPermissions();
    if (!granted) {
      console.error('Microphone permission not granted');
      return false;
    }

    const result = await VoiceRecorder.startRecording();
    return result.value;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return false;
  }
};

/**
 * Stop recording and return the base64 data.
 */
export const stopRecording = async (): Promise<string | null> => {
  try {
    const result: RecordingData = await VoiceRecorder.stopRecording();
    if (result.value && result.value.recordDataBase64) {
      return result.value.recordDataBase64;
    }
    return null;
  } catch (error) {
    console.error('Failed to stop recording:', error);
    return null;
  }
};

/**
 * Export a file to device storage.
 */
export const exportToDownloads = async (
  base64Data: string,
  fileName: string
): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const destName = `${fileName}_${Date.now()}.wav`;

    await Filesystem.writeFile({
      path: destName,
      data: base64Data,
      directory: Directory.Documents,
    });

    console.log(`File saved as ${destName}`);
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
};