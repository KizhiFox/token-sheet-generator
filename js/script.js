let tokensList = [];
const pdfViewer = document.getElementById('pdf-viewer');
pdfViewer.src = "img/placeholder.pdf";
const pageSizes = {
  A4: {
    width: PDFLib.PageSizes.A4[0],
    height: PDFLib.PageSizes.A4[1]
  },
  Letter: {
    width: PDFLib.PageSizes.Letter[0],
    height: PDFLib.PageSizes.Letter[1]
  }
};
parseTokens();

function exportProject() {
  let toExport = {
    pageFormat: document.getElementById('page-format').value,
    units: document.getElementById('units').value,
    tokenWidth: document.getElementById('token-width').value,
    paddingTop: document.getElementById('padding-top').value,
    paddingBottom: document.getElementById('padding-bottom').value,
    paddingLeft: document.getElementById('padding-left').value,
    paddingRight: document.getElementById('padding-right').value,
    renderBorders: document.getElementById('render-borders').checked,
    tokens: tokensList
  };
  let a = document.createElement('a');
  let file = new Blob([JSON.stringify(toExport, null, 2)], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = 'tokens.json';
  a.click();
}

function loadProject(input) {
  let file = input.files.item(0);
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
    project = JSON.parse(event.target.result);
    document.getElementById('page-format').value = project.pageFormat;
    document.getElementById('units').value = project.units;
    document.getElementById('token-width').value = project.tokenWidth;
    document.getElementById('padding-top').value = project.paddingTop;
    document.getElementById('padding-bottom').value = project.paddingBottom;
    document.getElementById('padding-left').value = project.paddingLeft;
    document.getElementById('padding-right').value = project.paddingRight;
    document.getElementById('render-borders').checked = project.renderBorders;
    tokensList = project.tokens;
    showTokens();
  };
}

function resetDefault() {
  document.getElementById('page-format').value = 'A4';
  document.getElementById('units').value = 'mm';
  document.getElementById('token-width').value = '26.0';
  document.getElementById('padding-top').value = '5.0';
  document.getElementById('padding-bottom').value = '5.0';
  document.getElementById('padding-left').value = '14.0';
  document.getElementById('padding-right').value = '14.0';
  document.getElementById('render-borders').checked = true;
}

function mmToPt(mm) {
  return mm * 2.83465;
}

function cmToPt(cm) {
  return cm * 28.3465;
}

function inchToPt(inch) {
  return inch * 72;
}

function ptToMm(pt) {
  return pt / 2.83465;
}

function ptToCm(pt) {
  return pt / 28.3465;
}

function ptToInch(pt) {
  return pt / 72;
}

function detectIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  // x1, y1 - left top point of first rectange
  // x2, y2 - right bottom point of first rectange
  // x3, y3 - left top point of second rectange
  // x4, y4 - right bottom point of second rectange
  let left = Math.max(x1, x3);
  let top = Math.min(y2, y4);
  let right = Math.min(x2, x4);
  let bottom = Math.max(y1, y3);

  let width = right - left;
  let height = top - bottom;

  if (width <= 0.01 || height <= 0.01) {
    return false;
  }
  return true;
}

function drawBorders(page, converter, paddingTop, paddingBottom, paddingLeft, paddingRight) {
  page.drawLine({
    start: { x: converter(paddingLeft), y: 0 },
    end: { x: converter(paddingLeft), y: page.getHeight() },
    thickness: 1,
    color: PDFLib.rgb(0.75, 0.75, 0.75)
  });
  page.drawLine({
    start: { x: page.getWidth() - converter(paddingRight), y: 0 },
    end: { x: page.getWidth() - converter(paddingRight), y: page.getHeight() },
    thickness: 1,
    color: PDFLib.rgb(0.75, 0.75, 0.75)
  });
  page.drawLine({
    start: { x: 0, y: page.getHeight() - converter(paddingTop) },
    end: { x: page.getWidth(), y: page.getHeight() - converter(paddingTop) },
    thickness: 1,
    color: PDFLib.rgb(0.75, 0.75, 0.75)
  });
  page.drawLine({
    start: { x: 0, y: converter(paddingBottom) },
    end: { x: page.getWidth(), y: converter(paddingBottom) },
    thickness: 1,
    color: PDFLib.rgb(0.75, 0.75, 0.75)
  });
}

async function createPdf(tokenPages, pageFormat, paddingTop, paddingBottom, paddingLeft, paddingRight) {
  let renderBorders = document.getElementById('render-borders').checked;
  let pdfDoc = await PDFLib.PDFDocument.create();
  let converter;
  switch (document.getElementById('units').value) {
    case 'mm':
      converter = mmToPt;
      break;
    case 'cm':
      converter = cmToPt;
      break;
    case 'inch':
      converter = inchToPt;
      break;
    default:
      converter = mmToPt;
  }
  // Default PDF
  if (tokenPages.length == 0) {
    let page = pdfDoc.addPage([pageFormat.width, pageFormat.height]);
    if (renderBorders) {
      drawBorders(page, converter, paddingTop, paddingBottom, paddingLeft, paddingRight);
    }
    let circleSize = converter(parseFloat(document.getElementById('token-width').value));
    for (let i = 0; i < 3; i++) {
      page.drawCircle({
        x: converter(paddingLeft) + circleSize * i + circleSize / 2,
        y: pageFormat.height - converter(paddingTop) - circleSize / 2,
        size: circleSize / 2,
        color: PDFLib.rgb(0.6 + i / 10, 0.6 + i / 10, 0.6 + i / 10)
      });
      page.drawText('Upload tokens and click «Export to PDF»', {
        x: converter(paddingLeft),
        y: pageFormat.height - circleSize - 20,
        size: 24,
        font: await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRoman)
      });
    }
  }
  // Rendering
  for (let i = 0; i < tokenPages.length; i++) {
    let page = pdfDoc.addPage([pageFormat.width, pageFormat.height]);
    if (renderBorders) {
      drawBorders(page, converter, paddingTop, paddingBottom, paddingLeft, paddingRight);
    }
    // Place tokens on a doc
    for (let j = 0; j < tokenPages[i].length; j++) {
      let mimeType = tokenPages[i][j].img.split(/[\s:;]+/, 3)[1];
      let image;
      switch (mimeType) {
        case 'image/png':
          image = await pdfDoc.embedPng(tokenPages[i][j].img);
          break;
        case 'image/jpeg':
          image = await pdfDoc.embedJpg(tokenPages[i][j].img);
          break;
        default:
          image = null;
      }
      page.drawImage(image, {
        x: converter(tokenPages[i][j].x) + converter(paddingLeft),
        y: pageFormat.height - converter(tokenPages[i][j].y) - converter(tokenPages[i][j].size) - converter(paddingTop),
        width: converter(tokenPages[i][j].size),
        height: converter(tokenPages[i][j].size)
      });
    }
  }
  let pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
  document.getElementById('pdf-viewer').src = pdfDataUri;
}

function parseTokens() {
  // Generating an array of pages and tokens on them
  // x - horizontal, y - vertical
  let pages = [];
  let sizeModifer = parseFloat(document.getElementById('token-width').value);
  let paddingTop = parseFloat(document.getElementById('padding-top').value);
  let paddingBottom = parseFloat(document.getElementById('padding-bottom').value);
  let paddingLeft = parseFloat(document.getElementById('padding-left').value);
  let paddingRight = parseFloat(document.getElementById('padding-right').value);
  let converter;
  let pageFormat;
  switch (document.getElementById('units').value) {
    case 'mm':
      converter = ptToMm;
      break;
    case 'cm':
      converter = ptToCm;
      break;
    case 'inch':
      converter = ptToInch;
      break;
    default:
      converter = ptToMm;
  }
  switch (document.getElementById('page-format').value) {
    case 'A4':
      pageFormat = pageSizes.A4;
      break;
    case 'Letter':
      pageFormat = pageSizes.Letter;
      break;
    default:
      pageFormat = pageSizes.A4;;
  }
  let pageWidth = converter(pageFormat.width) - paddingLeft - paddingRight;
  let pageHeight = converter(pageFormat.height) - paddingTop - paddingBottom;
  let step = sizeModifer * 0.25;
  for (let t = 0; t < tokensList.length; t++) {
    for (let c = 0; c < tokensList[t].count; c++) {
      let tokenSize = sizeModifer;
      switch (tokensList[t].size) {
        case 'tiny':
          tokenSize = sizeModifer * 0.5;
          break;
        case 'small':
          tokenSize = sizeModifer * 0.75;
          break;
        case 'medium':
          tokenSize = sizeModifer;
          break;
        case 'large':
          tokenSize = sizeModifer * 2;
          break;
        case 'huge':
          tokenSize = sizeModifer * 3;
          break;
        case 'gargantuan':
          tokenSize = sizeModifer * 4;
          break;
        default:
          tokenSize = sizeModifer;
      }
      isPlaced = false;
      while (!isPlaced) {
        for (let i = 0; i < pages.length; i++) {
          for (let y = 0.0; y < pageHeight; y += step) {
            for (let x = 0.0; x < pageWidth; x += step) {
              // Try to place token on a page, check if place is free
              let isIntersection = false;
              for (let j = 0; j < pages[i].length; j++) {
                // Detect intersection with tokens
                if (detectIntersection(x, y, x + tokenSize, y + tokenSize,
                  pages[i][j].x, pages[i][j].y, pages[i][j].x + pages[i][j].size, pages[i][j].y + pages[i][j].size)) {
                  isIntersection = true;
                }
                // Detect intersection with borders
                if (!isIntersection) {
                  if (x + tokenSize > pageWidth || y + tokenSize > pageHeight) {
                    isIntersection = true;
                  }
                }
              }
              // Plase token if there's no intersections
              if (!isIntersection) {
                pages[i].push({x: x, y: y, size: tokenSize, img: tokensList[t].img});
                isPlaced = true;
                break;
              }
              if (isPlaced)
                break;
            }
            if (isPlaced)
              break;
          }
          if (isPlaced)
            break;
        }
        // Create new page if there's no more free space
        if (!isPlaced) {
          pages.push([{x: 0.0, y: 0.0, size: tokenSize, img: tokensList[t].img}]);
          isPlaced = true;
        }
      }
    }
  }
  createPdf(pages, pageFormat, paddingTop, paddingBottom, paddingLeft, paddingRight);
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
        <div>
          <button id="card-up-${i}" class="card-move" onclick="upToken(this)">
            <img class="card-move-img" src="img/up.png">
          </button>
        </div>
        <div>
          <button id="card-down-${i}" class="card-move" onclick="downToken(this)">
            <img class="card-move-img" src="img/down.png">
          </button>
        </div>
        </td>
        <td>
          <img class="card-img" src="${tokensList[i].img}">
        </td>
        <td>
          <input type="text" class="card-input" id="card-text-${i}" value="${tokensList[i].name}" onchange="changeName(this)"><br>
          <label for="card-count-${i}" class="card-label" onChange="changeNumber(this)">Number of copies</label><br>
          <input type="number" class="card-input" id="card-count-${i}" value="${tokensList[i].count}" onchange="changeNumber(this)"><br>
          <label for="card-size-${i}" class="card-label">Size of token</label><br>
          <select name="card-size-${i}" class="card-input" id="card-size-${i}" index="${i}" onchange="changeSize(this)">
            <option value="tiny"${tokensList[i].size == 'tiny' ? ' selected' : ''}>Tiny</option>
            <option value="small"${tokensList[i].size == 'small' ? ' selected' : ''}>Small</option>
            <option value="medium"${tokensList[i].size == 'medium' ? ' selected' : ''}>Medium</option>
            <option value="large"${tokensList[i].size == 'large' ? ' selected' : ''}>Large</option>
            <option value="huge"${tokensList[i].size == 'huge' ? ' selected' : ''}>Huge</option>
            <option value="gargantuan"${tokensList[i].size == 'gargantuan' ? ' selected' : ''}>Gargantuan</option>
          </select>
        </td>
        <td>
          <button id="card-delete-${i}" class="card-delete" onclick="deleteToken(this)">
            <img class="card-delete-img" src="img/delete.png">
          </button>
        </td>
        </tr></table>
    </div>`;
  }
}

function changeName(input) {
  tokensList[getID(input)].name = input.value;
}

function changeNumber(input) {
  tokensList[getID(input)].count = parseInt(input.value);
}

function changeSize(input) {
  tokensList[getID(input)].size = input.value;
}

function deleteToken(button) {
  tokensList.splice(getID(button), 1);
  showTokens();
}

function upToken(button) {
  tokenID = getID(button);
  if (tokenID == 0) {
    return;
  }
  [tokensList[tokenID], tokensList[tokenID - 1]] = [tokensList[tokenID - 1], tokensList[tokenID]];
  showTokens();
}

function downToken(button) {
  tokenID = getID(button);
  if (tokenID == tokensList.length - 1) {
    return;
  }
  [tokensList[tokenID], tokensList[tokenID + 1]] = [tokensList[tokenID + 1], tokensList[tokenID]];
  showTokens();
}

function uploadTokens(input) {
  for (let i = 0; i < input.files.length; i++) {
    let file = input.files.item(i);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
      tokensList.push({name: file.name, count: 1, size: 'medium', img: event.target.result});
      showTokens();
    };
  }
}
