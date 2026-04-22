import '@testing-library/jest-native/extend-expect';
import React from 'react';

// Mock expo-router
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    },
    Stack: ({ children }: any) => children,
    Link: ({ children }: any) => children,
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(() => ({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getAllSync: jest.fn(() => []),
        getFirstSync: jest.fn(() => null),
    })),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(() => Promise.resolve(null)),
    setItemAsync: jest.fn(() => Promise.resolve()),
    deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-speech
jest.mock('expo-speech', () => ({
    speak: jest.fn(),
    stop: jest.fn(),
    isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
}));

// Mock drizzle-orm/expo-sqlite
jest.mock('drizzle-orm/expo-sqlite', () => ({
    drizzle: jest.fn(() => ({
        select: jest.fn(() => ({ from: jest.fn(() => ({ where: jest.fn(() => []) })) })),
        insert: jest.fn(() => ({ values: jest.fn(() => Promise.resolve()) })),
        update: jest.fn(() => ({ set: jest.fn(() => ({ where: jest.fn(() => Promise.resolve()) })) })),
        delete: jest.fn(() => ({ where: jest.fn(() => Promise.resolve()) })),
    })),
}));

// Mock expo-speech-recognition
const speechListeners: Record<string, Function> = {};
jest.mock('expo-speech-recognition', () => ({
    ExpoSpeechRecognitionModule: {
        requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
        start: jest.fn(() => {
            if (speechListeners['start']) speechListeners['start']();
        }),
        stop: jest.fn(() => {
            // Usually stopping doesn't trigger end immediately, but for tests this is fine
            if (speechListeners['end']) speechListeners['end']();
        }),
    },
    useSpeechRecognitionEvent: jest.fn((event: string, callback: Function) => {
        // React's useLayoutEffect/useEffect equivalent for tests
        const React = require('react');
        React.useEffect(() => {
            speechListeners[event] = callback;
            return () => {
                delete speechListeners[event];
            };
        }, [event, callback]);
    }),
}));
