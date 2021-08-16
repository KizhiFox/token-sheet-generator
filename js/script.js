let tokensList = [];
let pdfViewer = document.getElementById('pdf-viewer');
pdfViewer.src = "placeholder.pdf"

function renderPDF() {
    let doc = new PDFDocument();
    let stream = doc.pipe(blobStream());
    doc.fontSize(25).text('Hello World!', 100, 80);
    doc.end();
    stream.on('finish', function() {
        let url = stream.toBlobURL('application/pdf');
        pdfViewer.src = url;
    });
}

function showTokens() {
    console.log('test');
    console.log(tokensList);
}

function uploadTokens(input) {
    for (let i = 0; i < input.files.length; i++) {
        let file = input.files.item(i);
        tokensList.push({name: file.name, count: 1, size: 'medium', img: file});
    }
    showTokens();
}
