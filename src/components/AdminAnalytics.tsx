'use client';

import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

interface AdminAnalyticsProps {
  weeklyData: { name: string; revenue: number; orders: number }[];
  categoryData: { name: string; value: number }[];
  topProducts: { name: string; sales: number; revenue: string }[];
}

export default function AdminAnalytics({ weeklyData, categoryData, topProducts }: AdminAnalyticsProps) {
  return (
    <div className="space-y-8">
        {/* Row 1: Revenue & Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Weekly Revenue</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Orders vs Cancellations</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                             <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Row 2: Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
                <h3 className="font-bold text-gray-900 mb-6">Sales by Category</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                 <h3 className="font-bold text-gray-900 mb-6">Top Selling Products</h3>
                 <div className="space-y-4">
                    {topProducts.length > 0 ? topProducts.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <span className={`font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {i + 1}
                                </span>
                                <span className="font-medium text-gray-900">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm text-gray-900">{item.revenue}</p>
                                <p className="text-xs text-gray-500">{item.sales} sold</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-gray-500 text-sm py-4">No top-selling products yet.</div>
                    )}
                 </div>
            </div>
        </div>
    </div>
  );
}
