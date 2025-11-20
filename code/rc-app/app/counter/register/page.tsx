'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';
import Input from '../../components/Input';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function RegisterItemPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerType: '',
    problemDescription: '',
    itemDescription: '',
    departmentId: ''
  });
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const customerTypes = [
    { value: 'Externe', label: 'Externe' },
    { value: 'Student', label: 'Student' }
  ];

  useEffect(() => {
    // Fetch departments from API
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/afdelingen');
        const data = await response.json();
        const deptOptions = data.map((dept: any) => ({
          value: dept.afdelingId.toString(),
          label: dept.naam
        }));
        setDepartments(deptOptions);
        if (deptOptions.length > 0) {
          setFormData(prev => ({ ...prev, departmentId: deptOptions[0].value }));
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/voorwerpen/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Er is een fout opgetreden');
        setIsLoading(false);
        return;
      }

      // Success - redirect with tracking number
      localStorage.setItem('registeredItem', JSON.stringify(data.voorwerp));
      localStorage.setItem('trackingNumber', data.trackingNumber);
      router.push('/counter');
    } catch (err) {
      console.error('Register error:', err);
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Admin', 'Balie']}>
      <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
        {/* Header */}
        <div className="flex items-center justify-between p-2.5 mb-5">
          <BackButton />
          <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
            Nieuw voorwerp registreren
          </h1>
          <div className="w-[100px]" />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-2.5 lg:mx-10 mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2.5 px-2.5 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-2.5 flex-1">
          {/* Customer Information */}
          <div className="flex-1 flex flex-col gap-2.5 p-2.5 border-b lg:border-b-0 lg:border-r border-white/50">
            <h2 className="text-white font-open-sans text-3xl lg:text-4xl font-normal text-center">
              Klantgegevens
            </h2>
            <div className="flex flex-col gap-8">
              <Input
                label="Klant Naam"
                placeholder="Johan Klaasen"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
              <Input
                label="Klant Telefoon Nummer"
                placeholder="+32123456778"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                disabled={isLoading}
              />
              <Dropdown
                options={customerTypes}
                placeholder="Kies een klanttype"
                value={formData.customerType}
                onChange={(value) => setFormData({ ...formData, customerType: value })}
              />
              <Dropdown
                options={departments}
                placeholder="Kies een afdeling"
                value={formData.departmentId}
                onChange={(value) => setFormData({ ...formData, departmentId: value })}
              />
            </div>
          </div>

          {/* Item Information */}
          <div className="flex-1 flex flex-col gap-2.5 p-2.5">
            <h2 className="text-white font-open-sans text-3xl lg:text-4xl font-normal text-center">
              Voorwerpgegevens
            </h2>
            <div className="flex flex-col gap-2.5">
              <Input
                label="Beschrijving Probleem"
                placeholder="Het apparaat is kapot"
                required
                multiline
                rows={6}
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                disabled={isLoading}
              />
              <Input
                label="Beschrijving Voorwerp"
                placeholder="Een rekenmachine op zonnepanelen"
                required
                multiline
                rows={6}
                value={formData.itemDescription}
                onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center p-2.5">
          <Button variant="primary" type="submit" className="w-full lg:w-[572px] py-12 text-4xl" disabled={isLoading}>
            {isLoading ? 'Bezig met registreren...' : 'Voorwerp Registreren'}
          </Button>
        </div>
      </form>
    </div>
    </ProtectedRoute>
  );
}
