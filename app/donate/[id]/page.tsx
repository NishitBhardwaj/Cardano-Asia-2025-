import dynamic from 'next/dynamic';

const DonateContent = dynamic(() => import('./DonateContent'), {
    ssr: false,
});

export default function DonatePage() {
    return <DonateContent />;
}

