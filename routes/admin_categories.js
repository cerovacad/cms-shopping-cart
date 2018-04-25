const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

//GET categories

router.get('/', (req, res) => {
  Category.find({}, (err, categories) => {
    if (err) {
      console.log('Error finding categories', err);
    }
    res.render('admin/categories', {
      categories
    });
  })
});

//GET add-category

router.get('/add-category', (req, res) => {
  const title = '';
  const slug = '';

  res.render('admin/add-category', {
    title,
    slug
  })
});

//POST add-category

router.post('/add-category', (req, res) => {

  req.checkBody('title', 'Title must have a value').notEmpty();

  const title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug === '') {
    slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
  }
  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/add-category', {
      errors,
      title,
      slug
    });

  } else {
    Category.findOne({
      slug
    }, (err, category) => {
      if (category) {
        req.flash('danger', 'Category slug exists, please choose another one');
        res.render('admin/add-category', {
          title,
          slug
        });
      } else {

        const category = new Category({
          title,
          slug
        });

        category.save((err) => {
          if (err) {
            console.log('Error saving category', err);
          } else {
            console.log('Category saved to database');
            res.redirect('/admin/categories');
          }
        });

      }
    });
  }

});

//GET edit-category

router.get('/edit-category/:id', (req, res) => {

  Category.findById(req.params.id, (err, category) => {

    if (err) {
      console.log('Error finding category', err);
    }

    res.render('admin/edit-category', {
      title: category.title,
      slug: category.slug,
      id: category._id
    });

  });

});

//POST edit-category

router.post('/edit-category/:id', (req, res) => {

  req.checkBody('title', 'Title must have a value').notEmpty();

  const title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug === '') {
    slug = req.body.title.replace(/\s+/g, '-').toLowerCase()
  }
  const id = req.params.id;
  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/edit-category', {
      errors,
      title,
      slug,
      id
    });
  } else {
    Category.findOne({
      slug,
      _id: {
        $ne: id
      }
    }, (err, category) => {
      if (category) {
        req.flash('danger', 'Category slug exists, please choose another one');
        res.render('admin/categories/edit-category', {
          title,
          slug,
          id
        });
      } else {

        Category.findById(id, (err, category) => {
          if (err) {
            console.log(err, 'Error editing category');
          } else {
            category.title = title;
            category.slug = slug;
          

            category.save((err) => {
              if (err) {
                console.log(err, 'Error saving edited category to database');
              } else {
                req.flash('success', 'Saved to dabase');
                res.redirect('/admin/categories');
              }
            });
          }

        });
      }
    });
  }
});

//DELETE category

router.get('/delete-category/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id, (err) => {
    if(err){
      console.log('Error finding category to delete', err);
    }
    else{
      req.flash('success', 'Page deleted');
      res.redirect('/admin/categories');  
    }

  });
});

module.exports = router;