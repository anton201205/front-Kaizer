import { useRef, useState } from 'react';
import type { CartItem } from '../../Services/CartContext';
import '../Checkout/OderConfirmation.css';

interface Props {
  orderId:   number;
  envio:     number;
  district:  string;
  items:     CartItem[];
  payMethod: 'card' | 'qr';
  onClose:   () => void;
}

function formatDate(): string {
  return new Intl.DateTimeFormat('es-PE', {
    day:    '2-digit',
    month:  'long',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function payMethodLabel(m: 'card' | 'qr') {
  return m === 'card' ? 'Tarjeta de crédito/débito' : 'Transferencia bancaria / QR';
}

// Carga dinámica de jsPDF + html2canvas desde CDN
async function loadLibs(): Promise<{ jsPDF: any; html2canvas: any }> {
  // jsPDF
  if (!(window as any).jspdf) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('jsPDF load failed'));
      document.head.appendChild(s);
    });
  }
  // html2canvas
  if (!(window as any).html2canvas) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('html2canvas load failed'));
      document.head.appendChild(s);
    });
  }
  const { jsPDF } = (window as any).jspdf;
  const html2canvas = (window as any).html2canvas;
  return { jsPDF, html2canvas };
}

async function generatePDF(
  element: HTMLElement,
  filename: string,
  mode: 'download' | 'preview' | 'both',
): Promise<void> {
  const { jsPDF, html2canvas } = await loadLibs();

  // Capturamos en alta resolución con fondo blanco para impresión
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Ajustamos la imagen para que ocupe el ancho completo con margen
  const margin = 12; // mm
  const imgW = pageW - margin * 2;
  const imgH = (canvas.height * imgW) / canvas.width;

  // Si el contenido es más alto que la página, reducimos para que quepa
  const finalH = imgH > pageH - margin * 2 ? pageH - margin * 2 : imgH;
  const finalW = (canvas.width * finalH) / canvas.height;
  const offsetX = (pageW - finalW) / 2;

  pdf.addImage(imgData, 'PNG', offsetX, margin, finalW, finalH);

  if (mode === 'download' || mode === 'both') {
    pdf.save(filename);
  }

  if (mode === 'preview' || mode === 'both') {
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

export default function OrderConfirmation({
  orderId, envio, district, items, payMethod, onClose,
}: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const dateStr = formatDate();
  const filename = `boleta-kaizer-${String(orderId).padStart(6, '0')}.pdf`;

  const [pdfError, setPdfError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const computedSubtotal = Number((itemsTotal / 1.18).toFixed(2));
  const computedIgv = Number((itemsTotal - computedSubtotal).toFixed(2));
  const computedTotal = Number((itemsTotal + envio).toFixed(2));

  const handleGenerate = async (mode: 'download' | 'preview') => {
    if (!receiptRef.current) return;
    setPdfLoading(true);
    setPdfError('');

    try {
      await generatePDF(receiptRef.current, filename, mode);
    } catch (err) {
      console.error('PDF error:', err);
      setPdfError('No se pudo generar el PDF. Intenta nuevamente.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownload = () => void handleGenerate('download');

  const handlePreview = () => void handleGenerate('preview');

  return (
    <div className="oc-wrapper">

      {/* Área que se captura para el PDF — fondo blanco para impresión */}
      <div className="oc-receipt oc-print-surface" ref={receiptRef} id="printable-receipt">

        <div className="oc-header">
          <div className="oc-logo">
            <span className="oc-logo-mark">K</span>
            <span className="oc-logo-name">KAIZER STORE</span>
          </div>
          <div className="oc-company-info">
            <p>RUC: 20123456789</p>
            <p>Jr. Comercio 123, Lima, Perú</p>
            <p>ventas@kaizerstore.pe</p>
          </div>
        </div>

        <div className="oc-doc-type">
          BOLETA DE VENTA ELECTRÓNICA
        </div>

        <div className="oc-order-meta">
          <div className="oc-meta-group">
            <span className="oc-meta-label">N° Orden</span>
            <span className="oc-meta-value oc-order-id">#{String(orderId).padStart(6, '0')}</span>
          </div>
          <div className="oc-meta-group">
            <span className="oc-meta-label">Fecha y hora</span>
            <span className="oc-meta-value">{dateStr}</span>
          </div>
          <div className="oc-meta-group">
            <span className="oc-meta-label">Método de pago</span>
            <span className="oc-meta-value">{payMethodLabel(payMethod)}</span>
          </div>
          <div className="oc-meta-group">
            <span className="oc-meta-label">Distrito de entrega</span>
            <span className="oc-meta-value">{district}</span>
          </div>
        </div>

        <div className="oc-divider" />

        <table className="oc-items-table">
          <thead>
            <tr>
              <th className="oc-th-desc">Descripción</th>
              <th className="oc-th-qty">Cant.</th>
              <th className="oc-th-price">P. Unit.</th>
              <th className="oc-th-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="oc-td-desc">
                  <span className="oc-item-name">{item.name}</span>
                  {item.category && (
                    <span className="oc-item-cat">{item.category}</span>
                  )}
                </td>
                <td className="oc-td-qty">{item.quantity}</td>
                <td className="oc-td-price">S/ {item.price.toFixed(2)}</td>
                <td className="oc-td-total">S/ {(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="oc-divider" />

        <div className="oc-totals">
          <div className="oc-total-row">
            <span>Subtotal (sin IGV)</span>
            <span>S/ {computedSubtotal.toFixed(2)}</span>
          </div>
          <div className="oc-total-row">
            <span>IGV 18%</span>
            <span>S/ {computedIgv.toFixed(2)}</span>
          </div>
          <div className="oc-total-row">
            <span>Costo de envío ({district})</span>
            <span>{envio === 0 ? 'S/ 0.00 (Gratis)' : `S/ ${envio.toFixed(2)}`}</span>
          </div>
          <div className="oc-total-row oc-total-final">
            <span>TOTAL PAGADO</span>
            <strong>S/ {computedTotal.toFixed(2)}</strong>
          </div>
        </div>

        <div className="oc-divider" />

        <div className="oc-footer">
          <p>Este documento es una boleta de venta electrónica simulada con fines académicos.</p>
          <p>Emitido bajo el marco del IGV según Ley N° 29666 — Tasa: 18%</p>
          <p className="oc-footer-thanks">¡Gracias por tu compra en Kaizer Store!</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="oc-actions no-print">

        <div className="oc-success-badge">
          <span className="oc-checkmark">✓</span>
          Pago confirmado
        </div>

        {/* Indicador de generación automática */}
        <p className="oc-pdf-status">
          {pdfLoading ? 'Generando boleta PDF…' : 'Presiona un botón para descargar o ver la boleta.'}
        </p>
        {pdfError && (
          <p className="oc-pdf-status oc-pdf-err">{pdfError}</p>
        )}

        <div className="oc-action-buttons">
          <button
            className="oc-btn-print"
            onClick={handleDownload}
            title="Descargar PDF"
          >
            ↓ Descargar PDF
          </button>

          <button
            className="oc-btn-preview"
            onClick={handlePreview}
            title="Abrir en nueva pestaña"
          >
            ↗ Ver boleta
          </button>

          <button className="oc-btn-close" onClick={onClose}>
            Volver a la tienda
          </button>
        </div>

      </div>
    </div>
  );
}