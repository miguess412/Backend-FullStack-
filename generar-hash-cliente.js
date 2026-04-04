const bcrypt = require('bcryptjs');

const password = 'cliente123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('Contraseña:', password);
    console.log('Hash generado:');
    console.log(hash);
    console.log('Longitud:', hash.length);
});