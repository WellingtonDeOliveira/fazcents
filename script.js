(function () {
  'use strict';

  var CHAVE_TEMA = 'fazcents-tema';

  /* ---------- Modo escuro ---------- */

  function aplicarTema(tema) {
    if (tema === 'claro' || tema === 'escuro') {
      document.documentElement.setAttribute('data-tema', tema);
    } else {
      document.documentElement.removeAttribute('data-tema');
    }
  }

  function temaAtualEfetivo() {
    var salvo = null;
    try { salvo = localStorage.getItem(CHAVE_TEMA); } catch (e) { /* modo privado: ignora */ }
    if (salvo === 'claro' || salvo === 'escuro') return salvo;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  }

  function iniciarTema() {
    var salvo = null;
    try { salvo = localStorage.getItem(CHAVE_TEMA); } catch (e) { /* ignora */ }
    aplicarTema(salvo);

    var botao = document.getElementById('botao-tema');
    if (!botao) return;
    botao.setAttribute('aria-pressed', temaAtualEfetivo() === 'escuro' ? 'true' : 'false');

    botao.addEventListener('click', function () {
      var novo = temaAtualEfetivo() === 'escuro' ? 'claro' : 'escuro';
      aplicarTema(novo);
      botao.setAttribute('aria-pressed', novo === 'escuro' ? 'true' : 'false');
      try { localStorage.setItem(CHAVE_TEMA, novo); } catch (e) { /* ignora */ }
    });
  }

  /* ---------- Menu mobile ---------- */

  function iniciarMenu() {
    var botao = document.getElementById('botao-menu');
    var nav = document.getElementById('nav-principal');
    if (!botao || !nav) return;

    botao.addEventListener('click', function () {
      var aberto = document.body.classList.toggle('menu-aberto');
      botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });

    nav.addEventListener('click', function (evento) {
      if (evento.target.tagName === 'A') {
        document.body.classList.remove('menu-aberto');
        botao.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */

  function iniciarReveal() {
    var alvos = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || alvos.length === 0) {
      alvos.forEach(function (el) { el.classList.add('visivel'); });
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    alvos.forEach(function (el) { observador.observe(el); });
  }

  /* ---------- Como funciona: stepper com visual grudento ---------- */

  function iniciarComoFunciona() {
    var passos = document.querySelectorAll('.como-passo');
    var ilustracoes = document.querySelectorAll('.como-ilustracao');
    if (passos.length === 0) return;

    function ativarPasso(numero) {
      passos.forEach(function (p) { p.classList.toggle('ativo', p.dataset.passo === numero); });
      ilustracoes.forEach(function (i) { i.classList.toggle('ativo', i.dataset.passo === numero); });
    }

    ativarPasso('1');

    if (!('IntersectionObserver' in window)) return;

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) ativarPasso(entrada.target.dataset.passo);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    passos.forEach(function (p) { observador.observe(p); });
  }

  /* ---------- Gráficos: abas + animação de entrada ---------- */

  function animarPainel(painel) {
    painel.querySelectorAll('.barra').forEach(function (barra) {
      var alturaFinal = parseFloat(barra.dataset.h) || 0;
      var yBase = parseFloat(barra.getAttribute('y')) || 0;
      requestAnimationFrame(function () {
        barra.setAttribute('height', alturaFinal);
        barra.setAttribute('y', yBase - alturaFinal);
      });
    });
    painel.querySelectorAll('.linha-media, .area-categoria, .linha-categoria, .pontos-categoria')
      .forEach(function (el) { el.classList.add('animar'); });
  }

  function resetarPainel(painel) {
    painel.querySelectorAll('.barra').forEach(function (barra) {
      var yAtual = parseFloat(barra.getAttribute('y')) || 0;
      var altura = parseFloat(barra.getAttribute('height')) || 0;
      barra.setAttribute('y', yAtual + altura);
      barra.setAttribute('height', 0);
    });
    painel.querySelectorAll('.linha-media, .area-categoria, .linha-categoria, .pontos-categoria')
      .forEach(function (el) { el.classList.remove('animar'); });
  }

  function iniciarGraficos() {
    var abas = document.querySelectorAll('.grafico-aba');
    var paineis = document.querySelectorAll('.grafico-painel');
    var caixa = document.querySelector('.grafico-caixa');
    if (!caixa || abas.length === 0) return;

    function selecionar(indice) {
      abas.forEach(function (a) {
        var ativo = a.dataset.alvo === String(indice);
        a.classList.toggle('ativo', ativo);
        a.setAttribute('aria-selected', ativo ? 'true' : 'false');
      });
      paineis.forEach(function (p) {
        var ativo = p.dataset.painel === String(indice);
        p.classList.toggle('ativo', ativo);
        if (ativo) { resetarPainel(p); requestAnimationFrame(function () { animarPainel(p); }); }
      });
    }

    abas.forEach(function (aba) {
      aba.addEventListener('click', function () { selecionar(aba.dataset.alvo); });
    });

    var jaAnimou = false;
    if ('IntersectionObserver' in window) {
      var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting && !jaAnimou) {
            jaAnimou = true;
            var painelAtivo = caixa.querySelector('.grafico-painel.ativo');
            if (painelAtivo) animarPainel(painelAtivo);
          }
        });
      }, { threshold: 0.35 });
      observador.observe(caixa);
    } else {
      var inicial = caixa.querySelector('.grafico-painel.ativo');
      if (inicial) animarPainel(inicial);
    }
  }

  /* ---------- Newsletter (demonstração, sem backend real) ---------- */

  function iniciarFormulario() {
    var form = document.getElementById('form-aviso');
    var mensagem = document.getElementById('mensagem-form');
    if (!form || !mensagem) return;

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      var campoEmail = document.getElementById('email');
      var email = (campoEmail.value || '').trim();
      if (!email) return;

      var botao = form.querySelector('button');
      var rotuloBotao = botao.querySelector('.rotulo-botao');
      var rotuloCarregando = botao.querySelector('.rotulo-carregando');

      botao.disabled = true;
      rotuloBotao.hidden = true;
      rotuloCarregando.hidden = false;

      window.setTimeout(function () {
        form.hidden = true;
        mensagem.hidden = false;
        mensagem.textContent = 'Prontinho — avisaremos ' + email + ' assim que o FazCents estiver disponível.';
      }, 600);
    });
  }

  /* ---------- Ano do rodapé ---------- */

  function iniciarAno() {
    var el = document.getElementById('ano');
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    iniciarTema();
    iniciarMenu();
    iniciarReveal();
    iniciarComoFunciona();
    iniciarGraficos();
    iniciarFormulario();
    iniciarAno();
  });
})();
