# almuerzosnewhope

Aplicación web base para una institución educativa donde los estudiantes solicitan almuerzos y productos de soda.

## Incluye

- Inicio de sesión con **código de estudiante + usuario + contraseña**.
- Solicitud con selección de sede:
  - Kiosko de secundaria.
  - Kiosko de primaria.
  - Soda principal.
- Selección de almuerzo y extras de soda.
- Pago asignado por caja (Caja 1, 2 o 3) dentro del flujo.
- Confirmación final con estado **Completado** y número de orden.
- Panel de encargado principal para:
  - Crear promociones.
  - Definir filtros de cuáles sedes están habilitadas para pedir.

## Cómo ejecutar (paso a paso)

1. Descarga o clona este proyecto.
2. Abre la carpeta del proyecto.
3. Ejecuta uno de estos métodos:
   - **Rápido:** abre `index.html` directo en el navegador.
   - **Recomendado:** usar servidor local para desarrollo.
     - Si tienes VS Code, instala **Live Server**.
     - Clic derecho en `index.html` → **Open with Live Server**.
4. Inicia sesión de prueba:
   - Encargado principal: `ADM-0001` / `admin` / `admin123`.
   - Estudiante: `EST-0001` / `ana` / `ana123`.
5. Como encargado, configura promociones y filtros.
6. Como estudiante, crea pedido y valida que salga “Completado ✅ Orden #...”.

## Siguiente paso para producción

Para que funcione como app real institucional:

1. Mover usuarios, promociones y pedidos a una **base de datos** (no `localStorage`).
2. Crear un **backend** (Node.js + Express, Laravel, Django, etc.).
3. Implementar autenticación segura (hash de contraseñas + JWT/sesiones).
4. Conectar pasarela o módulo de caja real.
5. Publicar frontend y backend en un hosting (Vercel/Netlify + Render/Railway, por ejemplo).
6. Configurar dominio institucional y HTTPS.
