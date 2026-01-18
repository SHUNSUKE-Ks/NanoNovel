import { Edit, Trash2 } from 'lucide-react';

export interface TableColumn {
    key: string;
    label: string;
    render?: (value: any, item: any) => React.ReactNode;
}

interface TableViewProps {
    data: any[];
    columns: TableColumn[];
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
}

export function TableView({ data, columns, onEdit, onDelete }: TableViewProps) {
    if (!data || data.length === 0) {
        return <div className="p-4 text-gray-500">データがありません</div>;
    }

    return (
        <div className="w-full overflow-x-auto bg-gray-900 rounded-lg border border-gray-800">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800 text-gray-200 uppercase font-medium">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className="px-6 py-3">{col.label}</th>
                        ))}
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {data.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-800 transition-colors">
                            {columns.map(col => (
                                <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                                    {col.render ? col.render(item[col.key], item) : String(item[col.key] || '')}
                                </td>
                            ))}
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button className="p-1 hover:text-blue-400" onClick={() => onEdit?.(item)}>
                                    <Edit size={16} />
                                </button>
                                <button className="p-1 hover:text-red-400" onClick={() => onDelete?.(item)}>
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
