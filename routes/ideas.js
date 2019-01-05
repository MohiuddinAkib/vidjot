const express = require('express'),
  router = express.Router(),
  createIdeaValidation = require('../validations/create-idea-validation'),
  Idea = require('../models/Idea'),
  ideaDebug = require('debug')('app:Idea'),
  validateObjectID = require('../helpers/validateObjectID'),
  { ensureAuthenticated } = require('../helpers/auth');

// All idea page
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({ user: req.user.id })
    .sort('-createdAt')
    .populate('user', '-__v')
    .exec()
    .then(ideas =>
      res.render('ideas/index', {
        ideas,
        page_title: 'Ideas'
      })
    )
    .catch(err => ideaDebug('Fetching ideas error', err));
});

// Create idea page
router.get('/create', ensureAuthenticated, (req, res) => {
  res.render('ideas/create', { page_title: 'Add idea' });
});

// Store idea
router.post('/store', ensureAuthenticated, (req, res) => {
  const { errors, isValid, values } = createIdeaValidation(req.body);
  if (!isValid) {
    res.render('ideas/create', {
      errors,
      title: req.body.title,
      details: req.body.details,
      page_title: 'Add idea'
    });
  } else {
    const newIdea = {
      title: values.title,
      details: values.details,
      user: req.user.id
    };
    // Create idea
    new Idea(newIdea)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Video idea successfully added');
        res.redirect('/ideas');
      })
      .catch(err => ideaDebug('Creating idea error', err));
  }
});

// Edit idea page
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  // First validate the objectid
  validateObjectID(req, res);
  Idea.findById(req.params.id)
    .exec()
    .then(idea => {
      if (idea.user != req.user.id) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/ideas');
        return;
      }
      res.render('ideas/edit', { page_title: idea.title, idea });
    })
    .catch(err => ideaDebug('Fetching idea for edit page error', err));
});

// Update idea route
router.put('/update/:id', ensureAuthenticated, (req, res) => {
  // First validate the objectid
  validateObjectID(req, res);
  const { errors, isValid, values } = createIdeaValidation(req.body);
  Idea.findById(req.params.id)
    .exec()
    .then(idea => {
      if (!isValid) {
        res.render('ideas/edit', { page_title: idea.title, idea, errors });
      } else {
        idea.title = values.title;
        idea.details = values.details;
        idea.save().then(idea => {
          req.flash('success_msg', 'Video idea updated');
          res.redirect('/ideas');
        });
      }
    })
    .catch(err => ideaDebug('Idea fetch error for updating', err));
});

// Delete idea route
router.delete('/delete/:id', ensureAuthenticated, (req, res) => {
  // First validate the objectid
  validateObjectID(req, res);
  Idea.findByIdAndDelete(req.params.id)
    .exec()
    .then(idea => {
      req.flash('success_msg', 'Video idea removed');
      res.redirect('/ideas');
    })
    .catch(err => ideaDebug('Idea deletion error', err));
});

module.exports = router;
