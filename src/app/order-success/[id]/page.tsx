'use client';

import { Receipt } from '@/components/Receipt';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { CheckCircle2, Home, ArrowRight, Download, Loader2 } from 'lucide-react';
import { useOrderStore } from '@/store/order-store';
import dynamic from 'next/dynamic';
// Remove static imports of html2canvas and jsPDF to reduce initial bundle size
// They will be imported on demand when the user clicks download

const TrackingMap = dynamic(() => import('@/components/TrackingMap'), { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const [orderId, setOrderId] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);
    const { getOrder } = useOrderStore();
    
    // Fetch order details
    const order = getOrder(orderId);
    
    // Fallback if order not found (should ideally redirect or show error)
    const orderItems = order ? order.items : [];
    const orderTotal = order ? order.total : 0;
    const orderDate = order ? order.date : new Date().toLocaleDateString();

    const handleDownloadPDF = async () => {
        if (!receiptRef.current) return;
        
        setDownloading(true);
        try {
            // Dynamically import libraries only when needed
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const canvas = await html2canvas(receiptRef.current, {
                scale: 2, // Improve quality
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Zest-Invoice-${orderId}.pdf`); // Updated filename
        } catch (error) {
            console.error('Failed to generate PDF', error);
            alert('Failed to download invoice');
        } finally {
            setDownloading(false);
        }
    };

    const [currentStatus, setCurrentStatus] = useState<'Processing' | 'Packed' | 'Shipped' | 'Delivered'>('Processing');

    useEffect(() => {
        // Unwrap params
        params.then(p => setOrderId(p.id));
        
        // Simulate Order Progress
        const statuses: ('Processing' | 'Packed' | 'Shipped' | 'Delivered')[] = ['Processing', 'Packed', 'Shipped', 'Delivered'];
        let currentIndex = 0;

        const interval = setInterval(() => {
            currentIndex++;
            if (currentIndex < statuses.length) {
                setCurrentStatus(statuses[currentIndex]);
            } else {
                clearInterval(interval);
            }
        }, 3000); // Change status every 3 seconds

        return () => clearInterval(interval);
    }, [params]);

    return (
        <div className="min-h-screen bg-indigo-600 dark:bg-black flex flex-col items-center justify-center p-4 text-white relative overflow-hidden pb-24 transition-colors">
            {/* Off-screen Receipt for PDF Generation (Display block needed for html2canvas) */}
            <div className="absolute top-0 left-[-9999px]">
                {order && (
                    <Receipt 
                        ref={receiptRef} 
                        orderId={orderId} 
                        items={orderItems} 
                        subtotal={order.subtotal || 0}
                        deliveryFee={order.deliveryFee || 0}
                        handlingFee={order.handlingFee || 0}
                        platformFee={order.platformFee || 0}
                        tip={order.tip}
                        total={orderTotal} 
                        date={orderDate} 
                    />
                )}
            </div>

            {/* Confetti / Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-3xl"></div>
                 <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 text-center max-w-md w-full">
                <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-3xl p-8 shadow-2xl mx-4 relative transition-colors">
                    
                    {/* Success Icon */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-500 p-4 rounded-full shadow-lg border-4 border-indigo-600">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>

                    <div className="mt-8">
                        <h1 className="text-2xl font-black mb-2">Order Placed!</h1>
                        <p className="text-gray-500 font-medium">Order ID: #{orderId}</p>
                    </div>

                    <div className="my-8 py-6 border-t border-b border-dashed border-gray-200">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Status</span>
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Usually arrives in 9m
                                </span>
                            </div>
                            
                            {/* Live Delivery Progress */}
                            <div className="space-y-6 text-left relative pl-2">
                                {/* Vertical Line */}
                                <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                                {[
                                    { status: 'Processing', label: 'Order Placed', time: '10:00 AM' },
                                    { status: 'Packed', label: 'Order Packed', time: '10:02 AM' },
                                    { status: 'Shipped', label: 'Out for Delivery', time: '10:05 AM' },
                                    { status: 'Delivered', label: 'Order Delivered', time: '10:15 AM' },
                                ].map((step, index) => {
                                    const isCompleted = ['Processing', 'Packed', 'Shipped', 'Delivered'].indexOf(currentStatus) >= index;
                                    const isCurrent = currentStatus === step.status;

                                    return (
                                        <div key={step.status} className="flex items-start gap-4 relative z-10 transition-all duration-500">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                                {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                            </div>
                                            <div className={isCompleted ? 'opacity-100' : 'opacity-40'}>
                                                <p className="font-bold text-sm text-gray-900">{step.label}</p>
                                                <p className="text-xs text-gray-500">{step.time}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                        <Link href="/" className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                             <Home size={18} />
                             Home
                        </Link>

                    {/* Live Tracking Map */}
                    <div className="mt-6 border-t border-dashed border-gray-200 dark:border-gray-800 pt-6">
                        <h3 className="text-left font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Live Tracking
                        </h3>
                        <TrackingMap status={currentStatus} />
                    </div>
                    
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="mt-6 text-gray-400 text-xs font-medium flex items-center justify-center gap-1 hover:text-gray-600 transition-colors w-full disabled:opacity-50"
                    >
                        {downloading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download size={14} />
                                Download Invoice
                            </>
                        )}
                    </button>

                </div>

            </div>
            
            <p className="mt-8 text-indigo-200 text-sm font-medium">Redirecting to home in 10 seconds...</p>
        </div>
    );
}
