import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Job, ExtraCharge } from './types';

export async function generateReceiptPDF(
  job: Job,
  extraCharges: ExtraCharge[],
  companyInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 50;

  page.drawText(companyInfo.name, { x: 50, y, size: 16, font: fontBold, color: rgb(0, 0, 0) });
  y -= 20;

  if (companyInfo.address) {
    page.drawText(companyInfo.address, { x: 50, y, size: 10, font });
    y -= 15;
  }

  page.drawText(companyInfo.phone, { x: 50, y, size: 10, font });
  y -= 15;
  page.drawText(companyInfo.email, { x: 50, y, size: 10, font });
  y -= 40;

  page.drawText('EXTRA WORK RECEIPT', { x: 50, y, size: 18, font: fontBold });
  y -= 40;

  page.drawText('Customer Information', { x: 50, y, size: 12, font: fontBold });
  y -= 20;
  page.drawText(`Name: ${job.customerName}`, { x: 50, y, size: 10, font });
  y -= 15;
  page.drawText(`Email: ${job.customerEmail}`, { x: 50, y, size: 10, font });
  y -= 15;

  if (job.customerPhone) {
    page.drawText(`Phone: ${job.customerPhone}`, { x: 50, y, size: 10, font });
    y -= 15;
  }

  if (job.siteAddress) {
    page.drawText(`Site: ${job.siteAddress}`, { x: 50, y, size: 10, font });
    y -= 15;
  }

  y -= 20;

  page.drawText('Job Information', { x: 50, y, size: 12, font: fontBold });
  y -= 20;
  page.drawText(`Job: ${job.title}`, { x: 50, y, size: 10, font });
  y -= 15;

  if (job.initialEstimateAmount) {
    page.drawText(`Initial Estimate: $${job.initialEstimateAmount.toFixed(2)}`, { x: 50, y, size: 10, font });
    y -= 15;
  }

  const receiptDate = new Date().toLocaleDateString('en-US');
  page.drawText(`Receipt Date: ${receiptDate}`, { x: 50, y, size: 10, font });
  y -= 30;

  page.drawText('Extra Charges', { x: 50, y, size: 12, font: fontBold });
  y -= 20;

  page.drawText('Description', { x: 50, y, size: 10, font: fontBold });
  page.drawText('Category', { x: 300, y, size: 10, font: fontBold });
  page.drawText('Amount', { x: 480, y, size: 10, font: fontBold });
  y -= 15;

  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0, 0, 0) });
  y -= 15;

  let subtotal = 0;
  let totalTax = 0;

  for (const charge of extraCharges) {
    const maxDescLength = 40;
    const desc = charge.description.length > maxDescLength ? charge.description.substring(0, maxDescLength) + '...' : charge.description;

    page.drawText(desc, { x: 50, y, size: 9, font });
    page.drawText(charge.category || '', { x: 300, y, size: 9, font });
    page.drawText(`$${charge.amount.toFixed(2)}`, { x: 480, y, size: 9, font });

    subtotal += charge.amount;
    if (charge.taxAmount) totalTax += charge.taxAmount;

    y -= 15;
    if (y < 100) y = height - 50;
  }

  y -= 10;

  page.drawLine({ start: { x: 400, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0, 0, 0) });
  y -= 20;

  page.drawText('Subtotal:', { x: 400, y, size: 10, font: fontBold });
  page.drawText(`$${subtotal.toFixed(2)}`, { x: 480, y, size: 10, font });
  y -= 15;

  if (totalTax > 0) {
    page.drawText('Tax:', { x: 400, y, size: 10, font: fontBold });
    page.drawText(`$${totalTax.toFixed(2)}`, { x: 480, y, size: 10, font });
    y -= 15;
  }

  const total = subtotal + totalTax;
  page.drawText('Total:', { x: 400, y, size: 12, font: fontBold });
  page.drawText(`$${total.toFixed(2)}`, { x: 480, y, size: 12, font: fontBold });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
