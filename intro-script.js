document.addEventListener('DOMContentLoaded', () => {
  const imageContainer = document.getElementById('image-container');

  // Crea il contenitore del messaggio categoria
  const categoryMessage = document.createElement('div');
  categoryMessage.id = 'categoryMessage';
  categoryMessage.style.position = 'fixed';
  categoryMessage.style.top = '80%';
  categoryMessage.style.left = '50%';
  categoryMessage.style.transform = 'translate(-50%, -50%)';
  categoryMessage.style.zIndex = '100';
  categoryMessage.style.display = 'none';
  categoryMessage.style.textAlign = 'left';
  categoryMessage.style.fontFamily = '"Arial Narrow", Helvetica, sans-serif';
  categoryMessage.style.fontSize = '25px';
  categoryMessage.style.fontWeight = '400';
  categoryMessage.style.color = '#000';

  // Titolo e descrizione
  const categoryTitle = document.createElement('p');
  const categoryDescription = document.createElement('p');

  [categoryTitle, categoryDescription].forEach(el => {
    el.style.margin = '0 0 20px 0';
    el.style.fontFamily = '"Arial Narrow", Helvetica, sans-serif';
    el.style.fontSize = '25px';
    el.style.fontWeight = '400';
    el.style.color = '#000';
    el.style.lineHeight = '1.25';
  });

  // Bottone continua
  const continueBtn = document.createElement('button');
  continueBtn.textContent = '[Continua]';
  continueBtn.className = 'highlight-button';
  continueBtn.style.textAlign = 'left';

  // Aggiunge gli elementi al contenitore
  categoryMessage.appendChild(categoryTitle);
  categoryMessage.appendChild(categoryDescription);
  categoryMessage.appendChild(continueBtn);
  document.body.appendChild(categoryMessage);

  // Stile evidenziatore
  const style = document.createElement('style');
  style.textContent = `
    .highlight {
      background: #00fb10;
      padding: 0 4px;
      border-radius: 0;
    }
    .highlight-button {
      background: #00fb10;
      color: #000;
      border: none;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 25px;
      font-family: "Arial Narrow", Helvetica, sans-serif;
      font-weight: 400;
      text-align: left;
      margin-top: 20px;
      display: inline-block;
      border-radius: 0;
    }
    .highlight-button:hover {
      background: #00e60c;
    }
  `;
  document.head.appendChild(style);

  // Variabili generali
  let images = [];
  let currentIndex = 0;
  const imagesPerRow = 20;
  let currentRow;
  let imagesInCurrentRow = 0;
  let currentCategory = '';
  let isPaused = false;

  // Messaggi categoria
  const categoryMessages = {
    cielo: {
      title: 'Cielo',
      text: `Osservazioni di animali in volo durante le migrazioni e i loro spostamenti sopra il Parco Regionale del Fiume Sile. Nel periodo autunnale e invernale, numerose specie di uccelli si spostano attraversando l’area, utilizzando il cielo come via di passaggio.`
    },
    antenna: {
      title: 'Antenne',
      text: `Osservazioni di specie che sostano e utilizzano le antenne delle abitazioni circostanti il Parco del Sile come punti di appoggio e siti di nidificazione. Queste strutture offrono rifugio temporaneo, ma rappresentano al tempo stesso un ambiente insidioso e inadatto alla riproduzione, evidenziando come alcune infrastrutture umane possano interferire e risultare potenzialmente dannose per la vita di altre specie.
`
    },
    tetto: {
      title: 'Tetti e comignoli',
      text: `Osservazioni di volatili che sfruttano tetti, comignoli e strutture sopraelevate delle abitazioni come luoghi di sosta, nidificazione e punti di osservazione privilegiati. In questi spazi artificiali, le specie si adattano all’architettura umana, trasformando elementi costruiti in nuove risorse e rifugi all’interno del paesaggio urbano.`
    },
    alberi: {
      title: 'Alberi',
      text: `Osservazioni delle specie che usano gli alberi come rifugio, spazio di nidificazione, punto di appostamento e fonte di nutrimento. Nel Parco del Sile gli alberi offrono riparo a volatili, scoiattoli, insetti  e numerose specie di funghi simbionti. Gli alberi diventano veri e proprie abitazioni verticali, ambienti complessi capaci di ospitare differenti comunità biologiche, proteggendo e sostenendo molteplici forme di vita durante tutte le stagioni.`
    },
    erba: {
      title: 'Vegetazione',
      text: `Osservazioni delle specie che abitano, formano e attraversano l’ambiente vegetale del Parco Regionale del Fiume Sile. Piante, arbusti e il sottobosco costituiscono una rete vitale di relazioni ecologiche. Questo ecosistema vegetale ospita insetti impollinatori, piccoli mammiferi e funghi che collaborano nel ciclo di scambio di risorse, decomposizione e rigenerazione.`
    },
    acqua: {
      title: 'Acqua',
      text: `Osservazioni di esseri viventi che abitano le zone umide del fiume Sile. Il Sile, con le sue risorgive e il suo corso tranquillo, rappresenta un habitat essenziale per anfibi, pesci, rettili, insetti acquatici e numerose specie vegetali tipiche delle acque dolci. Qui, l’acqua genera un ecosistema complesso in cui le specie interagiscono in stretta interdipendenza, contribuendo a mantenere l’equilibrio ecologico e a filtrare naturalmente l’ambiente.`
    },
    mani: {
      title: 'Interazioni umane',
      text: `Osservazioni di esseri viventi ripresi nel punto di vista più ravvicinato, fotografati insieme alle mani dell’osservatore. Immagini che testimoniano il rapporto complesso tra l’essere umano e le altre forme di vita. Attraverso il contatto diretto, emergono gesti di cura, protezione, ma anche di controllo e appropriazione. `
    },
    cemento: {
      title: 'Cemento',
      text: `Osservazioni di specie che popolano gli spazi artificiali della città: marciapiedi, sottotetti e aree industriali. Esseri viventi che trovano tra il cemento nuove strategie di sopravvivenza, adattandosi a un ambiente modellato dall’essere umano. In questi piccoli interstizi, la natura si riappropria dello spazio, trasformando il paesaggio urbano in un habitat ibrido. Nel contesto del Parco Regionale del Fiume Sile, le zone urbanizzate limitrofe diventano estensioni ecologiche marginali, luoghi di rifugio e passaggio per specie che sono obbligate ad adattarsi all’azione dell’uomo.`
    }
  };

  // Carica CSV
  async function loadCSV() {
    try {
      const res = await fetch('picarrange.csv');
      const text = await res.text();
      const rows = text.trim().split('\n');
      const headers = rows[0].split(',');

      const imgIndex = headers.indexOf('image_url_small');
      const folderIndex = headers.indexOf('cartella');

      if (imgIndex === -1 || folderIndex === -1) {
        console.error('Colonne richieste non trovate nel CSV');
        return;
      }

      images = rows.slice(1).map(r => {
        const cols = r.split(',');
        return {
          url: cols[imgIndex],
          folder: cols[folderIndex]
        };
      }).reverse();

      loadNextImage();
    } catch (error) {
      console.error('Errore nel caricare il CSV:', error);
    }
  }

  // Aggiunge immagine alla griglia
  function addImage(url) {
    if (!currentRow || imagesInCurrentRow >= imagesPerRow) {
      currentRow = document.createElement('div');
      currentRow.className = 'image-row';
      imageContainer.appendChild(currentRow);
      imagesInCurrentRow = 0;
    }

    const imgElement = document.createElement('img');
    imgElement.src = url;
    imgElement.alt = 'Image';

    imgElement.onload = () => {
      setTimeout(() => {
        imgElement.classList.add('fade-in');
      }, 100);
    };

    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.appendChild(imgElement);

    currentRow.appendChild(imageItem);
    imagesInCurrentRow++;
  }

  function loadNextImage() {
    if (currentIndex >= images.length) {
      console.log('Fatto');
      setTimeout(() => window.location.href = 'overview.html', 100);
      return;
    }

    if (isPaused) return;

    const { url, folder } = images[currentIndex];

    const isFastCategory = folder === 'acqua' || folder === 'erba';
    const loadDelay = isFastCategory ? 5 : 10;

    if (folder !== currentCategory) {
      currentCategory = folder;
      pauseAnimation();
      showCategoryMessage(folder);
      return;
    }

    addImage(url);
    currentIndex++;
    setTimeout(loadNextImage, loadDelay);
  }

  function pauseAnimation() {
    isPaused = true;
  }

  function resumeAnimation() {
    isPaused = false;
    categoryMessage.style.display = 'none';
    loadNextImage();
  }

  function showCategoryMessage(category) {
    const normalizedCategory = category.trim().toLowerCase();
    const message = categoryMessages[normalizedCategory];

    if (message) {
      categoryTitle.innerHTML = `<span class="highlight">${message.title}</span>`;
      categoryDescription.innerHTML = `<span class="highlight">${message.text}</span>`;
      categoryMessage.style.display = 'block';
    } else {
      console.error(`Categoria non trovata: ${category}`);
      resumeAnimation();
    }
  }

  continueBtn.addEventListener('click', resumeAnimation);

  loadCSV();
});