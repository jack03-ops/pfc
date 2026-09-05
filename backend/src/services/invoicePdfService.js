// Pure Node.js Standard PDF Generator for Phoenix Fitness Centre Invoices
// Zero external dependencies - 100% compatible with Vercel Serverless

export function generateInvoicePdfBuffer({ invoiceNo, clientName, clientId, plan, amount, date, phone, address }) {
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
(INVOICE: ${invoiceNo}) Tj
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
65 682 Td
(${clientName}) Tj
ET

BT
/F1 9 Tf
0.3 0.3 0.3 rg
65 666 Td
(Member ID: ${clientId}  |  Address: ${address || 'Rampur'}) Tj
ET

BT
/F1 9 Tf
0.3 0.3 0.3 rg
65 650 Td
(Phone: ${phone || '+91 8015552425'}  |  Date: ${date}) Tj
ET

BT
/F1 9 Tf
0.4 0.4 0.4 rg
370 700 Td
(PAYMENT METRICS:) Tj
ET

BT
/F1 10 Tf
0.1 0.1 0.1 rg
370 682 Td
(Mode: UPI   |   Period: ${plan} Plan) Tj
ET

BT
/F1 9 Tf
0.3 0.3 0.3 rg
370 666 Td
(Issued By: Phoenix Admin Desk) Tj
ET

% Table Header
0.9 0.92 0.94 rg
50 580 512 25 re f

BT
/F1 10 Tf
0.2 0.2 0.2 rg
65 588 Td
(Description) Tj
250 588 Td
(Duration) Tj
360 588 Td
(Tax / GST) Tj
460 588 Td
(Amount) Tj
ET

% Table Row
BT
/F1 10 Tf
0.1 0.1 0.1 rg
65 550 Td
(Gym Membership Fee - Full Access) Tj
250 550 Td
(${plan}) Tj
360 550 Td
(Included 0%) Tj
460 550 Td
(Rs. ${amount}) Tj
ET

% Separator line
0.8 0.8 0.8 RG
50 535 512 0 re S

% Total Box
0.99 0.95 0.95 rg
0.9 0.7 0.7 RG
50 460 512 50 re b

BT
/F1 11 Tf
0.7 0.1 0.1 rg
70 482 Td
(TOTAL AMOUNT RECEIVED) Tj
ET

BT
/F1 16 Tf
0.7 0.1 0.1 rg
440 480 Td
(Rs. ${amount}) Tj
ET

% Footer
BT
/F1 9 Tf
0.5 0.5 0.5 rg
50 410 Td
(Thank you for training with Phoenix Fitness Centre! Keep pushing your limits.) Tj
ET

BT
/F1 8 Tf
0.6 0.6 0.6 rg
50 395 Td
(Computer generated official tax invoice & receipt. No physical signature required.) Tj
ET

Q
`;

  const streamLength = Buffer.byteLength(content, 'utf-8');

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

  return Buffer.from(pdfString, 'utf-8');
}
