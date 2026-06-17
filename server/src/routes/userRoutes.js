import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  updateProfile,
  changePassword,
  exportJSON,
  exportPDF,
  deleteAccount,
} from '../controllers/userController.js';

const router = Router();
router.use(protect);

router.put('/profile', upload.single('avatar'), updateProfile);
router.put('/password', changePassword);
router.get('/export/json', exportJSON);
router.get('/export/pdf', exportPDF);
router.delete('/account', deleteAccount);

export default router;
