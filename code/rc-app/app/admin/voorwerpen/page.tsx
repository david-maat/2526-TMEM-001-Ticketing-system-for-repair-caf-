import BackButton from '../../components/BackButton';
import { getVoorwerpen } from '@/lib/data/voorwerpen';
import VoorwerpenClient from './VoorwerpenClient';

export default async function VoorwerpenPage() {
  const voorwerpen = await getVoorwerpen();

  return (
    <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 mb-5">
        <BackButton />
        <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
          Voorwerpen beheren
        </h1>
        <div className="w-[100px]" />
      </div>

      <VoorwerpenClient voorwerpen={voorwerpen} />
    </div>
  );
}
