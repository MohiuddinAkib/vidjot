const mongoose = require('mongoose');

module.exports = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    req.flash('error_msg', 'Bad request');
    res.redirect('/ideas');
    return;
  }
};
