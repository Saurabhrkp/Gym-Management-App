var Member = require('../models/member');
var Trainer = require('../models/trainer');
var Type = require('../models/type');
var Plan = require('../models/plan');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        member_count: function(callback) {
            Member.countDocuments(callback);
        },
        plan_count: function(callback) {
            Plan.countDocuments(callback);
        },
        plan_count_available_count: function(callback) {
            Plan.countDocuments({status:'Active'},callback);
        },
        trainer_count: function(callback) {
            Trainer.countDocuments(callback);
        },
        type_count: function(callback) {
            Type.countDocuments(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Local Gym Home', error: err, data: results });
    });
};


// Display list of all members.
exports.member_list = function(req, res, next) {

  Member.find()
    .populate('member')
    .populate('trainer')
    .exec(function (err, list_members) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('member_list', { title: 'Member List', member_list:  list_members});
    });

};

// Display detail page for a specific member.
exports.member_detail = function(req, res, next) {

    async.parallel({
        member: function(callback) {

            Member.findById(req.params.id)
              .populate('trainer')
              .populate('type')
              .populate('plan')
              .exec(callback);
        },
        members_instance: function(callback) {
          Plan.find({ 'member': req.params.id }, 'planName status')
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.member==null) { // No results.
            var err = new Error('Member not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('member_detail', { title: 'Member Name', member:  results.member, member_instances: results.members_instance } );
    });

};

// Display member create form on GET.
exports.member_create_get = function(req, res, next) {

    // Get all trainers and types, which we can use for adding to our member.
    async.parallel({
        trainers: function(callback) {
            Trainer.find(callback);
        },
        types: function(callback) {
            Type.find(callback);
        },
        plans: function(callback) {
            Plan.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('member_form', { title: 'Create Member',trainers:results.trainers,plans:results.plans, types:results.types });
    });

};

// Handle member create on POST.
exports.member_create_post = [
    // Convert the type to an array.
    // (req, res, next) => {
    //     if(!(req.body.type instanceof Array)){
    //         if(typeof req.body.type==='undefined')
    //         req.body.type=[];
    //         else
    //         req.body.type=new Array(req.body.type);
    //     }
    //     next();
    // },

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
    body('trainer').isLength({ min: 1 }).trim().withMessage('Trainer must be specified.'),
    body('plan').isLength({ min: 1 }).trim().withMessage('Plan is Optional.'),
    body('plan_end_on', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),


    // Sanitize fields.
    // sanitizeBody('first_name').escape(),
    // sanitizeBody('family_name').escape(),
    // sanitizeBody('date_of_birth').toDate(),
    // sanitizeBody('m_address').escape(),
    // sanitizeBody('m_number').toInt(),
    // sanitizeBody('date_of_reg').toDate(),
    sanitizeBody('*').escape(),
    sanitizeBody('type.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Member object with escaped and trimmed data.
        var member = new Member(
          { first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            m_address: req.body.m_address,
            m_number: req.body.m_number,
            date_of_reg: req.body.date_of_reg,
            type: req.body.type,
            trainer: req.body.trainer,
            plan_end_on: req.body.plan_end_on,
            plan: req.body.plan
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all trainers and types for form.
            async.parallel({
                trainers: function(callback) {
                    Trainer.find(callback);
                },
                types: function(callback) {
                    Type.find(callback);
                },
                plans: function(callback) {
                    Plan.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // // Mark our selected types as checked.
                // for (let i = 0; i < results.types.length; i++) {
                //     if (member.type(results.types[i]._id) > -1) {
                //         results.types[i].checked='true';
                //     }
                // }
                res.render('member_form', { title: 'Create Member',trainers:results.trainers, types:results.types, plans: results.plans, member: member, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save member.
            member.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new member record.
                   res.redirect(member.url);
                });
        }
    }
];



// Display member delete form on GET.
exports.member_delete_get = function(req, res, next) {

    async.parallel({
        member: function(callback) {
            Member.findById(req.params.id).populate('trainer').populate('type').populate('plan').exec(callback);
        },
        member_plans: function(callback) {
            Plan.find({ 'member': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.member==null) { // No results.
            res.redirect('/catalog/members');
        }
        // Successful, so render.
        res.render('member_delete', { title: 'Delete Member', member: results.member, member_instances: results.member_plans } );
    });

};

// Handle member delete on POST.
exports.member_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        member: function(callback) {
            Member.findById(req.body.id).populate('trainer').populate('type').exec(callback);
        },
        member_plans: function(callback) {
            Plan.find({ 'member': req.body.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.member_plans.length > 0) {
            // Member has member_instances. Render in same way as for GET route.
            res.render('member_delete', { title: 'Delete Member', member: results.member, member_instances: results.member_plans } );
            return;
        }
        else {
            // Member has no Plan objects. Delete object and redirect to the list of members.
            Member.findByIdAndRemove(req.body.id, function deleteMember(err) {
                if (err) { return next(err); }
                // Success - got to members list.
                res.redirect('/catalog/members');
            });

        }
    });

};

// Display member update form on GET.
exports.member_update_get = function(req, res, next) {

    // Get member, trainers and types for form.
    async.parallel({
        member: function(callback) {
            Member.findById(req.params.id).populate('trainer').populate('type').exec(callback);
        },
        trainers: function(callback) {
            Trainer.find(callback);
        },
        types: function(callback) {
            Type.find(callback);
        },
        plans: function(callback) {
            Plan.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.member==null) { // No results.
                var err = new Error('Member not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected types as checked.
            for (var all_g_iter = 0; all_g_iter < results.types.length; all_g_iter++) {
                for (var member_g_iter = 0; member_g_iter < results.member.type.length; member_g_iter++) {
                    if (results.types[all_g_iter]._id.toString()==results.member.type[member_g_iter]._id.toString()) {
                        results.types[all_g_iter].checked='true';
                    }
                }
            }
            res.render('member_form', { title: 'Update Member', trainers:results.trainers, types:results.types, plans: results.plans, member: results.member });
        });

};


// Handle member update on POST.
exports.member_update_post = [

    // Convert the type to an array.
    (req, res, next) => {
        if(!(req.body.type instanceof Array)){
            if(typeof req.body.type==='undefined')
            req.body.type=[];
            else
            req.body.type=new Array(req.body.type);
        }
        next();
    },
   
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
    body('trainer').isLength({ min: 1 }).trim().withMessage('Trainer must be specified.'),
    body('plan').isLength({ min: 1 }).trim().withMessage('Plan is Optional.'),
    body('plan_end_on', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),


    // Sanitize fields.
    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('m_address').escape(),
    sanitizeBody('m_number').toInt(),
    sanitizeBody('date_of_reg').toDate(),
    sanitizeBody('*').escape(),
    sanitizeBody('type.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Member object with escaped/trimmed data and old id.
        var member = new Member(
          { first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            m_address: req.body.m_address,
            m_number: req.body.m_number,
            date_of_reg: req.body.date_of_reg,
            trainer: req.body.trainer,
            type: (typeof req.body.type==='undefined') ? [] : req.body.type,
            plan_end_on: req.body.plan_end_on,
            plan: req.body.plan,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all trainers and types for form
            async.parallel({
                trainers: function(callback) {
                    Trainer.find(callback);
                },
                types: function(callback) {
                    Type.find(callback);
                },
                plans: function(callback) {
                    Plan.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected types as checked.
                for (let i = 0; i < results.types.length; i++) {
                    if (member.type.indexOf(results.types[i]._id) > -1) {
                        results.types[i].checked='true';
                    }
                }
                res.render('member_form', { title: 'Update Member',trainers:results.trainers, types:results.types, member: member,plans: results.plans, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Member.findByIdAndUpdate(req.params.id, member, {}, function (err,themember) {
                if (err) { return next(err); }
                   // Successful - redirect to member detail page.
                   res.redirect(themember.url);
                });
        }
    }
];

