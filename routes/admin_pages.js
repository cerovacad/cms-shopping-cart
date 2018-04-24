const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

//GET pages

router.get('/', (req, res) => {
  Page.find({}).sort({
    sorting: 1
  }).exec((err, pages) => {
    res.render('admin/pages', {
      pages
    });
  })
});

//GET add page

router.get('/add-page', (req, res) => {
  const title = '';
  const slug = '';
  const content = '';

  res.render('admin/add-page', {
    title,
    slug,
    content
  });

});

//POST add page

router.post('/add-page', (req, res) => {

  //validation
  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('content', 'Content must have a value').notEmpty();

  //extracting data
  const title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug === '') {
    slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
  }
  const content = req.body.content;
  //validate req.body
  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/add-page', {
      errors,
      title,
      slug,
      content
    });
  } else {
    Page.findOne({ //check for unique slug
      slug
    }, (err, page) => {
      if (page) {
        req.flash('danger', 'Page slug exists, please choose another one');
        res.render('admin/add-page', {
          title,
          slug,
          content
        });
      } else {

        const page = new Page({
          title,
          slug,
          content,
          sorting: 100
        });

        page.save((err) => {
          if (err) {
            console.log(err, 'Error saving to database');
          }else {
            req.flash('success', 'Saved to dabase');
            res.redirect('/admin');
          }
        });

      }
    });
  }

});

//POST reorder pages

router.post('/reorder-pages', (req, res) => {
  
  const ids = req.body['id[]'];
  let count = 0;

  for (let i = 0; i < ids.length; i++) {
    let id = ids[i];
    count++;
    //wraping is clojure because of node async
    ((count) => {
      Page.findById(id, (err, page) => {
        if (err) {
          console.log(err, 'Error finding id');
        } else {
          page.sorting = count;
          page.save((err) => {
            if (err) {
              console.log(err, 'Error reordering');
            }
          })
        }
      });
    })(count);

  }

});


//GET edit page

router.get('/edit-page/:slug', (req, res) => {

  Page.findOne({slug: req.params.slug}, (err, page) => {
    
    if(err){
      console.log(err, 'Error saving edited page to database');
    }

    res.render('admin/edit-page', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });

  });

});

//POST edit page

router.post('/edit-page/:slug', (req, res) => {

  //validation
  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('content', 'Content must have a value').notEmpty();

  //extracting data
  const title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug === '') {
    slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
  }
  const content = req.body.content;
  const id = req.body.id;
  

  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/add-page', {
      errors,
      title,
      slug,
      content,
      id
    });
  } else {
    Page.findOne({ slug, _id:{ $ne: id }}, (err, page) => {
      if (page) {
        req.flash('danger', 'Page slug exists, please choose another one');
        res.render('admin/edit-page', {
          title,
          slug,
          content,
          id
        });
      } else {
        
        Page.findById(id, (err, page) => {
          if(err){
            console.log(err, 'Error editing page');
          }else{
            page.title = title;
            page.slug = slug;
            page.content = content;
          }
        
          page.save((err) => {
            if (err) {
              console.log(err, 'Error saving edited page to database');
            } else {
              req.flash('success', 'Saved to dabase');
              res.redirect('/admin');
            }
          });
        
        });

      }
    });
  }

});

//GET delete page

router.get('/delete-page/:id', (req, res) => {
  Page.findByIdAndRemove(req.params.id, (err) => {
    if(err){
      console.log('Error finding page to delete', err);
    }
    else{
      req.flash('success', 'Page deleted');
      res.redirect('/admin');  
    }

  });
});

module.exports = router;