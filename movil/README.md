# DK-FITT Móvil

Aplicación Expo + React Native + TypeScript para las historias HUM-01 a HUM-11 del Sprint 1.

## Arquitectura

- `src/domain`: modelos y contratos independientes de frameworks.
- `src/application`: casos de uso de registro, login y perfil.
- `src/infrastructure`: consumo HTTP y almacenamiento seguro del token.
- `src/presentation`: estado, componentes y pantallas móviles.

## Configuración

Define `EXPO_PUBLIC_API_URL` con la URL del backend. Si no existe, se utiliza `http://localhost:3000`.

```powershell
npm install
npm run typecheck
```

No se incluye implementación web ni API.
