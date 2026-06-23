import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <TabBar
          routes={state.routes}
          activeIndex={state.index}
          onTab={(name, key) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) navigation.navigate(name);
          }}
        />
      )}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="friends" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
