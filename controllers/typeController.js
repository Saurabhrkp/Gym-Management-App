var Type = require('../models/type');
var Member = require('../models/member');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Type.
exports.type_list = function(req, res, next) {

  Type.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_types) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('type_list', { title: 'Type List', list_types:  list_types});
    });

};

// Display detail page for a specific Type.
exports.type_detail = function(req, res, next) {

    async.parallel({
        type: function(callback) {
            Type.findById(req.params.id)
              .exec(callback);
        },

        type_members: function(callback) {
          Member.find({ 'type': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.type==null) { // No results.
            var err = new Error('Type not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('type_detail', { title: 'Type Detail', type: results.type, type_members: results.type_members } );
    });

};

// Display Type create form on GET.
exports.type_create_get = function(req, res, next) {
    res.render('type_form', { title: 'Create Type'});
};

// Handle Type create on POST.
exports.type_create_post = [
    
    // Validate that the name field is not empty.
    body('name').isLength({ min: 1 }).trim(),

    // Sanitize (trim) the name field.
    sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a type object with escaped and trimmed data.
        var type = new Type(
          { 
            name: req.body.name
         }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('type_form', { title: 'Create Type', type: type, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Type with same name already exists.
            Type.findOne({ 'name': req.body.name })
                .exec( function(err, found_type) {
                     if (err) { return next(err); }

                     if (found_type) {
                         // Type exists, redirect to its detail page.
                         res.redirect(found_type.url);
                     }
                     else {

                         type.save(function (err) {
                           if (err) { return next(err); }
                           // Type saved. Redirect to type detail page.
                           res.redirect(type.url);
                         });

                     }

                 });
        }
    }
];

// Display Type delete form on GET.
exports.type_delete_get = function(req, res, next) {

    async.parallel({
        type: function(callback) {
            Type.findById(req.params.id).exec(callback);
        },
        type_members: function(callback) {
            Member.find({ 'type': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.type==null) { // No results.
            res.redirect('/catalog/types');
        }
        // Successful, so render.
        res.render('type_delete', { title: 'Delete Type', type: results.type, type_members: results.type_members } );
    });

};

// Handle Type delete on POST.
exports.type_delete_post = function(req, res, next) {

    async.parallel({
        type: function(callback) {
            Type.findById(req.params.id).exec(callback);
        },
        type_members: function(callback) {
            Member.find({ 'type': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.type_members.length > 0) {
            // Type has members. Render in same way as for GET route.
            res.render('type_delete', { title: 'Delete Type', type: results.type, type_members: results.type_members } );
            return;
        }
        else {
            // Type has no members. Delete object and redirect to the list of types.
            Type.findByIdAndRemove(req.body.id, function deleteType(err) {
                if (err) { return next(err); }
                // Success - go to types list.
                res.redirect('/catalog/types');
            });

        }
    });

};

// Display Type update form on GET.
exports.type_update_get = function(req, res, next) {

    Type.findById(req.params.id, function(err, type) {
        if (err) { return next(err); }
        if (type==null) { // No results.
            var err = new Error('Type not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('type_form', { title: 'Update Type', type: type });
    });

};

// Handle Type update on POST.
exports.type_update_post = [
   
    // Validate that the name field is not empty.
    body('name', 'Type name required').isLength({ min: 1 }).trim(),


    // Sanitize (trim) the name field.
    sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a type object with escaped and trimmed data (and the old id!)
        var type = new Type(
          {
          name: req.body.name,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('type_form', { title: 'Update Type', type: type, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Type.findByIdAndUpdate(req.params.id, type, {}, function (err,thetype) {
                if (err) { return next(err); }
                   // Successful - redirect to type detail page.
                   res.redirect(thetype.url);
                });
        }
    }
];
