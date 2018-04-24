$(() => {

  if($('textarea#ta').length){
    CKEDITOR.replace('ta');
  }

  $('a.confirmDeletion').on('click', () => {
    if(!confirm('Are you sure you want to delete this page?')){
      return false;
    }
  });

});