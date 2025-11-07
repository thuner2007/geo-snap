import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0080ffff",
        headerShown: true,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <IconSymbol
                size={24}
                name="camera.fill"
                color={Colors["light"].tint}
              />
              <Text style={styles.headerText}>Geo-Snap</Text>
            </View>
          ),
          headerTitleAlign: "left",
          tabBarLabel: "Karte",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <IconSymbol
                size={24}
                name="photo.fill"
                color={Colors["light"].tint}
              />
              <Text style={styles.headerText}>Meine Fotos</Text>
            </View>
          ),
          headerTitleAlign: "left",
          tabBarLabel: "Galerie",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="photo.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors["light"].text,
  },
});
