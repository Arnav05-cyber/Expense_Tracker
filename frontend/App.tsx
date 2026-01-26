import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

function App() {
  return (
    <GluestackUIProvider mode="light">
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 20 }}>App works!</Text>
      </SafeAreaView> 
    </GluestackUIProvider>
  );
}

export default App;
