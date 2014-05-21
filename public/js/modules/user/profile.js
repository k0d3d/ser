$(document).ready(function () {

  $('.profile-img').dropzone({ 
    url: "/upload/profile",
    previewsContainer: false,
    clickable: true,
    paramName: 'profileImage'
  });
    // $(document).on('click', '.toggle-UAN', function (e) {
    //     console.log('message');
    //     e.stopPropagation();
    // });
});