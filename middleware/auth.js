function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('danger', 'Please log in to access that page.');
  res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('danger', 'You are not authorized to access this page.');
  res.redirect('/');
}

module.exports = { isAuthenticated, isAdmin };
