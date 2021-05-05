import { createContext, ReactNode, useState } from "react";
import { api } from "../services/api";
import Router from "next/router";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  //são as informações que eu vou ter dentro do meu contexto, oque eu quero salvar de informações do usuario
  signIn(credencials: SignInCredentials): Promise<void>;
  user: User; // dados do usuário
  isAuthenticated: boolean; // se o usuário esta autenticado ou não
};

type AuthProviderProps = {
  children: ReactNode; //ReactNode é uma tipagem colocada quando um componente pode receber qualquer outra coisa dentro dele(componente, textos, numeros )
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  // children= são todos os elementos que estão dentro do componenente AuthProvider
  const [user, setUser] = useState<User>();

  const isAuthenticated = !!user; // saber se o usuário esta autenticado

  async function signIn({ email, password }) {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      }); // atenticação do usuário

      const { permissions, roles } = response.data; // resposta da minha requisição

      setUser({
        email,
        permissions,
        roles,
      }); // salvando o usuário

      Router.push("/dashboard"); //redirecionando o usuário para a pagina
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
// Preciso guardar as informações mesmo que o usuário atualize a pagina, ESTRUTURA DE ARMAZENAMENTO DE DADOS
// -> sessionStorage = não fica disponivél em outras sessões, se fechar e abrir o navegador o sessionStorage morre
// dura somente durante a sessão do usuário, momento que ele esta usando a aplicação

// -> localStorage = localStorage so existe no browser, e não em server-side

// -> cookies = são formas de armazenar informações do browser, essas informações são enviadas ou não
// posso escolher entre as requisições que acontecem na aplicação, pode ser acessado tanto pelo lado do browser quanto pelo
// pelo lado do servidor, tanto para modificar informações, criar novas informações, deletar.
