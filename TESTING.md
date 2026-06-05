# Tests

## Comandos

```bash
npm test              # Ejecutar pruebas
npm run test:watch    # Modo watch
npm run test:coverage # Con coverage
```

## Estructura de pruebas

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

## Qué cubren

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