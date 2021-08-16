let tokensList = [];
let pdfViewer = document.getElementById('pdf-viewer');
pdfViewer.src = "img/placeholder.pdf"

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

function getID(element) {
    let splited = element.id.split('-');
    let lastNumber = parseInt(splited[splited.length - 1]);
    return lastNumber;
}

function showTokens() {
    let tokensHTML = document.getElementById('tokens-list');
    tokensHTML.innerHTML='';
    for (let i = 0; i < tokensList.length; i++) {
        tokensHTML.innerHTML += `
        <div class="token-card" id="token-${i}" index="${i}">
          <table><tr>
            <td>
              <img class="card-img" src="${URL.createObjectURL(tokensList[i].img)}">
            </td>
            <td>
              <input type="text" class="card-input" id="card-text-${i}" value="${tokensList[i].name}" onChange="changeName(this)"><br>
              <label for="card-count-${i}" class="card-label" onChange="changeNumber(this)">Number of copies</label><br>
              <input type="number" class="card-input" id="card-count-${i}" value="${tokensList[i].count}" onChange="changeNumber(this)"><br>
              <label for="card-size-${i}" class="card-label">Size of token</label><br>
              <select name="card-size-${i}" class="card-input" id="card-size-${i}" index="${i}" onChange="changeSize(this)">
                <option value="tiny"${tokensList[i].size == 'tiny' ? ' selected' : ''}>Tiny</option>
                <option value="small"${tokensList[i].size == 'small' ? ' selected' : ''}>Small</option>
                <option value="medium"${tokensList[i].size == 'medium' ? ' selected' : ''}>Medium</option>
                <option value="large"${tokensList[i].size == 'large' ? ' selected' : ''}>Large</option>
                <option value="huge"${tokensList[i].size == 'huge' ? ' selected' : ''}>Huge</option>
                <option value="gargantuan"${tokensList[i].size == 'gargantuan' ? ' selected' : ''}>Gargantuan</option>
              </select>
            </td>
            <td>
              <button id="card-delete-${i}" class="card-delete" id="card-delete-${i}"" onClick="deleteToken(this)">
                <img class="card-delete-img" src="img/delete.png">
              </button>
            </td>
            </tr></table>
        </div>`;
    }
}

function changeName(input) {
    tokensList[getID(input)].name = input.value;
    console.log(tokensList[getID(input)]);
}

function changeNumber(input) {
    tokensList[getID(input)].count = parseInt(input.value);
    console.log(tokensList[getID(input)]);
}

function changeSize(input) {
    tokensList[getID(input)].size = input.value;
    console.log(tokensList[getID(input)]);
}

function deleteToken(button) {
    tokensList.splice(getID(button), 1);
    showTokens();
}

function uploadTokens(input) {
    for (let i = 0; i < input.files.length; i++) {
        let file = input.files.item(i);
        tokensList.push({name: file.name, count: 1, size: 'medium', img: file});
    }
    showTokens();
}
