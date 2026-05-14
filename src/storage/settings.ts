import { useEffect, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';
import { WidgetPreference } from '../types/quote';

export const settingsStore = createMMKV({
  id: 'cozy-quotes-settings',
});

export function getWidgetPreference(): WidgetPreference {
  const value = settingsStore.getString('widgetPreference');
  return value === 'favorites' ? 'favorites' : 'random';
}

export function useWidgetPreference() {
  const [preference, setPreference] = useState<WidgetPreference>(getWidgetPreference());

  useEffect(() => {
    const listener = settingsStore.addOnValueChangedListener((key: string) => {
      if (key === 'widgetPreference') {
        setPreference(getWidgetPreference());
      }
    });
    return () => listener.remove();
  }, []);

  return [preference, setPreference] as const;
}
