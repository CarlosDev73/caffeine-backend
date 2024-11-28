import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado. Acceso denegado.' });
    }

    // Verifica el token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }

        // Almacena los datos decodificados en la solicitud
        req.user = decoded;
        next();
    });
};
