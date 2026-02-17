export const defaultInvoice = {
    id: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    client: {
        name: '',
        address: '',
        email: '',
        phone: '',
        gstin: ''
    },
    items: [
        { id: 1, name: '', description: '', hsn: '', qty: 1, unit: 'KG', price: 0 }
    ],
    taxRate: 18,
    discount: 0,
    notes: '',
    terms: ''
};

export const businessProfile = {
    name: "Rasys Billing",
    address: "",
    phone: "",
    email: "",
    gstin: "",
    logo: null
};

export const printSettings = {
    paperSize: 'A4', // 'A4', 'A5'
    orientation: 'portrait', // 'portrait', 'landscape'
    showBankDetails: true,
    showSignature: true
};
export const zylkerTheme = { accent: '#b45309', text: '#1f2937' };
