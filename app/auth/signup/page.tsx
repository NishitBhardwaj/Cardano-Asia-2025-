import dynamic from 'next/dynamic';

const SignupContent = dynamic(() => import('./SignupContent'), {
    ssr: false,
});

export default function SignupPage() {
    return <SignupContent />;
}

