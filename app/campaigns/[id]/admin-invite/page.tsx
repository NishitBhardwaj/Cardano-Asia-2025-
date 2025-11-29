import dynamic from 'next/dynamic';

const AdminInviteContent = dynamic(() => import('./AdminInviteContent'), {
    ssr: false,
});

export default function AdminInvitePage() {
    return <AdminInviteContent />;
}

