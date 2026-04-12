<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación Facial IA</title>
    <style>
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }

        .card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                        0 2px 4px -1px rgba(0, 0, 0, 0.06);
            width: 100%;
            max-width: 450px;
        }

        h2 {
            text-align: center;
            color: #111827;
            margin-top: 0;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }

        input[type="file"] {
            display: block;
            width: 100%;
            font-size: 0.9rem;
            color: #6b7280;
            padding: 0.5rem;
            border: 1px dashed #d1d5db;
            border-radius: 6px;
        }

        .video-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            background: #f9fafb;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        video {
            border-radius: 8px;
            background: #000;
            width: 100%;
            max-width: 320px;
            height: 240px;
            object-fit: cover;
            transform: scaleX(-1);
        }

        button {
            width: 100%;
            padding: 0.75rem;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .btn-capture {
            background-color: #10b981;
            color: white;
        }

        .btn-capture:hover {
            background-color: #059669;
        }

        .btn-submit {
            background-color: #4f46e5;
            color: white;
            margin-top: 1rem;
        }

        .btn-submit:hover {
            background-color: #4338ca;
        }

        .btn-submit:disabled {
            background-color: #a5b4fc;
            cursor: not-allowed;
        }

        .alert {
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
        }

        .alert-error {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #f87171;
        }

        .alert-success {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #34d399;
        }

        pre {
            background: #111827;
            color: #10b981;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
        }

        #mensajeResultado {
            margin-top: 1rem;
            font-weight: bold;
        }
    </style>
</head>

<body>

    <div class="card">
        <h2>Identificación Biométrica</h2>

        @if($errors->any())
        <div class="alert alert-error">
            <ul style="margin: 0; padding-left: 20px;">
                @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
        @endif

        @if(isset($resultado))
        <div class="alert alert-success">
            <strong>¡Respuesta de la IA recibida!</strong>
            <pre>{{ print_r($resultado, true) }}</pre>
        </div>
        @endif

        <!-- FORMULARIO ÚNICO -->
        <form id="formFacial" action="/test-facial" method="POST" enctype="multipart/form-data">
            @csrf

            <div class="form-group">
                <label>1. Foto de Registro (DNI o Perfil):</label>
                <input type="file" name="foto_registro" required accept="image/*">
            </div>

            <div class="form-group">
                <label>2. Verificación en vivo (Cámara):</label>
                <div class="video-container">
                    <video id="videoElement" autoplay playsinline></video>
                    <canvas id="canvasElement" style="display: none;"></canvas>
                    <button type="button" class="btn-capture" id="btnCapturar">📸 Capturar mi cara</button>
                </div>
            </div>

            <input type="file" name="foto_webcam" id="inputWebcam" style="display: none;" required>
            <button type="submit" class="btn-submit" id="btnEnviar" disabled>🚀 Enviar al Microservicio</button>
        </form>

        <!-- Contenedor de mensajes dinámicos -->
        <div id="mensajeResultado"></div>
    </div>

    <script>
        const video = document.getElementById('videoElement');
        const canvas = document.getElementById('canvasElement');
        const btnCapturar = document.getElementById('btnCapturar');
        const inputWebcam = document.getElementById('inputWebcam');
        const btnEnviar = document.getElementById('btnEnviar');
        const form = document.getElementById('formFacial');
        const mensajeResultado = document.getElementById('mensajeResultado');
        let stream;

        async function iniciarCamara() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
            } catch (error) {
                console.error("Error al acceder a la cámara:", error);
                alert("No se pudo acceder a la cámara.");
            }
        }
        iniciarCamara();

        btnCapturar.addEventListener('click', () => {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (!blob) return;
                const file = new File([blob], "foto_capturada.jpg", { type: "image/jpeg" });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                inputWebcam.files = dataTransfer.files;

                btnCapturar.innerText = "✅ ¡Foto Capturada!";
                btnCapturar.style.backgroundColor = "#059669";
                btnEnviar.disabled = false;

                video.pause();
                stream.getTracks().forEach(track => track.stop());
            }, 'image/jpeg', 0.9);
        });

        // Enviar formulario con fetch y mostrar resultado sin recargar
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            mensajeResultado.innerHTML = "⏳ Enviando imágenes...";

            const formData = new FormData(form);

            try {
     const response = await fetch('test-facial', {
    method: 'POST',
    body: formData

});

                if (!response.ok) throw new Error('Error al enviar las imágenes');

                const data = await response.json();

                if (data.match === true) {
                    mensajeResultado.innerHTML = "✅ Las imágenes coinciden. ¡Son la misma persona!";
                    mensajeResultado.style.color = "#065f46";
                } else {
                    mensajeResultado.innerHTML = "❌ Las imágenes no coinciden. No son la misma persona.";
                    mensajeResultado.style.color = "#991b1b";
                }

            } catch (error) {
                console.error(error);
                    mensajeResultado.innerHTML = "❌ Error al enviar las imágenes.";
                mensajeResultado.style.color = "#991b1b";
            }
        });
    </script>
</body>

</html>
