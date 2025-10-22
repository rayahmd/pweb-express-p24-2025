import { Router } from 'express';
import {
  createBook,
  getAllBooks,
  getBooksByGenre,
  getBookById,
  updateBook,
  deleteBook
} from '../modules/bookControllers';

const router = Router();

router.post('/', createBook);
router.get('/', getAllBooks);
router.get('/genre/:genreId', getBooksByGenre);
router.get('/:id', getBookById);
router.patch('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;