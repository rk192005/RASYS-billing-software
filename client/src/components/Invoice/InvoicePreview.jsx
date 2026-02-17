import { useState } from 'react';
import { printSettings, defaultInvoice } from '../../constants';
import './AdvancedTemplate.css'; // Use the new advanced styles

// Replicating "Zylker Design Labs" Style
export default function InvoicePreview({ invoice, settings, businessProfile }) {
    const { items, taxRate, discount } = invoice;
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax - discount;

    const paperClass = `paper-${settings.paperSize}${settings.orientation === 'landscape' ? '-landscape' : ''}`;

    return (
        <div id="invoice-print-area" className={`invoice-paper ${paperClass}`}>

            {/* Header: Logo, Company, Title, Balance */}
            <header className="inv-header">
                <div>
                    {/* Logo Circle */}
                    <div className="inv-logo-container" style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: businessProfile.logo ? 'transparent' : 'var(--invoice-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '2rem', fontWeight: 'bold'
                    }}>
                        {businessProfile.logo ? (
                            <img src={businessProfile.logo} className="inv-logo" alt="Logo" />
                        ) : (
                            <span>{businessProfile.name?.charAt(0) || 'R'}</span>
                        )}
                    </div>

                    <div className="inv-company-details">
                        <div className="inv-company-name">{businessProfile.name}</div>
                        <div className="inv-address" style={{ whiteSpace: 'pre-line' }}>
                            {businessProfile.address}
                        </div>
                    </div>
                </div>

                <div className="inv-meta-block" style={{ textAlign: 'right' }}>
                    <h1 className="inv-title">INVOICE</h1>
                    <div className="inv-number"># {invoice.id || 'DRAFT'}</div>

                    <div style={{ marginTop: '2rem' }}>
                        <div className="inv-balance-label">Balance Due</div>
                        <div className="inv-balance-amount">₹ {total.toFixed(2)}</div>
                    </div>
                </div>
            </header>

            {/* Bill To / Ship To / Date Grid */}
            <div className="inv-grid">
                <div>
                    <div className="inv-label">Bill To</div>
                    <div className="inv-client-name">{invoice.client.name}</div>
                    <div className="inv-address" style={{ whiteSpace: 'pre-line' }}>
                        {invoice.client.address}
                    </div>
                </div>

                {/* Optional Ship To (using Bill To for now if no separate field, keeping UI consistent) */}
                <div>
                    <div className="inv-label">Ship To</div>
                    <div className="inv-client-name">{invoice.client.name}</div>
                    <div className="inv-address" style={{ whiteSpace: 'pre-line' }}>
                        {invoice.client.address}
                    </div>
                </div>

                <div className="inv-dates">
                    <div className="inv-date-row">
                        <span className="inv-date-label">Invoice Date:</span>
                        <span className="inv-date-value">{invoice.date}</span>
                    </div>
                    <div className="inv-date-row">
                        <span className="inv-date-label">Terms:</span>
                        <span className="inv-date-value">{invoice.terms || 'Due on Receipt'}</span>
                    </div>
                    <div className="inv-date-row">
                        <span className="inv-date-label">Due Date:</span>
                        <span className="inv-date-value">{invoice.dueDate || invoice.date}</span>
                    </div>
                </div>
            </div>

            {/* Items Table - Clean and Bold Header */}
            <table className="inv-table">
                <thead>
                    <tr>
                        <th style={{ borderRadius: '4px 0 0 4px' }}>#</th>
                        <th>Item & Description</th>
                        <th style={{ textAlign: 'right' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Rate</th>
                        <th style={{ textAlign: 'right', borderRadius: '0 4px 4px 0' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td style={{ width: '5%' }}>{index + 1}</td>
                            <td style={{ width: '50%' }}>
                                <span className="inv-item-name">{item.name}</span>
                                <span className="inv-item-desc">{item.description}</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>{item.qty} {item.unit}</td>
                            <td style={{ textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{(item.qty * item.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '40%' }}>
                    <div className="inv-total-row">
                        <span>Sub Total</span>
                        <span>{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="inv-total-row">
                        <span>Tax ({taxRate}%)</span>
                        <span>{tax.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="inv-total-row" style={{ color: '#ef4444' }}>
                            <span>Discount</span>
                            <span>- {discount.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Grand Total */}
                    <div className="inv-total-row final" style={{ borderTop: '1px solid #e5e7eb', marginTop: '1rem', paddingTop: '1rem', fontSize: '1.2rem' }}>
                        <span>Total</span>
                        <span>₹ {total.toFixed(2)}</span>
                    </div>

                    {/* Balance Due Bar - The signature "Zoho/Zylker" look */}
                    <div className="inv-balance-bar" style={{ marginTop: '1.5rem', background: 'var(--invoice-accent)', color: 'white', padding: '0.75rem 1rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600' }}>Balance Due</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>₹ {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="inv-footer">
                <div style={{ marginBottom: '2rem' }}>
                    <div className="inv-notes-title">Notes</div>
                    <div className="inv-notes-text">Thanks for your business.</div>
                </div>
                <div>
                    <div className="inv-notes-title">Terms & Conditions</div>
                    <div className="inv-notes-text">
                        All payments must be made in full before the commencement of any design work.
                    </div>
                </div>
            </div>

        </div>
    );
}
