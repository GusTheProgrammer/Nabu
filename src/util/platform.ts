import { platform } from '@tauri-apps/plugin-os';

let cachedPlatform: string | null = null;

export const getPlatform = (): string => {
  if (cachedPlatform === null) {
    cachedPlatform = platform();
  }
  return cachedPlatform;
};

export const isMacOS = (): boolean => {
  return getPlatform() === 'macos';
};

export const isWindows = (): boolean => {
  return getPlatform() === 'windows';
};

export const isLinux = (): boolean => {
  return getPlatform() === 'linux';
};
