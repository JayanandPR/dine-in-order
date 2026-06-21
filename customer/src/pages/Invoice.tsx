import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../api';

interface InvoiceData {
  _id: string;
  totalPayableAmount: number;
  isPaid: boolean;
  generatedAt: string;
  paymentId?: string;
  tableId: { tableNo: number };
  restaurantId: { name: string; address: string; contactNumber: string; contactEmail: string };
  orderId: {
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    orderedAt: string;
  };
}

const Invoice = () => {
  const { billId } = useParams();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!billId) return;
    api.get(`/bills/${billId}/invoice`)
      .then(r => setInvoice(r.data.data))
      .catch(() => setError('Could not load invoice'))
      .finally(() => setLoading(false));
  }, [billId]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice?.restaurantId?.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 13px; }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; padding: 3px 0; }
            .bold { font-weight: bold; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; padding: 5px 0; }
            h2 { font-size: 18px; margin-bottom: 4px; }
            p { margin: 2px 0; color: #444; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleDownloadPDF = async () => {
    const content = printRef.current;
    if (!content || !invoice) return;

    // Use browser print to PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.restaurantId?.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 13px; }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; padding: 3px 0; }
            .bold { font-weight: bold; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; padding: 5px 0; }
            h2 { font-size: 18px; margin-bottom: 4px; }
            p { margin: 2px 0; color: #444; }
            @media print {
              @page { margin: 10mm; size: A5; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#718096' }}>Loading invoice...</p>
    </div>
  );

  if (error || !invoice) return (
    <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#e53e3e' }}>{error || 'Invoice not found'}</p>
    </div>
  );

  const subtotal = invoice.orderId?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const tax = invoice.totalPayableAmount - subtotal;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f7fafc', minHeight: '100vh', paddingBottom: '2rem' }}>

      {/* Header */}
      <div style={{ background: '#2d3748', color: '#fff', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700 }}>Invoice</span>
        <span style={{ background: invoice.isPaid ? '#48bb78' : '#e53e3e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>
          {invoice.isPaid ? '✅ Paid' : '⏳ Unpaid'}
        </span>
      </div>

      {/* Invoice content */}
      <div style={{ margin: '1rem', background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

        {/* Printable area */}
        <div ref={printRef}>
          {/* Restaurant info */}
          <div className="center" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{invoice.restaurantId?.name}</h2>
            <p style={{ color: '#718096', fontSize: '0.85rem' }}>{invoice.restaurantId?.address}</p>
            <p style={{ color: '#718096', fontSize: '0.85rem' }}>{invoice.restaurantId?.contactNumber}</p>
            <p style={{ color: '#718096', fontSize: '0.85rem' }}>{invoice.restaurantId?.contactEmail}</p>
          </div>

          <div style={{ borderTop: '1px dashed #cbd5e0', margin: '0.75rem 0' }} />

          {/* Invoice meta */}
          <div style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
              <span>Table</span>
              <span style={{ fontWeight: 600 }}>Table {invoice.tableId?.tableNo}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
              <span>Date</span>
              <span>{new Date(invoice.generatedAt).toLocaleString()}</span>
            </div>
            {invoice.paymentId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                <span>Payment ID</span>
                <span style={{ fontSize: '0.75rem' }}>{invoice.paymentId}</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px dashed #cbd5e0', margin: '0.75rem 0' }} />

          {/* Items */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 600 }}>
              <span>Item</span>
              <span>Qty</span>
              <span>Amount</span>
            </div>
            {invoice.orderId?.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.3rem 0', borderBottom: '1px solid #f7fafc' }}>
                <span style={{ flex: 2 }}>{item.name}</span>
                <span style={{ flex: 0.5, textAlign: 'center' }}>×{item.quantity}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed #cbd5e0', margin: '0.75rem 0' }} />

          {/* Totals */}
          <div style={{ fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', color: '#4a5568' }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', color: '#4a5568' }}>
                <span>Tax & Charges</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 700, fontSize: '1.05rem', borderTop: '2px solid #2d3748', marginTop: '0.5rem' }}>
              <span>Total Paid</span>
              <span>₹{invoice.totalPayableAmount.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #cbd5e0', margin: '0.75rem 0' }} />

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#718096' }}>
            Thank you for dining with us! 🙏
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ margin: '0 1rem', display: 'flex', gap: '0.75rem' }}>
        <button onClick={handlePrint}
          style={{ flex: 1, padding: '0.75rem', background: '#2d3748', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>
          🖨️ Print
        </button>
        <button onClick={handleDownloadPDF}
          style={{ flex: 1, padding: '0.75rem', background: '#276749', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>
          ⬇️ Download PDF
        </button>
      </div>
    </div>
  );
};

export default Invoice;