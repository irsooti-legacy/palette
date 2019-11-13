import colorThief, { rgbToHex } from './palette';
// import reset from 'reset-css/reset.css';

const $uploadButton = window.document.querySelector('#upload');
const $img = document.querySelector('img');
const $uploadFakeButton = window.document.querySelector('.upload-image');
const $downloadAsText = window.document.querySelector('#downloadFile');

let store = [];

$uploadFakeButton.addEventListener('click', () => $uploadButton.click());
$img.parentElement.addEventListener('drop', dropHandler);
$img.parentElement.addEventListener('dragenter', dragenter);
$img.parentElement.addEventListener('dragleave', dragleave);
$img.parentElement.addEventListener('dragend', dragend);
$img.parentElement.addEventListener('dragover', dragover);
$img.addEventListener('load', function({ target }) {
  const palettes = colorThief.getPalette(target);
  const mainColor = colorThief.getColor(target);

  const colors = palettes.map(r => rgbToHex(...r));
  const color = rgbToHex(...mainColor);
  store = colors;

  renderColorElements(colors.map(c => createColorElement(c)));
  renderMainColorElement(createColorElement(color, 'big-primary'));
});

$uploadButton.addEventListener('change', fn => {
  toBase64(fn.target.files[0]).then(r => {
    $img.setAttribute('src', r);
  });
});

$downloadAsText.addEventListener('click', () => {
  if (store.length > 0) download('palette.txt', store.join('\r\n'));
});

/**
 *
 * @param {any} file
 */
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 *
 * @param {string} color
 * @return {HTMLDivElement}
 */
function createColorElement(color, className = 'colors', text = '') {
  const $div = window.document.createElement('div');
  $div.style.borderRadius = '50%';
  $div.style.display = 'inline-block';
  $div.style.backgroundColor = color;
  $div.textContent = text;
  $div.classList.add(className);
  $div.onclick = () => copyToClipboard(color);

  return $div;
}

/**
 *
 * @param {HTMLDivElement[]} elements
 * @returns {void}
 */
function renderColorElements(elements) {
  const $fragment = document.createDocumentFragment();
  const $container = window.document.querySelector('#colors');

  $container.innerHTML = '';

  for (const element of elements) {
    $fragment.appendChild(element);
  }

  $container.appendChild($fragment);
}

/**
 *
 * @param {HTMLDivElement} $element
 * @returns {void}
 */
function renderMainColorElement($element) {
  const $container = window.document.querySelector('#main-color');

  $container.innerHTML = '';

  $container.appendChild($element);
}

function dropHandler(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        toBase64(file).then(r => {
          $img.setAttribute('src', r);
        });
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      toBase64(ev.dataTransfer.items[i].getAsFile()).then(r => {
        $img.setAttribute('src', r);
      });
    }
  }

  ev.currentTarget.classList.remove('dragover');
}

function dragover(e) {
  e.preventDefault();
}
function dragenter(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}

function dragleave(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
}

function dragend(e) {
  e.currentTarget.classList.remove('dragover');
}

function copyToClipboard(str) {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
