import { createContext, ReactNode, useEffect, useState } from "react";
import { parseCookies, setCookie } from "nookies"; // biblioteca para trabalhar com cookies dentro do next.js(yarn add nookies)
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

// children= são todos os elementos que estão dentro do componenente AuthProvider
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();

  const isAuthenticated = !!user; // saber se o usuário esta autenticado

  useEffect(() => {
    // armazenar os cookies, sempre que acessa a aplicação
    const { "nextauth.token": token } = parseCookies(); // me retorna uma lista de todos os cookies salvos

    if (token) {
      api.get("/me").then((response) => {
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles });
      });
    }
  }, []);

  async function signIn({ email, password }) {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      }); // atenticação do usuário

      const { token, refreshToken, permissions, roles } = response.data; // resposta da minha requisição

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // validade do meu cookie 30 days
        path: "/", //quais caminhos da minha aplicação vão ter acesso a esse cookie(no caso aqui a / representa que qualquer endereço vai ter acesso aos cookies)
      });
      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxage: 60 * 60 * 24 * 30,
        path: "/",
      });
      //recebe 3 parametros -> 1.contexto da requisição(ele não vai existir quando nossa aplicação estiver rodando pelo browser)
      // sempre que eu estou tentando tratar um cookie, setar, buscar, e eu estiver executando pelo lado do browser vai ser undefined
      // 2. nome do cookie
      // 3. e o valor
      // 4. posso passar uma serie de opções para o valor em si

      setUser({
        email,
        permissions,
        roles,
      }); // salvando o usuário

      api.defaults.headers["Authorization"] = `Bearer ${token}`; // atualizar a informação de token depois do login

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
