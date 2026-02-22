import { supabaseAdmin } from '@/lib/supabase';
import { User } from 'lucide-react';

export default async function AdminUsersPage() {
    const { data: users } = await supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Customers</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Customer</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Phone</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Addresses</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users?.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <User size={16} />
                                        </div>
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm tracking-wider font-mono">{user.phone}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">
                                        {user.addresses?.length || 0} Saved
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {(!users || users.length === 0) && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No customers found yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
