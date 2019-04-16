var Plan = require('../models/plan')
var Member = require('../models/member')
var async = require('async')

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Plans.
exports.plan_list = function(req, res, next) {

  Plan.find()
    .exec(function (err, list_plans) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('plan_list', { title: 'Plan List', plan_list:  list_plans});
    })

};

// Display detail page for a specific Plan.
exports.plan_detail = function (req, res, next) {

    async.parallel({
        plan: function (callback) {
            Plan.findById(req.params.id)
                .exec(callback)
        },
        plan_members: function (callback) {
            Member.find({ 'plan': req.params.id }, 'name')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.plan == null) { // No results.
            var err = new Error('Plan not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('plan_detail', { title: 'Plan Detail', plan: results.plan, plan_members: results.plans_members });
    });

};

// Display Plan create form on GET.
exports.plan_create_get = function (req, res, next) {
    res.render('plan_form', { title: 'Create Plan' });
};

// Handle Plan create on POST.
exports.plan_create_post = [

    // Validate fields.
    body('planName', 'Plan must be specified').isLength({ min: 1 }).trim(),
    body('price', 'Price must be specified').isLength({ min: 1 }).toInt(),
    body('discription', 'Discription must be specified').isLength({ min: 1 }).trim(),
    body('status', 'Status must be specified').isLength({ min: 1 }).trim(),
    // body('plan_due', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('planName').escape(),
    sanitizeBody('price').toInt(),
    sanitizeBody('discription').escape(),
    sanitizeBody('status').escape(),
    // sanitizeBody('plan_due').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Plan object with escaped and trimmed data.
        var plan = new Plan(
          { planName: req.body.planName,
            price: req.body.price,
            discription: req.body.discription,
            status: req.body.status,
            // plan_due: req.body.plan_due,
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            res.render('plan_form', { title: 'Create Plan', plan: plan, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid
            plan.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(plan.url);
                });
        }
    }
];



// Display Plan delete form on GET.
exports.plan_delete_get = function(req, res, next) {

    async.parallel({
        plan: function (callback) {
            Plan.findById(req.params.id).exec(callback)
        },
        plans_members: function (callback) {
            Member.find({ 'plan': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.plan==null) { // No results.
            res.redirect('/catalog/plans');
        }
        // Successful, so render.
        res.render('plan_delete', { title: 'Delete Plan', plan: results.plan, plan_members: results.plans_members});
    })

};

// Handle Plan delete on POST.
exports.plan_delete_post = function(req, res, next) {
    
    async.parallel({
        plan: function (callback) {
            Plan.findById(req.body.planid).exec(callback)
        },
        plans_members: function (callback) {
            Member.find({ 'plan': req.body.planid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        if (results.plans_members.length > 0) {
            // Plan has members. Render in same way as for GET route.
            res.render('plan_delete', { title: 'Delete Plan', plan: results.plan, plan_members: results.plans_members });
            return;
        }
        else {
            // Plan has no members. Delete object and redirect to the list of plans.
            Plan.findByIdAndRemove(req.body.planid, function deletePlan(err) {
                if (err) { return next(err); }
                // Success - go to plan list.
                res.redirect('/catalog/plans')
            })

        }
    });
};

// Display Plan update form on GET.
exports.plan_update_get = function(req, res, next) {

    Plan.findById(req.params.id, function (err, plan) {
        if (err) { return next(err); }
        if (plan == null) { // No results.
            var err = new Error('Plan not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('plan_form', { title: 'Update Plan', plan: plan });

    });
};

// Handle Plan update on POST.
exports.plan_update_post = [

    // Validate fields.
    body('planName', 'Plan must be specified').isLength({ min: 1 }).trim(),
    body('price', 'Price must be specified').isLength({ min: 1 }).toInt(),
    body('discription', 'Discription must be specified').isLength({ min: 1 }).trim(),
    body('status', 'Status must be specified').isLength({ min: 1 }).trim(),
    // body('plan_due', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('planName').escape(),
    sanitizeBody('price').toInt(),
    sanitizeBody('discription').escape(),
    sanitizeBody('status').escape(),
    // sanitizeBody('plan_due').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Plan object with escaped/trimmed data and current id.
        var plan = new Plan(
          { planName: req.body.planName,
            price: req.body.price,
            discription: req.body.discription,
            status: req.body.status,
            _id: req.params.id
           });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors.
            Member.find({},'title')
                .exec(function (err, members) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('plan_form', { title: 'Update Plan', member_list : members, selected_member : plan.member._id , errors: errors.array(), plan:plan });
            });
            return;
        }
        else {
            // Data from form is valid.
            Plan.findByIdAndUpdate(req.params.id, plan, {}, function (err,theplan) {
                if (err) { return next(err); }
                   // Successful - redirect to detail page.
                   res.redirect(theplan.url);
                });
        }
    }
];
