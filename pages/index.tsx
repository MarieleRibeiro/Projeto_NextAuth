import { FormEvent, useContext, useState } from "react";
import { parseCookies } from "nookies";
import { AuthContext } from "../contexts/AuthContext";
import { GetServerSideProps } from "next";
import { withSSRGuest } from "../utils/withSSRGuest";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password,
    };

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
}

//verificação pelo próprio servidor(trabalhar com cookies pelo lado do servidor)
export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {},
  };
});
//quando estou pelo lado do backend(servidor) toda vez que vou utilizar as funções do nookies
// eu sempre passo o primeiro parametro o meu contexto(ctx) e não mais undefined
