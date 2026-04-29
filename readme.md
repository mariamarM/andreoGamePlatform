## PLATAFORMA DE UEGOS CON LARAVEL 
Este es una aplicacion web que sua Laravel + React teniendo en cuenta diversos roles de usuarios (admin, gestor y user), para sus
diferentes privilegios respecto a los juegos. Se ha implementado un sistema de autenticación facial biométrica, con un microservicio 
externo de Python que juntaba la materia de M8. Por lo tanto esta condicionada a que el microservicio de Python este corriendo a la hora
de logearse.

## Índice

1. [Descripción General](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Flujo de Reconocimiento Facial Actual](#flujo-de-reconocimiento-facial-actual)
5. [Funcionalidad Pendiente: Reconocimiento de Emociones](#funcionalidad-pendiente-reconocimiento-de-emociones)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
8. [Instalación y Ejecución](#instalación-y-ejecución)
9. [RabbitMQ y optimizaciçon de procesos](#rabbitmq).

## Descripción General

Andreo Game Platform es una aplicación web moderna que permite a los usuarios descubrir, guardar y jugar juegos en línea. El sistema incluye roles de usuario (admin, gestor, jugador), chat en tiempo real entre usuarios y personal, y un avanzado sistema de autenticación mediante reconocimiento facial.

**Características principales:**

- Catálogo de juegos publicados
- Sistema de roles y permisos
- Chat en tiempo real (Laravel Echo + Reverb)
- Autenticación facial biométrica
- **Pendiente:** Detección de emociones durante el juego (feliz, si vas perdiendo etc...)

---

## Stack Tecnológico

### Frontend
    - React
    - TypeScript
    - Inertia.js
    - Tailwind CSS


### Backend
    - Laravel Fortify no se usa, se usa el sistema de autenticación propio de Laravel.
    - Inertia Laravel es el que se encarga de la comunicación entre Laravel y React.
    - Laravel Reverb es el WebSocket para el chat en tiempo real.
    - Laravel Echo es el cliente JS para Reverb.
    - Livewire se usa en algunas vistas para componentes interactivos.

### Base de Datos y Almacenamiento

- **MySQL** / **PostgreSQL** (configurable)
- **Almacenamiento local** para fotos faciales (storage/app/public/face_photos)
- **Cache** con driver configurable (Redis recomendado para Reverb)

### Servicio Externo de Reconocimiento Facial

- **API Python externa** (microservicio) configurada en `FACIAL_SERVICE_URL`
- Recibe 2 imágenes (registro + webcam) y devuelve resultado de comparación biométrica

---

## Arquitectura del Sistema



```
┌─────────────────┐
│   React SPA     │  ← Inertia.js pages + components
│  (Vite + TSX)   │
└────────┬────────┘
         │ Inertia requests (XHR)
         ▼
┌─────────────────┐
│   Laravel 12    │  ← Routes / Controllers
│   (PHP 8.2+)    │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
    ▼         ▼              ▼
  MySQL   Storage      External Facial
  Eloquent  (photos)   Recognition API
                (Python microservice)
```


## Flujo de Reconocimiento Facial Actual

### 1. Registro Facial (POST `/settings/face-photo`)

```
Usuario → Frontend (upload) → Laravel → Storage → User.face_photo (path)
```

**Detalles:**

- Ruta protegida con `auth` middleware
- Valida que el archivo sea imagen (jpg/png) y < 5MB
- Almacena en `storage/app/public/face_photos/`
- Guarda la ruta relativa en `users.face_photo`

### 2. Login Híbrido (Credenciales + Facial)

El proceso de login facial consta de **2 pasos**:

#### Paso A: Validación de credenciales (POST `/facial-login`)

```
Usuario → {email, password} → Laravel → Verificar Hash
                                              ↓
                                   ¿Credenciales correctas?
                                              ↓
                                     Sí → ¿Tiene face_photo?
                                              ↓
                                    No → Error 422
                                    Sí → Devuelve user_id + has_face_photo
```

**Respuesta exitosa:**

```json
{
    "success": true,
    "has_face_photo": true,
    "user_id": 123
}
```

#### Paso B: Verificación biométrica (POST `/facial-verify`)

```
Usuario → {email, password, foto_webcam} → Laravel
        ↓
   Valida credenciales + face_photo existente
        ↓
   Obtiene face_photo del storage
        ↓
   HTTP POST a FACIAL_SERVICE_URL con img1 (registro) + img2 (webcam)
        ↓
   Servicio Python compara embeddings / landmarks
        ↓
   Respuesta: { "match": true/false }
        ↓
   ¿match == true?
    ├─ Sí → Auth::login(user) + redirect según rol
    └─ No → Error "Las caras no coinciden"
```

**Redirección post-login exitoso:**

- `role_id == 1` (admin) → `/admin`
- `role_id == 2` (gestor) → `/gestor`
- Otro → `/` (home jugador)

### 3. Test Facial Independiente (GET/POST `/test-facial`)

Ruta para pruebas manuales:

- `GET /test-facial` → Muestra vista Blade con formulario (probablemente `resources/views/test-facial.blade.php`)
- `POST /test-facial` → Envía 2 fotos al servicio Python y devuelve resultado

La cosa esque el test-facial es accesible sin autenticación, lo cual no es correcto porque NO tiene que ser asi es solo por
la practica de M8 que es para probar el servicio de reconocimiento facial. Pero en produccion no tiene que ser asi.
---

## Funcionalidad Pendiente: Reconocimiento de Emociones

### Estado Actual

Actualmente **NO existe** funcionalidad de detección de emociones en tiempo real durante el gameplay. El proyecto únicamente contempla:

- Autenticación facial (comparación de rostros) SI
- **Reconocimiento de emociones pendiente** (feliz, enfadado, triste, sorprendido, neutral, etc.) NO
- **Integración de emociones con el gameplay pendiente** NO


## Estructura del Proyecto

```
andreoGamePlatform/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── GameController.php          → CRUD juegos + API JSON
│   │   │   ├── MessageController.php       → Chat usuario ↔ staff
│   │   │   └── Settings/
│   │   └── Middleware/
│   │       └── RoleMiddleware.php          → authorization por rol
│   ├── Models/
│   │   ├── User.php                        → +face_photo (facial)
│   │   ├── Game.php                        → juegos publicados
│   │   ├── Message.php                     → chat messages
│   │   └── Role.php                        → roles (admin/gestor/jugador)
│   ├── Events/
│   │   └── MessageSend.php                 → broadcast chat
│   └── Livewire/
│       └── ManageMessages.php              → gestión chat admin
├── routes/
│   ├── web.php                             → rutas principales (Inertia + facial)
│   ├── api.php                             → (posibles API futuras)
│   ├── channels.php                        → Reverb auth channels
│   └── settings.php                        → preferencias usuario
├── resources/
│   ├── js/
│   │   ├── app.tsx                         → entry point + Inertia init
│   │   ├── ssr.tsx                         → SSR entry
│   │   ├── pages/                          → vistas Inertia (React)
│   │   │   ├── Games.tsx                   → lista de juegos (pendiente)
│   │   │   ├── admin/
│   │   │   ├── gestor/
│   │   │   ├── player/
│   │   │   ├── chat/
│   │   │   └── settings/
│   │   ├── components/
│   │   │   ├── ui/                         → Radix UI components
│   │   │   ├── MisComponentes/
│   │   │   │   └── Navbar.tsx
│   │   │   └── [otros componentes]
│   │   ├── layouts/
│   │   │   ├── app/
│   │   │   │   ├── app-header-layout.tsx
│   │   │   │   └── app-sidebar-layout.tsx
│   │   │   ├── auth/
│   │   │   └── settings/
│   │   └── hooks/                          → custom hooks
│   │       ├── use-initials.tsx
│   │       ├── use-mobile.tsx
│   │       └── use-appearance.tsx
│   ├── css/
│   │   └── app.css                         → Tailwind imports
│   └── views/                              ← vistas Blade
│       └── test-facial.blade.php           ← test manual facial
├── storage/
│   └── app/public/face_photos/             ← fotos faciales guardadas
├── composer.json                           → Laravel + Fortify + Reverb
├── package.json                            → React + Vite + Tailwind
├── vite.config.ts                          → Vite + React + Tailwind config
├── tailwind.config.js                      ←是否存在??
├── tsconfig.json                           → TypeScript config
├── .env.example                            ← plantilla variables
└── readme.md                               ← este archivo
```

### 1. Servicio de Reconocimiento Facial EXTERNO

**IMPORTANTE**: El microservicio Python **NO está incluido** en este repositorio. Debes:

1. Desplegar separadamente un servicio Flask/FastAPI que exponga:
    - `POST /verify` (o la URL que configures en `FACIAL_SERVICE_URL`)
    - Reciba `multipart/form-data` con campos `img1` e `img2`
    - Devuelva JSON: `{ "match": true/false }`

2. Configurar la URL en `.env`:

    ```env
    FACIAL_SERVICE_URL=http://localhost:5001/verify
    ```

3. Asegurar que el servicio Python tenga acceso a las fotos enviadas y ejecute:

    - Generación de embeddings (FaceNet / ArcFace)
    - Comparación por distancia (cosine similarity)
   

---

## PENDIENTE: Roadmap de Reconocimiento de Emociones


4. **Backend listener (Laravel Echo)**
    - Frontend del juego suscribirse a evento `Game.EmotionDetected`
    - Actualizar UI: icono de emoción detectada en tiempo real

5. **Lógica de adaptación de juego**
    - Design: si usuario → enfadado (frustración) → reducir velocidad de enemigos
    - Design: si usuario → feliz (flow) → aumentar rewards temporal
    - Diseñar reglas balanceadas (evitar manipulación excesiva)

6. **Analíticas de emociones**
    - Dashboard admin: "Emociones por juego"
    - Métricas: % happy, frustrated time, engagement score
    - Export a CSV para análisis externo



**¿Por qué el facial login es en 2 pasos?**  
Para no exponer el token de sesión hasta confirmar que el rostro coincide. Primero validamos credenciales (email+pass) y luego, si la cara coincide, autenticamos.

**¿Se pueden usar fotos en lugar de webcam?**  
El flujo de login requiere una foto tomada en tiempo real (`foto_webcam`) para evitar ataques con fotos estáticas.

**¿Dónde se almacenan las fotos faciales?**  
En `storage/app/public/face_photos/`. Son accesibles solo para el usuario autenticado y el sistema de verificación.

**¿El servicio de reconocimiento facial es gratuito?**  
Depende de tu implementación Python. Si usas modelos open-source (MTCNN + FaceNet) es gratuito pero consumes recursos CPU/GPU. Si usas API de pago (Azure Face, AWS Rekognition) considera costos por llamada.

**¿Se puede usar el login facial como único método?**  
Sí, pero actualmente el sistema híbrido (pass + facial) ofrece capa de seguridad adicional. Para eliminar contraseña, modificar el flujo para que el email sea solo identificador y la autenticación sea 100% biométrica.
---

### 9.RabbitMQ

RabbitMQ es un sistema de mensajería asíncrona utilizando RabbitMQ, una herramienta ampliamente utilizada para la comunicación entre servicios desacoplados. El objetivo principal es mejorar la escalabilidad y la eficiencia de la aplicación mediante el uso de colas de mensajes.

El proyecto conecta GitHub, MCP y RabbitMQ para crear un sistema donde los eventos del desarrollo (como pull requests o issues) generan acciones automáticas procesadas de forma asíncrona. Esto permite mejorar la organización, la escalabilidad y la mantenibilidad de la aplicación, acercándola a un entorno real de desarrollo profesional.
Este es el esquema que me dio Claude para que tenga presente la estructura actual del proyecto asi puede identificar los issues y procesarlos en el rabbitMQ
<img width="737" height="574" alt="image" src="https://github.com/user-attachments/assets/bea507b5-bf84-4cbe-9293-9d9dfbc3f1cd" />

