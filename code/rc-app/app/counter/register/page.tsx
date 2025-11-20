'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/BackButton';
import Input from '../../components/Input';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';

export default function RegisterItemPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerType: '',
    problemDescription: '',
    itemDescription: ''
  });

  const customerTypes = [
    { value: 'extern', label: 'Extern' },
    { value: 'student', label: 'Student' },
    { value: 'docent', label: 'Docent' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registering item:', formData);
    router.push('/counter/register/success');
  };

  return (
    <div className="min-h-screen bg-[#03091C] flex flex-col p-2.5 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 mb-5">
        <BackButton />
        <h1 className="text-white font-open-sans text-3xl lg:text-4xl font-normal">
          Nieuw voorwerp registreren
        </h1>
        <div className="w-[100px]" />
      </div>

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
              />
              <Input
                label="Klant eMail"
                placeholder="johan.klaasen@gmail.com"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              />
              <Dropdown
                options={customerTypes}
                placeholder="Kies een klanttype"
                value={formData.customerType}
                onChange={(value) => setFormData({ ...formData, customerType: value })}
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
              />
              <Input
                label="Beschrijving Voorwerp"
                placeholder="Een rekenmachine op zonnepanelen"
                required
                multiline
                rows={6}
                value={formData.itemDescription}
                onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center p-2.5">
          <Button variant="primary" type="submit" className="w-full lg:w-[572px] py-12 text-4xl">
            Voorwerp Registreren
          </Button>
        </div>
      </form>
    </div>
  );
}
