import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles, mainEdges } from "../styles/globalStyles";

const FindBuilding = () => {
  return (
    <SafeAreaView style={globalStyles.container} edges={mainEdges}>
      <Text style={[globalStyles.textBold, { fontSize: 24 }]}>
        Find Building
      </Text>
    </SafeAreaView>
  );
};

export default FindBuilding;
