'use client';

import { ExtraCharge } from '@/lib/types';

interface ExtraChargesTableProps {
  charges: ExtraCharge[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (charge: ExtraCharge) => void;
  onDelete?: (id: string) => void;
}

export default function ExtraChargesTable({
  charges,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
}: ExtraChargesTableProps) {
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === charges.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(charges.map((c) => c.id));
    }
  };

  if (charges.length === 0) {
    return (
      <div className="text-center py-8 text-royal-taupe">
        <p>No extra charges yet. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-royal-beige">
            <th className="p-2 text-left">
              <input
                type="checkbox"
                checked={selectedIds.length === charges.length}
                onChange={toggleAll}
                className="cursor-pointer"
              />
            </th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Created</th>
            {(onEdit || onDelete) && <th className="p-2 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {charges.map((charge) => (
            <tr key={charge.id} className="border-t hover:bg-royal-stone">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(charge.id)}
                  onChange={() => toggleSelection(charge.id)}
                  className="cursor-pointer"
                />
              </td>
              <td className="p-2">{charge.description}</td>
              <td className="p-2">{charge.category || '—'}</td>
              <td className="p-2">${charge.amount.toFixed(2)}</td>
              <td className="p-2">{new Date(charge.createdAt).toLocaleDateString()}</td>
              {(onEdit || onDelete) && (
                <td className="p-2">
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(charge)}
                        className="text-crown-terracotta hover:underline text-sm"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this extra charge?')) {
                            onDelete(charge.id);
                          }
                        }}
                        className="text-accent-alert hover:underline text-sm"
                      >
                        Delete
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
