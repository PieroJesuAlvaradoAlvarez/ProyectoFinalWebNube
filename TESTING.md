# Tests

## Pruebas de Código (Unitarias e Integración)

### Comandos
```bash
npm test              # Ejecutar pruebas
npm run test:watch    # Modo watch
npm run test:coverage # Con coverage
```

### Estructura de pruebas
```
src/__tests__/
├── api/
│   ├── projects.test.ts        # Unitarias para /api/projects
│   ├── projectById.test.ts     # Unitarias para /api/projects/[id]
│   ├── users.test.ts           # Unitarias para /api/users/[id]
│   └── applications.test.ts    # Unitarias para /api/applications
└── integration/
    └── projectFlow.test.ts     # Integración: crear proyecto y aplicar
```

### Qué cubren
**Projects API:**
- GET: devuelve proyectos OPEN
- POST: crea proyecto, maneja errores

**Project by ID:**
- GET: devuelve proyecto o 404
- PATCH: actualiza estado, asigna desarrollador

**Users:**
- GET: devuelve usuario con relaciones
- PATCH: actualiza campos

**Applications:**
- POST: crea postulación, previene duplicados
- Crea notificación al dueño del proyecto

**Integration:**
- Flujo completo: crear proyecto → aplicar


## Pruebas de Datos (Seeding)

Genera datos masivos para probar la aplicación con una base de datos realista.

### Instalar tsx (si no lo tienes)
```bash
npm install -g tsx
```

### Generar datos
1. Asegúrate de que tu `DATABASE_URL` en `.env` apunte a la BD que quieres poblar
2. Ejecuta:
```bash
npm run db:seed
```

Esto generará:
- 500 usuarios (250 clientes, 250 desarrolladores)
- 100 proyectos
- Cientos de postulaciones
- Reseñas de ejemplo


## Pruebas de Estrés y Rendimiento

Usamos **k6**, la herramienta estándar para pruebas de carga y estrés.

### Instalar k6
1. Descarga k6 desde https://k6.io/docs/get-started/installation/
2. O usa npm (Windows/macOS/Linux):
   ```bash
   # En Windows (con Chocolatey)
   choco install k6

   # O descarga directamente desde https://dl.k6.io/
   ```

### Tipos de pruebas

#### 1. Prueba de Carga Básica (`npm run k6:load`)
Simula tráfico normal escalando gradualmente hasta 500 usuarios. Perfecta para:
- Ver el comportamiento normal de la app
- Medir tiempos de respuesta
- Encontrar cuellos de botella iniciales

**Ejecutar localmente:**
```bash
# Primero inicia tu servidor de desarrollo
npm run dev

# En otra terminal, ejecuta la prueba
npm run k6:load
```

**Ejecutar contra Vercel (producción):**
```bash
# Establece la URL de tu app
set BASE_URL=https://nextcode-six.vercel.app && npm run k6:load
```

#### 2. Prueba de Estrés Máxima (`npm run k6:stress`)
Simula 1000 usuarios concurrentes durante 2 minutos. Perfecta para:
- Encontrar el punto de ruptura de tu aplicación
- Ver cómo se comporta bajo presión extrema
- Probar la escalabilidad de la BD y el servidor

**Ejecutar:**
```bash
npm run k6:stress
```


## ¿Qué métricas buscar?

Cuando ejecutes k6, verás:

1. **http_req_duration**: Tiempo promedio de respuesta (debe ser < 500ms para una experiencia buena)
2. **http_req_failed**: Porcentaje de solicitudes fallidas (debe ser 0% o muy bajo)
3. **vus**: Usuarios virtuales concurrentes
4. **iterations**: Número total de operaciones completadas

## Pasos recomendados para probar tu app

1. **Inicia con datos**: Usa `npm run db:seed` para poblar tu BD
2. **Pruebas de código**: Asegúrate que `npm test` pase todo
3. **Pruebas locales**: Usa `npm run k6:load` con tu servidor local
4. **Pruebas en producción**: Cuando esté listo, prueba en Vercel
5. **Monitorea**: Abre la consola de Vercel o Neon para ver el rendimiento de la BD


## Tips para mejorar el rendimiento

Si las pruebas encuentran problemas:
1. **Indexa tu BD**: Asegúrate de que los campos que buscas mucho (email, projectId, userId) tengan índices (Prisma lo hace automáticamente para claves)
2. **Usa caché**: Considera Vercel Edge Functions o Redis para datos que no cambian mucho
3. **Paginación**: Si tienes miles de proyectos, agrega paginación en `/api/projects`
4. **Optimizá consultas Prisma**: Asegúrate de no hacer consultas N+1 (usa `include` correctamente)
