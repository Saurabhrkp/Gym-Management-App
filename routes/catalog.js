var express = require('express');
var router = express.Router();
const {ensureAuthenticated} = require('../config/auth');


// Require our controllers.
var member_controller = require('../controllers/memberController');
var type_controller = require('../controllers/typeController');
var plan_controller = require('../controllers/planController');
var trainer_controller = require('../controllers/trainerController');

/// AUTHOR ROUTES ///

// GET catalog home page.
router.get('/', ensureAuthenticated, member_controller.index); 

// GET request for creating Member. NOTE This must come before route for id (i.e. display member).
router.get('/member/create', ensureAuthenticated, member_controller.member_create_get);

// POST request for creating Member.
router.post('/member/create', ensureAuthenticated, member_controller.member_create_post);

// GET request to delete Member.
router.get('/member/:id/delete', ensureAuthenticated, member_controller.member_delete_get);

// POST request to delete Member
router.post('/member/:id/delete', ensureAuthenticated, member_controller.member_delete_post);

// GET request to update Member.
router.get('/member/:id/update', ensureAuthenticated, member_controller.member_update_get);

// POST request to update Member.
router.post('/member/:id/update', ensureAuthenticated, member_controller.member_update_post);

// GET request for one Member.
router.get('/member/:id', ensureAuthenticated, member_controller.member_detail);

// GET request for list of all Members.
router.get('/members', ensureAuthenticated, member_controller.member_list);

/// PLAN ROUTES ///

// GET request for creating a Type. NOTE This must come before route that displays Type (uses id).
router.get('/type/create', ensureAuthenticated, type_controller.type_create_get);

// POST request for creating Type.
router.post('/type/create', ensureAuthenticated, type_controller.type_create_post);

// GET request to delete Type.
router.get('/type/:id/delete', ensureAuthenticated, type_controller.type_delete_get);

// POST request to delete Type.
router.post('/type/:id/delete', ensureAuthenticated, type_controller.type_delete_post);

// GET request to update Type.
router.get('/type/:id/update', ensureAuthenticated, type_controller.type_update_get);

// POST request to update Type.
router.post('/type/:id/update', ensureAuthenticated, type_controller.type_update_post);

// GET request for one Type.
router.get('/type/:id', ensureAuthenticated, type_controller.type_detail);

// GET request for list of all Type.
router.get('/types', ensureAuthenticated, type_controller.type_list);


/// PLAN ROUTES ///

// GET request for creating a Plan. NOTE This must come before route that displays Plan (uses id).
router.get('/plan/create', ensureAuthenticated, plan_controller.plan_create_get);

// POST request for creating Plan.
router.post('/plan/create', ensureAuthenticated, plan_controller.plan_create_post);

// GET request to delete Plan.
router.get('/plan/:id/delete', ensureAuthenticated, plan_controller.plan_delete_get);

// POST request to delete Plan.
router.post('/plan/:id/delete', ensureAuthenticated, plan_controller.plan_delete_post);

// GET request to update Plan.
router.get('/plan/:id/update', ensureAuthenticated, plan_controller.plan_update_get);

// POST request to update Plan.
router.post('/plan/:id/update', ensureAuthenticated, plan_controller.plan_update_post);

// GET request for one Plan.
router.get('/plan/:id', ensureAuthenticated, plan_controller.plan_detail);

// GET request for list of all Plan.
router.get('/plans', ensureAuthenticated, plan_controller.plan_list);


/// BOOKINSTANCE ROUTES ///

// GET request for creating a Trainer. NOTE This must come before route that displays Trainer (uses id).
router.get('/trainer/create', ensureAuthenticated, trainer_controller.trainer_create_get);

// POST request for creating Trainer.
router.post('/trainer/create', ensureAuthenticated, trainer_controller.trainer_create_post);

// GET request to delete Trainer.
router.get('/trainer/:id/delete', ensureAuthenticated, trainer_controller.trainer_delete_get);

// POST request to delete Trainer.
router.post('/trainer/:id/delete', ensureAuthenticated, trainer_controller.trainer_delete_post);

// GET request to update Trainer.
router.get('/trainer/:id/update', ensureAuthenticated, trainer_controller.trainer_update_get);

// POST request to update Trainer.
router.post('/trainer/:id/update', ensureAuthenticated, trainer_controller.trainer_update_post);

// GET request for one Trainer.
router.get('/trainer/:id', ensureAuthenticated, trainer_controller.trainer_detail);

// GET request for list of all Trainer.
router.get('/trainers', ensureAuthenticated, trainer_controller.trainer_list);


module.exports = router;
