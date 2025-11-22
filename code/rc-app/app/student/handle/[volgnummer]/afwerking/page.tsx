import { notFound, redirect } from 'next/navigation';
import { getVoorwerpByVolgnummer } from '@/lib/data/voorwerpen';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import AfwerkingClient from './AfwerkingClient';

export default async function AfwerkingPage({
  params,
}: {
  params: Promise<{ volgnummer: string }>;
}) {
  const { volgnummer } = await params;
  
  // Fetch voorwerp data on server
  const voorwerp = await getVoorwerpByVolgnummer(volgnummer);

  if (!voorwerp) {
    return redirect('/student');
  }

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Student']}>
      <AfwerkingClient voorwerp={voorwerp} volgnummer={volgnummer} />
    </ProtectedRoute>
  );
}
