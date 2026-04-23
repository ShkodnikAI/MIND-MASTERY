/**
 * @file Onboarding Layout — Stack navigator for the onboarding flow.
 *
 * No gestures allowed — the user must proceed through the onboarding
 * in order via explicit buttons.
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
