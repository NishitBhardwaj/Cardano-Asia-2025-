import dynamic from 'next/dynamic';

const ResetPasswordContent = dynamic(() => import('./ResetPasswordContent'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

export default function ResetPasswordPage() {
    return <ResetPasswordContent />;
}

