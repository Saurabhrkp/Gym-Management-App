var Trainer = require('../models/trainer')
var async = require('async')
var Member = require('../models/member')

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Trainers.
exports.trainer_list = function (req, res, next) {

    Trainer.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_trainers) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('trainer_list', { title: 'Trainer List', trainer_list: list_trainers });
        })

};

// Display detail page for a specific Trainer.
exports.trainer_detail = function (req, res, next) {

    async.parallel({
        trainer: function (callback) {
            Trainer.findById(req.params.id)
                .exec(callback)
        },
        trainers_members: function (callback) {
            Member.find({ 'trainer': req.params.id }, 'first_name family_name type')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.trainer == null) { // No results.
            var err = new Error('Trainer not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('trainer_detail', { title: 'Trainer Detail', trainer: results.trainer, trainer_members: results.trainers_members });
    });

};

// Display Trainer create form on GET.
exports.trainer_create_get = function (req, res, next) {
    res.render('trainer_form', { title: 'Create Trainer' });
};

// Handle Trainer create on POST.
exports.trainer_create_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('m_address').isLength({ min: 1 }).trim().withMessage('Address must be specified.'),
    body('m_number').isLength({ min: 10, max: 12 }).trim().withMessage('Phone number must be specified')
        .isNumeric().withMessage('Should be Number.'),
    body('date_of_reg', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    body('salary', '15000').isInt(),

    // Sanitize fields.
    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('m_address').escape(),
    sanitizeBody('m_number').toInt(),
    sanitizeBody('date_of_reg').toDate(),
    sanitizeBody('salary').toInt(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        // Create Trainer object with escaped and trimmed data
        var trainer = new Trainer(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                m_address: req.body.m_address,
                m_number: req.body.m_number,
                date_of_reg: req.body.date_of_reg,
                salary: req.body.salary
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('trainer_form', { title: 'Create Trainer', trainer: trainer, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Save trainer.
            trainer.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new trainer record.
                res.redirect(trainer.url);
            });
        }
    }
];



// Display Trainer delete form on GET.
exports.trainer_delete_get = function (req, res, next) {

    async.parallel({
        trainer: function (callback) {
            Trainer.findById(req.params.id).exec(callback)
        },
        trainers_members: function (callback) {
            Member.find({ 'trainer': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.trainer == null) { // No results.
            res.redirect('/catalog/trainers');
        }
        // Successful, so render.
        res.render('trainer_delete', { title: 'Delete Trainer', trainer: results.trainer, trainer_members: results.trainers_members });
    });

};

// Handle Trainer delete on POST.
exports.trainer_delete_post = function (req, res, next) {

    async.parallel({
        trainer: function (callback) {
            Trainer.findById(req.body.trainerid).exec(callback)
        },
        trainers_members: function (callback) {
            Member.find({ 'trainer': req.body.trainerid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        if (results.trainers_members.length > 0) {
            // Trainer has members. Render in same way as for GET route.
            res.render('trainer_delete', { title: 'Delete Trainer', trainer: results.trainer, trainer_members: results.trainers_members });
            return;
        }
        else {
            // Trainer has no members. Delete object and redirect to the list of trainers.
            Trainer.findByIdAndRemove(req.body.trainerid, function deleteTrainer(err) {
                if (err) { return next(err); }
                // Success - go to trainer list.
                res.redirect('/catalog/trainers')
            })

        }
    });

};

// Display Trainer update form on GET.
exports.trainer_update_get = function (req, res, next) {

    Trainer.findById(req.params.id, function (err, trainer) {
        if (err) { return next(err); }
        if (trainer == null) { // No results.
            var err = new Error('Trainer not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('trainer_form', { title: 'Update Trainer', trainer: trainer });

    });
};

// Handle Trainer update on POST.
exports.trainer_update_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('m_address').isLength({ min: 1 }).trim().withMessage('Address must be specified.'),
    body('m_number').isLength({ min: 10, max: 12 }).trim().withMessage('Phone number must be specified')
        .isNumeric().withMessage('Should be Number.'),
    body('date_of_reg', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    body('salary', '15000').isInt(),

    // Sanitize fields.
    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('m_address').escape(),
    sanitizeBody('m_number').toInt(),
    sanitizeBody('date_of_reg').toDate(),
    sanitizeBody('salary').toInt(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Trainer object with escaped and trimmed data (and the old id!)
        var trainer = new Trainer(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                m_address: req.body.m_address,
                m_number: req.body.m_number,
                date_of_reg: req.body.date_of_reg,
                salary: req.body.salary,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('trainer_form', { title: 'Update Trainer', trainer: trainer, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Trainer.findByIdAndUpdate(req.params.id, trainer, {}, function (err, thetrainer) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(thetrainer.url);
            });
        }
    }
];
