const dictEn = {
  'page': {
    'load-project': 'Load project',
    'save-project': 'Save project',
    'reset-default': 'Reset default settings',
    'page-format-label': 'Page format',
    'units-label': 'Units',
    'mm': 'Millimeters',
    'cm': 'Centimeters',
    'inch': 'Inches',
    'token-width-label': 'Medium token width',
    'padding-top-label': 'Top margin',
    'padding-bottom-label': 'Bottom margin',
    'padding-left-label': 'Left margin',
    'padding-right-label': 'Right margin',
    'token-padding-label': 'Token padding',
    'render-borders-label': 'Render margins from the edge of the sheet',
    'export-pdf': 'Export to PDF',
    'add-token': 'Upload tokens',
    'dragndrop-zone': 'Drop files here to upload'
  },
  'tokens': {
    'count': 'Number of copies',
    'size': 'Size of token',
    'tiny': 'Tiny',
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'huge': 'Huge',
    'gargantuan': 'Gargantuan'

  }
};
const dictRu = {
  'page': {
    'load-project': 'Открыть проект',
    'save-project': 'Сохранить проект',
    'reset-default': 'Настройки по умолчанию',
    'page-format-label': 'Формат страницы',
    'units-label': 'Единицы измерения',
    'mm': 'Миллиметры',
    'cm': 'Сантиметры',
    'inch': 'Дюймы',
    'token-width-label': 'Ширина среднего токена',
    'padding-top-label': 'Отступ сверху',
    'padding-bottom-label': 'Отступ снизу',
    'padding-left-label': 'Отступ слева',
    'padding-right-label': 'Отступ справа',
    'token-padding-label': 'Отступ вокруг токена',
    'render-borders-label': 'Отрисовывать отступы от края листа',
    'export-pdf': 'Экспорт в PDF',
    'add-token': 'Загрузить токены',
    'dragndrop-zone': 'Отпустите файлы здесь, чтобы загрузить'
  },
  'tokens': {
    'count': 'Количество копий',
    'size': 'Размер токена',
    'tiny': 'Крошечный',
    'small': 'Маленький',
    'medium': 'Средний',
    'large': 'Большой',
    'huge': 'Огромный',
    'gargantuan': 'Громадный'

  }
};

const availableLanguages = ['en', 'ru'];
let isDefaultLang = true;
for (let i = 0; i < navigator.languages.length; i++) {
  lang = navigator.languages[i].split('-')[0];
  if (availableLanguages.includes(lang)) {
    document.getElementById('locale').value = lang;
    isDefaultLang = false;
    break;
  }
}
if (isDefaultLang) {
  document.getElementById('locale').value = en;
}
switchLocale(false);

function switchLocale(updateTokens) {
  let locale = document.getElementById('locale').value;
  switch (locale) {
    case 'en':
      dictionary = dictEn;
      break;
    case 'ru':
      dictionary = dictRu;
      break;
    default:
      dictionary = dictEn;
  }
  Object.keys(dictionary.page).forEach(function (key) {
    document.getElementById(key).innerHTML = dictionary.page[key];
  });
  if (updateTokens) {
    showTokens();
  }
}
