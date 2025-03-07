import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles, mainEdges } from "../styles/globalStyles";

const ClassSchedule = () => {
  return (
    <SafeAreaView style={globalStyles.container} edges={mainEdges}>
      <Text style={[globalStyles.textBold, { fontSize: 24 }]}>
        Class Schedule
      </Text>
    </SafeAreaView>
  );
};

export default ClassSchedule;
