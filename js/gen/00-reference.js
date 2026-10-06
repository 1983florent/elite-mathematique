/*
 * Générateurs de référence : ils servent de modèle pour écrire les autres.
 * Règles d'écriture :
 *  - utiliser EM.T (num, poly, mono, signed, par, sqrt, set…) pour éviter « + -3 », « 1x », « 2,50000001 » ;
 *  - toujours fournir une correction détaillée, étape par étape ;
 *  - préférer des contextes sénégalais pour les problèmes concrets (FCFA, villes, marchés…).
 */
(function (root) {
  'use strict';
  var EM = root.EM;
  var T = EM.T, F = EM.F;

  /* -------------------- 3e : Thalès, calcul de longueur -------------------- */
  EM.gen.register({
    id: 'thales-longueur',
    titre: 'Calculer une longueur avec le théorème de Thalès',
    chapitres: ['3e-thales'],
    niveaux: 2,
    examen: true,
    gen: function (rng, niveau) {
      var noms = rng.pick([['A', 'M', 'B', 'N', 'C'], ['O', 'E', 'F', 'G', 'H'], ['S', 'R', 'T', 'U', 'V']]);
      var A = noms[0], M = noms[1], B = noms[2], N = noms[3], C = noms[4];
      // rapport k = AM/AB avec AB, AC, BC entiers ou demi-entiers
      var k = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4), F(2, 5), F(3, 5), F(4, 5)]);
      var unit = k.d;
      var AB = unit * rng.int(2, 4), AC = unit * rng.int(2, 5), BC = unit * rng.int(2, 5);
      if (AB + AC <= BC || AB + BC <= AC || AC + BC <= AB) { BC = Math.max(AB, AC); }
      var AM = k.mul(AB).value(), AN = k.mul(AC).value(), MN = k.mul(BC).value();
      var inconnue = niveau === 1 ? 'MN' : rng.pick(['MN', 'AN']);
      var enonce, question, sol;
      // figure : triangle ABC, M sur [AB], N sur [AC]
      var pA = [0, 0], pB = [AB, 0];
      var cosA = (AB * AB + AC * AC - BC * BC) / (2 * AB * AC);
      var sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
      var pC = [AC * cosA, AC * sinA];
      var kv = k.value();
      var pM = [pB[0] * kv, 0], pN = [pC[0] * kv, pC[1] * kv];
      var f = EM.fig.fit([pA, pB, pC], { w: 280, h: 200 });
      f.poly([pA, pB, pC]).seg(pM, pN, { accent: true });
      f.point(pA, A, 'so').point(pB, B, 'se').point(pC, C, 'n').point(pM, M, 's').point(pN, N, 'no');

      var data = '$' + A + M + ' = ' + T.num(AM) + '$ cm, $' + A + B + ' = ' + T.num(AB) + '$ cm';
      if (inconnue === 'MN') {
        data += ', $' + B + C + ' = ' + T.num(BC) + '$ cm';
        question = { label: '$' + M + N + ' =$', type: 'number', reponse: MN, unite: 'cm' };
        sol = [
          'Les points $' + A + '$, $' + M + '$, $' + B + '$ d\'une part et $' + A + '$, $' + N + '$, $' + C + '$ d\'autre part sont alignés dans le même ordre, et $(' + M + N + ') \\parallel (' + B + C + ')$.',
          "D'après le théorème de Thalès : $$\\dfrac{" + A + M + '}{' + A + B + '} = \\dfrac{' + A + N + '}{' + A + C + '} = \\dfrac{' + M + N + '}{' + B + C + '}$$',
          'Donc $\\dfrac{' + T.num(AM) + '}{' + T.num(AB) + '} = \\dfrac{' + M + N + '}{' + T.num(BC) + '}$, '
            + "d'où $" + M + N + ' = \\dfrac{' + T.num(AM) + ' \\times ' + T.num(BC) + '}{' + T.num(AB) + '} = ' + T.num(MN) + '$ cm.'
        ];
      } else {
        data += ', $' + A + C + ' = ' + T.num(AC) + '$ cm';
        question = { label: '$' + A + N + ' =$', type: 'number', reponse: AN, unite: 'cm' };
        sol = [
          'Les points $' + A + '$, $' + M + '$, $' + B + '$ et $' + A + '$, $' + N + '$, $' + C + '$ sont alignés dans le même ordre, et $(' + M + N + ') \\parallel (' + B + C + ')$.',
          "D'après le théorème de Thalès : $\\dfrac{" + A + M + '}{' + A + B + '} = \\dfrac{' + A + N + '}{' + A + C + '}$.',
          'Donc $' + A + N + ' = \\dfrac{' + A + M + ' \\times ' + A + C + '}{' + A + B + '} = \\dfrac{' + T.num(AM) + ' \\times ' + T.num(AC) + '}{' + T.num(AB) + '} = ' + T.num(AN) + '$ cm.'
        ];
      }
      enonce = 'Dans le triangle $' + A + B + C + '$, le point $' + M + '$ appartient au segment $[' + A + B + ']$ et le point $' + N +
        '$ au segment $[' + A + C + ']$. Les droites $(' + M + N + ')$ et $(' + B + C + ')$ sont parallèles.<br>On donne ' + data + '.';
      return {
        enonce: enonce,
        figure: f.svg(),
        questions: [question],
        indices: [
          'Les droites $(' + M + N + ')$ et $(' + B + C + ')$ sont parallèles : pense au théorème de Thalès.',
          'Écris l\'égalité des trois rapports $\\dfrac{' + A + M + '}{' + A + B + '} = \\dfrac{' + A + N + '}{' + A + C + '} = \\dfrac{' + M + N + '}{' + B + C + '}$ puis garde les deux utiles.'
        ],
        solution: sol
      };
    }
  });

  /* -------------------- 2nde S : équation du second degré -------------------- */
  EM.gen.register({
    id: 'second-degre-equation',
    titre: 'Résoudre une équation du second degré',
    chapitres: ['2s-second-degre', '1s-polynomes', '1l-equations'],
    niveaux: 3,
    examen: true,
    gen: function (rng, niveau) {
      var a, b, c, sols;
      var cas = niveau === 1 ? 'deux' : rng.pick(['deux', 'deux', 'deux', 'double', 'aucune']);
      if (cas === 'deux') {
        // racines rationnelles (niveaux 1-2) ou irrationnelles (niveau 3)
        if (niveau < 3) {
          a = niveau === 1 ? rng.pick([1, 1, 2, -1]) : rng.nz(-3, 3);
          var p = rng.int(-6, 6), q = rng.intExcept(-6, 6, [p]);
          var d = niveau === 2 ? rng.pick([1, 2]) : 1;
          // a(x - p)(x - q/d) multiplié par d pour garder des entiers : a(x - p)(dx - q)
          b = -a * (d * p + q); c = a * p * q; a = a * d;
          sols = [F(p), F(q, d)];
        } else {
          a = rng.nz(-2, 2); b = rng.int(-6, 6); c = rng.int(-6, 6);
          var delta0 = b * b - 4 * a * c;
          var guard = 0;
          while ((delta0 <= 0 || EM.ar.isInt(Math.sqrt(delta0))) && guard++ < 50) {
            b = rng.int(-6, 6); c = rng.int(-6, 6); delta0 = b * b - 4 * a * c;
          }
          if (delta0 <= 0 || EM.ar.isInt(Math.sqrt(delta0))) { a = 1; b = -2; c = -1; }
          sols = null;
        }
      } else if (cas === 'double') {
        a = rng.nz(-3, 3);
        var r = rng.nz(-5, 5);
        b = -2 * a * r; c = a * r * r;
        sols = [F(r)];
      } else {
        a = rng.nz(-3, 3);
        b = rng.int(-4, 4);
        c = Math.sign(a) * (Math.floor(b * b / (4 * Math.abs(a))) + rng.int(1, 5));
        sols = [];
      }
      var delta = b * b - 4 * a * c;
      var eq = T.poly([a, b, c]) + ' = 0';
      var steps = [
        "On calcule le discriminant : $\\Delta = b^2 - 4ac = " + T.par(b) + '^2 - 4 \\times ' + T.par(a) + ' \\times ' + T.par(c) + ' = ' + T.num(delta) + '$.'
      ];
      var question;
      if (delta > 0) {
        var sq = Math.sqrt(delta);
        if (sols) {
          var x1 = F(-b - sq, 2 * a), x2 = F(-b + sq, 2 * a);
          steps.push('$\\Delta > 0$ : l\'équation a deux solutions distinctes.');
          steps.push('$x_1 = \\dfrac{-b - \\sqrt{\\Delta}}{2a} = \\dfrac{' + T.num(-b) + ' - ' + T.num(sq) + '}{' + T.num(2 * a) + '} = ' + x1.tex() + '$ et ' +
            '$x_2 = \\dfrac{-b + \\sqrt{\\Delta}}{2a} = \\dfrac{' + T.num(-b) + ' + ' + T.num(sq) + '}{' + T.num(2 * a) + '} = ' + x2.tex() + '$.');
          var tri = x1.cmp(x2) < 0 ? [x1, x2] : [x2, x1];
          steps.push('$S = ' + T.set([tri[0].tex(), tri[1].tex()]) + '$');
          question = { label: '$S =$', type: 'set', reponse: [x1, x2] };
        } else {
          var r1 = (-b - sq) / (2 * a), r2 = (-b + sq) / (2 * a);
          var A2 = 2 * a, mB = -b;
          var g = EM.ar.gcd(EM.ar.gcd(mB, A2), EM.ar.sqrtSimplify(delta).a);
          var sd = EM.ar.sqrtSimplify(delta);
          var num = mB / g, coef = sd.a / g, den = A2 / g;
          if (den < 0) { num = -num; den = -den; }
          var rad = (coef === 1 ? '' : coef) + '\\sqrt{' + sd.b + '}';
          var fmt = function (sgn) {
            var top = (num === 0 ? (sgn < 0 ? '-' : '') + rad : T.num(num) + (sgn < 0 ? ' - ' : ' + ') + rad);
            return den === 1 ? top : '\\dfrac{' + top + '}{' + den + '}';
          };
          steps.push('$\\Delta > 0$ et $\\sqrt{\\Delta} = \\sqrt{' + delta + '}' + (sd.a > 1 ? ' = ' + T.sqrt(delta) : '') + '$ n\'est pas entier : les solutions s\'écrivent avec un radical.');
          steps.push('$x_1 = ' + fmt(-1) + '$ et $x_2 = ' + fmt(1) + '$.');
          question = { label: '$S =$', type: 'set', reponse: [r1, r2], reponseTex: T.set([fmt(-1), fmt(1)]) };
        }
      } else if (delta === 0) {
        var x0 = F(-b, 2 * a);
        steps.push('$\\Delta = 0$ : l\'équation a une solution double $x_0 = -\\dfrac{b}{2a} = ' + x0.tex() + '$.');
        steps.push('$S = ' + T.set([x0.tex()]) + '$');
        question = { label: '$S =$', type: 'set', reponse: [x0] };
      } else {
        steps.push('$\\Delta < 0$ : l\'équation n\'a pas de solution réelle.');
        steps.push('$S = \\varnothing$');
        question = { label: '$S =$', type: 'set', reponse: [] };
      }
      return {
        enonce: 'Résoudre dans $\\R$ l\'équation : $$' + eq + '$$',
        questions: [question],
        indices: [
          'Identifie $a = ' + a + '$, $b = ' + b + '$ et $c = ' + c + '$, puis calcule $\\Delta = b^2 - 4ac$.',
          'Selon le signe de $\\Delta$ : deux solutions, une solution double ou aucune solution réelle.'
        ],
        solution: steps,
        aide: 'Sépare les solutions par « ; ». Écris « ∅ » ou « aucune » s\'il n\'y a pas de solution. Tu peux écrire 3/2, √5, (1+√5)/2…'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
