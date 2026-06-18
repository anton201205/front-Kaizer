import { useRef } from 'react';
import type { CartItem } from '../../Services/CartContext';
import '../Checkout/OderConfirmation.css';

interface Props {
  orderId:    number;
  subtotal:   number;
  igv:        number;
  envio:      number;
  total:      number;
  district:   string;
  items:      CartItem[];
  payMethod:  'card' | 'qr';
  onClose:    () => void;
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

export default function OrderConfirmation({
  orderId, subtotal, igv, envio, total, district, items, payMethod, onClose,
}: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const dateStr = formatDate();

const handlePrint = () => {
  const receiptEl = document.getElementById('printable-receipt');
  if (!receiptEl) return;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Boleta #${String(orderId).padStart(6, '0')} - Kaizer Store</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; background: #fff; color: #000; padding: 2rem; }
        .oc-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .oc-logo { display: flex; align-items: center; gap: 0.5rem; }
        .oc-logo-mark { font-size: 2rem; font-weight: bold; }
        .oc-logo-name { font-size: 1.2rem; font-weight: bold; }
        .oc-company-info { text-align: right; font-size: 0.8rem; line-height: 1.6; }
        .oc-doc-type { text-align: center; font-weight: bold; font-size: 1rem; border: 2px solid #000; padding: 0.4rem; margin: 1rem 0; }
        .oc-order-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; }
        .oc-meta-label { font-size: 0.7rem; text-transform: uppercase; color: #555; display: block; }
        .oc-meta-value { font-weight: bold; font-size: 0.9rem; }
        .oc-order-id { font-size: 1.1rem; }
        .oc-divider { border-top: 1px dashed #000; margin: 1rem 0; }
        .oc-items-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .oc-items-table th { border-bottom: 2px solid #000; padding: 0.4rem; text-align: left; }
        .oc-items-table td { padding: 0.4rem; border-bottom: 1px solid #ddd; }
        .oc-th-qty, .oc-td-qty, .oc-th-price, .oc-td-price, .oc-th-total, .oc-td-total { text-align: right; }
        .oc-item-cat { display: block; font-size: 0.75rem; color: #666; }
        .oc-totals { margin-left: auto; width: 60%; }
        .oc-total-row { display: flex; justify-content: space-between; padding: 0.25rem 0; font-size: 0.85rem; }
        .oc-total-final { font-weight: bold; font-size: 1rem; border-top: 2px solid #000; margin-top: 0.5rem; padding-top: 0.5rem; }
        .oc-footer { text-align: center; font-size: 0.75rem; color: #555; line-height: 1.8; margin-top: 1rem; }
        .oc-footer-thanks { font-weight: bold; color: #000; margin-top: 0.5rem; }
      </style>
    </head>
    <body>
      ${receiptEl.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
};

  return (
    <div className="oc-wrapper">
      {/* Área imprimible */}
      <div className="oc-receipt" ref={receiptRef} id="printable-receipt">

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
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="oc-total-row">
            <span>IGV 18%</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
          <div className="oc-total-row">
            <span>Costo de envío ({district})</span>
            <span>{envio === 0 ? 'S/ 0.00 (Gratis)' : `S/ ${envio.toFixed(2)}`}</span>
          </div>
          <div className="oc-total-row oc-total-final">
            <span>TOTAL PAGADO</span>
            <strong>S/ {total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="oc-divider" />

        <div className="oc-footer">
          <p>Este documento es una boleta de venta electrónica simulada con fines académicos.</p>
          <p>Emitido bajo el marco del IGV según Ley N° 29666 — Tasa: 18%</p>
          <p className="oc-footer-thanks">¡Gracias por tu compra en Kaizer Store!</p>
        </div>
      </div>

      <div className="oc-actions no-print">
        <div className="oc-success-badge">
          <span className="oc-checkmark">✓</span>
          Pago confirmado
        </div>

        <div className="oc-action-buttons">
          <button className="oc-btn-print" onClick={handlePrint}>
            Imprimir / Guardar PDF
          </button>
          <button className="oc-btn-close" onClick={onClose}>
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}