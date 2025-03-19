import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import InventoryScreen from "./screens/InventoryScreen";
import ProductsScreen from "./screens/ProductsScreen";
import SalesScreen from "./screens/SalesScreen";
import RevenueScreen from "./screens/RevenueScreen";

// Context Provider
import { DataProvider } from './context/DataContext';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{
        tabBarActiveTintColor: '#7048e8',
        tabBarInactiveTintColor: '#777',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#7048e8',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Inventory" 
        component={InventoryScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="package" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="category" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Sales" 
        component={SalesScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-cart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Revenue" 
        component={RevenueScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="rupee-sign" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={styles.container}>
        <DataProvider>
          <Toaster />
          <NavigationContainer>
            <MainTabs />
          </NavigationContainer>
        </DataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
