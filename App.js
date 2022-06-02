import React, {Component} from 'react';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import Firebase from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';


import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ToastAndroid
} from 'react-native';

import axios from 'axios';

const API = 'https://aman-server.temperature-monitoring.xyz/api';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isLoading: true,
      isError: false,
      errorMessage: null,

      idToken: null,
      isUserExist: false,
      emailInput: "",
      nameInput: "",
      isSubmit: null,

      dataProfile: [],
      dataTemperature: [],
      dataHumidity: [],
      dataConfig: [],
    };

    AsyncStorage.getItem('isUserExist', (error, result) => {
      if (result == 'true') {
         this.setState({isUserExist: true})
      } else {
        this.setState({isUserExist: false})
      }
    });

    AsyncStorage.getItem('name', (error, result) => {
      if (result != '') {
         this.setState({nameInput: result})
      } else {
        this.setState({nameInput: ''})
      }
    });



  }

  componentDidMount() {

    this.getConfigData();
    this.getTemperatureData();

    // AsyncStorage.getItem('maxLimitTemperature', (error, result) => {
    //   if (result != null) {
    //      this.setState({dataConfig: {
    //       maxLimitTemperature: result
    //      }})

    //      alert(result)
    //   } else {
    //     this.setState({dataConfig: {
    //       maxLimitTemperature: 0
    //      }})

    //      alert("belum ada nilai suhu")
    //   }
    // });

    // AsyncStorage.getItem('maxLimitHumidity', (error, result) => {
    //   if (result != null) {
    //      this.setState({dataConfig: {
    //       maxLimitHumidity: result
    //      }})

    //      alert(result)
    //   } else {
    //     this.setState({dataConfig: {
    //       maxLimitHumidity: 0
    //      }})
    //   }
    // });

    // Firebase.initializeApp(this);
    var firebaseConfig = {
      apiKey: "AIzaSyBcHSdTDQx6IO1Kl52MCdmvuG_FblfwvCA",
      authDomain: "aman-project-poltekbang.firebaseapp.com",
      projectId: "aman-project-poltekbang",
      storageBucket: "aman-project-poltekbang.appspot.com",
      messagingSenderId: "623822883539",
      appId: "1:623822883539:web:2be5f615ba68a06f4b6226"
    };
    // Initialize Firebase
    if (!Firebase.apps.length) {
      Firebase.initializeApp(firebaseConfig);
    } else {
      Firebase.app();
    }

    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      // onRegister: function (token) {
      //   console.log("TOKEN:", token);

      //   this.setState({ idToken: token.token });
      // },

      onRegister: (token) => {this.setState({ idToken: token.token }); 
    
      console.log('token: ', token.token)
      },
    
      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
    
        // process the notification
    
        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
    
      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);
    
        // process the action
      },
    
      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },
    
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
    
      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,
    
      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });


    this.initProfile();

    this._interval = setInterval(() => {
      this.getTemperatureData();
    }, 10000);

  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  initProfile = () => {
    const date = new Date();
    const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

    let dateNow = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    this.setState({dataProfile: {date: dateNow, name: this.state.nameInput}});

  }

  forceLogin = () => {

    alert("Memaksa masuk akan mengakibatkan aplikasi tidak dapat menerima notifikasi")

    AsyncStorage.setItem('name', 'Guest');

    AsyncStorage.setItem('isUserExist', 'true');

    this.setState({ isSubmit: 1, isUserExist: true, isLoading: false, isError: false, errorMessage: null });
  }

  submitEmail = () => {

    if (this.state.nameInput == null || this.state.nameInput == '' || this.state.emailInput == null || this.state.emailInput == '') {
      alert('Semua field harus diisi')
    } else {
      this.setState({ isSubmit: 1, isUserExist: true });

      // PROSES PENYIMPNAN NAMA PADA DEVICE
      AsyncStorage.setItem('name', this.state.nameInput);
      
      // PROSES PENYIMPNAN VARIABLE UNTUK PENGECEKAN APAKAH USER SUDAH LOGIN?
      AsyncStorage.setItem('isUserExist', 'true');
  
      let deviceInfo = [];
  
      // PROSES PENGIRIMAN DATA LOGIN KE SERVER
      let data = new FormData();
      data.append('name', this.state.nameInput);
      data.append('email', this.state.emailInput);
      data.append('token', this.state.idToken);
  
      let url = `${API}/device`;
  
      axios.post(url, data)
      .then((data) => console.log(data))
      .catch((response) =>  this.setState({isLoading: false, isError: true, errorMessage: "Kesalahan saat set account"}));
  
    }

  }

  getConfigData = () => {
    try {
      // const response = await axios.get(`${API}/config`);

      axios.get(`${API}/config`)
      .then(res => {
        const response = res.data;

        this.setState({
          dataConfig: {
            maxLimitTemperature: response.data.maxLimitTemperature,
            maxLimitHumidity: response.data.maxLimitHumidity,
          }
        });

        AsyncStorage.setItem('maxLimitTemperature', String(response.data.maxLimitTemperature));
        AsyncStorage.setItem('maxLimitHumidity', String(response.data.maxLimitHumidity));
      })

    } catch (error) {
      console.log(error)
    }
  };

  updateData = () => {
    this.getTemperatureData();

    ToastAndroid.showWithGravity(
      "Data telah diperbaharui",
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
  }

  // PROSES REQUST DATA DARI ANDROID KE SERVER UNTUK MEMINTA DATA SUHU DAN KELEMBABAN
  getTemperatureData = async () => {
    try {

      // PROSES REQUEST DATA
      const response = await axios.get(
        `${API}/temperature/latest`,
      );

      let temperatureCondition;
      let humidityCondition;

      // PENGECAKAN APAKAH SUHU NORMAL ATAU TIDAK
      if (response.data.data.temperature < this.state.dataConfig.maxLimitTemperature) {
          temperatureCondition = 'Normal';
      } else if (response.data.data.temperature >= this.state.dataConfig.maxLimitTemperature) {
          temperatureCondition = 'Tidak normal';
      }

      // PENGECAKAN APAKAH KELEMBABAN NORMAL ATAU TIDAK
      if (response.data.data.humidity < this.state.dataConfig.maxLimitHumidity) {
          humidityCondition = 'Normal';
      } else if (response.data.data.humidity >= this.state.dataConfig.maxLimitHumidity) {
          humidityCondition = 'Tidak normal';
      }


      this.setState({
        isError: false,
        isLoading: false,
        errorMessage: null,
        data: response.data.data,
        dataTemperature: {
          temperature: response.data.data.temperature,
          condition: temperatureCondition,
        },
        dataHumidity: {
          humidity: response.data.data.humidity,
          condition: humidityCondition,
        },
      });
    } catch (error) {
      this.setState({isLoading: false, isError: true, errorMessage: "Kesalahan saat get data suhu"});
    }
  };

  render() {
    const {temperature, humidity, created_at} = this.state.data;
    const {date, name} = this.state.dataProfile;

    // alert(JSON.stringify(this.state.data.data.temperature))

    if (this.state.isUserExist) {
      if (this.state.isLoading) {
        return (
          <SafeAreaView>
            <View
              style={{alignItems: 'center', justifyContent: 'center', height: '100%'}}>
              <ActivityIndicator size="large" color="#0279FF" />
            </View>
          </SafeAreaView>
        );
      } else if (this.state.isError) {
        return (
          <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
            <Text>Terjadi kesalahan saat memuat data</Text>

            <TouchableOpacity onPress={this.forceLogin} style={{ backgroundColor: '#DC3545', padding: 10, borderRadius: 10, alignItems: 'center'}}>
                <Text style={{color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}>Paksa masuk</Text>
              </TouchableOpacity>

            <Text>{JSON.stringify(this.state.errorMessage)}</Text>
          </View>
        );
      }
  
      return (
        <SafeAreaView>
          <View style={{ backgroundColor: '#F5F5F5', padding: 10, height: '100%'}}>

            <View style={{ padding: 10, flexDirection: 'column' }}>
              <View>
                <Text style={{ color: '#BEBEBE', fontSize: 14, }}>{date}</Text>
                <Text style={{ fontWeight: '700', fontSize: 32 }}>Hi, {this.state.nameInput}</Text>
              </View>

              <View style={{ position: 'absolute', right: 10, top: 18 }}>
                <Image source={require("./assets/images/image_profile.png")} style={{ width: 48, height: 51 }} />
              </View>
            </View>

            {/* ---START--- PENGECEKAN APAKAH SUHU NORMAL UNTUK BAGIAN TAMPILAN */}
            <View style={{ marginTop: 40, padding: 10}}>
              <Text style={{ color: '#8D8D8D', fontSize: 14, marginBottom: 12, fontWeight: 'bold' }}>Perangkat</Text>

              <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 17, flexDirection: 'row', alignItems: 'center', borderStyle: 'solid', borderWidth: this.state.dataTemperature.temperature >= this.state.dataConfig.maxLimitTemperature ? 1 : 0, borderColor: '#E43838', marginBottom: 20}}>

                <View style={{ }}>
                  {
                    this.state.dataTemperature.temperature >= this.state.dataConfig.maxLimitTemperature ? (
                      <Image source={require("./assets/images/image_thermostat_hot.png")} style={{ width: 48, height: 51 }} />
                    ):(
                      <Image source={require("./assets/images/image_thermostat_normal.png")} style={{ width: 48, height: 51 }} />
                    )
                  }
                </View>

                <View style={{ flexDirection: 'column', marginLeft: 15}}>
                  <Text style={{ fontWeight: '700', fontSize: 18, alignItems: 'flex-start' }}>Suhu</Text>
                  {
                    this.state.dataTemperature.temperature >= this.state.dataConfig.maxLimitTemperature ? (
                      <Text style={{ color: '#8D8D8D', alignItems: 'flex-end' }}>Kondisi : <Text style={{ color: '#E43838', fontWeight: '700' }}>{this.state.dataTemperature.condition}</Text></Text>
                    ):(
                      <Text style={{ color: '#8D8D8D', alignItems: 'flex-end' }}>Kondisi : {this.state.dataTemperature.condition}</Text>
                    )
                  }
                  
                </View>

                <View style={{ position: 'absolute', right: 20, top: 18 }}>
                  {
                    this.state.dataTemperature.temperature >= this.state.dataConfig.maxLimitTemperature ? (
                      <Text style={{ fontSize: 36, fontWeight: '700', textAlign: 'right', color: '#E43838'}}>{this.state.dataTemperature.temperature}°</Text>
                    ):(
                      <Text style={{ fontSize: 36, fontWeight: '700', textAlign: 'right', color: 'black'}}>{this.state.dataTemperature.temperature}°</Text>
                    )
                  }
                  
                </View>
                
                
              </View>

              <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 17, flexDirection: 'row', alignItems: 'center', borderStyle: 'solid', borderWidth: this.state.dataHumidity.humidity >= this.state.maxLimitHumidity ? 1 : 0, borderColor: '#0279FF', marginBottom: 20}}>

                <View style={{ }}>
                  {
                    this.state.dataHumidity.humidity >= this.state.dataConfig.maxLimitHumidity ? (
                      <Image source={require("./assets/images/image_water_normal.png")} style={{ width: 48, height: 51 }} />
                    ):(
                      <Image source={require("./assets/images/image_water_normal.png")} style={{ width: 48, height: 51 }} />
                    )
                  }
                </View>

                <View style={{ flexDirection: 'column', marginLeft: 15}}>
                  <Text style={{ fontWeight: '700', fontSize: 18, alignItems: 'flex-start' }}>Kelembapan</Text>
                  {
                    this.state.dataHumidity.humidity >= this.state.dataConfig.maxLimitHumidity ? (
                      <Text style={{ color: '#8D8D8D', alignItems: 'flex-end' }}>Kondisi : <Text style={{ color: '#0279FF', fontWeight: '700' }}>{this.state.dataHumidity.condition}</Text></Text>
                    ):(
                      <Text style={{ color: '#8D8D8D', alignItems: 'flex-end' }}>Kondisi : {this.state.dataHumidity.condition}</Text>
                    )
                  }
                  
                </View>

                <View style={{ position: 'absolute', right: 20, top: 18 }}>
                  {
                    this.state.dataHumidity.humidity >= this.state.dataConfig.maxLimitHumidity ? (
                      <Text style={{ fontSize: 36, fontWeight: '700', textAlign: 'right', color: '#0279FF'}}>{this.state.dataHumidity.humidity}%</Text>
                    ):(
                      <Text style={{ fontSize: 36, fontWeight: '700', textAlign: 'right', color: 'black'}}>{this.state.dataHumidity.humidity}%</Text>
                    )
                  }
                  
                </View>

                {/* ---END--- PENGECEKAN APAKAH SUHU NORMAL UNTUK BAGIAN TAMPILAN */}
                
                
              </View>
              
              <Text style={{ color: '#8D8D8D', textAlign: 'center', fontSize: 14 }}>Terakhir diperbaharui : {created_at}</Text>


              <TouchableOpacity onPress={this.updateData} style={{ padding: 10, borderRadius: 10, alignItems: 'center', marginTop: '50%'}}>
                <View style={{ flexDirection: 'row'}}>
                  <Image source={require("./assets/images/image_sync.png")} style={{ width: 24, height: 24 }} />
                  <Text style={{color: '#0279FF', fontWeight: 'bold', textTransform: 'capitalize', marginLeft: 10, marginTop: 1}}>Perbaharui data</Text>
                </View>
              </TouchableOpacity>

            </View>


          </View>
        </SafeAreaView>
      );

    } else {

      // BAGIAN TAMPILAN UNTUK DAFTAR AKUN DEVICE
      return (
          <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', flex: 1, fontFamily: 'Poppins-Regular', backgroundColor: '#F5F5F5'}}>
            <View>
              <Text>Nama panggilan</Text>
              <TextInput onChangeText={(text) => this.setState({nameInput: text})} placeholder="Nama penggilan anda" style={{ backgroundColor: 'white', width: 300, fontSize: 14, borderRadius: 10, padding: 10, marginTop: 10, marginBottom: 10 }} />

              <Text>Email</Text>
              <TextInput onChangeText={(text) => this.setState({emailInput: text})} placeholder="mail@domain.com" style={{ backgroundColor: 'white', width: 300, fontSize: 14, borderRadius: 10, padding: 10, marginTop: 10, marginBottom: 15 }} />

              <TouchableOpacity onPress={this.submitEmail} style={{ backgroundColor: '#0279FF', padding: 10, borderRadius: 10, alignItems: 'center'}}>
                <Text style={{color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}>Mulai monitoring</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }

    
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
  fontPoppinsRegular: {
    fontFamily: 'Poppins-Regular',
  },
});

export default App;
