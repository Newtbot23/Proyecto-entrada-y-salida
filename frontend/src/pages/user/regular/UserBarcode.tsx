import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import styles from './UserBarcode.module.css';
import { apiClient, API_BASE_URL } from '../../../config/api';
import { jsPDF } from 'jspdf';

const UserBarcode: React.FC = () => {
    const { user } = useAuth();

    // The barcode path from DB typically looks like 'usuarios/barcodes/123_456.svg'
    const barcodeUrl = user?.codigo_qr ? `${API_BASE_URL.replace('/api', '')}/storage/${user.codigo_qr}` : null;

    const handleExportPDF = async () => {
        if (!user) return;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Add System Header
        doc.setFillColor(0, 143, 57); // Brand Green
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('SISTEMA DE CONTROL', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Credencial de Acceso Digital', 105, 30, { align: 'center' });

        // User Data
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text(`Usuario: ${user.nombre}`, 20, 60);
        doc.text(`Documento: ${user.id || user.doc || 'N/A'}`, 20, 70);

        // Barcode Title
        doc.setFontSize(12);
        doc.text('CÓDIGO DE BARRAS PARA ESCANEO:', 105, 100, { align: 'center' });

        // Fetch and Add Barcode Image via Base64 Endpoint
        try {
            // Fetch Base64 from backend to solve CORS once and for all
            const response = await apiClient.get<{ success: boolean, base64: string }>('/user/barcode-base64');
            const base64Data = response.base64;

            // If it's SVG, we still need to draw it to canvas because jsPDF addImage 
            // has very limited support for raw SVG base64 in some versions.
            // Converting SVG Base64 to Canvas PNG Base64 is the safest cross-browser path.

            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 1200;
                    canvas.height = 300;
                    if (ctx) {
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    }
                    try {
                        const pngBase64 = canvas.toDataURL('image/png');
                        doc.addImage(pngBase64, 'PNG', 62.5, 110, 85, 22.5);
                        resolve(true);
                    } catch (e) {
                        reject(new Error('Error procesando imagen local.'));
                    }
                };
                img.onerror = () => reject(new Error('Error al decodificar imagen base64.'));
                img.src = base64Data;
            });

        } catch (error: any) {
            console.error('Error adding barcode to PDF:', error);
            doc.setTextColor(255, 0, 0);
            doc.setFontSize(12);
            doc.text('ERROR AL CARGAR CÓDIGO:', 105, 120, { align: 'center' });
            doc.setFontSize(10);
            doc.text(error.message || 'Error de conexión con el servidor', 105, 128, { align: 'center' });
        }

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Este documento es personal e intransferible.', 105, 280, { align: 'center' });
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });

        doc.save(`Codigo_Acceso_${user.id || 'usuario'}.pdf`);
    };

    return (
        <div className={styles.barcodeContainer}>
            <div className={styles.card}>
                <h2 className={styles.title}>Mi Código de Acceso</h2>
                <p className={styles.subtitle}>
                    Presenta este código en los puntos de control para registrar tu entrada o salida.
                </p>

                <div className={styles.barcodeWrapper}>
                    {barcodeUrl ? (
                        <img
                            src={barcodeUrl}
                            alt="Código de Barras del Usuario"
                            className={styles.barcodeImage}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // Prevent loop
                                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="0" y="25" fill="red">Error al cargar código</text></svg>';
                            }}
                        />
                    ) : (
                        <div className={styles.noBarcode}>
                            <p>Aún no tienes un código de barras asignado.</p>
                        </div>
                    )}
                </div>

                {(user?.id || user?.doc) && (
                    <div className={styles.docNumber}>
                        Documento: <strong>{user?.id || user?.doc}</strong>
                    </div>
                )}
            </div>

            {barcodeUrl && (
                <div className={styles.actions}>
                    <button onClick={handleExportPDF} className={styles.pdfBtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Exportar a PDF
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserBarcode;
