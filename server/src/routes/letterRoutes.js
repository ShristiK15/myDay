import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getLetters,
  getLetterById,
  createLetter,
  updateLetter,
  sealLetter,
  openLetter,
  deleteLetter,
} from '../controllers/letterController.js';

const router = Router();
router.use(protect);

router.get('/', getLetters);
router.get('/:id', getLetterById);
router.post('/', createLetter);
router.put('/:id', updateLetter);
router.post('/:id/seal', sealLetter);
router.post('/:id/open', openLetter);
router.delete('/:id', deleteLetter);

export default router;