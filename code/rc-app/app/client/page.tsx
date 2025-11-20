export default function ClientView() {
  const items = [
    { id: 'F78D', status: 'afgegeven' },
    { id: 'F94H', status: 'afgegeven' },
    { id: 'J23N', status: 'behandeling' },
    { id: 'K9Gh', status: 'behandeling' },
    { id: '0PO3', status: 'klaar' }
  ];

  return (
    <div className="min-h-screen bg-[#03091C] flex justify-center items-start p-5 lg:p-10">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-12 lg:gap-12">
        {/* Afgegeven */}
        <div className="flex-1 flex flex-col items-center gap-5">
          <h2 className="text-white font-open-sans text-2xl font-normal">Afgegeven</h2>
          <div className="w-full flex flex-col gap-5">
            {items
              .filter((item) => item.status === 'afgegeven')
              .map((item) => (
                <div
                  key={item.id}
                  className="w-full h-32 lg:h-44 flex items-center justify-center rounded-md bg-[#ED5028]"
                >
                  <span className="text-white font-open-sans text-4xl font-normal">
                    {item.id}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* In behandeling */}
        <div className="flex-1 flex flex-col items-center gap-5">
          <h2 className="text-white font-open-sans text-2xl font-normal">In behandeling</h2>
          <div className="w-full flex flex-col gap-5">
            {items
              .filter((item) => item.status === 'behandeling')
              .map((item) => (
                <div
                  key={item.id}
                  className="w-full h-32 lg:h-44 flex items-center justify-center rounded-md bg-[#ED5028]"
                >
                  <span className="text-white font-open-sans text-4xl font-normal">
                    {item.id}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Klaar */}
        <div className="flex-1 flex flex-col items-center gap-5">
          <h2 className="text-white font-open-sans text-2xl font-normal">Klaar</h2>
          <div className="w-full flex flex-col gap-5">
            {items
              .filter((item) => item.status === 'klaar')
              .map((item) => (
                <div
                  key={item.id}
                  className="w-full h-32 lg:h-44 flex items-center justify-center rounded-md bg-[#ED5028]"
                >
                  <span className="text-white font-open-sans text-4xl font-normal">
                    {item.id}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
