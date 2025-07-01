const canvas = document.getElementById('canvas');
const customCursor = document.getElementById('custom-cursor');

let images = [];

async function loadCSV() {
  const res = await fetch('picarrange.csv');
  const text = await res.text();
  const rows = text.trim().split('\n');
  const headers = rows[0].split(',');

  const imgIndex = headers.indexOf('image_url_small');
  if (imgIndex === -1) {
    console.error('Colonna image_url_small non trovata');
    return;
  }

  images = rows.slice(1).map(r => r.split(',')[imgIndex]);
}

function createCursorTrail(x, y) {
  // Crea una singola immagine quadrata alla posizione del cursore
  const tile = document.createElement('div');
  tile.className = 'image-tile';
  const randomImage = images[Math.floor(Math.random() * images.length)];
  tile.style.backgroundImage = `url(${randomImage})`;
  tile.style.left = `${x - 62}px`; // centro l'immagine sul cursore
  tile.style.top = `${y - 62}px`;

  canvas.appendChild(tile);

  // Fai svanire e rimuovi dopo 600ms
  setTimeout(() => {
    tile.style.opacity = '0';
  }, 400);

  setTimeout(() => {
    tile.remove();
  }, 600);
}

// Segui il mouse
document.addEventListener('mousemove', (e) => {
  customCursor.style.left = `${e.clientX}px`;
  customCursor.style.top = `${e.clientY}px`;

  if (images.length) {
    createCursorTrail(e.clientX, e.clientY);
  }
});

loadCSV();
