// js/player.js — Player de música funcional

(function () {
  const audio        = document.getElementById('audioPlayer');
  const btnPlay       = document.getElementById('btnPlay');
  const btnPrev       = document.getElementById('btnPrev');
  const btnNext       = document.getElementById('btnNext');
  const progressBar   = document.getElementById('progressBar');
  const progressFill  = document.getElementById('progressFill');
  const timeAtual     = document.getElementById('timeAtual');
  const timeTotal     = document.getElementById('timeTotal');
  const volumeSlider   = document.getElementById('volumeSlider');
  const playerSong    = document.getElementById('playerSong');
  const playerArtist  = document.getElementById('playerArtist');
  const playerIcon    = document.getElementById('playerIcon');

  const cards = Array.from(document.querySelectorAll('.main_col.playable'));
  let indiceAtual = -1;
  let tocando = false;

  // volume inicial
  audio.volume = volumeSlider.value / 100;

  function formatarTempo(segundos) {
    if (isNaN(segundos)) return '0:00';
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  }

  function carregarFaixa(indice, autoPlay = true) {
    if (indice < 0 || indice >= cards.length) return;

    // remove destaque do card anterior
    cards.forEach(c => c.classList.remove('playing'));

    indiceAtual = indice;
    const card = cards[indiceAtual];
    card.classList.add('playing');

    const arquivo = card.dataset.file;
    const artista = card.dataset.artist;
    const musica  = card.dataset.song;
    const icone   = card.dataset.icon || 'fa-music';

    audio.src = arquivo;
    playerSong.textContent = musica;
    playerArtist.textContent = artista;
    playerIcon.innerHTML = `<i class="fas ${icone}"></i>`;

    if (autoPlay) {
      audio.play();
      tocando = true;
      atualizarBotaoPlay();
    }
  }

  function atualizarBotaoPlay() {
    btnPlay.innerHTML = tocando
      ? '<i class="fas fa-pause"></i>'
      : '<i class="fas fa-play"></i>';
  }

  function togglePlay() {
    if (indiceAtual === -1) {
      // nenhuma música selecionada ainda — toca a primeira
      carregarFaixa(0);
      return;
    }

    if (tocando) {
      audio.pause();
    } else {
      audio.play();
    }
    tocando = !tocando;
    atualizarBotaoPlay();
  }

  function proximaFaixa() {
    const novoIndice = (indiceAtual + 1) % cards.length;
    carregarFaixa(novoIndice);
  }

  function faixaAnterior() {
    const novoIndice = (indiceAtual - 1 + cards.length) % cards.length;
    carregarFaixa(novoIndice);
  }

  // ---- clique nos cards de música ----
  cards.forEach((card, i) => {
    card.addEventListener('click', () => carregarFaixa(i));
  });

  // ---- controles ----
  btnPlay.addEventListener('click', (e) => { e.preventDefault(); togglePlay(); });
  btnNext.addEventListener('click', (e) => { e.preventDefault(); proximaFaixa(); });
  btnPrev.addEventListener('click', (e) => { e.preventDefault(); faixaAnterior(); });

  // ---- progresso da música ----
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      timeAtual.textContent = formatarTempo(audio.currentTime);
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatarTempo(audio.duration);
  });

  audio.addEventListener('ended', () => {
    proximaFaixa();
  });

  // ---- clique na barra de progresso (pular para o ponto) ----
  progressBar.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  // ---- volume ----
  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
  });

  // ---- atalho de teclado: espaço para play/pause ----
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      togglePlay();
    }
  });
})();
