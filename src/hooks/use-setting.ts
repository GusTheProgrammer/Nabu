import { useEffect, useState } from 'react';

import clipboardDatabase from '@/lib/db';
import useDebounce from '@/hooks/use-debounce';

export function useSetting<T>(key: string, defaultValue: T, delay: number = 0) {
  const [localValue, setLocalValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const debouncedValue = useDebounce(localValue, delay);

  useEffect(() => {
    const loadSetting = async () => {
      const saved = await clipboardDatabase.getSetting(key, defaultValue);
      setLocalValue(saved);
      setIsLoaded(true);
    };

    loadSetting();
  }, [key]);

  useEffect(() => {
    if (!isLoaded) return;

    const saveSetting = async () => {
      await clipboardDatabase.setSetting(key, debouncedValue);
    };

    saveSetting();
  }, [debouncedValue, isLoaded, key]);

  return {
    value: localValue,
    isLoaded,
    setValue: setLocalValue,
  };
}
