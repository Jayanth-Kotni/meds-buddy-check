const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  addMedication,
  getMedications,
  markMedicationTaken,
  getAdherence,
} = require('../controllers/medicationController');

router.use(authenticate);

router.post('/', addMedication);
router.get('/', getMedications);
router.post('/:id/taken', markMedicationTaken);
router.get('/adherence', getAdherence);

module.exports = router;
