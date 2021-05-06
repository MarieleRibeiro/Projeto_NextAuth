import axios, { AxiosError } from "axios";

import { parseCookies, setCookie } from "nookies";

let cookies = parseCookies(); // tipo let pode receber um novo valor

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});
// funcionalidade tokenRefresh -> toda vez que nosso app identifica que nosso token expira ele gera um novo token atraves de uma chamada ao backend

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === "token.expired") {
        //renovar o token
        cookies = parseCookies();

        const { "nextauth.refreshToken": refreshToken } = cookies;

        api
          .post("/refresh", {
            refreshToken,
          })
          .then((response) => {
            const { token } = response.data;

            setCookie(undefined, "nextauth.token", token, {
              maxAge: 60 * 60 * 24 * 30,
              path: "/",
            });

            setCookie(
              undefined,
              "nextauth.refreshToken",
              response.data.refreshToken,
              {
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
              }
            );

            api.defaults.headers["Authorization"] = `Bearer ${token}`;
          });
      } else {
        // deslogar o usuário
      }
    }
  }
);
//recebe 2 funções como parametro
//1.o que fazer se a respostar der sucesso(se der sucesso literalmente eu não quero fazer nada)
//então vou pegar a resposta e retornar do jeito que eu recebi
//2. o que eu quero fazer se a resposta der erro
