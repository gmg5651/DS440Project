import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#0a0a0a' },
                    headerTintColor: '#fff',
                    contentStyle: { backgroundColor: '#0a0a0a' },
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Swiftulin' }} />
            </Stack>
        </QueryClientProvider>
    );
}
