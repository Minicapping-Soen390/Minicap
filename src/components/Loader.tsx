import { View } from "react-native";
import { Spinner } from "@gluestack-ui/themed";
import { Dimensions } from "react-native";

type LoaderProps = {
  isLoading: boolean;
};

const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
  const screenHeight = Dimensions.get("screen").height;

  if (!isLoading) return null;

  return (
    <View
      testID="loader"
      style={{
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: screenHeight,
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 10,
      }}
    >
      <Spinner size="large" color="$white" />
    </View>
  );
};

export default Loader;
