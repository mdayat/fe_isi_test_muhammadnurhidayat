import type { UserDTO } from "@dto/user";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import { useToast } from "./ToastProvider";
import { logger } from "@libs/pino";
import { axiosInstance } from "@libs/axios";
import { useRouter } from "next/router";

interface AuthContextType {
  user: UserDTO | null;
  setUser: Dispatch<SetStateAction<UserDTO | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { addToast } = useToast();

  const value = useMemo((): AuthContextType => {
    return { user, setUser };
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get<UserDTO>("/api/users/me");
        if (res.status === 200) {
          setUser(res.data);
        } else if (res.status === 401) {
          setUser(null);
        } else if (res.status === 404) {
          addToast("User not found", "error");
        } else {
          throw new Error(`unhandled status code: ${res.status}`);
        }
      } catch (error) {
        logger.error(error, "failed to get user");
        addToast(
          "Something is wrong with the server, please try again",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [addToast]);

  if (isLoading) {
    return <></>;
  }

  if (user === null && router.pathname !== "/login") {
    router.replace("/login");
    return <></>;
  }

  if (user && router.pathname === "/login") {
    router.replace("/");
    return <></>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
