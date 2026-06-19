import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  getDashboard,
  getCalendarMonth,
  getTimeline,
  getGallery,
} from '../controllers/entryController.js';

const router = Router();
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/calendar', getCalendarMonth);
router.get('/timeline', getTimeline);
router.get('/gallery', getGallery);
router.get('/', getEntries);
router.get('/:id', getEntry);
router.post('/', upload.single('photo'), createEntry);
router.put('/:id', upload.single('photo'), updateEntry);
router.delete('/:id', deleteEntry);

export default router;
