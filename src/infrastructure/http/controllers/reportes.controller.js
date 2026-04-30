const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Asegurar que la carpeta reports existe
const reportsDir = path.join(__dirname, '../../../../reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// Generar reporte de clientes en PDF
exports.generarReporteClientes = async (req, res) => {
    try {
        const { clientes, titulo } = req.body;
        const fecha = new Date().toISOString().split('T')[0];
        const timestamp = Date.now();
        const filename = `clientes_${fecha}_${timestamp}.pdf`;
        const filepath = path.join(reportsDir, filename);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const writeStream = fs.createWriteStream(filepath);
        doc.pipe(writeStream);

        // Título
        doc.fontSize(18).font('Helvetica-Bold').text(titulo || 'Reporte de Clientes - ISP-Manager', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Preparar datos para la tabla
        const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Ciudad', 'Plan', 'Estado'];
        const rows = clientes.map(c => [
            c.id.toString(),
            c.nombre || '',
            c.email || '',
            c.telefono || 'N/A',
            c.ciudad || 'N/A',
            c.plan?.nombre || 'Sin plan',
            c.activo === 1 || c.activo === true ? 'Activo' : 'Inactivo'
        ]);

        // Configuración de la tabla
        const tableTop = doc.y;
        const colWidths = [30, 70, 90, 60, 60, 70, 50];
        let startX = 50;
        let currentY = tableTop;

        // Dibujar encabezados con fondo
        headers.forEach((header, i) => {
            doc.rect(startX, currentY, colWidths[i], 20).fill('#2c3e50');
            doc.fillColor('white')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(header, startX + 5, currentY + 5, { width: colWidths[i] - 10, align: 'center' });
            doc.fillColor('black');
            startX += colWidths[i];
        });

        currentY += 20;
        startX = 50;

        // Dibujar filas
        rows.forEach((row, rowIndex) => {
            // Color alternado para filas
            if (rowIndex % 2 === 0) {
                doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), 18).fill('#f8f9fa');
                doc.fillColor('black');
            }

            row.forEach((cell, i) => {
                doc.fontSize(8)
                   .font('Helvetica')
                   .text(cell, startX + 3, currentY + 3, { width: colWidths[i] - 6, align: 'left' });
                startX += colWidths[i];
            });

            // Dibujar borde inferior
            doc.rect(50, currentY, colWidths.reduce((a, b) => a + b, 0), 18).stroke();

            currentY += 18;
            startX = 50;

            // Nueva página si es necesario
            if (currentY > 750) {
                doc.addPage();
                currentY = 50;
                startX = 50;
                
                // Volver a dibujar encabezados en la nueva página
                headers.forEach((header, i) => {
                    doc.rect(startX, currentY, colWidths[i], 20).fill('#2c3e50');
                    doc.fillColor('white').text(header, startX + 5, currentY + 5, { width: colWidths[i] - 10, align: 'center' });
                    doc.fillColor('black');
                    startX += colWidths[i];
                });
                currentY += 20;
                startX = 50;
            }
        });

        doc.end();

        writeStream.on('finish', () => {
            res.json({
                success: true,
                message: 'PDF generado correctamente',
                filename: filename,
                url: `/reports/${filename}`
            });
        });

        writeStream.on('error', (error) => {
            console.error('Error escribiendo PDF:', error);
            res.status(500).json({ success: false, message: error.message });
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generar reporte de facturas en PDF
exports.generarReporteFacturas = async (req, res) => {
    try {
        const { facturas, titulo } = req.body;
        const fecha = new Date().toISOString().split('T')[0];
        const timestamp = Date.now();
        const filename = `facturas_${fecha}_${timestamp}.pdf`;
        const filepath = path.join(reportsDir, filename);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const writeStream = fs.createWriteStream(filepath);
        doc.pipe(writeStream);

        // Título
        doc.fontSize(18).font('Helvetica-Bold').text(titulo || 'Reporte de Facturas - ISP-Manager', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Preparar datos para la tabla
        const headers = ['ID', 'Cliente', 'Monto', 'Estado', 'Emisión', 'Vencimiento'];
        const rows = facturas.map(f => [
            f.id.toString(),
            f.cliente || 'N/A',
            `$${parseFloat(f.monto).toFixed(2)}`,
            f.estado === 'pagada' ? 'Pagada' : 'Pendiente',
            new Date(f.fecha_emision).toLocaleDateString(),
            new Date(f.fecha_vencimiento).toLocaleDateString()
        ]);

        // Configuración de la tabla
        const colWidths = [40, 100, 70, 60, 70, 70];
        let startX = 50;
        let currentY = doc.y;

        // Dibujar encabezados con fondo
        headers.forEach((header, i) => {
            doc.rect(startX, currentY, colWidths[i], 20).fill('#2c3e50');
            doc.fillColor('white')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(header, startX + 5, currentY + 5, { width: colWidths[i] - 10, align: 'center' });
            doc.fillColor('black');
            startX += colWidths[i];
        });

        currentY += 20;
        startX = 50;

        // Dibujar filas
        rows.forEach((row, rowIndex) => {
            // Color alternado para filas
            if (rowIndex % 2 === 0) {
                doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), 18).fill('#f8f9fa');
                doc.fillColor('black');
            }

            row.forEach((cell, i) => {
                doc.fontSize(8)
                   .font('Helvetica')
                   .text(cell, startX + 3, currentY + 3, { width: colWidths[i] - 6, align: 'left' });
                startX += colWidths[i];
            });

            // Dibujar borde inferior
            doc.rect(50, currentY, colWidths.reduce((a, b) => a + b, 0), 18).stroke();

            currentY += 18;
            startX = 50;

            // Nueva página si es necesario
            if (currentY > 750) {
                doc.addPage();
                currentY = 50;
                startX = 50;
                
                // Volver a dibujar encabezados en la nueva página
                headers.forEach((header, i) => {
                    doc.rect(startX, currentY, colWidths[i], 20).fill('#2c3e50');
                    doc.fillColor('white').text(header, startX + 5, currentY + 5, { width: colWidths[i] - 10, align: 'center' });
                    doc.fillColor('black');
                    startX += colWidths[i];
                });
                currentY += 20;
                startX = 50;
            }
        });

        doc.end();

        writeStream.on('finish', () => {
            res.json({
                success: true,
                message: 'PDF generado correctamente',
                filename: filename,
                url: `/reports/${filename}`
            });
        });

        writeStream.on('error', (error) => {
            console.error('Error escribiendo PDF:', error);
            res.status(500).json({ success: false, message: error.message });
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};