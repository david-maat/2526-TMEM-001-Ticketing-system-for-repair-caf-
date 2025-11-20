import Link from 'next/link';
import Button from '../components/Button';

export default function AdminDashboard() {
  const adminSections = [
    { title: 'CaféDagen', href: '/admin/cafedagen' },
    { title: 'Gebruikers', href: '/admin/gebruikers' },
    { title: 'Afdelingen', href: '/admin/afdelingen' },
    { title: 'Materialen', href: '/admin/materialen' },
    { title: 'Statistieken', href: '/admin/statistieken' },
    { title: 'Voorwerpen', href: '/admin/voorwerpen' }
  ];

  return (
    <div className="min-h-screen bg-[#03091C] flex items-center justify-center p-4 lg:p-0">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-[85px]">
        {adminSections.map((section) => (
          <Link key={section.href} href={section.href} className="w-full">
            <Button variant="primary" className="w-full h-32 lg:h-44 text-4xl">
              {section.title}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
