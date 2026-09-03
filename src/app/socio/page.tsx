import SocioClient from "./socio-client";

export const dynamic = "force-dynamic";

/* El listado de cuentas de socios ya NO se envía al cliente por seguridad
   (el login valida en el servidor con sesión httpOnly: cada dueño ve su negocio). */
export default async function SocioPage() {
  return <SocioClient />;
}
