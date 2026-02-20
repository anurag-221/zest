'use client';

import { Receipt } from '@/components/Receipt';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    const [order, setOrder] = useState<any>(null);
    const [orderId, setOrderId] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    
    // Fetch order details from Server with Polling for real-time sync
    useEffect(() => {
        let isMounted = true;
        let interval: NodeJS.Timeout;

        const fetchOrder = async () => {
            try {
                const p = await params;
                setOrderId(p.id);
                const { getOrderById } = await import('@/actions/order-actions');
                const result = await getOrderById(p.id);
                
                if (isMounted && result.success && result.order) {
                    setOrder(result.order);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        };

        fetchOrder(); // initial fetch
        interval = setInterval(fetchOrder, 3000); // Poll every 3 seconds

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [params]);
    
    const orderItems = order ? order.items : [];
    const orderTotal = order ? order.total : 0;
    const orderDate = order ? order.createdAt : new Date().toISOString();
    const currentStatus = order?.status || 'pending';
    const statusHistory = order?.statusHistory || [];

    // Redirect Countdown
    const [countdown, setCountdown] = useState(15); // Changed to 15s
    const [fromCheckout, setFromCheckout] = useState(false);

    useEffect(() => {
        // Check if we arrived here directly from checkout
        const searchParams = new URLSearchParams(window.location.search);
        setFromCheckout(searchParams.get('fromCheckout') === 'true');
    }, []);
    
    useEffect(() => {
        if (!order || !fromCheckout) return; // Wait until loaded, ONLY countdown if from checkout

        const timer = setInterval(() => {
            setCountdown((prev) => prev > 0 ? prev - 1 : 0);
        }, 1000);

        return () => clearInterval(timer);
    }, [order, fromCheckout]);

    useEffect(() => {
        if (countdown === 0 && fromCheckout) {
            router.push('/');
        }
    }, [countdown, fromCheckout, router]);

    const handleDownloadPDF = async () => {
        if (!receiptRef.current) return;
        
        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const canvas = await html2canvas(receiptRef.current, {
                scale: 2, 
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
            pdf.save(`Zest-Invoice-${orderId}.pdf`); 
        } catch (error) {
            console.error('Failed to generate PDF', error);
            alert('Failed to download invoice');
        } finally {
            setDownloading(false);
        }
    };

    const getStatusTime = (targetStatus: string) => {
        const historyItem = statusHistory.find((h: any) => h.status === targetStatus);
        if (historyItem) {
            return new Date(historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return '--:--';
    };

    return (
        <div className="min-h-screen bg-indigo-600 dark:bg-black flex flex-col items-center justify-center p-4 text-white relative overflow-hidden pb-24 transition-colors">
            {/* Off-screen Receipt for PDF Generation */}
            <div className="absolute top-0 left-[-9999px]">
                {order && (
                    <Receipt 
                        ref={receiptRef} 
                        orderId={orderId} 
                        items={orderItems} 
                        subtotal={order.subtotal || orderTotal}
                        deliveryFee={order.fees?.delivery || 0}
                        handlingFee={order.fees?.handling || 0}
                        platformFee={order.fees?.platform || 0}
                        tip={order.fees?.tip || 0}
                        total={orderTotal} 
                        date={new Date(orderDate).toLocaleDateString()} 
                    />
                )}
            </div>

            {/* Confetti / Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-3xl"></div>
                 <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 text-center max-w-md w-full mt-12">
                <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-3xl p-8 shadow-2xl mx-4 relative transition-colors pt-14">
                    
                    {/* Success Icon */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 p-4 rounded-full shadow-lg border-4 border-indigo-600">
                        <CheckCircle2 size={48} className="text-white" />
                    </div>

                    <div className="mt-4">
                        <h1 className="text-2xl font-black mb-2">Order Placed!</h1>
                        <p className="text-gray-500 font-medium">Order ID: #{orderId}</p>
                    </div>

                    <div className="my-8 py-6 border-t border-b border-dashed border-gray-200">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Status</span>
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {currentStatus}
                                </span>
                            </div>
                            
                            {/* Live Delivery Progress */}
                            <div className="space-y-6 text-left relative pl-2">
                                {/* Vertical Line */}
                                <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                                {[
                                    { status: 'pending', label: 'Order Placed' },
                                    { status: 'processing', label: 'Processing' },
                                    { status: 'packed', label: 'Order Packed' },
                                    { status: 'shipped', label: 'Shipped' },
                                    { status: 'out-for-delivery', label: 'Out for Delivery' },
                                    { status: 'delivered', label: 'Delivered' },
                                ].map((step, index) => {
                                    const flowOrder = ['pending', 'processing', 'packed', 'shipped', 'out-for-delivery', 'delivered'];
                                    const currentIndex = flowOrder.indexOf(currentStatus);
                                    let isCompleted = false;
                                    
                                    if (currentStatus === 'cancelled') {
                                         isCompleted = index === 0; // Only placed
                                    } else {
                                         isCompleted = currentIndex >= index;
                                    }

                                    // Hide future steps beyond the immediate active status to avoid confusion
                                    const isCurrent = currentIndex === index;
                                    const isActiveOrNext = isCompleted || currentIndex + 1 === index || (currentIndex === -1 && index === 0);
                                    
                                    if (!isActiveOrNext && step.status !== 'delivered') {
                                         // don't render intermediate gray states if they are far off
                                         // wait, let's just make it simpler: only show up to index + 1
                                    }

                                    // Let's actually only render steps that are active or exactly 1 ahead.
                                    if (currentIndex > -1 && index > currentIndex + 1) return null;
                                    // if currentStatus is pending (-1), index 0 (pending) and index 1 (processing) are shown
                                    if (currentIndex === -1 && index > 1) return null;

                                    return (
                                        <div key={step.status} className="flex items-start gap-4 relative z-10 transition-all duration-500">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                                {isCompleted ? <CheckCircle2 size={16} /> : (isCurrent ? <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-current" />)}
                                            </div>
                                            <div className={isCompleted || isCurrent ? 'opacity-100' : 'opacity-40'}>
                                                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{step.label}</p>
                                                <p className={`text-xs ${isCurrent ? 'text-indigo-600 font-medium animate-pulse' : 'text-gray-500'}`}>
                                                    {isCompleted ? getStatusTime(step.status) : (isCurrent ? 'In Progress' : 'Pending...')}
                                                </p>
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
                    {['shipped', 'out-for-delivery', 'delivered'].includes(currentStatus) && (
                        <div className="mt-6 border-t border-dashed border-gray-200 dark:border-gray-800 pt-6">
                            <h3 className="text-left font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                <span className={`absolute inline-flex h-full w-full rounded-full ${currentStatus !== 'delivered' ? 'bg-green-400 animate-ping opacity-75' : 'bg-gray-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${currentStatus !== 'delivered' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                </span>
                                Live Tracking
                            </h3>
                            <TrackingMap status={currentStatus} />
                        </div>
                    )}
                    
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
            
            {fromCheckout && (
                <p className="mt-8 text-indigo-200 text-sm font-medium">Redirecting to home in {countdown} seconds...</p>
            )}
        </div>
    );
}
