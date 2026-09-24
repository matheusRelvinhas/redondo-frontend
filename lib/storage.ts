import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const memory = new Map<string, string>();

const isWeb = Platform.OS === "web";

const PERSISTED_KEYS = ["token_access", "theme", "games_status"] as const;

export async function hydrateStorage() {
  await Promise.all(
    PERSISTED_KEYS.map(async (key) => {
      try {
        const value = isWeb
          ? globalThis.localStorage?.getItem(key)
          : await SecureStore.getItemAsync(key);
        if (value != null) memory.set(key, value);
      } catch {
        // storage indisponível (modo privado, etc.) — segue sem cache
      }
    })
  );
}

export function getItem(key: string): string | null {
  return memory.get(key) ?? null;
}

export function setItem(key: string, value: string) {
  memory.set(key, value);
  try {
    if (isWeb) globalThis.localStorage?.setItem(key, value);
    else void SecureStore.setItemAsync(key, value);
  } catch {
    // ignora falha de persistência; o valor continua válido em memória
  }
}

export function removeItem(key: string) {
  memory.delete(key);
  try {
    if (isWeb) globalThis.localStorage?.removeItem(key);
    else void SecureStore.deleteItemAsync(key);
  } catch {
    // ignora
  }
}
