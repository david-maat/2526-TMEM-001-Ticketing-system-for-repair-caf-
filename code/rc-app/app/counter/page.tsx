import Link from 'next/link';
import Button from '../components/Button';

export default function CounterDashboard() {
  return (
    <div className="min-h-screen bg-[#03091C] flex items-center justify-center p-2.5">
      <div className="w-full max-w-7xl flex flex-col items-center gap-14">
        <Link href="/counter/deliver">
          <Button variant="primary" className="w-full lg:w-auto px-8 py-8 text-4xl">
            Voorwerp uitleveren
          </Button>
        </Link>

        <Link href="/counter/register">
          <Button variant="primary" className="w-full lg:w-auto px-8 py-8 text-4xl">
            Nieuw voorwerp registreren
          </Button>
        </Link>
      </div>
    </div>
  );
}
