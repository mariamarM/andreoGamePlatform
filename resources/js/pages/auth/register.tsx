import { Form, Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
            });
            streamRef.current = stream;
            setIsCameraActive(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error al acceder a la cámara:', err);
        }
    }, []);

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
        setIsCameraActive(false);
        stopCamera();
    }, [stopCamera]);

    const handleRetry = useCallback(() => {
        setCapturedImage(null);
        setIsCameraActive(false);
        setTimeout(() => startCamera(), 300);
    }, [startCamera]);

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>
                                    Foto de perfil (reconocimiento facial)
                                </Label>
                                <div className="overflow-hidden rounded-xl border-2 border-zinc-200/50 bg-black dark:border-zinc-700/50">
                                    {capturedImage ? (
                                        <img
                                            src={capturedImage}
                                            alt="Captura facial"
                                            className="w-full object-cover"
                                            style={{
                                                transform: 'scaleX(-1)',
                                                maxHeight: '240px',
                                            }}
                                        />
                                    ) : (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full object-cover"
                                            style={{
                                                transform: 'scaleX(-1)',
                                                maxHeight: '240px',
                                            }}
                                        />
                                    )}
                                    <canvas
                                        ref={canvasRef}
                                        className="hidden"
                                    />
                                </div>
                                <input
                                    type="hidden"
                                    name="face_photo"
                                    value={capturedImage || ''}
                                />
                                <div className="flex gap-2">
                                    {!capturedImage && !isCameraActive && (
                                        <Button
                                            type="button"
                                            onClick={startCamera}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Activar cámara
                                        </Button>
                                    )}
                                    {isCameraActive && !capturedImage && (
                                        <Button
                                            type="button"
                                            onClick={handleCapture}
                                            className="flex-1"
                                        >
                                            Capturar
                                        </Button>
                                    )}
                                    {capturedImage && (
                                        <>
                                            <Button
                                                type="button"
                                                onClick={handleRetry}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                Repetir
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
