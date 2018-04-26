$(() => {

  if($('textarea#ta').length){
    CKEDITOR.replace('ta');
  }

  $('a.confirmDeletion').on('click', () => {
    if(!confirm('Are you sure you want to delete this page?')){
      return false;
    }
  });

  $('a.confirmDeletionCat').on('click', () => {
    if(!confirm('Are you sure you want to delete this category?')){
      return false;
    }
  });

  $('a.confirmDeletionProd').on('click', () => {
    if(!confirm('Are you sure you want to delete this product?')){
      return false;
    }
  });


});