import { CartItem } from '@/store/cart-store';
import React from 'react';

interface ReceiptProps {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  handlingFee: number;
  platformFee: number;
  tip?: number;
  total: number;
  date: string;
  paymentMethod?: string;
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ orderId, items, subtotal, deliveryFee, handlingFee, platformFee, tip, total, date, paymentMethod }, ref) => {
  return (
    <div ref={ref} style={{ width: '100%', maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', color: '#000000', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#4F46E5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}>Z</div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: '#111827', letterSpacing: '-1px' }}>Zest</h1>
                </div>
                <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6' }}>
                    <strong>Zest Commerce Pvt Ltd.</strong> <br />
                    Building 10, Cyber City, Gurgaon <br />
                    Haryana - 122002 <br />
                    GSTIN: 07UIPPS9203R1Z2
                </p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>INVOICE</h2>
                <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>#{orderId}</p>
                <div style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Date</p>
                    <p style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{date}</p>
                </div>
                 {paymentMethod && (
                    <div style={{ marginTop: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Payment Mode</p>
                         <p style={{ fontSize: '16px', color: '#4F46E5', fontWeight: 'bold', textTransform: 'capitalize' }}>
                            {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}
                         </p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', marginBottom: '40px', borderCollapse: 'collapse' }}>
        <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '16px 8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280' }}>Item Description</th>
                <th style={{ textAlign: 'center', padding: '16px 8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '16px 8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280' }}>Price</th>
                <th style={{ textAlign: 'right', padding: '16px 8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280' }}>Amount</th>
            </tr>
        </thead>
        <tbody>
            {items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '20px 8px', verticalAlign: 'top' }}>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>{item.name}</p>
                         <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>unit price: ₹{item.price}</p>
                    </td>
                    <td style={{ padding: '20px 8px', textAlign: 'center', verticalAlign: 'top', color: '#4B5563', fontWeight: '500' }}>{item.quantity}</td>
                    <td style={{ padding: '20px 8px', textAlign: 'right', verticalAlign: 'top', color: '#4B5563' }}>₹{item.price}</td>
                    <td style={{ padding: '20px 8px', textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold', color: '#111827' }}>₹{item.price * item.quantity}</td>
                </tr>
            ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
        <div style={{ width: '320px', backgroundColor: '#F9FAFB', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#4B5563' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#4B5563' }}>
                <span>Delivery Charges</span>
                <span style={{ color: deliveryFee === 0 ? '#059669' : '#4B5563' }}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#4B5563' }}>
                <span>Handling Fee</span>
                <span>₹{handlingFee}</span>
            </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#4B5563' }}>
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
            </div>
            {tip ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#4F46E5' }}>
                    <span>Delivery Partner Tip</span>
                    <span>₹{tip}</span>
                </div>
            ) : null}
            
            <div style={{ borderTop: '2px solid #E5E7EB', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Total Amount</span>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#4F46E5' }}>₹{total}</span>
            </div>
             <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '8px', textAlign: 'right' }}>Includes all applicable taxes</p>
        </div>
      </div>

      {/* Offers & Ads */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
         <div style={{ flex: 1, backgroundColor: '#EEF2FF', padding: '20px', borderRadius: '12px', border: '1px dashed #6366F1' }}>
            <p style={{ fontSize: '12px', color: '#4F46E5', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Exclusive Offer</p>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937', marginBottom: '4px' }}>Get 20% OFF on Fresh Fruits</h3>
            <p style={{ fontSize: '14px', color: '#4B5563' }}>Use code <strong>ZESTFRESH</strong> on your next order above ₹299.</p>
         </div>
         <div style={{ flex: 1, backgroundColor: '#ECFDF5', padding: '20px', borderRadius: '12px', border: '1px dashed #10B981' }}>
            <p style={{ fontSize: '12px', color: '#059669', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Zest Membership</p>
             <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937', marginBottom: '4px' }}>Free Delivery Forever?</h3>
            <p style={{ fontSize: '14px', color: '#4B5563' }}>Join <strong>Zest Gold</strong> today at just ₹49/month.</p>
         </div>
      </div>

      <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '12px', borderTop: '1px solid #F3F4FB', paddingTop: '24px' }}>
        <p style={{ marginBottom: '4px' }}>Need help with this order? Email us at <strong>support@zest.com</strong></p>
        <p>© 2026 Zest Commerce Pvt Ltd. All rights reserved.</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
