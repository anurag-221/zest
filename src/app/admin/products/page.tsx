import { db } from '@/lib/fs-db';
import Link from 'next/link';
import { Plus, Edit, Package } from 'lucide-react';

export default async function ProductsPage() {
  const products = await db.products.getAll();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Inventory</h1>
            <p className="text-gray-500">Manage global products catalogue.</p>
        </div>
        <Link href="/admin/products/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors font-medium">
            <Plus size={18} />
            Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
            <div key={product.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center p-4">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={product.name} className="h-full object-contain mix-blend-multiply" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold tracking-wider rounded">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="font-bold text-gray-900">₹{product.price}</span>
                    <Link href={`/admin/products/${product.id}`} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                        <Edit size={16} />
                    </Link>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
