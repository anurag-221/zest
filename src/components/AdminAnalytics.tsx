'use client';

import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const data = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 2000, orders: 12 },
  { name: 'Thu', revenue: 2780, orders: 22 },
  { name: 'Fri', revenue: 1890, orders: 15 },
  { name: 'Sat', revenue: 6390, orders: 42 },
  { name: 'Sun', revenue: 5490, orders: 38 },
];

const categoryData = [
  { name: 'Fruits & Veg', value: 400 },
  { name: 'Dairy & Bread', value: 300 },
  { name: 'Snacks', value: 300 },
  { name: 'Beverages', value: 200 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
        {/* Row 1: Revenue & Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Weekly Revenue</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
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
                        <BarChart data={data}>
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

            {/* Top Products Table (Placeholder for now) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                 <h3 className="font-bold text-gray-900 mb-6">Top Selling Products</h3>
                 <div className="space-y-4">
                    {[
                        { name: 'Amul Taaza Fresh Toned Milk', sales: 1240, revenue: '₹84,320' },
                        { name: 'Lay\'s India\'s Magic Masala', sales: 980, revenue: '₹19,600' },
                        { name: 'Coca-Cola Zero Sugar', sales: 850, revenue: '₹34,000' },
                        { name: 'Farm Fresh Tomatoes', sales: 620, revenue: '₹24,800' },
                    ].map((item, i) => (
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
                    ))}
                 </div>
            </div>
        </div>
    </div>
  );
}
