const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

//Model
const Product = require('../models/Product');

//GET products

router.get('/', (req, res) => {
  
  let count;

  Product.count((err, c) => {
    count = c;
  });
  
  Product.find({}, (err, products) => {
    if(err){
      console.log('Error fetching products', err);
    }else{
      res.render('admin/products', { products, count });
    }
  });

});

//GET add product

router.get('/add-product', (req, res) => {
  const title = '';
  const slug = '';
  const desc = '';
  const category = '';
  const price = '';
  const image = '';

  res.render('admin/add-product', {
    title,
    slug,
    desc,
    category,
    price,
    image
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

router.get('/edit-page/:id', (req, res) => {

  Page.findById(req.params.id, (err, page) => {
    
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

router.post('/edit-page/:id', (req, res) => {

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
  const id = req.params.id;
  

  const errors = req.validationErrors();

  if (errors) {
    res.render('admin/edit-page', {
      errors,
      title,
      slug,
      content,
      id
    });
  } else {
    Page.findOne({slug, _id:{ $ne: id }}, (err, page) => {
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
        
            page.save((err) => {
              if (err) {
                console.log(err, 'Error saving edited page to database');
              } else {
                req.flash('success', 'Saved to dabase');
                res.redirect('/admin');
              }
            });
          }

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