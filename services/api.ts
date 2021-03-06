import axios, { AxiosError } from "axios";

import { parseCookies, setCookie } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false; //identificar se eu estou atualizando o token ou não
let failedRequestsQueue = [];

export function setupApiClient(ctx = undefined) {
  let cookies = parseCookies(ctx); // tipo let pode receber um novo valor

  const api = axios.create({
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
        //erro de não autorizado
        if (error.response.data?.code === "token.expired") {
          //renovar o token
          cookies = parseCookies();

          const { "nextauth.refreshToken": refreshToken } = cookies;
          const originalConfig = error.config; // config=tem todas as configuração da requisição feita para o backend

          if (!isRefreshing) {
            // eu sou vou fazer o refresh token uma unica vez, idenpendente de quantas chamadas api acontecem ao mesmmo tempo
            isRefreshing = true;

            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;

                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 60 * 60 * 24 * 30,
                  path: "/",
                });

                setCookie(
                  ctx,
                  "nextauth.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30,
                    path: "/",
                  }
                );

                api.defaults.headers["Authorization"] = `Bearer ${token}`;

                failedRequestsQueue.forEach((request) =>
                  request.onSucess(token)
                );
                failedRequestsQueue = [];
              })
              .catch((err) => {
                failedRequestsQueue.forEach((request) =>
                  request.onFailure(err)
                );
                failedRequestsQueue = [];
                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                // quando ele terminar de fazer o refresh
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSucess: (token: string) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;

                resolve(api(originalConfig)); // todas as configurações que eu preciso para fazer uma chamada api de novo
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          // deslogar o usuário
          if (process.browser) {
            //se eu estou no browser vou retornar
            signOut();
          } else {
            // se não
            return Promise.reject(new AuthTokenError());
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}
//recebe 2 funções como parametro
//1.o que fazer se a respostar der sucesso(se der sucesso literalmente eu não quero fazer nada)
//então vou pegar a resposta e retornar do jeito que eu recebi
//2. o que eu quero fazer se a resposta der erro
