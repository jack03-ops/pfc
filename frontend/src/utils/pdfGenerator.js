// Phoenix Fitness Centre - Client-side Vector PDF Invoice Generator
// Generates standard PDF 1.4 documents directly in the browser as Blob and triggers file download.

export function generateInvoicePdfBlob({
  invoiceNo = 'PFC-INV-101',
  clientName = 'Hari Ram Kumar',
  clientId = 'PXM-1001',
  plan = 'Monthly',
  amount = 1000,
  date = new Date().toLocaleDateString('en-IN'),
  phone = '+91 8015552425',
  address = 'Near Temple, Rampur'
}) {
  const safeName = (clientName || 'Gym Member').replace(/[()]/g, '');
  const safeId = (clientId || 'PXM-1001').replace(/[()]/g, '');
  const safeInvoice = (invoiceNo || 'PFC-INV-101').replace(/[()]/g, '');
  const safePhone = (phone || '+91 8015552425').replace(/[()]/g, '');
  const safeAddress = (address || 'Rampur').replace(/[()]/g, '');
  const safePlan = (plan || 'Monthly').replace(/[()]/g, '');
  const numAmount = typeof amount === 'number' ? amount : Number(amount) || 1000;

  const content = `
q
% Red header banner
0.725 0.11 0.11 rg
0 740 612 102 re f

% Header gym title
BT
/F1 22 Tf
1 1 1 rg
50 790 Td
(PHOENIX FITNESS CENTRE) Tj
ET

BT
/F1 10 Tf
1 1 1 rg
50 772 Td
(MODERN GYM & PERSONAL FITNESS ACADEMY | Phone: +91 8015552425) Tj
ET

% Official Receipt Badge Box
0.95 0.98 0.96 rg
0.8 0.9 0.8 RG
1 w
390 755 172 35 re b

BT
/F1 10 Tf
0.08 0.5 0.24 rg
405 776 Td
(STATUS: PAID & VERIFIED) Tj
ET

BT
/F1 9 Tf
0.2 0.2 0.2 rg
405 762 Td
(INVOICE: ${safeInvoice}) Tj
ET

% Member and Bill Info Box
0.97 0.97 0.97 rg
0.85 0.85 0.85 RG
50 620 512 100 re b

BT
/F1 9 Tf
0.4 0.4 0.4 rg
65 700 Td
(BILLED TO MEMBER:) Tj
ET

BT
/F1 13 Tf
0.1 0.1 0.1 rg
65 683 Td
(${safeName}) Tj
ET

BT
/F1 9 Tf
0.3 0.3 0.3 rg
65 667 Td
(Client ID: ${safeId} | Phone: ${safePhone}) Tj
ET

BT
/F1 9 Tf
0.3 0.3 0.3 rg
65 652 Td
(Address: ${safeAddress}) Tj
ET

BT
/F1 9 Tf
0.4 0.4 0.4 rg
360 700 Td
(PAYMENT & ISSUE DETAILS:) Tj
ET

BT
/F1 9 Tf
0.2 0.2 0.2 rg
360 683 Td
(Issue Date: ${date}) Tj
ET

BT
/F1 9 Tf
0.2 0.2 0.2 rg
360 667 Td
(Payment Mode: UPI / Cash / Card) Tj
ET

BT
/F1 9 Tf
0.08 0.5 0.24 rg
360 652 Td
(Verification: Digitally Signed by Admin) Tj
ET

% Table Header Bar
0.92 0.92 0.94 rg
50 580 512 25 re f

BT
/F1 9 Tf
0.2 0.2 0.2 rg
65 590 Td
(DESCRIPTION) Tj
ET

BT
/F1 9 Tf
0.2 0.2 0.2 rg
280 590 Td
(DURATION) Tj
ET

BT
/F1 9 Tf
0.2 0.2 0.2 rg
380 590 Td
(TAX / GST) Tj
ET

BT
/F1 9 Tf
0.2 0.2 0.2 rg
480 590 Td
(AMOUNT) Tj
ET

% Table Row
BT
/F1 10 Tf
0.1 0.1 0.1 rg
65 555 Td
(Gym Membership Fee (${safePlan} Plan)) Tj
ET

BT
/F1 8 Tf
0.4 0.4 0.4 rg
65 542 Td
(Full access to gym floor, cardio, strength equipment) Tj
ET

BT
/F1 9 Tf
0.2 0.2 0.2 rg
280 550 Td
(${safePlan}) Tj
ET

BT
/F1 9 Tf
0.08 0.5 0.24 rg
380 550 Td
(Included 0%) Tj
ET

BT
/F1 10 Tf
0.1 0.1 0.1 rg
480 550 Td
(INR ${numAmount.toLocaleString('en-IN')}) Tj
ET

% Line
0.85 0.85 0.85 RG
50 530 512 0 re S

% Total Box
0.98 0.93 0.93 rg
0.85 0.3 0.3 RG
1 w
50 470 512 45 re b

BT
/F1 10 Tf
0.725 0.11 0.11 rg
65 487 Td
(TOTAL AMOUNT PAID & RECEIVED:) Tj
ET

BT
/F1 14 Tf
0.6 0.05 0.05 rg
420 485 Td
(INR ${numAmount.toLocaleString('en-IN')}) Tj
ET

% Terms and Policy
BT
/F1 9 Tf
0.2 0.2 0.2 rg
50 430 Td
(IMPORTANT GYM GUIDELINES & TERMS:) Tj
ET

BT
/F1 8 Tf
0.4 0.4 0.4 rg
50 412 Td
(1. Operating Hours: Monday to Saturday: 5:00 AM - 10:00 PM. Sunday: 6:00 AM - 12:00 PM.) Tj
ET

BT
/F1 8 Tf
0.4 0.4 0.4 rg
50 398 Td
(2. Please bring a gym towel, proper sports shoes, and a personal water bottle at all times.) Tj
ET

BT
/F1 8 Tf
0.4 0.4 0.4 rg
50 384 Td
(3. Membership is non-refundable and non-transferable.) Tj
ET

BT
/F1 8 Tf
0.4 0.4 0.4 rg
50 370 Td
(4. For any locker or trainer queries, please contact reception desk: +91 8015552425.) Tj
ET

% Footer Stamp
0.95 0.95 0.95 rg
50 290 512 45 re f

BT
/F1 8 Tf
0.3 0.3 0.3 rg
180 312 Td
(OFFICIAL COMPUTER GENERATED TAX INVOICE & RECEIPT) Tj
ET

BT
/F1 8 Tf
0.5 0.5 0.5 rg
180 300 Td
(Phoenix Fitness Centre | Admin: phoenixgym.vkp@gmail.com | Phone: +91 8015552425) Tj
ET
Q
`;

  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(content);
  const streamLength = streamBytes.length;

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream${content}endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
000000${String(300 + streamLength).padStart(4, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF
`;

  return new Blob([encoder.encode(pdfString)], { type: 'application/pdf' });
}

export function downloadInvoicePdf(options) {
  const blob = generateInvoicePdfBlob(options);
  const invoiceNo = options.invoiceNo || 'PFC-INV-101';
  const fileName = `Phoenix_Invoice_${invoiceNo}.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  return { blob, fileName };
}
