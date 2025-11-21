import BackButton from '../../components/BackButton';
import { getMaterialen } from '@/lib/data/materialen';
import MaterialenClient from './MaterialenClient';

export default async function MaterialenPage() {
  const materialen = await getMaterialen();

  return (
    <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 mb-5">
        <BackButton />
        <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
          Materialen beheren
        </h1>
        <div className="w-[100px]" />
      </div>

      <MaterialenClient materialen={materialen} />
    </div>
  );
}
