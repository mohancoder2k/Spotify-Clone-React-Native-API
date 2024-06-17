import { View, Text, SafeAreaView, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Entypo, MaterialIcons, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import base64 from 'base-64';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useNavigation();
  const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  };

  const redirectUri = makeRedirectUri({
    scheme: 'yourapp',
    path: 'spotify',
  });
  console.log('Redirect URI:', redirectUri);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '316375d866214b6a88a1d80e5a0213f4',
      scopes: [
        "user-read-email",
        "user-library-read",
        "user-read-recently-played",
        "user-top-read",
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-public"
      ],
      usePKCE: false,
      redirectUri: redirectUri,
    },
    discovery
  );

  const [accessToken, setAccessToken] = useState([]);
  const [expirationDate, setExpirationDate] = useState([]);

  useEffect(() => {
    const checkTokenValidity = async () => {
      const storedAccessToken = await AsyncStorage.getItem("token");
      const storedExpirationDate = await AsyncStorage.getItem("expirationDate");

      if (storedAccessToken && storedExpirationDate) {
        const currentTime = Date.now();
        if (currentTime < parseInt(storedExpirationDate)) {
          console.log("Login Sucessfully");
          navigation.replace("Main");
        } else {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("expirationDate");
        }
      }
    };

    checkTokenValidity();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      console.log('Authorization code:', code);

      const fetchToken = async () => {
        try {
          const tokenResponse = await fetch(`https://accounts.spotify.com/api/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${base64.encode('316375d866214b6a88a1d80e5a0213f4:e55838c13ad343cc9d18784c1a36c76a')}`,
            },
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
          });
          const data = await tokenResponse.json();
          console.log('Token response:', data);

          if (data.access_token) {
            const accessToken = data.access_token;
            const expirationDate = new Date(Date.now() + data.expires_in * 1000).getTime();
            setAccessToken(accessToken);
            setExpirationDate(expirationDate);
            await AsyncStorage.setItem("token", accessToken);
            await AsyncStorage.setItem("expirationDate", expirationDate.toString());
            console.log("successful login");
            navigation.replace("Main");
          } else {
            console.error('Failed to get access token:', data);
          }
        } catch (error) {
          console.error('Token exchange error:', error);
        }
      };

      fetchToken();
    }
  }, [response]);

  const authenticate = async () => {
    promptAsync();
  };

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <SafeAreaView>
        <View style={{ height: 80 }} />
        <Entypo style={{ alignItems: 'center', textAlign: 'center' }} name="spotify" size={80} color="white" />
        <Text style={{
          color: 'white',
          fontSize: 40,
          textAlign: 'center',
          fontWeight: 'bold',
          marginTop: 40
        }}>
          Millions of songs free on spotify
        </Text>

        <View style={{ height: 80 }} />
        <Pressable
          onPress={authenticate}
          style={{
            backgroundColor: '#1DB954',
            padding: 10,
            marginLeft: 'auto',
            marginRight: 'auto',
            width: 300,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 10
          }}
        >
          <Text>Sign in with Spotify</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: '#131624',
            padding: 10,
            marginLeft: 'auto',
            marginRight: 'auto',
            width: 300,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 10,
            borderColor: '#C0C0C0',
            borderWidth: 0.8
          }}
        >
          <MaterialIcons name="phone-android" size={24} color="white" />
          <Text style={{ fontWeight: '500', color: 'white', textAlign: 'center', flex: 1 }}>
            Continue with Phone Number
          </Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: '#131624',
            padding: 10,
            marginLeft: 'auto',
            marginRight: 'auto',
            width: 300,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 10,
            borderColor: '#C0C0C0',
            borderWidth: 0.8
          }}
        >
          <AntDesign name="google" size={24} color="red" />
          <Text style={{ fontWeight: '500', color: 'white', textAlign: 'center', flex: 1 }}>
            Continue with Google
          </Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: '#131624',
            padding: 10,
            marginLeft: 'auto',
            marginRight: 'auto',
            width: 300,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 10,
            borderColor: '#C0C0C0',
            borderWidth: 0.8
          }}
        >
          <Entypo name="facebook" size={24} color="blue" />
          <Text style={{ fontWeight: '500', color: 'white', textAlign: 'center', flex: 1 }}>
            Continue with Facebook
          </Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}
