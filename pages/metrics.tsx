import { setupApiClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Metrics() {
  return (
    <>
      <h1>Metrics</h1>
    </>
  );
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupApiClient(ctx);
    const response = await apiClient.get("/me");

    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list3"],
    roles: ["administrator"],
  }
);
// 1 parametro recebe qual a função que vai executar para buscar os dados que eu preciso do getServerside
// como 2 parametro eu vou enviar para ele o objeto com as permissões do usuario
