import { useState } from 'react';
import { printSettings, defaultInvoice } from '../../constants';
import './AdvancedTemplate.css'; // Use the new advanced styles

// Premium "Vyapar/Zoho" Style Invoice
export default function InvoicePreview({ invoice, settings, businessProfile }) {
    if (!invoice) return <div>No Invoice Data</div>;

    // Defensive defaults
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    const taxRate = Number(invoice.taxRate) || 0;
    const discount = Number(invoice.discount) || 0;
    const client = invoice.client || {};

    const subtotal = items.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.price) || 0)), 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax - discount;

    const paperClass = `paper-${settings.paperSize}${settings.orientation === 'landscape' ? '-landscape' : ''}`;

    return (
        <div id="invoice-print-area" className={`invoice-paper ${paperClass}`}>
            <div className="inv-container">

                {/* Header */}
                <header className="inv-header">
                    <div className="inv-logo-section">
                        {businessProfile.logo && (
                            <img src={businessProfile.logo} className="inv-logo" alt="Logo" />
                        )}
                        <div className="inv-company-info">
                            <div className="inv-company-name">{businessProfile.name}</div>
                            <div className="inv-company-address">{businessProfile.address}</div>
                            {businessProfile.gstin && <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>GSTIN: <strong>{businessProfile.gstin}</strong></div>}
                        </div>
                    </div>

                    <div className="inv-meta-section">
                        <div className="inv-title">INVOICE</div>
                        <div className="inv-meta-grid">
                            <div className="inv-meta-label">Invoice No:</div>
                            <div className="inv-meta-value">{invoice.id || 'DRAFT'}</div>

                            <div className="inv-meta-label">Date:</div>
                            <div className="inv-meta-value">{invoice.date}</div>

                            {/* Optional Due Date */}
                            <div className="inv-meta-label">Due Date:</div>
                            <div className="inv-meta-value">{invoice.dueDate || invoice.date}</div>
                        </div>
                    </div>
                </header>

                {/* Addresses */}
                <div className="inv-address-grid">
                    <div className="inv-address-block">
                        <h3>Bill To</h3>
                        <div className="inv-client-name">{client.name || 'Walk-in Customer'}</div>
                        <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: '#475569' }}>
                            {client.address}
                        </div>
                        {client.gstin && <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>GSTIN: {client.gstin}</div>}
                    </div>
                    <div className="inv-address-block">
                        <h3>Ship To</h3>
                        <div className="inv-client-name">{client.name || 'Walk-in Customer'}</div>
                        <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: '#475569' }}>
                            {client.address}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div style={{ flex: 1 }}>
                    <table className="inv-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }} className="text-center">#</th>
                                <th style={{ width: '45%' }}>Item Description</th>
                                <th style={{ width: '10%' }} className="text-right">Qty</th>
                                <th style={{ width: '10%' }} className="text-right">Unit</th>
                                <th style={{ width: '15%' }} className="text-right">Rate</th>
                                <th style={{ width: '15%' }} className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.name}</div>
                                        {item.description && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.description}</div>}
                                    </td>
                                    <td className="text-right">{item.qty}</td>
                                    <td className="text-right" style={{ fontSize: '0.8rem' }}>{item.unit}</td>
                                    <td className="text-right">{Number(item.price).toFixed(2)}</td>
                                    <td className="text-right" style={{ fontWeight: '600' }}>{(item.qty * item.price).toFixed(2)}</td>
                                </tr>
                            ))}
                            {/* Empty rows filler if needed for A4 aesthetic, can be added here */}
                        </tbody>
                    </table>
                </div>

                {/* Footer Layout */}
                <div className="inv-footer-layout">

                    {/* Left: Bank & Notes */}
                    <div className="inv-left-section">
                        <div className="inv-info-box">
                            <div className="inv-info-title">Terms & Conditions</div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                1. Goods once sold will not be taken back.<br />
                                2. Interest @ 18% p.a. will be charged if payment is not made within due date.<br />
                                3. Subject to jurisdiction.
                            </div>
                        </div>

                        <div className="inv-info-box" style={{ marginTop: '20px' }}>
                            <div className="inv-info-title">Bank Details</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 15px', maxWidth: '300px', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748b' }}>Bank Name:</span> <span>HDFC Bank</span>
                                <span style={{ color: '#64748b' }}>A/C No:</span> <span>YOUR-ACC-NO</span>
                                <span style={{ color: '#64748b' }}>IFSC:</span> <span>HDFC0001234</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Totals & Signature */}
                    <div className="inv-right-section">
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
                        <div className="inv-grand-total">
                            <span>Total</span>
                            <span>₹ {total.toFixed(2)}</span>
                        </div>

                        <div className="inv-signature-area">
                            <div className="inv-signature-line"></div>
                            <div className="inv-signature-text">Authorized Signatory</div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
