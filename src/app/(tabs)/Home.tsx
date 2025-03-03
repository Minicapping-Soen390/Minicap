import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles, mainEdges } from "../styles/globalStyles";

const Home = () => {
  return (
    <SafeAreaView style={globalStyles.container} edges={mainEdges}>
      <Text style={globalStyles.textBold}>
        Welcome to {"\n"}
        the Concordia{"\n"}
        Student Navigation App
      </Text>
    </SafeAreaView>
  );
};

export default Home;
