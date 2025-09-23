import { useEffect, useState, useCallback } from 'react';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UpdateState {
  isChecking: boolean;
  isDownloading: boolean;
  isUpdateAvailable: boolean;
  error: string | null;
  lastChecked: Date | null;
}

export const useOTAUpdates = () => {
  const [updateState, setUpdateState] = useState<UpdateState>({
    isChecking: false,
    isDownloading: false,
    isUpdateAvailable: false,
    error: null,
    lastChecked: null,
  });

  const checkForUpdates = useCallback(async (showAlerts = false) => {
    // Skip in development mode
    if (__DEV__) {
      console.log('🚀 OTA Updates: Skipping in development mode');
      return;
    }

    try {
      setUpdateState(prev => ({ ...prev, isChecking: true, error: null }));
      console.log('🔍 Checking for OTA updates...');

      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        console.log('✅ Update available! Downloading...');
        setUpdateState(prev => ({ 
          ...prev, 
          isUpdateAvailable: true, 
          isDownloading: true,
          isChecking: false 
        }));

        await Updates.fetchUpdateAsync();
        console.log('📦 Update downloaded successfully!');

        if (showAlerts) {
          Alert.alert(
            'Update Ready',
            'A new version has been downloaded. Restart the app to apply the update.',
            [
              { text: 'Later', style: 'cancel' },
              { 
                text: 'Restart Now', 
                onPress: async () => {
                  await Updates.reloadAsync();
                }
              }
            ]
          );
        } else {
          // Auto-reload after 2 seconds for background updates
          setTimeout(async () => {
            await Updates.reloadAsync();
          }, 2000);
        }
      } else {
        console.log('ℹ️ No updates available');
        if (showAlerts) {
          Alert.alert('No Updates', 'Your app is up to date!');
        }
      }

      // Store last check time
      await AsyncStorage.setItem('lastUpdateCheck', new Date().toISOString());
      
      setUpdateState(prev => ({
        ...prev,
        isChecking: false,
        isDownloading: false,
        lastChecked: new Date(),
        error: null
      }));

    } catch (error: any) {
      console.error('❌ Update check failed:', error);
      setUpdateState(prev => ({
        ...prev,
        isChecking: false,
        isDownloading: false,
        error: error.message,
        lastChecked: new Date()
      }));

      if (showAlerts) {
        Alert.alert('Update Error', 'Failed to check for updates. Please try again later.');
      }
    }
  }, []);

  // Auto-check for updates on app start
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const autoCheck = async () => {
      // Wait 3 seconds after app load to check for updates
      timeoutId = setTimeout(() => {
        checkForUpdates(false); // Don't show alerts for automatic checks
      }, 3000);
    };

    autoCheck();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [checkForUpdates]);

  // Check for updates every 30 minutes when app is active
  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpdates(false);
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  const manualUpdateCheck = () => checkForUpdates(true);

  return {
    ...updateState,
    checkForUpdates: manualUpdateCheck,
  };
};