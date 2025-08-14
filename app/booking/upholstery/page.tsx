// app/booking/upholstery/page.tsx
// Redirect to the first step
import { redirect } from 'next/navigation';

export default function UpholsteryRedirectPage() {
    redirect('/booking/upholstery/service');
    return null;
}
