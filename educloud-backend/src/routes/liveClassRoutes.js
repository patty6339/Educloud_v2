const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const liveClassController = require('../controllers/liveClassController');
const validate = require('../middlewares/validate');
const { liveClassValidation } = require('../validations');

const router = express.Router({ mergeParams: true });

router.use(protect);

// Routes accessible by all authenticated users
router.get('/', liveClassController.getLiveClasses);
router.get('/:id', liveClassController.getLiveClass);

// Routes for joining/leaving live classes
router.post('/:id/join', liveClassController.joinLiveClass);
router.post('/:id/leave', liveClassController.leaveLiveClass);

// Routes restricted to teachers
router
  .route('/')
  .post(
    restrictTo('teacher'),
    validate(liveClassValidation.createLiveClass),
    liveClassController.createLiveClass
  );

router
  .route('/:id')
  .patch(
    restrictTo('teacher'),
    validate(liveClassValidation.updateLiveClass),
    liveClassController.updateLiveClass
  )
  .delete(restrictTo('teacher'), liveClassController.deleteLiveClass);

// Routes for managing live class state
router.post(
  '/:id/start',
  restrictTo('teacher'),
  liveClassController.startLiveClass
);

router.post(
  '/:id/end',
  restrictTo('teacher'),
  liveClassController.endLiveClass
);

module.exports = router;
