const paypal = require('@paypal/checkout-server-sdk');
const { Invoice, Client, User } = require('../../../domain/entities');
const logger = require('../../http/middlewares/logger');

// Configurar el entorno de PayPal
function environment() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
    return new paypal.core.PayPalHttpClient(environment());
}

// Crear una orden de pago
async function createOrder(monto, facturaId) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: monto.toString()
            },
            reference_id: facturaId.toString(),
            description: `Pago de factura ISP-Manager #${facturaId}`
        }],
        application_context: {
            brand_name: 'ISP-Manager',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: 'http://localhost:4200/pago-retorno',
            cancel_url: 'http://localhost:4200/pago-cancelado'
        }
    });

    const order = await client().execute(request);
    return order;
}

// Capturar el pago después de aprobación
async function captureOrder(orderId) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const capture = await client().execute(request);
    return capture;
}

// Obtener detalles de la orden
async function getOrder(orderId) {
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const order = await client().execute(request);
    return order;
}

// ============================================
// CONTROLADORES
// ============================================

// Crear orden de pago para una factura
exports.crearOrdenPago = async (req, res) => {
    try {
        const { facturaId } = req.body;
        const userId = req.userId;

        logger.info(`Usuario ${userId} solicita pago para factura ${facturaId}`);

        // Verificar que la factura existe
        const factura = await Invoice.findByPk(facturaId, {
            include: [{
                model: Client,
                include: [{
                    model: User,
                    where: { id: userId }
                }]
            }]
        });

        if (!factura) {
            logger.warn(`Factura ${facturaId} no encontrada`);
            return res.status(404).json({ message: 'Factura no encontrada' });
        }

        if (factura.estado === 'pagada') {
            logger.warn(`Factura ${facturaId} ya está pagada`);
            return res.status(400).json({ message: 'La factura ya está pagada' });
        }

        // Crear orden en PayPal
        const order = await createOrder(factura.monto, facturaId);
        
        const approvalUrl = order.result.links.find(link => link.rel === 'approve').href;
        
        logger.info(`Orden PayPal creada: ${order.result.id} para factura ${facturaId}`);

        res.json({
            success: true,
            orderId: order.result.id,
            approvalUrl: approvalUrl,
            facturaId: facturaId
        });

    } catch (error) {
        logger.error('Error creando orden PayPal:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al procesar el pago', 
            error: error.message 
        });
    }
};

// Capturar pago después de aprobación
exports.capturarPago = async (req, res) => {
    try {
        console.log('===== CAPTURAR PAGO =====');
        console.log('Body recibido:', req.body);
        
        const { orderId } = req.body;
        console.log('orderId extraído:', orderId);
        
        const userId = req.userId;
        console.log('userId:', userId);

        if (!orderId) {
            console.log('ERROR: orderId no encontrado');
            return res.status(400).json({ message: 'orderId es requerido' });
        }

        // Obtener detalles de la orden
        console.log('Consultando PayPal - getOrder...');
        const order = await getOrder(orderId);
        console.log('Orden obtenida:', order.result.id);
        
        const facturaId = order.result.purchase_units[0].reference_id;
        console.log('facturaId extraída:', facturaId);
        
        if (!facturaId) {
            console.log('ERROR: No se pudo identificar facturaId');
            return res.status(400).json({ message: 'No se pudo identificar la factura' });
        }

        // Verificar la factura
        console.log('Buscando factura en BD...');
        const factura = await Invoice.findByPk(facturaId, {
            include: [{
                model: Client,
                include: [{
                    model: User,
                    where: { id: userId }
                }]
            }]
        });

        if (!factura) {
            console.log('ERROR: Factura no encontrada en BD');
            return res.status(404).json({ message: 'Factura no encontrada' });
        }
        console.log('Factura encontrada, estado actual:', factura.estado);

        if (factura.estado === 'pagada') {
            console.log('ERROR: Factura ya está pagada');
            return res.status(400).json({ message: 'La factura ya está pagada' });
        }

        // Capturar el pago
        console.log('Capturando pago en PayPal...');
        const capture = await captureOrder(orderId);
        console.log('Pago capturado:', capture.result.id);

        // Actualizar el estado de la factura
        await factura.update({
            estado: 'pagada',
            fecha_pago: new Date()
        });
        console.log('Factura actualizada a pagada');

        logger.info(`Pago capturado: orden ${orderId}, factura ${facturaId}`);

        res.json({
            success: true,
            message: 'Pago realizado exitosamente',
            captureId: capture.result.id,
            facturaId: facturaId
        });

    } catch (error) {
        console.error('Error capturando pago PayPal:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Error al confirmar el pago', 
            error: error.message 
        });
    }
};