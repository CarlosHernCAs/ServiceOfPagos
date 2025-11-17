import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Cliente } from '@/tipos/clientes';
import { Button } from '@/componentes/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';

interface TablaClientesProps {
  clientes: Cliente[];
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: string) => void;
  onVer: (cliente: Cliente) => void;
}

export default function TablaClientes({
  clientes,
  onEditar,
  onEliminar,
  onVer,
}: TablaClientesProps) {
  const columnas: ColumnDef<Cliente>[] = [
    {
      accessorKey: 'razonSocial',
      header: 'Razón Social',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.razonSocial}</div>
          {row.original.nombreComercial && (
            <div className="text-sm text-gray-500">{row.original.nombreComercial}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'rfc',
      header: 'RFC',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.rfc}</span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      cell: ({ row }) => row.original.telefono || row.original.celular || '-',
    },
    {
      accessorKey: 'ciudad',
      header: 'Ciudad',
      cell: ({ row }) => row.original.ciudad || '-',
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.original.activo
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.original.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onVer(row.original)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditar(row.original)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEliminar(row.original.id)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const tabla = useReactTable({
    data: clientes,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  });

  if (clientes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
        <p className="text-gray-500">No hay clientes registrados</p>
        <p className="text-sm text-gray-400 mt-2">
          Haz clic en "Nuevo Cliente" para agregar uno
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {tabla.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tabla.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
