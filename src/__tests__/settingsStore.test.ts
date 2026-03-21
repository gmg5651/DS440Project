import { useSettingsStore } from '@/store/settingsStore';
import { act, renderHook } from '@testing-library/react-native';

test('ICR defaults to 10', () => {
    const { result } = renderHook(() => useSettingsStore());
    expect(result.current.icr).toBe(10);
});

test('updates ICR correctly', () => {
    const { result } = renderHook(() => useSettingsStore());
    act(() => result.current.setIcr(12));
    expect(result.current.icr).toBe(12);
});
