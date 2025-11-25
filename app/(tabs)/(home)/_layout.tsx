
import { Platform, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: Platform.OS === 'ios',
          title: 'Home',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/create-post')}>
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add_circle"
                size={28}
                color={colors.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
