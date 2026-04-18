## Índice

1. [Descripción General](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Flujo de Reconocimiento Facial Actual](#flujo-de-reconocimiento-facial-actual)
5. [Reconocimiento de Emociones (Implementado)](#reconocimiento-de-emociones)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
8. [Instalación y Ejecución](#instalación-y-ejecución)

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

| Tecnología       | Versión                     | Uso                               |
| ---------------- | --------------------------- | --------------------------------- |
| **React**        | 19.2.4                      | UI component library              |
| **TypeScript**   | 5.7.2                       | Type safety y DX                  |
| **Inertia.js**   | 3.0 (core) / 2.3.18 (React) | SPA sin API REST                  |
| **Vite**         | 7.0.4                       | Build tool y dev server           |
| **Tailwind CSS** | 4.0.0                       | Utility-first CSS                 |
| **Radix UI**     | v1.x                        | Componentes primitivos accesibles |
| **Lucide React** | 0.475.0                     | Iconos                            |

### Backend

| Tecnología            | Versión | Uso                                      |
| --------------------- | ------- | ---------------------------------------- |
| **Laravel**           | 12.0    | Framework PHP MVC                        |
| **PHP**               | ^8.2    | Lenguaje servidor                        |
| **Laravel Fortify**   | ^1.30   | Autenticación / Sanctum                  |
| **Laravel Reverb**    | ^1.10   | WebSockets para chat en tiempo real      |
| **Laravel Echo**      | ^2.3.4  | Cliente JS para Reverb                   |
| **Pusher PHP Server** | \*      | Compatibilidad con protocolo Pusher      |
| **Livewire**          | ^4.2    | Components interactivos (algunas vistas) |
| **Inertia Laravel**   | ^2.0    | Bridge Laravel ↔ React                   |

### Base de Datos y Almacenamiento

- **MySQL** / **PostgreSQL** (configurable)
- **Almacenamiento local** para fotos faciales (storage/app/public/face_photos)
- **Cache** con driver configurable (Redis recomendado para Reverb)

### Servicio Externo de Reconocimiento Facial

- **API Python externa** (microservicio) configurada en `FACIAL_SERVICE_URL`
- Recibe 2 imágenes (registro + webcam) y devuelve resultado de comparación biométrica

---

## Arquitectura del Sistema

### Diagrama de Alto Nivel

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

### Patrones Arquitectónicos

1. **SPA con Inertia.js**: No hay API REST tradicional. Las peticiones desde React viajan como solicitudes HTTP/XMLHTTPRequest que Laravel maneja como requests normales, devolviendo respuestas JSON que Inertia transforma en actualizaciones de estado React.

2. **Server-Side Rendering (SSR)**: Configurado pero opcional. El SSR habilitado permite renderizado inicial en servidor para mejor SEO y performance (vite.config.ts:11).

3. **Middleware de Roles**: `RoleMiddleware` protege rutas según el rol del usuario (admin, gestor, jugador).

4. **Real-time con WebSockets**:
    - **Laravel Reverb** como servidor WebSocket
    - **Laravel Echo** en frontend para suscribirse a eventos
    - Eventos definidos: `MessageSend` (chat)

5. **Servicio de Reconocimiento Facial Desacoplado**:
    - Laravel actúa como orquestador
    - La lógica de comparación facial corre en un servicio Python independiente
    - Comunicación via HTTP con `FACIAL_SERVICE_URL`
    - **Importante**: El servicio no está contemplado en el despliegue local; se espera que corra externamente

---

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

**Nota:** Esta ruta es de desarrollo/testing y no forma parte del flujo de producción.

---

## Funcionalidad Pendiente: Reconocimiento de Emociones

### Estado Actual

Actualmente **NO existe** funcionalidad de detección de emociones en tiempo real durante el gameplay. El proyecto únicamente contempla:

- Autenticación facial (comparación de rostros) SI
- **Reconocimiento de emociones pendiente** (feliz, enfadado, triste, sorprendido, neutral, etc.) NO
- **Integración de emociones con el gameplay pendiente** NO

### Requisitos Técnicos Propuestos

#### 1. Tecnología de Captura y Procesamiento

**Opción A: JavaScript en Navegador (Recomendada)**

- Librería: **[face-api.js](https://github.com/justadudewhohacks/face-api.js)** o **MediaPipe Face Mesh**
- Ventajas: Sin latencia, todo en cliente, respeta privacidad (imágenes no salen del navegador)
- Desventajas: Requiere Webcam activa durante el juego

**Opción B: Servicio Python de Backend**

- Servidor de.OpenCV + DeepFace / FER
- Ventajas: Modelos más robustos, procesamiento en servidor
- Desventajas: Latencia por red, carga servidor, costo de infra

**Opción C: Híbrida**

- Detección en cliente (emociones básicas) → Enviar emociones detectadas al backend
- Backend registra métricas y adapta experiencia

#### 2. Flujo Propuesto

```
┌─────────────────┐
│  Juego en browser│
│   (React)       │
└────────┬────────┘
         │ Webcam access (getUserMedia)
         ▼
┌─────────────────┐       ┌─────────────────────┐
│ face-api.js /   │──────▶│  TensorFlow.js      │
│ MediaPipe       │       │  Modelos ONNX       │
└────────┬────────┘       └──────────┬──────────┘
         │                          │
         │ Detectar emociones       │ cad frame (100-500ms)
         ▼                          ▼
   [emotion: "happy",      →   [emotion: "neutral",
    confidence: 0.87]            confidence: 0.92]
         │                          │
         └──────────┬───────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Enviar emociones   │
         │  al backend vía     │ ← POST /api/game/emotion
         │  Laravel Echo /     │    o EVENTO Reverb
         │  Http request       │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Laravel            │
         │  - Guarda métricas  │
         │  - Actualiza estado │
         │    del jugador      │
         │  - Trigger eventos  │
         │    del juego        │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Lógica del Juego   │
         │  - Adaptar dificul- │
         │    tad según emoción│
         │  - Otorgar bonus    │
         │  - Logging analytics│
         └─────────────────────┘
```

#### 3. Implementación Frontend (Pendiente)

**Componente propuesto:** `resources/js/components/game/EmotionDetector.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function EmotionDetector({ onEmotionDetected }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        // Cargar modelos de face-api.js desde /models/
        async function loadModels() {
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        }
        loadModels();

        // Iniciar webcam
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            if (videoRef.current) videoRef.current.srcObject = stream;
        });

        // Detectar emociones cada 500ms
        const interval = setInterval(async () => {
            if (!isActive) return;
            const video = videoRef.current;
            if (!video) return;

            const detection = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            if (detection) {
                const expressions = detection.expressions;
                const emotion = Object.keys(expressions).reduce((a, b) =>
                    expressions[a] > expressions[b] ? a : b,
                );
                const confidence = expressions[emotion];

                onEmotionDetected({
                    emotion,
                    confidence,
                    timestamp: Date.now(),
                });
            }
        }, 500);

        return () => clearInterval(interval);
    }, [isActive, onEmotionDetected]);

    return <video ref={videoRef} autoPlay muted className="hidden" />;
}
```

#### 4. Backend Endpoints / Eventos (Pendientes)

**A. Ruta para recibir emociones (si se envían vía HTTP):**

```php
// routes/api.php
Route::middleware('auth')->post('/game/emotion', function(Request $request) {
    $user = $request->user();
    $emotion = $request->input('emotion');
    $confidence = $request->input('confidence');
    $gameId = $request->input('game_id');

    // Guardar en tabla game_emotion_logs (crear migration)
    GameEmotionLog::create([
        'user_id' => $user->id,
        'game_id' => $gameId,
        'emotion' => $emotion,
        'confidence' => $confidence,
    ]);

    // Broadcast evento para listeners en tiempo real
    broadcast(new PlayerEmotionDetected($user, $emotion))->toOthers();

    return response()->json(['status' => 'recorded']);
});
```

**B. Modelo Eloquent:**

```php
// app/Models/GameEmotionLog.php
class GameEmotionLog extends Model
{
    protected $fillable = ['user_id', 'game_id', 'emotion', 'confidence'];
    public function user() { return $this->belongsTo(User::class); }
    public function game() { return $this->belongsTo(Game::class); }
}
```

**C. Evento Broadcast:**

```php
// app/Events/PlayerEmotionDetected.php
class PlayerEmotionDetected implements ShouldBroadcast
{
    public function broadcastOn() { return new PrivateChannel('game.emotion'); }
    public function broadcastWith() {
        return ['emotion' => $this->emotion, 'user' => $this->user->name];
    }
}
```

#### 5. Integración con Lógica de Juego

Una vez recibida la emoción, el backend puede:

- **Ajustar dificultad dinámica**: Si el jugador muestra frustración (enfadado), reducir dificultad
- **Otorgar power-ups**: Si está feliz durante X segundos, desbloquear bonificaciones
- **Sistema de recompensas emocionales**: Logros por mantener calma o diversión
- **Métricas de engagement**: Analizar qué juegos generan más emociones positivas

---

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

### Consideraciones Éticas y Legales

- **Consentimiento explícito**: El usuario debe habilitar la webcam y aceptar seguimiento de emociones por separado (opt-in).
- **Transparencia**: Notificar qué datos se recolectan y con qué fin.
- **Datos anónimos**: Las emociones pueden agregarse anónimamente para analíticas, no vincular a perfil personal sin autorización.
- **Derecho al olvido**: Permitir borrar logs de emociones.
- **Protección de menores**: Si hay usuarios menores, consultar con legal antes de implementar.

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
