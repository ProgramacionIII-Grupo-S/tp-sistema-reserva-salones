import express from 'express';
import {
  getSalones,
  getSalon,
  createSalon,
  updateSalon,
  deleteSalon
} from '../controllers/salonesControlador.js';

const router = express.Router();

router.get('/', getSalones);       
router.get('/:id', getSalon);      
router.post('/', createSalon);     
router.put('/:id', updateSalon);   
router.delete('/:id', deleteSalon); 

export default router;