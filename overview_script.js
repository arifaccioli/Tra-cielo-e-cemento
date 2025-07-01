// Carica e legge il CSV
async function fetchCSV() {
  try {
    const res = await fetch('picarrange.csv');
    if (!res.ok) throw new Error('Errore nel recupero del file CSV');

    const text = await res.text();
    const rows = text.trim().split('\n');
    const headers = rows[0].split(',');

    const getIndex = col => headers.indexOf(col);
    const idx = {
      imgSmall: getIndex('image_url_small'),
      imgLarge: getIndex('image_url'),
      sciName: getIndex('scientific_name'),
      commonName: getIndex('common_name'),
      lat: getIndex('lat'),
      lon: getIndex('long'),
      kingdom: getIndex('taxon_kingdom_name'),
      minaccia: getIndex('minaccia'),
      originStatus: getIndex('origin_status'),
      classe: getIndex('classe'),
      phylum: getIndex('phylum'),
      filename: getIndex('filename'),
      cartella: getIndex('cartella'),

    };

    return rows.slice(1).filter(r => r.trim()).map(row => {
      const cols = row.split(',');
      return {
        imgSmall: cols[idx.imgSmall],
        imgLarge: cols[idx.imgLarge],
        sciName: cols[idx.sciName],
        commonName: cols[idx.commonName],
        lat: cols[idx.lat],
        lon: cols[idx.lon],
        kingdom: cols[idx.kingdom] || 'Unknown',
        minaccia: cols[idx.minaccia] || 'Unknown',
        originStatus: cols[idx.originStatus] || 'Unknown',
        classe: cols[idx.classe] || 'Unknown',
        phylum: cols[idx.phylum] || 'Unknown',
        filename: cols[idx.filename] || 'Unknown',
        cartella: cols[idx.cartella] || 'Unknown',


      };
    });
  } catch (error) {
    console.error('Errore:', error);
    alert('Errore nel caricamento del file CSV.');
    return [];
  }
}
function createImage(item) {
  const div = document.createElement('div');
  div.className = 'image-item';
  div.dataset.kingdom = item.kingdom;
  div.dataset.minaccia = item.minaccia;
  div.dataset.originStatus = item.originStatus;

  const img = document.createElement('img');
  img.src = item.imgSmall;
  img.alt = item.sciName || 'Image';
  div.appendChild(img);

  div.addEventListener('mouseenter', () => {
    // Controlla se l'elemento è "blurred"
    if (div.classList.contains('blurred')) return;

    const popup = document.getElementById('popup');
    document.getElementById('popup-img').src = item.imgLarge;

    // Genera il contenuto del popup con parole evidenziate
    document.getElementById('popup-info').innerHTML = `
      <p><strong class="highlight">${item.sciName}</strong></p>
      <p><span class="highlight">${item.commonName}</span></p>
      <p> <span class="highlight"> Phylum: ${item.phylum}</span></p>
      <p> <span class="highlight"> Classe: ${item.classe}</span></p>
      <p> <span class="highlight">Latitudine: ${item.lat}</span></p>
      <p> <span class="highlight"> Longitudine: ${item.lon}</span></p>
      <p> <span class="highlight"> Img: ${item.filename}</span></p>
      <p> <span class="highlight"> Categoria: ${item.cartella}</span></p>




    `;

    popup.classList.add('show');
  });

  div.addEventListener('mouseleave', () => {
    document.getElementById('popup').classList.remove('show');
  });

  return div;
}

// Applica il filtro blur sugli item in base al tipo selezionato
function applyFilter(selectedCategory) {
  const allItems = document.querySelectorAll('.image-item');

  allItems.forEach(item => {
    const kingdom = item.dataset.kingdom;
    const minaccia = (item.dataset.minaccia || '').toLowerCase();
    const originStatus = (item.dataset.originStatus || '').toLowerCase();

    let blurred = false;

    if (selectedCategory === 'Animalia' && kingdom !== 'Animalia') blurred = true;
    if (selectedCategory === 'Plantae' && kingdom !== 'Plantae') blurred = true;
    if (selectedCategory === 'Fungi' && kingdom !== 'Fungi') blurred = true;
    if (selectedCategory === 'minaccia' && minaccia === 'non_minacciata') blurred = true;
    if (selectedCategory === 'autoctona' && originStatus !== 'autoctona') blurred = true;
    if (selectedCategory === 'alloctona' && originStatus !== 'alloctona') blurred = true;

    if (selectedCategory === 'ALL') blurred = false;

    item.classList.toggle('blurred', blurred);
  });

  document.querySelectorAll('.category-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === selectedCategory);
  });
}

// Inizializza i bottoni filtro
function initFilterButtons() {
  document.querySelectorAll('.category-button').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const selected = button.dataset.category;
      applyFilter(selected);
    });
  });
}

// Rimuove i blur cliccando ovunque nel body
function initBodyClick() {
  document.body.addEventListener('click', () => {
    applyFilter('ALL');
  });
}

// Inizializzazione generale
fetchCSV().then(data => {
  const grid = document.getElementById('image-grid');
  data.forEach(item => grid.appendChild(createImage(item)));
  initFilterButtons();
  initBodyClick();
});
