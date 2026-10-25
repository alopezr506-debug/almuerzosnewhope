# Revisión de seguridad y operación

La aplicación sigue siendo una demo. No usar datos reales ni operar cobros.

## Corrección de roles

Cada intento de login revoca la sesión anterior, oculta ambas secciones y limpia
formularios y mensajes. Un login válido muestra administración únicamente al
principal. Los handlers de promociones y filtros rechazan a cualquier otro rol.
Estos controles del frontend no constituyen una frontera de seguridad.

## Pruebas ejecutadas

Node.js 22 o superior: `node --test tests/roles.test.cjs`.
Siete pruebas con DOM y almacenamiento simulados ejecutan los handlers reales.
Resultado: 7 pasan. Contra el script original: 6 fallan y 1 pasa.
También se ejecutó `node --check script.js`.
No se ejecutaron pruebas de navegador ni de backend (no existe backend).

## Cambios mínimos antes de uso institucional

1. Backend con autenticación y autorización por operación. Rol obtenido de una
   fuente del servidor, denegar por defecto. Estudiantes solo consultan/crean
   pedidos propios; principal administra promociones y sedes; caja confirma pagos.
2. Eliminar credenciales del frontend y ejemplos publicados. Invalidar cualquier
   credencial reutilizada. Contraseñas con hash robusto o identidad institucional.
   Sesiones con cookies Secure/HttpOnly/SameSite, expiración, logout e invalidación;
   protección CSRF y límites de intentos de login.
3. Base de datos central para usuarios, roles, promociones, sedes y pedidos.
   Actualmente usuarios están en USERS; localStorage guarda promociones, sedes y
   contador. Los pedidos completos NO se persisten ni se envían a una cocina/caja.
   IDs únicos y transacciones evitan colisiones entre dispositivos.
4. Validar en servidor productos, sede habilitada, cantidades, precios,
   descuentos y disponibilidad. Calcular totales allí. Crear pedidos de manera
   idempotente; estados pendiente de pago/pagado/en preparación/entregado/cancelado.
   El mensaje actual Completado no demuestra pago ni recepción.
5. Renderizar contenido variable con textContent/nodos seguros. El nombre de
   promoción se interpola actualmente en innerHTML (riesgo de XSS). Validar
   esquema y errores de almacenamiento mientras siga existiendo la demo.
6. HTTPS, configuración de secretos fuera del repositorio, mínimos permisos,
   registro de cambios administrativos y pagos, monitoreo y manejo de errores.
   Copias de seguridad con restauración probada y responsable de soporte.
   Minimizar datos de estudiantes, restringir acceso y definir conservación.
7. CI que ejecute las pruebas y bloquee integración ante fallos. Agregar pruebas
   reales de navegador y de API antes de autorizar producción.

## Criterios concretos de aceptación para producción

- Navegador real: principal -> estudiante en la misma pestaña oculta el panel;
  login fallido, logout y recarga no restauran privilegios previos.
- Estudiante: revelar DOM y enviar ambos formularios no cambia datos.
- API: crear/editar/eliminar promociones y cambiar sedes con sesión estudiantil
  devuelve 403 y deja DB intacta; sin sesión devuelve 401.
- Cambiar role/userId en JSON, URL o almacenamiento no concede permisos.
- Estudiante A no puede consultar ni modificar pedidos de B (403/404).
- Sesión principal expirada o revocada deja de funcionar en todas las pestañas.
- Principal autorizado puede administrar; caja solo registra pagos permitidos.
- Pedido con precio/descuento adulterado se recalcula o rechaza; reintentos no
  duplican pedidos; dos dispositivos generan IDs distintos.
- Promoción con HTML se muestra como texto sin ejecutar código.
- Un pedido sobrevive recarga y aparece en caja/cocina; restaurar respaldo
  recupera pedidos y estados verificables.
