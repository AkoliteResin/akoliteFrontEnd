/**
 * Professional Invoice Print Utility
 * Creates a sophisticated, print-ready invoice layout
 */

export function printInvoice(invoiceData) {
  const {
    items = [],
    totals = {},
    date = new Date(),
    invoiceNumber = null,
    companyInfo = {
      name: "Akolite Resins",
      address: "Industrial Area, Manufacturing Unit",
      phone: "+91 XXXX XXXXXX",
      email: "info@akolitesresins.com",
      gst: "GST IN: XXXXXXXXXXXXXXX"
    }
  } = invoiceData;

  const printWindow = window.open('', '_blank');
  
  // Get unique clients and order numbers
  const clients = Array.from(new Set(items.map(i => i.clientName).filter(Boolean)));
  const orderNumbers = Array.from(new Set(items.map(i => i.orderNumber).filter(Boolean)));
  
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  const formattedTime = new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - ${invoiceNumber || formattedDate}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 20mm;
          background: #fff;
        }
        
        .invoice-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
        }
        
        /* Header */
        .invoice-header {
          border-bottom: 3px solid #2c3e50;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .company-info {
          flex: 1;
        }
        
        .company-name {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        
        .company-details {
          font-size: 11px;
          color: #666;
          line-height: 1.8;
        }
        
        .invoice-title-section {
          text-align: right;
        }
        
        .invoice-title {
          font-size: 36px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        
        .invoice-meta {
          font-size: 11px;
          color: #666;
          line-height: 1.8;
        }
        
        .invoice-number {
          font-weight: 600;
          color: #2c3e50;
        }
        
        /* Client Info */
        .invoice-details {
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .detail-section {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          border-left: 4px solid #3498db;
        }
        
        .detail-section h3 {
          font-size: 12px;
          text-transform: uppercase;
          color: #2c3e50;
          margin-bottom: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .detail-section p {
          font-size: 11px;
          color: #555;
          margin: 4px 0;
        }
        
        .detail-section .highlight {
          font-weight: 600;
          color: #2c3e50;
        }
        
        /* Items Table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          font-size: 11px;
        }
        
        .items-table thead {
          background: #2c3e50;
          color: white;
        }
        
        .items-table th {
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 10px;
        }
        
        .items-table th.text-right,
        .items-table td.text-right {
          text-align: right;
        }
        
        .items-table tbody tr {
          border-bottom: 1px solid #e0e0e0;
        }
        
        .items-table tbody tr:hover {
          background: #f8f9fa;
        }
        
        .items-table td {
          padding: 10px 8px;
          color: #555;
        }
        
        .items-table tbody tr:last-child {
          border-bottom: 2px solid #2c3e50;
        }
        
        /* Totals Section */
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        
        .totals-box {
          width: 400px;
          border: 2px solid #e0e0e0;
          border-radius: 4px;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 11px;
        }
        
        .totals-row:last-child {
          border-bottom: none;
        }
        
        .totals-row .label {
          color: #666;
          font-weight: 500;
        }
        
        .totals-row .value {
          font-weight: 600;
          color: #2c3e50;
        }
        
        .totals-row.subtotal {
          background: #f8f9fa;
        }
        
        .totals-row.highlight {
          background: #e3f2fd;
        }
        
        .totals-row.grand-total {
          background: #2c3e50;
          color: white;
          font-size: 14px;
          padding: 15px;
          font-weight: 700;
        }
        
        .totals-row.grand-total .label,
        .totals-row.grand-total .value {
          color: white;
        }
        
        /* Payment Breakdown */
        .payment-breakdown {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 4px;
          border-left: 4px solid #27ae60;
        }
        
        .payment-breakdown h3 {
          font-size: 13px;
          text-transform: uppercase;
          color: #2c3e50;
          margin-bottom: 15px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .payment-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        
        .payment-item {
          text-align: center;
          padding: 12px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }
        
        .payment-item .payment-label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 5px;
          letter-spacing: 0.5px;
        }
        
        .payment-item .payment-value {
          font-size: 16px;
          font-weight: 700;
          color: #2c3e50;
        }
        
        .payment-item.transaction {
          border-left: 4px solid #3498db;
        }
        
        .payment-item.cash {
          border-left: 4px solid #27ae60;
        }
        
        .payment-item.gst {
          border-left: 4px solid #e74c3c;
        }
        
        /* Footer */
        .invoice-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        
        .footer-note {
          margin-bottom: 10px;
          font-style: italic;
        }
        
        .footer-legal {
          font-size: 9px;
          color: #999;
        }
        
        /* Print Styles */
        @media print {
          body {
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .invoice-container {
            max-width: 100%;
          }
          
          .items-table {
            page-break-inside: auto;
          }
          
          .items-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .totals-section,
          .payment-breakdown {
            page-break-inside: avoid;
          }
        }
        
        /* Print Button */
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }
        
        .print-button:hover {
          background: #2980b9;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        @media print {
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print()" class="print-button no-print">🖨️ Print Invoice</button>
      
      <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
          <div class="company-info">
            <div class="company-name">${companyInfo.name}</div>
            <div class="company-details">
              ${companyInfo.address}<br>
              Phone: ${companyInfo.phone}<br>
              Email: ${companyInfo.email}<br>
              ${companyInfo.gst}
            </div>
          </div>
          <div class="invoice-title-section">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-meta">
              ${invoiceNumber ? `<div class="invoice-number">Invoice #: ${invoiceNumber}</div>` : ''}
              <div>Date: ${formattedDate}</div>
              <div>Time: ${formattedTime}</div>
            </div>
          </div>
        </div>
        
        <!-- Invoice Details -->
        <div class="invoice-details">
          <div class="detail-section">
            <h3>Bill To</h3>
            ${clients.length > 0 ? clients.map(client => `
              <p class="highlight">${client}</p>
            `).join('') : '<p>Multiple Clients</p>'}
          </div>
          <div class="detail-section">
            <h3>Order Reference</h3>
            ${orderNumbers.length > 0 ? `
              <p><span class="highlight">Order Count:</span> ${orderNumbers.length}</p>
              <p><span class="highlight">Order Numbers:</span></p>
              <p>${orderNumbers.map(o => `#${o}`).join(', ')}</p>
            ` : '<p>No order numbers</p>'}
          </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Client</th>
              <th>Resin Type</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Rate (₹/L)</th>
              <th class="text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>#${item.orderNumber || '-'}</td>
                <td>${item.clientName || '-'}</td>
                <td>${item.resinType || '-'}</td>
                <td class="text-right">${item.litres || 0} L</td>
                <td class="text-right">₹ ${(item.rate || 0).toFixed(2)}</td>
                <td class="text-right">₹ ${(item.lineTotal || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals-section">
          <div class="totals-box">
            <div class="totals-row subtotal">
              <span class="label">Subtotal</span>
              <span class="value">₹ ${(totals.subtotal || 0).toFixed(2)}</span>
            </div>
            <div class="totals-row grand-total">
              <span class="label">TOTAL AMOUNT</span>
              <span class="value">₹ ${(totals.grandTotal || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <!-- Payment Breakdown -->
        ${totals.transactionPercent != null ? `
          <div class="payment-breakdown">
            <h3>Payment Breakdown</h3>
            <div class="payment-grid">
              <div class="payment-item transaction">
                <div class="payment-label">Transaction (${totals.transactionPercent || 0}%)</div>
                <div class="payment-value">₹ ${(totals.transactionTotal || 0).toFixed(2)}</div>
                <div style="font-size: 9px; color: #666; margin-top: 4px;">
                  Base: ₹${(totals.transactionBase || 0).toFixed(2)}
                </div>
              </div>
              <div class="payment-item cash">
                <div class="payment-label">Cash Payment</div>
                <div class="payment-value">₹ ${(totals.cashAmount || 0).toFixed(2)}</div>
                <div style="font-size: 9px; color: #666; margin-top: 4px;">
                  ${((1 - (totals.transactionPercent || 0) / 100) * 100).toFixed(0)}% of subtotal
                </div>
              </div>
              <div class="payment-item gst">
                <div class="payment-label">GST (18%)</div>
                <div class="payment-value">₹ ${(totals.gst || 0).toFixed(2)}</div>
                <div style="font-size: 9px; color: #666; margin-top: 4px;">
                  On transaction amount
                </div>
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="invoice-footer">
          <div class="footer-note">
            Thank you for your business. For any queries, please contact us at ${companyInfo.email}
          </div>
          <div class="footer-legal">
            This is a computer-generated invoice and does not require a physical signature.
            All payments are subject to realization. Terms and conditions apply.
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Auto-focus the print window
  printWindow.focus();
}
