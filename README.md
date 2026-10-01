# Analisador Visual de Estilo

**Demo ao vivo:** https://rafaelsavioli.github.io/Visual_Analyser/

Descubra seu tom de pele e a paleta de cores dominante de qualquer foto.
Tudo roda dentro do navegador — **nenhuma imagem é enviada para servidor
algum**, nem para uma API de terceiros.

![HTML](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=white)
![Canvas](https://img.shields.io/badge/Canvas_API-DSP43F?logo=mdn&logoColor=white)

---

## O problema

Querer saber o tom de pele e a paleta de uma foto normalmente significa
mandar a imagem para um serviço de análise — e um serviço **de terceiro**.
Foto é dado pessoal: quem pede esse tipo de análise não deveria precisar
de consentimento de uma empresa que ele não conhece.

## O que foi construído

| etapa | como funciona |
|---|---|
| **Leitura da imagem** | `FileReader` em `ArrayBuffer` e `createImageBitmap`, sem upload |
| **Tom de pele** | amostragem em grade, descarte de outliers por brilho e saturação, depois média no espaço CIELAB e conversão para as categorias Fitzpatrick |
| **Paleta dominante** | algoritmo **median cut**: reduz a imagem a 5 bits por canal, corta recursivamente o maior volume e agrupa por proximidade |
| **Pontos dominantes** | mede distância perceptual entre extremos, para o card final não cair em cores acidentalmente parecidas |
| **Quiz de estilo** | 5 perguntas pontuadas, resultado mapeado em 4 perfis de estilo |

## Decisões técnicas

**Por que Canvas e não WebGL?** O volume de dados é de uma imagem, não de
vídeo. Canvas 2D entrega o resultado com uma fração do custo de um contexto
WebGL, e o código continua legível.

**Por que median cut e não k-means?** Median cut é determinístico: a mesma
foto devolve sempre a mesma paleta. K-means precisa de semente aleatória e
pode devolver cores diferentes a cada execução — ruim para um resultado que
a pessoa vai usar para escolher roupa.

**Por que processar em requestIdleCallback?** A análise de uma imagem grande
trava a interface por centenas de milissegundos. O processamento roda em
fatias durante os momentos ociosos, então a barra de progresso continua
animando.

**Por que CIELAB e não RGB?** Distância euclidiana em RGB não corresponde a
distância perceptual. Duas cores visualmente iguais podem estar longe em RGB.
CIELAB foi escolhido justamente para evitar isso na extração de tom.

## Limitações conhecidas

- A classificação Fitzpatrick é uma simplificação: categorias clínicas
  reais levam em cicatriz e reação solar, que uma foto não revela.
- A paleta ignora a região da pele quando calcula cores dominantes, para o
  resultado não ser sempre o tom da pessoa.
- Sem `noUiSlider`: os controles usam `input[type=range]` nativo.

## Acessibilidade

- HTML semântico com um único `h1`
- Cada campo com `<label for>` associado ao seu input
- `aria-label` nos controles só de ícone
- `prefers-reduced-motion` respeitado nas animações de entrada

## Rodando localmente

Não tem build. Abra o `index.html` ou sirva a pasta:

```bash
npx serve .
```

## Stack

**HTML, CSS e JavaScript puro.** Tailwind via CDN apenas para utilitários de
layout; a identidade visual está em `assets/css/style.css`.

## Licença

MIT.
