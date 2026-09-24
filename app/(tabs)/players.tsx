import { Text } from "react-native";
import { Screen, PageTitle } from "@/components/screen";
import { Panel } from "@/components/ui";

export default function JogadoresScreen() {
  return (
    <Screen>
      <PageTitle title="Jogadores" subtitle="Ranking e estatísticas" />
      <Panel className="items-center justify-center p-8">
        <Text className="text-sm text-ink-2">Em construção</Text>
      </Panel>
    </Screen>
  );
}
