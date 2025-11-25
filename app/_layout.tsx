
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session ? 'Authenticated' : 'Not authenticated');
      setSession(session);
      if (session) {
        checkProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Authenticated' : 'Not authenticated');
      setSession(session);
      if (session) {
        checkProfile(session.user.id);
      } else {
        setHasProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (userId: string) => {
    try {
      console.log('Checking if profile exists for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, company_name, bio')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking profile:', error);
        setHasProfile(false);
        setIsLoading(false);
        return;
      }

      // Profile exists if we have data and both company_name and bio are filled
      const profileComplete = data && data.company_name && data.bio;
      console.log('Profile complete:', profileComplete);
      setHasProfile(!!profileComplete);
    } catch (error) {
      console.error('Unexpected error checking profile:', error);
      setHasProfile(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (isLoading || !loaded) return;

    const inAuthGroup = segments[0] === 'auth';
    const inEditProfile = segments[0] === 'edit-profile';

    if (!session && !inAuthGroup) {
      // Redirect to welcome/login if not authenticated
      router.replace('/');
    } else if (session && inAuthGroup) {
      // User is authenticated and trying to access auth screens
      if (hasProfile === false) {
        // Profile not complete, redirect to edit profile
        router.replace('/edit-profile');
      } else if (hasProfile === true) {
        // Profile complete, redirect to app
        router.replace('/(tabs)');
      }
    } else if (session && hasProfile === false && !inEditProfile) {
      // User is authenticated but profile not complete, redirect to edit profile
      router.replace('/edit-profile');
    } else if (session && hasProfile === true && inEditProfile) {
      // Profile is complete and user is on edit profile, allow it (they're editing)
      // Do nothing, let them stay on edit profile
    }
  }, [session, segments, isLoading, loaded, hasProfile]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen
          name="create-post"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Modal',
          }}
        />
        <Stack.Screen
          name="formsheet"
          options={{
            presentation: 'formSheet',
            title: 'Form Sheet',
            sheetAllowedDetents: [0.5, 1],
            sheetLargestUndimmedDetent: 0.5,
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen
          name="transparent-modal"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
