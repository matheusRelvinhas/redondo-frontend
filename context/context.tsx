import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Platform, useWindowDimensions } from "react-native";
import { useColorScheme } from "nativewind";
import { axiosPost } from "@/lib/api";
import { getItem, hydrateStorage, setItem } from "@/lib/storage";


interface User {
  id: number | null;
  name: string | null;
  email: string | null;
  premium: boolean | null;
  logged: boolean | null;
}

interface AppContextType {
  isMobile: boolean;
  isDesktop: boolean;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  user: User;
  setUser: (user: User) => void;
  accessToken: string | null;
  setAccessToken: (t: string | null) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  ready: boolean;
}

const defaultUser: User = {
  id: null,
  name: null,
  email: null,
  premium: null,
  logged: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { width } = useWindowDimensions();
  const { colorScheme, setColorScheme } = useColorScheme();

  const [user, setUser] = useState<User>(defaultUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const isMobile = width < 1040;
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const theme: "light" | "dark" = colorScheme === "light" ? "light" : "dark";

  const setTheme = (t: "light" | "dark") => {
    setColorScheme(t);
    setItem("theme", t);
  };

  useEffect(() => {
    hydrateStorage().then(() => {
      const saved = getItem("theme");
      if (saved === "light" || saved === "dark") setColorScheme(saved);
      setReady(true);
    });
  }, [setColorScheme]);

  useEffect(() => {
    if (!ready) return;

    const storedToken = getItem("token_access");
    if (!storedToken && !accessToken) return;

    if (accessToken && accessToken !== storedToken) {
      setItem("token_access", accessToken);
    }

    const finalToken = accessToken ?? storedToken;
    if (!finalToken || finalToken === "not_user") {
      setUser(defaultUser);
      return;
    }

    axiosPost(
      `/login/check_auth`,
      {},
      (data) => {
        setUser({
          id: data.user_id,
          name: data.name,
          email: data.email,
          logged: data.logged,
          premium: data.premium,
        });
      },
      () => {},
      true
    );
  }, [accessToken, ready]);

  return (
    <AppContext.Provider
      value={{
        isMobile,
        isDesktop,
        theme,
        setTheme,
        user,
        setUser,
        accessToken,
        setAccessToken,
        loading,
        setLoading,
        ready,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
