'use strict';
var spawn = require('child_process').spawn;

var currencyGetter = spawn('python',  ['/Users/boolgom/Develop/Champong/packages/articles/server/controllers/currency.py']);

var currency = '';
currencyGetter.stdout.on('data', function(data){
    currency += data;
});

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Article = mongoose.model('Article'),
_ = require('lodash');


/**
 * Find article by id
 */
exports.article = function(req, res, next, id) {
    Article.load(id, function(err, article) {
        if (err) return next(err);
        if (!article) return next(new Error('Failed to load article ' + id));
        req.article = article;
        next();
    });
};

exports.articleByName = function(req, res, next, id) {
    Article.findOne({ 'title': id }, function (err, article) {
        if (article) {
            res.write(article.content);
            res.end();
        } else {
            var python = spawn('python',  ['/Users/boolgom/Develop/Champong/packages/articles/server/controllers/wrapper.py', id, currency]);
            var output = '';
            python.stdout.on('data', function(data){
                output += data;
            });
            python.on('close', function(code){
                if (code !== 0) {  return res.send(500, code); }
                res.write(output);
                res.end();
                article = new Article({title: id, content: output});
                article.save();
            });
        }
    });
};

/**
 * Create an article
 */
exports.create = function(req, res) {
    var article = new Article(req.body);
    article.user = req.user;

    article.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                article: article
            });
        } else {
            res.jsonp(article);
        }
    });
};

/**
 * Update an article
 */
exports.update = function(req, res) {
    var article = req.article;

    article = _.extend(article, req.body);

    article.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                article: article
            });
        } else {
            res.jsonp(article);
        }
    });
};

/**
 * Delete an article
 */
exports.destroy = function(req, res) {
    var article = req.article;

    article.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                article: article
            });
        } else {
            res.jsonp(article);
        }
    });
};

/**
 * Show an article
 */
exports.show = function(req, res) {
    res.jsonp(req.article);
};

/**
 * List of Articles
 */
exports.all = function(req, res) {
    Article.find().sort('-created').populate('user', 'name username').exec(function(err, articles) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(articles);
        }
    });
};

exports.showWithName = function(req, res) {
    res.jsonp(req.searchResult);
};
