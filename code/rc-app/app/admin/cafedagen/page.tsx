import BackButton from '../../components/BackButton';
import { getCafedagen } from '@/lib/data/cafedagen';
import CafeDagenClient from './CafeDagenClient';

export default async function CafeDagenPage() {
  const cafedagen = await getCafedagen();

  return (
    <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 mb-5">
        <BackButton />
        <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
          CafeDagen beheren
        </h1>
        <div className="w-[100px]" />
      </div>

      <CafeDagenClient cafedagen={cafedagen} />
    </div>
  );
}
