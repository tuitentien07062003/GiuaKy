import { Router } from 'express';
import { 
    getCategories, 
    getMenuItems, 
    getMenuItemById 
} from '../controllers/foodController.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/menu-items/category/:categoryId', getMenuItems);
router.get('/menu-items/:id', getMenuItemById);

export default router;