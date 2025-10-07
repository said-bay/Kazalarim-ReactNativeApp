// App.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native'; // Yüklenme ekranı için
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Veri kontrolü için

// Ekranlarımızı import ediyoruz
import SetupScreen from './src/screens/SetupScreen'; 
import TrackerScreen from './src/screens/TrackerScreen'; 

const Stack = createNativeStackNavigator();
const KAZA_DATA_KEY = 'kazaData'; // TrackerScreen'deki anahtar ile aynı olmalı

const App = () => {
  // 1. STATE: Uygulama veriyi kontrol ederken bekleme durumu
  const [isLoading, setIsLoading] = useState(true); 
  // 2. STATE: Kaza borcu verisi var mı? (Uygulama kuruldu mu?)
  const [isSetupComplete, setIsSetupComplete] = useState(false); 

  // EFFECT: Uygulama ilk açıldığında çalışacak
  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    try {
      // AsyncStorage'da kaza borcu verisi var mı diye kontrol ediyoruz
      const storedData = await AsyncStorage.getItem(KAZA_DATA_KEY);
      
      if (storedData) {
        // Veri varsa, kurulum tamamlanmıştır.
        setIsSetupComplete(true);
      } else {
        // Veri yoksa, SetupScreen'e gitmelidir.
        setIsSetupComplete(false);
      }
    } catch (e) {
      console.error("Başlangıç verisi kontrol hatası:", e);
      // Hata olsa bile, SetupScreen'e gitmek en güvenli yoldur.
      setIsSetupComplete(false);
    } finally {
      // Kontrol bitti, yükleniyor durumunu kapat.
      setIsLoading(false); 
    }
  };

  // KOŞUL 1: Uygulama ilk veriyi kontrol ederken gösterilecek basit ekran
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // KOŞUL 2: Veri kontrolü bitti, navigasyonu başlat
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          // Artık hangi ekranın açılacağına isSetupComplete değişkeni karar veriyor!
          initialRouteName={isSetupComplete ? "Tracker" : "Setup"} 
          screenOptions={{
            headerShown: false, 
          }}
        >
          {/* Setup Ekranı: isSetupComplete FALSE ise burası açılır */}
          <Stack.Screen name="Setup" component={SetupScreen} />
          
          {/* Tracker Ekranı: isSetupComplete TRUE ise burası açılır */}
          <Stack.Screen name="Tracker" component={TrackerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

// Yüklenme ekranı için basit stil
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    fontSize: 18,
    color: '#307765',
  }
});

export default App;