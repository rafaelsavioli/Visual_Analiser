(function() {
  'use strict';

  // ===== DOM REFS =====
  const secIntro = document.getElementById('section-intro');
  const secQuiz = document.getElementById('section-quiz');
  const secLoading = document.getElementById('section-loading');
  const secResult = document.getElementById('section-result');
  const nameInput = document.getElementById('name-input');
  const fileInput = document.getElementById('file-input');
  const uploadLabel = document.getElementById('upload-label');
  const previewContainer = document.getElementById('preview-container');
  const btnContinue = document.getElementById('btn-continue');
  const btnQuizNext = document.getElementById('btn-quiz-next');
  const btnQuizPrev = document.getElementById('btn-quiz-prev');
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnRestart = document.getElementById('btn-restart');
  const quizQuestionArea = document.getElementById('quiz-question-area');
  const quizCounter = document.getElementById('quiz-counter');
  const quizDots = document.getElementById('quiz-dots');
  const loadingMessage = document.getElementById('loading-message');
  const loadingBar = document.getElementById('loading-bar');
  const loadingPercent = document.getElementById('loading-percent');
  const loadingPhoto = document.getElementById('loading-photo');
  const resultTopics = document.getElementById('result-topics');
  const resultGreeting = document.getElementById('result-greeting');

  // ===== STATE =====
  let userName = '';
  let photoDataURL = '';
  let currentQuestion = 0;
  let quizAnswers = [null, null, null, null];

  // ===== SECTION MANAGEMENT =====
  function showSection(section) {
    [secIntro, secQuiz, secLoading, secResult].forEach(function(s) {
      s.classList.remove('active');
      s.classList.remove('section-transition');
    });
    section.classList.add('active');
    section.classList.add('section-transition');
  }

  // ===== PHOTO UPLOAD =====
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      photoDataURL = ev.target.result;
      uploadLabel.style.display = 'none';
      previewContainer.style.display = 'block';
      previewContainer.innerHTML = '<div style="position:relative;display:inline-block;border-radius:50%;box-shadow:0 0 0 0 rgba(232,146,124,0.3);animation:glowPulse 2s ease-in-out infinite;"><img src="' + photoDataURL + '" alt="Sua foto" class="preview-img fade-in" style="margin:0 auto;"></div>';
      updateContinueButton();
    };
    reader.readAsDataURL(file);
  });

  // ===== NAME INPUT =====
  nameInput.addEventListener('input', updateContinueButton);

  function updateContinueButton() {
    btnContinue.disabled = !(nameInput.value.trim().length > 0 && photoDataURL.length > 0);
  }

  // ===== CONTINUE =====
  btnContinue.addEventListener('click', function() {
    userName = nameInput.value.trim();
    showSection(secQuiz);
    initQuiz();
  });

  // ===== QUIZ DATA =====
  var quizData = [
    {
      question: 'Como voc\u00ea prefere se vestir no dia a dia?',
      options: [
        { text: '\uD83D\uDC56 Confort\u00e1vel e despojado', scores: { casual: 2, classico: 0, romantico: 0, expressivo: 0 } },
        { text: '\uD83D\uDC54 Elegante e cl\u00e1ssico', scores: { casual: 0, classico: 2, romantico: 0, expressivo: 0 } },
        { text: '\uD83C\uDF38 Feminino e rom\u00e2ntico', scores: { casual: 0, classico: 0, romantico: 2, expressivo: 0 } },
        { text: '\uD83C\uDFA8 Criativo e diferente', scores: { casual: 0, classico: 0, romantico: 0, expressivo: 2 } }
      ]
    },
    {
      question: 'Qual pe\u00e7a voc\u00ea nunca dispensa?',
      options: [
        { text: '\uD83D\uDC5F T\u00eanis e cal\u00e7a jeans', scores: { casual: 2, classico: 0, romantico: 0, expressivo: 0 } },
        { text: '\uD83D\uDC60 Salto e blazer', scores: { casual: 0, classico: 2, romantico: 0, expressivo: 0 } },
        { text: '\uD83D\uDC57 Vestido fluido ou sainha', scores: { casual: 0, classico: 0, romantico: 2, expressivo: 0 } },
        { text: '\uD83E\uDDE3 Algo com estampa ou textura', scores: { casual: 0, classico: 0, romantico: 0, expressivo: 2 } }
      ]
    },
    {
      question: 'Qual estampa te representa mais?',
      options: [
        { text: '\u2B1B Sem estampa \u2014 prefiro liso', scores: { casual: 1, classico: 1, romantico: 0, expressivo: 0 } },
        { text: '\uD83C\uDF3F Floral ou org\u00e2nica', scores: { casual: 0, classico: 0, romantico: 2, expressivo: 0 } },
        { text: '\uD83D\uDD32 Xadrez, listrado ou geom\u00e9trico', scores: { casual: 0, classico: 1, romantico: 0, expressivo: 1 } },
        { text: '\uD83D\uDC06 Animal print ou estampa \u00e9tnica', scores: { casual: 0, classico: 0, romantico: 0, expressivo: 2 } }
      ]
    },
    {
      question: 'Qual dessas palavras define melhor seu estilo?',
      options: [
        { text: '\uD83E\uDD0D Minimal e clean', scores: { casual: 1, classico: 1, romantico: 0, expressivo: 0 } },
        { text: '\uD83D\uDC8E Sofisticado e atemporal', scores: { casual: 0, classico: 2, romantico: 0, expressivo: 0 } },
        { text: '\uD83C\uDF37 Delicado e encantador', scores: { casual: 0, classico: 0, romantico: 2, expressivo: 0 } },
        { text: '\u26A1 Ousado e expressivo', scores: { casual: 0, classico: 0, romantico: 0, expressivo: 2 } }
      ]
    }
  ];

  var styleNames = {
    casual: { label: 'Casual Natural', emoji: '\uD83D\uDC56', desc: 'Despojado, confort\u00e1vel, aut\u00eantico' },
    classico: { label: 'Cl\u00e1ssico Elegante', emoji: '\uD83D\uDC8E', desc: 'Sofisticado, atemporal, refinado' },
    romantico: { label: 'Rom\u00e2ntico Feminino', emoji: '\uD83C\uDF38', desc: 'Delicado, fluido, encantador' },
    expressivo: { label: 'Criativo Expressivo', emoji: '\uD83C\uDFA8', desc: 'Ousado, \u00fanico, marcante' }
  };

  // ===== QUIZ INIT =====
  function initQuiz() {
    currentQuestion = 0;
    quizAnswers = [null, null, null, null];
    renderQuestion(0);
    btnQuizNext.disabled = true;
    btnAnalyze.style.display = 'none';
  }

  function renderQuestion(index) {
    var q = quizData[index];
    var answered = quizAnswers[index];
    var html = '<div class="slide-up" style="margin-bottom:16px;">';
    html += '<p style="font-weight:500;margin:0 0 14px;font-size:1rem;">' + q.question + '</p>';
    for (var oi = 0; oi < q.options.length; oi++) {
      var opt = q.options[oi];
      var sel = (answered === oi) ? ' selected' : '';
      var slideClass = (oi % 2 === 0) ? 'option-slide-left' : 'option-slide-right';
      html += '<button class="quiz-option ' + slideClass + sel + '" data-opt="' + oi + '" data-delay="' + (oi * 80) + '" aria-pressed="' + (answered === oi ? 'true' : 'false') + '" style="animation-delay:' + (oi * 80) + 'ms;">' + opt.text + '</button>';
    }
    html += '</div>';
    quizQuestionArea.innerHTML = html;

    quizCounter.textContent = (index + 1) + ' / 4';
    var dots = quizDots.children;
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.remove('active', 'done');
      if (d === index) dots[d].classList.add('active');
      else if (d < index) dots[d].classList.add('done');
    }

    var btns = quizQuestionArea.querySelectorAll('.quiz-option');
    for (var b = 0; b < btns.length; b++) {
      btns[b].addEventListener('click', function() {
        var optIndex = parseInt(this.dataset.opt);
        selectOption(index, optIndex);
      });
    }

    btnQuizNext.disabled = (quizAnswers[index] === null);
    btnQuizPrev.style.visibility = (index === 0) ? 'hidden' : 'visible';

    if (index === quizData.length - 1) {
      btnQuizNext.style.display = 'none';
      var allDone = true;
      for (var a = 0; a < quizAnswers.length; a++) { if (quizAnswers[a] === null) { allDone = false; break; } }
      btnAnalyze.style.display = allDone ? 'block' : 'none';
    } else {
      btnQuizNext.style.display = 'block';
      btnQuizNext.textContent = 'Pr\u00f3xima \u2192';
      btnAnalyze.style.display = 'none';
    }
  }

  function selectOption(qIndex, optIndex) {
    quizAnswers[qIndex] = optIndex;
    var btns = quizQuestionArea.querySelectorAll('.quiz-option');
    for (var b = 0; b < btns.length; b++) {
      btns[b].classList.toggle('selected', b === optIndex);
      btns[b].setAttribute('aria-pressed', b === optIndex ? 'true' : 'false');
    }
    if (qIndex === quizData.length - 1) {
      var allDone = true;
      for (var a = 0; a < quizAnswers.length; a++) { if (quizAnswers[a] === null) { allDone = false; break; } }
      if (allDone) {
        btnAnalyze.style.display = 'block';
        btnAnalyze.classList.add('fade-in');
      }
    } else {
      btnQuizNext.disabled = false;
    }
    updateDots();
  }

  function updateDots() {
    var dots = quizDots.children;
    for (var i = 0; i < dots.length; i++) {
      if (quizAnswers[i] !== null && i !== currentQuestion) {
        dots[i].classList.add('done');
        dots[i].classList.remove('active');
      }
    }
    if (quizAnswers[currentQuestion] !== null && currentQuestion < quizData.length - 1) {
      dots[currentQuestion].classList.add('done');
    }
  }

  btnQuizNext.addEventListener('click', function() {
    if (quizAnswers[currentQuestion] === null) return;
    if (currentQuestion < quizData.length - 1) {
      currentQuestion++;
      renderQuestion(currentQuestion);
    }
  });

  btnQuizPrev.addEventListener('click', function() {
    if (currentQuestion > 0) {
      currentQuestion--;
      renderQuestion(currentQuestion);
    }
  });

  // ===== QUIZ SCORING =====
  function computeQuizScore() {
    var totals = { casual: 0, classico: 0, romantico: 0, expressivo: 0 };

    for (var qi = 0; qi < quizAnswers.length; qi++) {
      var ans = quizAnswers[qi];
      if (ans === null || ans === undefined) continue;
      var q = quizData[qi];
      var opt = q.options[ans];
      if (opt && opt.scores) {
        totals.casual += opt.scores.casual || 0;
        totals.classico += opt.scores.classico || 0;
        totals.romantico += opt.scores.romantico || 0;
        totals.expressivo += opt.scores.expressivo || 0;
      }
    }

    var maxScore = 0;
    var topStyles = [];
    for (var key in totals) {
      if (totals[key] > maxScore) {
        maxScore = totals[key];
        topStyles = [key];
      } else if (totals[key] === maxScore && maxScore > 0) {
        topStyles.push(key);
      }
    }

    if (topStyles.length === 0) topStyles = ['casual'];

    return {
      totals: totals,
      primary: topStyles[0],
      secondary: topStyles.length > 1 ? topStyles[1] : null,
      primaryName: styleNames[topStyles[0]],
      secondaryName: topStyles.length > 1 ? styleNames[topStyles[1]] : null
    };
  }

  // ===== CANVAS COLOR ANALYSIS =====
  function analyzeImagePixels(imageData, w, h) {
    var data = imageData.data;
    var skinPixels = [];
    var allPixels = [];
    var total = w * h;

    for (var i = 0; i < total; i++) {
      var idx = i * 4;
      var r = data[idx];
      var g = data[idx + 1];
      var b = data[idx + 2];
      var a = data[idx + 3];
      if (a < 128) continue;

      allPixels.push({ r: r, g: g, b: b });

      var hsl = rgbToHsl(r, g, b);
      if (hsl.h >= 0 && hsl.h <= 50 && hsl.s >= 20 && hsl.s <= 70 && hsl.l >= 30 && hsl.l <= 80) {
        skinPixels.push({ r: r, g: g, b: b });
      }
    }

    var undertone = { type: 'neutro', emoji: '\uD83E\uDD0D' };
    var avgSkin = null;

    if (skinPixels.length > 50) {
      var sumR = 0, sumG = 0, sumB = 0;
      for (var s = 0; s < skinPixels.length; s++) { sumR += skinPixels[s].r; sumG += skinPixels[s].g; sumB += skinPixels[s].b; }
      avgSkin = { r: Math.round(sumR / skinPixels.length), g: Math.round(sumG / skinPixels.length), b: Math.round(sumB / skinPixels.length) };
      var diffRB = avgSkin.r - avgSkin.b;
      if (diffRB > 20) undertone = { type: 'quente', emoji: '\uD83C\uDF42' };
      else if (diffRB < -20) undertone = { type: 'frio', emoji: '\u2744\uFE0F' };
    } else {
      if (allPixels.length > 0) {
        var sR = 0, sG = 0, sB = 0;
        for (var p = 0; p < allPixels.length; p++) { sR += allPixels[p].r; sG += allPixels[p].g; sB += allPixels[p].b; }
        avgSkin = { r: Math.round(sR / allPixels.length), g: Math.round(sG / allPixels.length), b: Math.round(sB / allPixels.length) };
        var diff = avgSkin.r - avgSkin.b;
        if (diff > 20) undertone = { type: 'quente', emoji: '\uD83C\uDF42' };
        else if (diff < -20) undertone = { type: 'frio', emoji: '\u2744\uFE0F' };
      }
    }

    var dominant = medianCut(allPixels, 5);
    var colorimetry = determineColorimetry(dominant, undertone);
    var palette = getPalette(colorimetry.key);

    return {
      undertone: undertone,
      colorimetry: colorimetry,
      dominantColors: dominant,
      palette: palette
    };
  }

  function getFallbackAnalysis() {
    var fb = [
      { r: 200, g: 150, b: 130 },
      { r: 180, g: 120, b: 100 },
      { r: 220, g: 190, b: 170 },
      { r: 160, g: 100, b: 80 },
      { r: 210, g: 170, b: 150 }
    ];
    var ut = { type: 'neutro', emoji: '\uD83E\uDD0D' };
    var cm = determineColorimetry(fb, ut);
    return { undertone: ut, colorimetry: cm, dominantColors: fb, palette: getPalette(cm.key) };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function(c) { return Math.min(255, Math.max(0, Math.round(c))).toString(16).padStart(2, '0'); }).join('');
  }

  // ===== MEDIAN CUT =====
  function medianCut(pixels, targetCount) {
    if (!pixels || pixels.length === 0) {
      return [{ r: 200, g: 180, b: 160 }, { r: 180, g: 150, b: 130 }, { r: 220, g: 200, b: 180 }, { r: 160, g: 120, b: 100 }, { r: 190, g: 170, b: 150 }];
    }
    var boxes = [pixels.slice()];

    while (boxes.length < targetCount) {
      var largestBox = boxes[0];
      var largestIdx = 0;
      for (var bi = 1; bi < boxes.length; bi++) {
        if (boxes[bi].length > largestBox.length) { largestBox = boxes[bi]; largestIdx = bi; }
      }
      boxes.splice(largestIdx, 1);

      if (largestBox.length < 2) { boxes.push(largestBox); break; }

      var minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
      for (var pi = 0; pi < largestBox.length; pi++) {
        var p = largestBox[pi];
        if (p.r < minR) minR = p.r; if (p.r > maxR) maxR = p.r;
        if (p.g < minG) minG = p.g; if (p.g > maxG) maxG = p.g;
        if (p.b < minB) minB = p.b; if (p.b > maxB) maxB = p.b;
      }
      var rangeR = maxR - minR, rangeG = maxG - minG, rangeB = maxB - minB;

      var channel = 'r';
      if (rangeG >= rangeR && rangeG >= rangeB) channel = 'g';
      else if (rangeB >= rangeR && rangeB >= rangeG) channel = 'b';

      largestBox.sort(function(a, b) { return a[channel] - b[channel]; });
      var median = Math.floor(largestBox.length / 2);
      boxes.push(largestBox.slice(0, median));
      boxes.push(largestBox.slice(median));
    }

    return boxes.map(function(box) {
      var sumR = 0, sumG = 0, sumB = 0;
      for (var bpi = 0; bpi < box.length; bpi++) { sumR += box[bpi].r; sumG += box[bpi].g; sumB += box[bpi].b; }
      var len = box.length || 1;
      return { r: Math.round(sumR / len), g: Math.round(sumG / len), b: Math.round(sumB / len) };
    });
  }

  // ===== COLORIMETRY =====
  function determineColorimetry(dominant, undertone) {
    if (!dominant || dominant.length === 0) return seasons.primavera;

    var avgL = 0, avgS = 0;
    for (var ci = 0; ci < dominant.length; ci++) {
      var hsl = rgbToHsl(dominant[ci].r, dominant[ci].g, dominant[ci].b);
      avgL += hsl.l;
      avgS += hsl.s;
    }
    avgL /= dominant.length;
    avgS /= dominant.length;

    var isWarm = undertone.type === 'quente';
    var isCool = undertone.type === 'frio';
    var isNeutral = undertone.type === 'neutro';
    var isLight = avgL > 55;
    var isDark = avgL < 40;
    var isHighSat = avgS > 45;
    var isLowSat = avgS < 25;

    if (isLight && isWarm && isHighSat) return seasons.primavera;
    if (isLight && (isCool || isNeutral) && isLowSat) return seasons.verao;
    if (isDark && isWarm && !isHighSat) return seasons.outono;
    if (isDark && (isCool || isNeutral)) return seasons.inverno;
    if (isWarm) return isLight ? seasons.primavera : seasons.outono;
    if (isCool) return isLight ? seasons.verao : seasons.inverno;
    if (isLight) return isHighSat ? seasons.primavera : seasons.verao;
    return isLowSat ? seasons.outono : seasons.inverno;
  }

  var seasons = {
    primavera: { label: '\uD83C\uDF38 Primavera', key: 'primavera', desc: 'Cores claras, quentes e vibrantes \u2014 como um jardim florido.' },
    verao: { label: '\u2744\uFE0F Ver\u00e3o', key: 'verao', desc: 'Cores claras, frias e suaves \u2014 como o c\u00e9u de um dia nublado.' },
    outono: { label: '\uD83C\uDF42 Outono', key: 'outono', desc: 'Cores escuras, quentes e terrosas \u2014 como as folhas no ch\u00e3o.' },
    inverno: { label: '\uD83C\uDF19 Inverno', key: 'inverno', desc: 'Cores escuras, frias e de alto contraste \u2014 como a noite estrelada.' }
  };

  // ===== PALETTE DATABASE =====
  var palettes = {
    primavera: [
      '#F4A07A','#E8C4A0','#F7D4A8','#C8D9A0','#A8C9A0','#D4A8C0',
      '#F0B8A0','#E8D0B0','#F0D8B8','#B8D8A8','#90C8A8','#C8A8B8',
      '#E8A080','#D8B890','#E8C8A8','#A8C890','#80B890','#B898A8',
      '#F0B090','#E0C0A0','#E0D0A8','#B0D0A0','#98C0A0','#C0A0B0',
      '#E89880','#D0A888','#D8C098','#98C088','#70A880','#A88098'
    ],
    verao: [
      '#B0C8D8','#C8B8D0','#D0C0D0','#B8D0C8','#A8C8C0','#D0C8C0',
      '#A0B8D0','#B8A8C8','#C0B0C0','#A8C0B8','#98B8B0','#C0B8B0',
      '#90A8C8','#A898C0','#B0A0B8','#98B8A8','#88A8A0','#B0A8A0',
      '#8898C0','#9888B8','#A090B0','#88A898','#789898','#A09890',
      '#8088B8','#8878A8','#9080A0','#789888','#688888','#908880'
    ],
    outono: [
      '#B89068','#A88058','#987048','#C8A078','#B89070','#A88060',
      '#A87850','#987048','#886840','#B89060','#A88058','#987050',
      '#A87048','#906038','#805030','#B88868','#A07858','#907048',
      '#986840','#886038','#785030','#A88048','#907040','#806038',
      '#906048','#805038','#704028','#A07848','#886840','#785838'
    ],
    inverno: [
      '#384860','#485870','#586880','#284060','#385068','#486078',
      '#303848','#404858','#505868','#283848','#384858','#485868',
      '#384050','#485060','#586070','#203040','#304050','#405060',
      '#283040','#384050','#485060','#202838','#303848','#404858',
      '#202030','#303040','#404050','#181828','#282838','#383848'
    ]
  };

  function getPalette(seasonKey) {
    return palettes[seasonKey] || palettes.primavera;
  }

  function getSeasonalColors(seasonKey) {
    var p = palettes[seasonKey] || palettes.primavera;
    return p.slice(0, 6);
  }

  // ===== STYLING TIPS =====
  var stylingTips = {
    casual_primavera: 'Invista em pe\u00e7as leves em tons past\u00e9is quentes \u2014 camisetas algod\u00e3o, saias fluidas, jeans claros. T\u00eanis branco completa o look.',
    casual_verao: 'Aposte em basics em tons frios \u2014 branco, cinza claro, azul beb\u00ea. Jeans destroyed e moletom oversized funcionam bem.',
    casual_outono: 'Sobreposi\u00e7\u00f5es terrosas \u2014 tric\u00f4 bege, cal\u00e7a cargo marrom, botas. Tons de caramelo e verde musgo s\u00e3o seus aliados.',
    casual_inverno: 'Monocrom\u00e1tico em preto, cinza e off-white. Pe\u00e7as estruturadas casuais \u2014 sobretudo, gola alta, jeans escuro.',
    classico_primavera: 'Blazer claro, cal\u00e7a de alfaiataria em tom pastel, camisa de seda. Scarpin nude e acess\u00f3rios dourados.',
    classico_verao: 'Terninho em cinza claro ou azul gelo. Camisa branca, sapatilha. Acess\u00f3rios prateados e p\u00e9rolas.',
    classico_outono: 'Tweed, couro marrom, camisa creme. Blazer estruturado, cal\u00e7a reta, sapato social. Cachecol de l\u00e3.',
    classico_inverno: 'Preto e branco com corte impec\u00e1vel. Sobretudo, cal\u00e7a de alfaiataria, camisa social. Sapatos oxford.',
    romantico_primavera: 'Vestidos florais leves, saias rodadas, babados. Cores como p\u00eassego, rosa claro e lavanda. Sapatilha.',
    romantico_verao: 'Rendas, bordados, tecidos fluidos em tons frios \u2014 azul c\u00e9u, rosa antigo, lil\u00e1s. Acess\u00f3rios delicados.',
    romantico_outono: 'Vestidos em viscose com estampas florais escuras. Cores como vinho, marsala, verde escuro. Botas finas.',
    romantico_inverno: 'Veludo, gola beb\u00ea, saia l\u00e1pis. Preto com detalhes em renda. Acess\u00f3rios elegantes e femininos.',
    expressivo_primavera: 'Misture cores vibrantes \u2014 laranja com rosa, verde com amarelo. Estampas geom\u00e9tricas. T\u00eanis colorido.',
    expressivo_verao: 'Misture texturas e estampas em tons frios. Animal print com listras. Pe\u00e7as oversized e acess\u00f3rios statement.',
    expressivo_outono: 'Estampas \u00e9tnicas, animal print, couro. Cores terrosas com toques de mostarda ou ferrugem. Botas robustas.',
    expressivo_inverno: 'Alto contraste \u2014 preto com branco, vermelho com preto. Pe\u00e7as assim\u00e9tricas, couro, tachas. Visual impactante.'
  };

  function getStylePrints(styleKey) {
    var map = {
      casual: { label: 'Pe\u00e7as lisas e neutras', emoji: '\u2B1B' },
      classico: { label: 'Xadrez, listrado e geom\u00e9trico', emoji: '\uD83D\uDD32' },
      romantico: { label: 'Estampas florais e org\u00e2nicas', emoji: '\uD83C\uDF3F' },
      expressivo: { label: 'Animal print e estampas \u00e9tnicas', emoji: '\uD83D\uDC06' }
    };
    return map[styleKey] || map.casual;
  }

  // ===== LOADING MESSAGES =====
  var loadingMessages = [
    '\uD83D\uDD0D Lendo suas caracter\u00edsticas...',
    '\uD83C\uDFA8 Mapeando sua paleta de cores...',
    '\uD83C\uDF3F Identificando seu subtom...',
    '\u2728 Calculando sua colorimetria...',
    '\uD83D\uDC57 Analisando seu perfil de estilo...',
    '\uD83D\uDCA1 Preparando recomenda\u00e7\u00f5es personalizadas...',
    '\uD83C\uDF38 \u00daltimos ajustes na sua an\u00e1lise...'
  ];

  // ===== START ANALYSIS =====
  function startAnalysis() {
    showSection(secLoading);
    loadingPhoto.src = photoDataURL;
    loadingPhoto.style.display = 'block';

    var progress = 0;
    var msgIndex = 0;
    var analysisResult = null;
    var analysisReady = false;

    loadingMessage.innerHTML = '<span class="blur-in">' + loadingMessages[0] + '</span> <span id="loading-dots" style="display:inline-block;animation:dotsPulse 1.2s ease-in-out infinite;">.</span>';

    var msgInterval = setInterval(function() {
      msgIndex++;
      if (msgIndex < loadingMessages.length) {
        var oldSpan = loadingMessage.querySelector('span');
        if (oldSpan) oldSpan.style.opacity = '0';
        setTimeout(function() {
          loadingMessage.innerHTML = '<span class="blur-in">' + loadingMessages[msgIndex] + '</span> <span style="display:inline-block;animation:dotsPulse 1.2s ease-in-out infinite;">.</span>';
        }, 200);
      }
    }, 2000);

    var score = computeQuizScore();

    // Canvas analysis
    var canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });

    var img = new Image();
    img.onload = function() {
      try {
        ctx.clearRect(0, 0, 200, 200);
        ctx.drawImage(img, 0, 0, 200, 200);
        var pixels = ctx.getImageData(0, 0, 200, 200);
        analysisResult = analyzeImagePixels(pixels, 200, 200);
      } catch(e) {
        analysisResult = getFallbackAnalysis();
      }
      analysisReady = true;
    };
    img.onerror = function() {
      analysisResult = getFallbackAnalysis();
      analysisReady = true;
    };
    img.src = photoDataURL;

    if (img.complete && !analysisReady) {
      try {
        ctx.clearRect(0, 0, 200, 200);
        ctx.drawImage(img, 0, 0, 200, 200);
        var px = ctx.getImageData(0, 0, 200, 200);
        analysisResult = analyzeImagePixels(px, 200, 200);
      } catch(e) {
        analysisResult = getFallbackAnalysis();
      }
      analysisReady = true;
    }

    var barInterval = setInterval(function() {
      if (analysisReady) {
        clearInterval(barInterval);
        var p = 0;
        var fi = setInterval(function() {
          p += 2 + Math.floor(Math.random() * 3);
          if (p >= 95) {
            p = 100;
            updateLoadingBar(p);
            clearInterval(fi);
            clearInterval(msgInterval);
            setTimeout(function() { showResult(analysisResult, score); }, 400);
            return;
          }
          updateLoadingBar(p);
        }, 80);
        return;
      }

      progress += 1 + Math.floor(Math.random() * 3);
      if (progress >= 60) progress = 60;
      updateLoadingBar(progress);
    }, 120);
  }

  function updateLoadingBar(val) {
    loadingBar.style.width = val + '%';
    loadingBar.setAttribute('aria-valuenow', val);
    if (val > 0) loadingBar.classList.add('glow-progress');
    animateCounter(loadingPercent, val);
  }

  var counterId = null;
  function animateCounter(el, target) {
    if (counterId) { cancelAnimationFrame(counterId); counterId = null; }
    var current = parseInt(el.textContent) || 0;
    if (current === target) return;
    var startTime = null;
    var duration = 120;
    function step(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      var value = Math.round(current + (target - current) * eased);
      el.textContent = value + '%';
      if (progress < 1) { counterId = requestAnimationFrame(step); }
    }
    counterId = requestAnimationFrame(step);
  }

  // ===== SHOW RESULT =====
  function showResult(analysis, score) {
    showSection(secResult);

    resultGreeting.textContent = userName + ', sua an\u00e1lise ficou linda!';
    resultGreeting.classList.add('bounce-in');

    var seasonKey = analysis.colorimetry.key;
    var styleKey = score.primary;

    var seasonColors = getSeasonalColors(seasonKey);
    var printRec = getStylePrints(styleKey);
    var tipText = stylingTips[styleKey + '_' + seasonKey] || stylingTips.casual_primavera;

    var topics = [
      {
        emoji: '\uD83C\uDF3F',
        title: 'Subtom de Pele',
        content: 'Seu subtom \u00e9 <strong>' + analysis.undertone.type + '</strong> ' + analysis.undertone.emoji + '.'
      },
      {
        emoji: '\uD83C\uDFA8',
        title: 'Colorimetria',
        content: 'Sua esta\u00e7\u00e3o \u00e9 <strong>' + analysis.colorimetry.label + '</strong><br><span style="color:var(--text-sub);font-size:0.85rem;">' + analysis.colorimetry.desc + '</span>'
      },
      {
        emoji: '\uD83D\uDD8C\uFE0F',
        title: 'Paleta de Cores',
        content: 'Cores que mais combinam com voc\u00ea:',
        colors: analysis.dominantColors
      },
      {
        emoji: '\u2728',
        title: 'Cores que Combinam',
        content: 'Paleta recomendada para sua esta\u00e7\u00e3o:',
        paletteColors: seasonColors
      },
      {
        emoji: '\uD83E\uDD8B',
        title: 'Estampas Recomendadas',
        content: 'Prefira: <strong>' + printRec.label + '</strong> ' + printRec.emoji
      },
      {
        emoji: '\uD83D\uDC57',
        title: 'Estilo Predominante',
        content: '<strong>' + score.primaryName.emoji + ' ' + score.primaryName.label + '</strong><br><span style="color:var(--text-sub);font-size:0.85rem;">' + score.primaryName.desc + '</span>'
          + (score.secondaryName ? '<br><span style="font-size:0.85rem;">Tamb\u00e9m: ' + score.secondaryName.emoji + ' ' + score.secondaryName.label + '</span>' : '')
      },
      {
        emoji: '\uD83D\uDCAB',
        title: 'Dicas de Styling',
        content: tipText
      }
    ];

    resultTopics.innerHTML = '';
    showTopicsStaggered(topics);
  }

  function showTopicsStaggered(topics) {
    var delay = 0;
    for (var t = 0; t < topics.length; t++) {
      var topic = topics[t];
      (function(topicData, currentDelay) {
        setTimeout(function() {
          var div = document.createElement('div');
          div.className = 'result-topic stagger-item hover-lift';

          var html = '<div style="display:flex;gap:12px;align-items:flex-start;">';
          html += '<span class="topic-icon">' + topicData.emoji + '</span>';
          html += '<div style="flex:1;">';
          html += '<h4 style="margin:0 0 4px;font-weight:600;font-size:0.95rem;">' + topicData.title + '</h4>';
          html += '<div style="font-size:0.9rem;line-height:1.5;">' + topicData.content;

          if (topicData.colors) {
            html += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">';
            for (var c = 0; c < topicData.colors.length; c++) {
              var hex = rgbToHex(topicData.colors[c].r, topicData.colors[c].g, topicData.colors[c].b);
              html += '<div class="color-dot spin-in" style="background:' + hex + ';animation-delay:' + (c * 80) + 'ms;"><span class="color-tooltip">' + hex + '</span></div>';
            }
            html += '</div>';
          }

          if (topicData.paletteColors) {
            html += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">';
            for (var pc = 0; pc < topicData.paletteColors.length; pc++) {
              html += '<div class="color-dot spin-in" style="background:' + topicData.paletteColors[pc] + ';animation-delay:' + (pc * 80) + 'ms;"><span class="color-tooltip">' + topicData.paletteColors[pc] + '</span></div>';
            }
            html += '</div>';
          }

          html += '</div></div></div>';
          div.innerHTML = html;
          resultTopics.appendChild(div);

          requestAnimationFrame(function() {
            div.classList.add('show');
          });
        }, currentDelay);
      })(topic, delay);
      delay += 120;
    }
  }

  // ===== RESTART =====
  btnRestart.addEventListener('click', function() {
    userName = '';
    photoDataURL = '';
    currentQuestion = 0;
    quizAnswers = [null, null, null, null];
    nameInput.value = '';
    fileInput.value = '';
    uploadLabel.style.display = 'flex';
    previewContainer.style.display = 'none';
    previewContainer.innerHTML = '';
    resultTopics.innerHTML = '';
    loadingBar.style.width = '0%';
    loadingBar.setAttribute('aria-valuenow', '0');
    loadingPercent.textContent = '0%';
    loadingPhoto.style.display = 'none';
    btnContinue.disabled = true;
    showSection(secIntro);
  });

  // ===== BUTTON RIPPLE EFFECT =====
  function addRipple(e) {
    var btn = e.currentTarget;
    if (btn.disabled) return;
    var existing = btn.querySelector('.ripple-effect');
    if (existing) existing.remove();
    var ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var x = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    var y = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
    ripple.style.cssText = 'position:absolute;border-radius:50%;background:rgba(255,255,255,0.4);width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;transform:scale(0);animation:rippleAnim 0.5s ease forwards;pointer-events:none;';
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(function() { if (ripple.parentNode) ripple.remove(); }, 500);
  }

  // Inject ripple keyframe if not exists
  if (!document.getElementById('ripple-style')) {
    var rs = document.createElement('style');
    rs.id = 'ripple-style';
    rs.textContent = '@keyframes rippleAnim {to{transform:scale(2.5);opacity:0;}}';
    document.head.appendChild(rs);
  }

  document.querySelectorAll('.btn-primary, .btn-secondary, .quiz-option').forEach(function(b) {
    b.addEventListener('click', addRipple);
  });

  // ===== SUBTLE BACKGROUND WAVE =====
  var bodyEl = document.body;
  var bgWave = document.createElement('style');
  bgWave.id = 'bg-wave-style';
  bgWave.textContent = 'body::before{content:\"\";position:fixed;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(232,146,124,0.06) 0%,transparent 60%),radial-gradient(ellipse at 80% 100%,rgba(201,167,194,0.06) 0%,transparent 50%);z-index:-1;animation:bgShift 8s ease-in-out infinite alternate;}@keyframes bgShift{0%{opacity:0.6;}100%{opacity:1;}}';
  document.head.appendChild(bgWave);

  // ===== EVENT LISTENERS =====
  btnAnalyze.addEventListener('click', startAnalysis);

  // ===== INIT =====
  btnContinue.disabled = true;
})();