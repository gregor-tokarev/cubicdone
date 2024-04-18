import { FlatList, View } from "react-native";
import DraftRow from "../components/DraftRow";

export default function Page() {
  return (
    <View className="pt-10">
      <FlatList
        data={Array(30)}
        renderItem={(_item) => <DraftRow></DraftRow>}
      ></FlatList>
    </View>
  );
}
