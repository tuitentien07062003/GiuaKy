import { Router } from 'express';
import * as cartController from '../controllers/cartController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

router.get('/cart', verifyToken, cartController.getCart);
router.post('/add', verifyToken, cartController.addToCart);
router.post('/checkout', verifyToken, cartController.checkout);

export default router;