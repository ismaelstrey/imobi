import { useContext } from "react";
import { AuthContext } from "./useAuth";
import { AuthContextData } from "./useAuth";

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};