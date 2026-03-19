const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Importar rutas
app.use('/api/auth', require('./routes/auth.routes'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: '🚀 API de ISP-Manager funcionando' });
});

// Importar rutas (las crearemos después)
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/users', require('./routes/user.routes'));
// app.use('/api/invoices', require('./routes/invoice.routes'));

// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        await testConnection();
        
        // Sincronizar modelos con la base de datos
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados');
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('✅ Servidor corriendo en http://localhost:');
        });
    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
    }
};

startServer();
