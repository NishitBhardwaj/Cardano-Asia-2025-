import dynamic from 'next/dynamic';

const VerifyEmailContent = dynamic(() => import('./VerifyEmailContent'), {
    ssr: false,
});

export default function VerifyEmailPage() {
    return <VerifyEmailContent />;
}

