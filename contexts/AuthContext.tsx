import { createContext, ReactNode } from "react";
import { api } from "../services/api";

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  //são as informações que eu vou ter dentro do meu contexto, oque eu quero salvar de informações do usuario
  signIn(credencials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean; // se o usuário esta autenticado ou não
};

type AuthProviderProps = {
  children: ReactNode; //ReactNode é uma tipagem colocada quando um componente pode receber qualquer outra coisa dentro dele(componente, textos, numeros )
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthenticated = false; // children= são todos os elementos que estão dentro do componenente AuthProvider

  async function signIn({ email, password }) {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
