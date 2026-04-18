import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { useState, useRef, useCallback, useEffect } from 'react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [showFacialModal, setShowFacialModal] = useState(false);
    const [facialStatus, setFacialStatus] = useState<'idle' | 'validating' | 'camera' | 'captured' | 'verifying' | 'success' | 'error'>('idle');
    const [facialMessage, setFacialMessage] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Limpiar la cámara al desmontar
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setFacialMessage('No se pudo acceder a la cámara.');
            setFacialStatus('error');
        }
    }, []);

    const handleFacialLogin = useCallback(async () => {
        // Obtener email y password del formulario
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const email = emailInput?.value;
        const password = passwordInput?.value;

        if (!email || !password) {
            setFacialMessage('Por favor, rellena email y contraseña primero.');
            setFacialStatus('error');
            setShowFacialModal(true);
            return;
        }

        setShowFacialModal(true);
        setFacialStatus('validating');
        setFacialMessage('Validando credenciales...');
        setCapturedImage(null);

        try {
            // Obtener token CSRF
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfMeta?.getAttribute('content') || '';

            const response = await fetch('/facial-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setFacialMessage(data.message || 'Credenciales incorrectas.');
                setFacialStatus('error');
                return;
            }

            // Credenciales OK → abrir cámara
            setFacialStatus('camera');
            setFacialMessage('Coloca tu cara frente a la cámara y pulsa capturar.');
            // Pequeño delay para que el video element se renderice
            setTimeout(() => startCamera(), 300);
        } catch (err) {
            setFacialMessage('Error de conexión. Inténtalo de nuevo.');
            setFacialStatus('error');
        }
    }, [startCamera]);

    const handleCapture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
        setFacialStatus('captured');
        setFacialMessage('Foto capturada. ¿Enviar para verificación?');

        // Parar el video
        stopCamera();
    }, [stopCamera]);

    const handleVerify = useCallback(async () => {
        if (!canvasRef.current) return;

        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const email = emailInput?.value;
        const password = passwordInput?.value;

        setFacialStatus('verifying');
        setFacialMessage('Verificando identidad con IA...');

        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfMeta?.getAttribute('content') || '';

            // Convertir canvas a blob
            const blob = await new Promise<Blob | null>((resolve) => {
                canvasRef.current!.toBlob(resolve, 'image/jpeg', 0.9);
            });

            if (!blob) {
                setFacialMessage('Error al procesar la imagen.');
                setFacialStatus('error');
                return;
            }

            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('foto_webcam', new File([blob], 'webcam.jpg', { type: 'image/jpeg' }));

            const response = await fetch('/facial-verify', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success && data.match) {
                setFacialStatus('success');
                setFacialMessage('✅ ¡Verificación exitosa! Redirigiendo...');
                // Redirigir al dashboard correspondiente
                setTimeout(() => {
                    window.location.href = data.redirect_url || '/';
                }, 1200);
            } else {
                setFacialMessage(data.message || '❌ Las caras no coinciden.');
                setFacialStatus('error');
            }
        } catch (err) {
            setFacialMessage('Error al verificar. Inténtalo de nuevo.');
            setFacialStatus('error');
        }
    }, []);

    const handleRetry = useCallback(() => {
        setCapturedImage(null);
        setFacialStatus('camera');
        setFacialMessage('Coloca tu cara frente a la cámara y pulsa capturar.');
        setTimeout(() => startCamera(), 300);
    }, [startCamera]);

    const closeFacialModal = useCallback(() => {
        stopCamera();
        setShowFacialModal(false);
        setFacialStatus('idle');
        setFacialMessage('');
        setCapturedImage(null);
    }, [stopCamera]);

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>

                            {/* Botón de verificación facial */}
                            <button
                                type="button"
                                onClick={handleFacialLogin}
                                className="w-full rounded-lg border-2 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition-all duration-300 hover:border-indigo-500/60 hover:from-indigo-500/20 hover:to-purple-500/20 hover:shadow-md hover:shadow-indigo-500/10 dark:text-indigo-300"
                                id="facial-login-button"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 3H5a2 2 0 0 0-2 2v4" />
                                        <path d="M15 3h4a2 2 0 0 1 2 2v4" />
                                        <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                                        <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
                                        <circle cx="12" cy="10" r="3" />
                                        <path d="M7 17s1.5-2 5-2 5 2 5 2" />
                                    </svg>
                                    🔐 Verificar con Reconocimiento Facial
                                </span>
                            </button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {/* ═══ MODAL DE VERIFICACIÓN FACIAL ═══ */}
            {showFacialModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) closeFacialModal(); }}>
                    <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl dark:bg-zinc-900/95 dark:border-zinc-700/50">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-200/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-6 py-4 dark:border-zinc-700/50">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 3H5a2 2 0 0 0-2 2v4" />
                                    <path d="M15 3h4a2 2 0 0 1 2 2v4" />
                                    <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                                    <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
                                </svg>
                                Verificación Facial
                            </h3>
                            <button
                                onClick={closeFacialModal}
                                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-600 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {/* Status message */}
                            <div className={`mb-4 rounded-lg px-4 py-3 text-center text-sm font-medium ${facialStatus === 'error'
                                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : facialStatus === 'success'
                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                }`}>
                                {facialStatus === 'validating' && <span className="mr-2 inline-block animate-spin">⏳</span>}
                                {facialStatus === 'verifying' && <span className="mr-2 inline-block animate-spin">⏳</span>}
                                {facialMessage}
                            </div>

                            {/* Camera / Captured image */}
                            {(facialStatus === 'camera' || facialStatus === 'captured' || facialStatus === 'verifying' || facialStatus === 'success') && (
                                <div className="mb-4 overflow-hidden rounded-xl border-2 border-zinc-200/50 bg-black dark:border-zinc-700/50">
                                    {capturedImage ? (
                                        <img
                                            src={capturedImage}
                                            alt="Captura facial"
                                            className="w-full object-cover"
                                            style={{ transform: 'scaleX(-1)', maxHeight: '320px' }}
                                        />
                                    ) : (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full object-cover"
                                            style={{ transform: 'scaleX(-1)', maxHeight: '320px' }}
                                        />
                                    )}
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            )}

                            {/* Spinner for validating */}
                            {facialStatus === 'validating' && (
                                <div className="flex justify-center py-8">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500" />
                                </div>
                            )}

                            {/* Verifying spinner */}
                            {facialStatus === 'verifying' && (
                                <div className="flex justify-center py-2">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500" />
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                {facialStatus === 'camera' && (
                                    <button
                                        type="button"
                                        onClick={handleCapture}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30"
                                    >
                                        📸 Capturar mi cara
                                    </button>
                                )}

                                {facialStatus === 'captured' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleRetry}
                                            className="flex w-1/2 items-center justify-center gap-1 rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                        >
                                            🔄 Repetir
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleVerify}
                                            className="flex w-1/2 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl"
                                        >
                                            🚀 Verificar
                                        </button>
                                    </>
                                )}

                                {facialStatus === 'error' && (
                                    <button
                                        type="button"
                                        onClick={closeFacialModal}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                    >
                                        Cerrar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}

