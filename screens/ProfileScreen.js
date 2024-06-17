import { Image, ScrollView, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState({});
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("token");
      await getProfile(accessToken);
      await getPlaylists(accessToken);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching data:", error.message);
      setLoading(false);
    }
  };

  const getProfile = async (accessToken) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.log("Error fetching profile:", error.message);
      throw error;
    }
  };

  const getPlaylists = async (accessToken) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }
      const data = await response.json();
      setPlaylists(data.items);
    } catch (error) {
      console.log("Error fetching playlists:", error.message);
      throw error;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <ScrollView style={{ marginTop: 50 }}>
        <View style={{ padding: 12 }}>
          {userProfile && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Image
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  resizeMode: "cover",
                }}
                source={{ uri: userProfile?.images?.[0]?.url || "https://via.placeholder.com/40" }}
              />
              <View>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
                  {userProfile?.display_name || "No Display Name"}
                </Text>
                <Text style={{ color: "gray", fontSize: 16, fontWeight: "bold" }}>
                  {userProfile?.email || "No Email"}
                </Text>
              </View>
            </View>
          )}
        </View>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "500", marginHorizontal: 12 }}>
          Your Playlists
        </Text>
        <View style={{ padding: 15 }}>
          {playlists.map((item, index) => (
            <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 10 }}>
              <Image
                source={{
                  uri: item?.images?.[0]?.url || "https://via.placeholder.com/50",
                }}
                style={{ width: 50, height: 50, borderRadius: 4 }}
              />
              <View>
                <Text style={{ color: "white" }}>{item?.name || "No Name"}</Text>
                {item?.followers && (
                  <Text style={{ color: "white", marginTop: 7 }}>
                    {item?.followers.total || "0"} followers
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen;
