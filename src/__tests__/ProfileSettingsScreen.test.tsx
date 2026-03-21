import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileSettingsScreen from '@/screens/ProfileSettingsScreen';

test('renders ICR and ISF inputs and Save button', () => {
    const { getByTestId } = render(<ProfileSettingsScreen />);
    expect(getByTestId('input-icr')).toBeTruthy();
    expect(getByTestId('input-isf')).toBeTruthy();
    expect(getByTestId('btn-save-settings')).toBeTruthy();
});
