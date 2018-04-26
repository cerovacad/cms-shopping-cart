const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

//Model
const Product = require('../models/Product');
const Category = require('../models/Category');

//GET products

router.get('/', (req, res) => {

  let count;

  Product.count((err, c) => {
    count = c;
  });

  Product.find({}, (err, products) => {
    if (err) {
      console.log('Error fetching products', err);
    } else {
      res.render('admin/products', {
        products,
        count
      });
    }
  });

});

//GET add product

router.get('/add-product', (req, res) => {
  const title = '';
  const slug = '';
  const desc = '';
  const price = '';

  Category.find({}, (err, categories) => {
    res.render('admin/add-product', {
      title,
      slug,
      desc,
      categories,
      price
    });
  });

});

//POST add product

router.post('/add-product', (req, res) => {

  const image = typeof req.files.image !== "undefined" ? req.files.image.name : "";

  //validation
  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('desc', 'Content must have a value').notEmpty();
  req.checkBody('price', 'Price must have a value').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(image);


  //extracting data
  const title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug === '') {
    slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
  }
  const desc = req.body.desc;
  const price = req.body.price;
  const category = req.body.category;
  //validate req.body
  const errors = req.validationErrors();

  if (errors) {
    Category.find({}, (err, categories) => {
      res.render('admin/add-product', {
        errors,
        title,
        slug,
        desc,
        categories,
        price
      });
    });
  } else {
    Product.findOne({
      slug
    }, (err, product) => {
      if (product) {
        req.flash('danger', 'Page slug exists, please choose another one');
        Category.find({}, (err, categories) => {
          res.render('admin/add-product', {
            errors,
            title,
            slug,
            desc,
            categories,
            price
          });
        });
      } else {
        const product = new Product({
          title,
          slug,
          desc,
          category,
          price,
          image
        });

        product.save((err) => {
          if (err) {
            console.log(err, 'Error saving to database');
          } else {

            mkdirp('public/product_images/' + product._id, (err) => {
              return console.log(err);
            });

            mkdirp('public/product_images/' + product._id + '/gallery', (err) => {
              return console.log(err);
            });

            mkdirp('public/product_images/' + product._id + '/gallery/thumbs', (err) => {
              return console.log(err);
            });

            //UPLOADING IMAGE
            if (image != '') {
              const productImage = req.files.image;
              const path = 'public/product_images/' + product._id + '/' + image;
              productImage.mv(path, (err) => {
                if (err) {
                  console.log('MV', err);
                }
              });
            }

            req.flash('success', 'Saved to dabase');
            res.redirect('/admin/products');

          }
        });

      }
    });
  }

});

//GET edit product
router.get('/edit-product/:id', (req, res) => {

  Product.findById(req.params.id, (err, product) => {

    if (err) {
      console.log(err, 'Error saving edited page to database');
    }

    Category.find({}, (err, categories) => {

      const galleryDir = 'public/product_images/' + product._id + '/gallery';
      let galleryImgs = null;

      fs.readdir(galleryDir, (err, files) => {
        if (err) {
          console.log(err);
        } else {
          galleryImgs = files;

          res.render('admin/edit-product', {
            title: product.title,
            slug: product.slug,
            desc: product.desc,
            price: product.price,
            categories: categories,
            defaultCat: product.category,
            id: product._id,
            galleryImgs,
            image: product.image
          });

        }
      });
    });

  });

});

//POST edit product
router.post('/edit-product/:id', (req, res) => {

  const image = typeof req.files.image !== "undefined" ? req.files.image.name : "";

  //validation
  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('desc', 'Content must have a value').notEmpty();
  req.checkBody('price', 'Price must have a value').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(image);


  //extracting data
  const title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug === '') {
    slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
  }
  const desc = req.body.desc;
  const price = req.body.price;
  const category = req.body.category;
  const defaultCat = req.body.defaultCat;
  const id = req.params.id;


  //validate req.body
  const errors = req.validationErrors();

  if (errors) {
    Category.find({}, (err, categories) => {
      res.render('admin/edit-product', {
        errors,
        title,
        slug,
        desc,
        categories,
        defaultCat,
        price,
        id
      });
    });
  } else {
    Product.findOne({
      slug,
      _id: {
        $ne: id
      }
    }, (err, product) => {
      if (product) {
        req.flash('danger', 'Page slug exists, please choose another one');
        Category.find({}, (err, categories) => {
          res.render('admin/edit-product', {
            errors,
            title,
            slug,
            desc,
            categories,
            defaultCat,
            price,
            id
          });
        });
      } else {

        Product.findById(id, (err, product) => {
          if (err) {
            console.log(err, 'Error editing page');
          } else {

            product.title = title;
            product.slug = slug;
            product.desc = desc;
            product.price = price;
            product.category = category;

            if (image !== '') {
              const productImage = req.files.image;
              const path = 'public/product_images/' + product._id + '/' + image;
              productImage.mv(path, (err) => {
                if (err) {
                  console.log('MV', err);
                }
              });
              product.image = image;
            }

            product.save((err) => {
              if (err) {
                console.log(err, 'Error saving to database');
              } else {


                res.redirect('/admin/products');
              }
            });
          }
        });
      }
    });
  }
});

//GET delete page

router.get('/delete-product/:id', (req, res) => {
  Product.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      console.log('Error finding page to delete', err);
    } else {
      req.flash('success', 'Page deleted');
      res.redirect('/admin/products');
    }

  });
});

module.exports = router;