const bcrypt = require('bcryptjs');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('Contraseña:', password);
    console.log('Hash GENERADO (60 caracteres):');
    console.log(hash);
    console.log('Longitud del hash:', hash.length);
});