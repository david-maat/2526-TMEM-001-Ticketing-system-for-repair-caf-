import { getMaterialen } from '@/lib/data/materialen';
import { getVoorwerpByVolgnummer } from '@/lib/data/voorwerpen';
import MaterialenSelectieClient from './MaterialenSelectieClient';

interface PageProps {
  readonly params: Promise<{ volgnummer: string }>;
}

export default async function MaterialenSelectiePage({ params }: PageProps) {
  const { volgnummer } = await params;
  const materialen = await getMaterialen();
  const voorwerp = await getVoorwerpByVolgnummer(volgnummer);
  const gebruikteMaterialen = voorwerp?.gebruikteMaterialen ?? [];

  return (
    <MaterialenSelectieClient
      materialen={materialen}
      volgnummer={volgnummer}
      gebruikteMaterialen={gebruikteMaterialen}
    />
  );
}
