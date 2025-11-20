import React from 'react';

interface TableColumn {
  key: string;
  header: string;
}

interface TableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  showActions?: boolean;
  renderCell?: (key: string, value: any, item: any) => React.ReactNode;
}

export default function Table({
  columns,
  data,
  onEdit,
  onDelete,
  showActions = true,
  renderCell
}: TableProps) {
  return (
    <div className="w-full rounded border border-[#5B5B5B] bg-[#363636] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-transparent">
            {columns.map((column) => (
              <th
                key={column.key}
                className="border-t border-l border-black bg-[#F76B3D] text-left"
              >
                <div className="px-3 py-2.5">
                  <span className="text-white font-inter text-xs font-semibold leading-[130%]">
                    {column.header}
                  </span>
                </div>
              </th>
            ))}
            {showActions && (
              <th className="border-t border-l border-black bg-[#F76B3D] text-left">
                <div className="px-3 py-2.5">
                  <span className="text-white font-inter text-xs font-semibold leading-[130%]">
                    Acties
                  </span>
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-[#F76B3D]' : 'bg-transparent'}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="border-t border-l border-black bg-white"
                >
                  <div className="px-3 py-2.5">
                    <span className="text-black font-inter text-xs font-normal leading-[130%]">
                      {renderCell ? renderCell(column.key, item[column.key], item) : item[column.key]}
                    </span>
                  </div>
                </td>
              ))}
              {showActions && (
                <td className="border-t border-l border-black bg-white">
                  <div className="px-3 py-2.5 flex justify-end items-center gap-2">
                    {onEdit && (
                      <button onClick={() => onEdit(item)} className="cursor-pointer">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M14.06 9L15 9.94L5.92 19H5V18.08L14.06 9ZM17.66 3C17.41 3 17.15 3.1 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04C21.1 6.65 21.1 6 20.71 5.63L18.37 3.29C18.17 3.09 17.92 3 17.66 3ZM14.06 6.19L3 17.25V21H6.75L17.81 9.94L14.06 6.19Z"
                            fill="black"
                          />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(item)} className="cursor-pointer">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M18 5V19C18 19.5 17.5 20 17 20H12H7C6.5 20 6 19.5 6 19V5"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4 5H20"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 4H14M10 9V16M14 9V16"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
