import React from 'react';
import { Edit, Trash2 } from "@deemlol/next-icons";

function formatDateDDMMYYYY(date: Date): string {
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).padStart(4, '0');
  return `${day}/${month}/${year}`;
}

function getRowKey(item: Record<string, any>): string {
  const candidate = item.id ?? item.uuid ?? item.key ?? item.ID ?? item._id;
  if (candidate != null && (typeof candidate === 'string' || typeof candidate === 'number')) {
    return String(candidate);
  }

  try {
    return JSON.stringify(item);
  } catch {
    return '[row]';
  }
}

function toCellContent(value: unknown): React.ReactNode {
  if (
    value == null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    return value as any;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (value instanceof Date) {
    return formatDateDDMMYYYY(value);
  }

  if (React.isValidElement(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (v instanceof Date) return formatDateDDMMYYYY(v);
        if (v == null) return '';
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'bigint') return String(v);
        if (typeof v === 'boolean') return v ? 'true' : 'false';
        try {
          return JSON.stringify(v);
        } catch {
          return '[item]';
        }
      })
      .filter((s) => s !== '')
      .join(', ');
  }

  try {
    return JSON.stringify(value);
  } catch {
    return '[value]';
  }
}

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
}: Readonly<TableProps>) {
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
            <tr key={getRowKey(item)} className={index % 2 === 0 ? 'bg-[#F76B3D]' : 'bg-transparent'}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="border-t border-l border-black bg-white"
                >
                  <div className="px-3 py-2.5">
                    <span className="text-black font-inter text-xs font-normal leading-[130%]">
                      {toCellContent(
                        renderCell
                          ? renderCell(column.key, item[column.key], item)
                          : item[column.key]
                      )}
                    </span>
                  </div>
                </td>
              ))}
              {showActions && (
                <td className="border-t border-l border-black bg-white">
                  <div className="px-3 py-2.5 flex justify-end items-center gap-2">
                    {onEdit && (
                      <button onClick={() => onEdit(item)} className="cursor-pointer">
                        <Edit size={24} color="#000000" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(item)} className="cursor-pointer">
                        <Trash2 size={24} color="#000000" />
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
