import { Router } from 'express';
import {
  getStoresController,
  getMyStoresController,
  getStoreByIdController,
  updateStoreStatusController,
} from './store.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

export const router = Router();

router.get('/', getStoresController);
router.get('/my', authMiddleware, getMyStoresController);
router.get('/:id', getStoreByIdController);
router.patch('/:id/status', authMiddleware, updateStoreStatusController);