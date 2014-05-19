$(document).ready(function () {

    $(document).on('click', '.toggle-UAN', function (e) {
        console.log('message');
        e.stopPropagation();
    });
});