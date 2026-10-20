# Intermediario con Cloudflare

Sirve para que la lectura con Gemini funcione para todos los usuarios de la pagina sin que cada uno tenga que pegar su propia clave. La clave queda guardada como secreto en Cloudflare, nunca en la pagina ni en este repo.

## Pasos

1. Crea una cuenta gratis en https://dash.cloudflare.com/sign-up
2. En el menu de la izquierda: **Workers & Pages** -> **Create** -> **Create Worker**. Nombre sugerido: `facturas-gemini`. Deploy.
3. **Edit code**: borra el codigo de ejemplo, pega el contenido de `worker.js` de este repo y **Save and deploy**.
4. En el Worker: **Settings** -> **Variables and Secrets** -> **Add**. Tipo **Secret**, nombre `GEMINI_API_KEY`, valor: tu clave de Gemini de Google AI Studio (la nueva, sin facturacion activada). Save.
5. Abri la URL del Worker (algo como `https://facturas-gemini.<tu-cuenta>.workers.dev`): tiene que decir "intermediario activo".
6. Pasame esa URL y conecto la pagina.
