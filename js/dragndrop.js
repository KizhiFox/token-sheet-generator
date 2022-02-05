// Drag & Drop
var form = document.getElementById('dragndrop-zone');
var page = document.getElementById('body');
var input = form.querySelector('input[type="file"]');

window.addEventListener('load', function(){
    ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function (event) {
        form.addEventListener(event, function (e) {
        // preventing the unwanted behaviours
            e.preventDefault();
            e.stopPropagation();
        });
        page.addEventListener(event, function (e) {
        // preventing the unwanted behaviours
            e.preventDefault();
            e.stopPropagation();
        });
    });
});

// Page style
['dragover', 'dragenter', 'dragstart'].forEach(function (event) {
    page.addEventListener(event, function () {
        form.classList.add('dragstart');
    });
});

['dragleave', 'dragend', 'drop'].forEach(function (event) {
    page.addEventListener(event, function () {
       form.classList.remove('dragstart');
   });
});

// Form style
['dragover', 'dragenter', 'dragstart'].forEach(function (event) {
    form.addEventListener(event, function () {
        form.classList.add('dragover');
    });
});

['dragleave', 'dragend', 'drop'].forEach(function (event) {
    form.addEventListener(event, function () {
       form.classList.remove('dragover');
   });
});

// Drop files
form.addEventListener('drop', function (e) {
    var droppedFiles = e.dataTransfer;
    if (droppedFiles.files.length > 0)
    {
        uploadTokens(droppedFiles);
    }
});