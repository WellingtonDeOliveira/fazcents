(function () {
  'use strict';

  /* ---------- Índice: destaca a seção que está na tela ---------- */

  function iniciarIndice() {
    var links = document.querySelectorAll('.documento-indice a[href^="#"]');
    if (links.length === 0 || !('IntersectionObserver' in window)) return;

    var porId = {};
    var secoes = [];
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var alvo = document.getElementById(id);
      if (!alvo) return;
      porId[id] = link;
      secoes.push(alvo);
    });

    function ativar(id) {
      links.forEach(function (l) { l.classList.remove('ativo'); });
      if (porId[id]) porId[id].classList.add('ativo');
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) ativar(entrada.target.id);
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    secoes.forEach(function (s) { observador.observe(s); });
  }

  /* ---------- Exclusão de conta: prepara o e-mail no aparelho ---------- */

  // Só abre o cliente de e-mail com a mensagem pronta; nada sai desta página.
  function iniciarPedidoDeExclusao() {
    var form = document.getElementById('form-exclusao');
    var mensagem = document.getElementById('mensagem-exclusao');
    if (!form || !mensagem) return;

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      var campo = document.getElementById('email-conta');
      var email = (campo.value || '').trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mensagem.hidden = false;
        mensagem.textContent = 'Informe o e-mail da sua conta.';
        campo.focus();
        return;
      }

      var assunto = 'Excluir minha conta do FazCentz';
      var corpo =
        'Olá,\n\n' +
        'Peço a exclusão da minha conta do FazCentz e de todos os dados dela no servidor.\n\n' +
        'E-mail da conta: ' + email + '\n\n' +
        'Estou enviando esta mensagem a partir do e-mail da conta.';

      window.location.href =
        'mailto:contato@fazcents.com.br' +
        '?subject=' + encodeURIComponent(assunto) +
        '&body=' + encodeURIComponent(corpo);

      mensagem.hidden = false;
      mensagem.textContent =
        'Abrimos o seu aplicativo de e-mail. Envie a mensagem a partir de ' + email +
        '. Se nada abriu, escreva para contato@fazcents.com.br.';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    iniciarIndice();
    iniciarPedidoDeExclusao();
  });
})();
