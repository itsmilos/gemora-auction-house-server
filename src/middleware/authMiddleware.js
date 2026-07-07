import jwt from 'jsonwebtoken';

export async function AuthMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            req.user = decoded;
            next();
        })
    } catch (error) {
        return res.status(500).json({ message: 'Error occurred while validating token' });
    }
}
