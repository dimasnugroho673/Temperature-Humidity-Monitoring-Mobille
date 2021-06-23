import React, { Component } from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ActivityIndicator
} from 'react-native';


import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from './src/pages/SplashScreen';
import Home from './src/pages/Home';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import Axios from 'axios';


// const Stack = createStackNavigator();

// function App() {
//   console.log("entering..")
//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         initialRouteName="SplashScreen"
//         screenOptions={{headerShown: false}}>
//           <Stack.Screen name="Home" component={Home} />
//           <Stack.Screen name="SplashScreen" component={SplashScreen} />
//         </Stack.Navigator>
//     </NavigationContainer>
//   ); 
// }

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isLoading: true,
      isError: false,
    };
}

  componentDidMount() {
      this.getTemperatureData()
  }

  getTemperatureData = async () => {
    try {
        const response = await Axios.get(`https://temperature-monitoring-230321.herokuapp.com/api/temperature/latest`)
        this.setState({ isError: false, isLoading: false, data: response.data.data })

    } catch (error) {
        this.setState({ isLoading: false, isError: true })
    }
  }

  render() {

    const { temperature, humidity, created_at } = this.state.data
    // alert(JSON.stringify(this.state.data.data.temperature))

    if (this.state.isLoading) {
      return (
        <SafeAreaView>
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <ActivityIndicator size='large' color='red' />
                </View>
        </SafeAreaView>
      );
    } 
    
    // If data not fetch
    else if (this.state.isError) {
      return (
          <View
              style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}
          >
              <Text>Terjadi Error Saat Memuat Data</Text>
          </View>
      )
  }

      return (
        <SafeAreaView>
          <View>
            <Text>Suhu : {temperature}</Text>
            <Text>Kelembapan : {humidity}</Text>
            <Text>Terakhir update : {created_at}</Text>
            
          </View>
        </SafeAreaView>
      );


      
  }
  
}


// const App: () => Node = () => {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   return (
//     <SafeAreaView style={backgroundStyle}>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <View>
//         <Text>Home</Text>
//       </View>
//       {/* <ScrollView
//         contentInsetAdjustmentBehavior="automatic"
//         style={backgroundStyle}>
//         <Header />
//         <View
//           style={{
//             backgroundColor: isDarkMode ? Colors.black : Colors.white,
//           }}>
//           <Section title="Step One">
//             Edit <Text style={styles.highlight}>App.js</Text> to change this
//             screen and then come back to see your edits.
//           </Section>
//           <Section title="See Your Changes">
//             <ReloadInstructions />
//           </Section>
//           <Section title="Debug">
//             <DebugInstructions />
//           </Section>
//           <Section title="Learn More">
//             Read the docs to discover what to do next:
//           </Section>
//           <LearnMoreLinks />
//         </View>
//       </ScrollView> */}
//     </SafeAreaView>
//   );
// };

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
