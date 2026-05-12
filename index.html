<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AssoPilot — La gestion d'association, enfin simple</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

:root {
  --ink: #0F1117;
  --ink2: #1E2230;
  --sage: #2D6A4F;
  --sage2: #40916C;
  --sage3: #74C69D;
  --lime: #B7E4C7;
  --cream: #F8F5F0;
  --cream2: #EDE8E0;
  --warm: #E76F51;
  --warm2: #F4A261;
  --text: #2C2C2C;
  --muted: #7A7A7A;
  --white: #FFFFFF;
  --r: 14px;
}

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

html { scroll-behavior: smooth; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--cream);
  color: var(--text);
  overflow-x: hidden;
}

/* ── NAV ── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: 0 5%;
  display: flex; align-items: center; justify-content: space-between;
  height: 68px;
  background: rgba(248,245,240,0.88);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.nav-logo {
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px;
  color: var(--ink);
  display: flex; align-items: center; gap: 8px;
}
.nav-logo span { color: var(--sage2); }
.nav-logo .dot { width: 8px; height: 8px; background: var(--warm); border-radius: 50%; display: inline-block; margin-left: 2px; }
.nav-links { display: flex; gap: 32px; list-style: none; }
.nav-links a { font-size: 15px; color: var(--muted); text-decoration: none; font-weight: 500; transition: color .2s; }
.nav-links a:hover { color: var(--ink); }
.nav-cta {
  background: var(--ink); color: var(--white);
  padding: 10px 22px; border-radius: 50px; font-size: 14px; font-weight: 600;
  text-decoration: none; transition: all .2s; white-space: nowrap;
}
.nav-cta:hover { background: var(--sage2); transform: translateY(-1px); }

/* ── HERO ── */
.hero {
  min-height: 100vh;
  display: flex; flex-direction: column; justify-content: center;
  padding: 120px 5% 80px;
  position: relative; overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(ellipse 70% 60% at 80% 20%, rgba(45,106,79,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 20% 80%, rgba(231,111,81,0.07) 0%, transparent 50%);
}
.hero-grid {
  position: absolute; inset: 0; z-index: 0; opacity: .035;
  background-image: linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px);
  background-size: 48px 48px;
}
.hero-content { position: relative; z-index: 1; max-width: 780px; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--white); border: 1px solid var(--cream2);
  border-radius: 50px; padding: 7px 16px; margin-bottom: 32px;
  font-size: 13px; font-weight: 500; color: var(--sage2);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  animation: fadeUp .6s ease both;
}
.hero-badge::before { content: ''; width: 8px; height: 8px; background: var(--sage3); border-radius: 50%; }
h1 {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(42px, 6.5vw, 82px);
  line-height: 1.05; letter-spacing: -2px;
  color: var(--ink);
  animation: fadeUp .6s .1s ease both;
}
h1 em { font-style: normal; color: var(--sage2); }
h1 .strike {
  position: relative; color: var(--muted);
  text-decoration: line-through; text-decoration-color: var(--warm);
}
.hero-sub {
  margin-top: 24px; font-size: clamp(17px, 2vw, 20px);
  color: var(--muted); line-height: 1.65; max-width: 560px;
  font-weight: 300;
  animation: fadeUp .6s .2s ease both;
}
.hero-actions {
  margin-top: 40px; display: flex; gap: 14px; flex-wrap: wrap;
  animation: fadeUp .6s .3s ease both;
}
.btn-primary {
  background: var(--ink); color: var(--white);
  padding: 16px 32px; border-radius: 50px; font-size: 16px; font-weight: 600;
  text-decoration: none; transition: all .2s; display: inline-flex; align-items: center; gap: 10px;
  box-shadow: 0 4px 24px rgba(15,17,23,0.25);
}
.btn-primary:hover { background: var(--sage2); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(45,106,79,0.3); }
.btn-secondary {
  background: transparent; color: var(--ink);
  padding: 16px 28px; border-radius: 50px; font-size: 16px; font-weight: 500;
  text-decoration: none; border: 1.5px solid var(--cream2); transition: all .2s;
  display: inline-flex; align-items: center; gap: 8px;
}
.btn-secondary:hover { border-color: var(--ink); background: var(--white); }
.hero-stats {
  margin-top: 60px; display: flex; gap: 40px; flex-wrap: wrap;
  animation: fadeUp .6s .4s ease both;
}
.stat { }
.stat-n { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; color: var(--ink); }
.stat-l { font-size: 13px; color: var(--muted); font-weight: 400; margin-top: 2px; }

/* ── PAIN SECTION ── */
.pain {
  padding: 100px 5%;
  background: var(--ink);
  color: var(--white);
}
.section-label {
  font-size: 12px; letter-spacing: 3px; text-transform: uppercase; font-weight: 600;
  color: var(--sage3); margin-bottom: 16px;
}
.pain h2 {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(30px, 4vw, 52px); line-height: 1.1; letter-spacing: -1px;
  max-width: 700px; margin-bottom: 60px;
}
.pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
.pain-card {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--r); padding: 28px;
  transition: all .25s;
}
.pain-card:hover { background: rgba(255,255,255,0.07); transform: translateY(-3px); }
.pain-icon { font-size: 28px; margin-bottom: 14px; }
.pain-card h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; margin-bottom: 8px; }
.pain-card p { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.6; font-weight: 300; }

/* ── FEATURES ── */
.features { padding: 100px 5%; }
.section-title {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(28px, 4vw, 48px); line-height: 1.1; letter-spacing: -1px;
  margin-bottom: 12px;
}
.section-sub { font-size: 18px; color: var(--muted); font-weight: 300; max-width: 500px; margin-bottom: 64px; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.feat-card {
  background: var(--white); border: 1px solid var(--cream2);
  border-radius: var(--r); padding: 32px;
  transition: all .25s; position: relative; overflow: hidden;
}
.feat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--sage2), var(--sage3));
  transform: scaleX(0); transform-origin: left; transition: transform .3s;
}
.feat-card:hover::before { transform: scaleX(1); }
.feat-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.08); transform: translateY(-4px); }
.feat-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; margin-bottom: 20px;
}
.feat-icon.green { background: rgba(45,106,79,0.1); }
.feat-icon.warm { background: rgba(231,111,81,0.1); }
.feat-icon.blue { background: rgba(58,112,196,0.1); }
.feat-icon.yellow { background: rgba(244,162,97,0.12); }
.feat-card h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; margin-bottom: 10px; }
.feat-card p { font-size: 14px; color: var(--muted); line-height: 1.65; }
.feat-list { margin-top: 14px; list-style: none; display: flex; flex-direction: column; gap: 6px; }
.feat-list li { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
.feat-list li::before { content: '✓'; color: var(--sage2); font-weight: 700; flex-shrink: 0; }

/* ── PRICING ── */
.pricing {
  padding: 100px 5%;
  background: var(--cream2);
}
.pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1000px; }
.price-card {
  background: var(--white); border: 1px solid var(--cream2);
  border-radius: var(--r); padding: 36px; position: relative;
  transition: all .25s;
}
.price-card:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.1); transform: translateY(-4px); }
.price-card.featured {
  background: var(--ink); color: var(--white);
  border-color: var(--ink); transform: scale(1.03);
}
.price-card.featured:hover { transform: scale(1.03) translateY(-4px); }
.price-badge {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--warm); color: var(--white);
  font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  padding: 4px 14px; border-radius: 50px;
}
.price-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; margin-bottom: 8px; }
.price-desc { font-size: 13px; color: var(--muted); margin-bottom: 28px; line-height: 1.5; }
.price-card.featured .price-desc { color: rgba(255,255,255,0.55); }
.price-amount { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }
.price-amount .eur { font-size: 22px; font-weight: 600; }
.price-amount .num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 52px; line-height: 1; }
.price-amount .per { font-size: 15px; color: var(--muted); }
.price-card.featured .price-amount .per { color: rgba(255,255,255,0.5); }
.price-note { font-size: 12px; color: var(--muted); margin-bottom: 32px; }
.price-card.featured .price-note { color: rgba(255,255,255,0.4); }
.price-features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
.price-features li { font-size: 14px; display: flex; align-items: flex-start; gap: 10px; line-height: 1.4; }
.price-features li::before { content: '✓'; color: var(--sage2); font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.price-card.featured .price-features li::before { color: var(--sage3); }
.price-features li.muted { opacity: .4; }
.price-features li.muted::before { content: '—'; }
.btn-price {
  width: 100%; padding: 14px; border-radius: 50px; font-size: 15px; font-weight: 600;
  text-align: center; text-decoration: none; display: block; transition: all .2s; border: none; cursor: pointer;
}
.btn-price.dark { background: var(--ink); color: var(--white); }
.btn-price.dark:hover { background: var(--sage2); }
.btn-price.light { background: var(--white); color: var(--ink); }
.btn-price.light:hover { background: var(--cream); }
.btn-price.outline { background: transparent; color: var(--ink); border: 1.5px solid var(--cream2); }
.btn-price.outline:hover { border-color: var(--ink); }

/* ── TESTIMONIALS ── */
.testimonials { padding: 100px 5%; }
.testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.testi-card {
  background: var(--white); border: 1px solid var(--cream2);
  border-radius: var(--r); padding: 28px; position: relative;
}
.testi-quote { font-size: 40px; color: var(--cream2); font-family: Georgia, serif; line-height: 1; margin-bottom: 4px; }
.testi-text { font-size: 15px; line-height: 1.65; color: var(--text); margin-bottom: 20px; font-style: italic; font-weight: 300; }
.testi-author { display: flex; align-items: center; gap: 12px; }
.testi-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: var(--white); flex-shrink: 0;
}
.testi-avatar.g { background: var(--sage2); }
.testi-avatar.o { background: var(--warm); }
.testi-avatar.b { background: #3A70C4; }
.testi-name { font-weight: 600; font-size: 14px; }
.testi-role { font-size: 12px; color: var(--muted); }
.stars { color: #F4A261; font-size: 14px; margin-bottom: 12px; }

/* ── FAQ ── */
.faq { padding: 80px 5%; background: var(--cream2); }
.faq-list { max-width: 720px; display: flex; flex-direction: column; gap: 12px; }
.faq-item {
  background: var(--white); border: 1px solid var(--cream2); border-radius: var(--r);
  overflow: hidden;
}
.faq-q {
  padding: 20px 24px; font-weight: 600; font-size: 15px; cursor: pointer;
  display: flex; justify-content: space-between; align-items: center;
  user-select: none;
}
.faq-q .arrow { transition: transform .3s; font-size: 18px; color: var(--muted); }
.faq-item.open .faq-q .arrow { transform: rotate(180deg); }
.faq-a { max-height: 0; overflow: hidden; transition: max-height .35s ease; }
.faq-a-inner { padding: 0 24px 20px; font-size: 14px; color: var(--muted); line-height: 1.7; }
.faq-item.open .faq-a { max-height: 200px; }

/* ── CTA FINAL ── */
.cta-final {
  padding: 100px 5%; background: var(--ink); text-align: center; color: var(--white);
}
.cta-final h2 {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(30px, 5vw, 60px); line-height: 1.1; letter-spacing: -1.5px;
  max-width: 700px; margin: 0 auto 24px;
}
.cta-final p { font-size: 18px; color: rgba(255,255,255,0.55); margin-bottom: 44px; font-weight: 300; }
.cta-final .btn-primary { font-size: 17px; padding: 18px 40px; }

/* ── FOOTER ── */
footer {
  background: var(--ink2); color: rgba(255,255,255,0.4);
  padding: 40px 5%; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap;
  font-size: 13px;
}
.footer-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: var(--white); }

/* ── ANIMATIONS ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal { opacity: 0; transform: translateY(30px); transition: all .6s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }

/* ── MOBILE ── */
@media(max-width: 768px) {
  .nav-links { display: none; }
  .pricing-grid { grid-template-columns: 1fr; }
  .price-card.featured { transform: scale(1); }
  .hero-stats { gap: 24px; }
  footer { flex-direction: column; gap: 12px; text-align: center; }
}
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-logo">Asso<span>Pilot</span><span class="dot"></span></div>
  <ul class="nav-links">
    <li><a href="#features">Fonctions</a></li>
    <li><a href="#pricing">Tarifs</a></li>
    <li><a href="#faq">FAQ</a></li>
  </ul>
  <a href="#pricing" class="nav-cta">Essai gratuit →</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-grid"></div>
  <div class="hero-content">
    <div class="hero-badge">✦ Conçu pour les associations loi 1901 françaises</div>
    <h1>
      Fini les<br>
      <span class="strike">tableaux Excel</span><br>
      <em>Bienvenue AssoPilot</em>
    </h1>
    <p class="hero-sub">Gérez vos adhérents, cotisations, assemblées générales et comptabilité en un seul endroit. Simple, légal, français.</p>
    <div class="hero-actions">
      <a href="assopilot-app.php" class="btn-primary">🚀 Essayer gratuitement <small style="opacity:.7;font-size:12px">(sans CB)</small></a>
      <a href="#features" class="btn-secondary">Voir les fonctions →</a>
    </div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-n">2 min</div><div class="stat-l">pour configurer votre asso</div></div>
      <div class="stat"><div class="stat-n">100%</div><div class="stat-l">conforme loi 1901</div></div>
      <div class="stat"><div class="stat-n">0€</div><div class="stat-l">pour commencer</div></div>
    </div>
  </div>
</section>

<!-- PAIN -->
<section class="pain">
  <div class="section-label">Le problème</div>
  <h2>Les associations méritent mieux que des bricolages</h2>
  <div class="pain-grid">
    <div class="pain-card reveal">
      <div class="pain-icon">📊</div>
      <h3>Fichiers Excel impossibles</h3>
      <p>Un fichier par an, des formules cassées, personne ne sait qui a payé sa cotisation.</p>
    </div>
    <div class="pain-card reveal">
      <div class="pain-icon">📄</div>
      <h3>Documents à rédiger de zéro</h3>
      <p>PV d'AG, convocations, bilans moraux… chaque fois c'est des heures perdues.</p>
    </div>
    <div class="pain-card reveal">
      <div class="pain-icon">💸</div>
      <h3>Comptabilité confuse</h3>
      <p>Qui a remboursé quoi ? Le compte de l'asso est-il positif ? Impossible à suivre.</p>
    </div>
    <div class="pain-card reveal">
      <div class="pain-icon">📅</div>
      <h3>Événements désorganisés</h3>
      <p>Les inscriptions par SMS, les listes sur papier, les relances manuelles… c'est épuisant.</p>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features" id="features">
  <div class="section-label">Ce qu'on fait</div>
  <div class="section-title">Tout ce dont votre asso a besoin</div>
  <p class="section-sub">4 modules pensés pour simplifier le quotidien de vos bénévoles.</p>
  <div class="features-grid">

    <div class="feat-card reveal">
      <div class="feat-icon green">👥</div>
      <h3>Gestion des adhérents</h3>
      <p>Fiches membres, suivi des cotisations, relances automatiques, historique complet.</p>
      <ul class="feat-list">
        <li>Import/export CSV</li>
        <li>Statuts : actif, en retard, radié</li>
        <li>Reçus de cotisation PDF auto</li>
        <li>Envoi d'e-mails groupés</li>
      </ul>
    </div>

    <div class="feat-card reveal">
      <div class="feat-icon warm">📝</div>
      <h3>Documents officiels</h3>
      <p>Générez en 1 clic tous vos documents légaux, pré-remplis avec vos données.</p>
      <ul class="feat-list">
        <li>Convocation AG + ordre du jour</li>
        <li>PV d'assemblée générale</li>
        <li>Bilan moral & financier</li>
        <li>Déclaration en préfecture</li>
      </ul>
    </div>

    <div class="feat-card reveal">
      <div class="feat-icon blue">📒</div>
      <h3>Comptabilité simplifiée</h3>
      <p>Recettes, dépenses, solde en temps réel. Pensé pour les non-comptables.</p>
      <ul class="feat-list">
        <li>Tableau de trésorerie auto</li>
        <li>Catégories de dépenses</li>
        <li>Export bilan annuel PDF</li>
        <li>Multi-comptes bancaires</li>
      </ul>
    </div>

    <div class="feat-card reveal">
      <div class="feat-icon yellow">🗓️</div>
      <h3>Événements & réservations</h3>
      <p>Créez vos événements, gérez les inscriptions, envoyez les confirmations.</p>
      <ul class="feat-list">
        <li>Page d'inscription publique</li>
        <li>Gestion des présences</li>
        <li>Rappels automatiques</li>
        <li>Billetterie simple</li>
      </ul>
    </div>

  </div>
</section>

<!-- PRICING -->
<section class="pricing" id="pricing">
  <div class="section-label">Tarifs</div>
  <div class="section-title" style="margin-bottom:12px">Transparent, sans surprise</div>
  <p class="section-sub">Commencez gratuitement. Passez au payant quand vous êtes prêt.</p>

  <div class="pricing-grid">

    <div class="price-card reveal">
      <div class="price-name">Gratuit</div>
      <p class="price-desc">Pour découvrir et les petites structures.</p>
      <div class="price-amount"><span class="eur">€</span><span class="num">0</span><span class="per">/mois</span></div>
      <p class="price-note">Pour toujours gratuit</p>
      <ul class="price-features">
        <li>Jusqu'à 25 adhérents</li>
        <li>1 événement actif</li>
        <li>Documents de base</li>
        <li class="muted">Comptabilité</li>
        <li class="muted">Export PDF illimité</li>
        <li class="muted">Support prioritaire</li>
      </ul>
      <a href="assopilot-app.html" class="btn-price outline">Commencer gratuitement</a>
    </div>

    <div class="price-card featured reveal">
      <div class="price-badge">⭐ Le plus populaire</div>
      <div class="price-name">Pro</div>
      <p class="price-desc">Pour les assos actives qui veulent tout gérer proprement.</p>
      <div class="price-amount"><span class="eur">€</span><span class="num">19</span><span class="per">/mois</span></div>
      <p class="price-note">ou 179€/an (économisez 49€)</p>
      <ul class="price-features">
        <li>Adhérents illimités</li>
        <li>Événements illimités</li>
        <li>Tous les documents officiels</li>
        <li>Comptabilité complète</li>
        <li>Export PDF illimité</li>
        <li>Support par e-mail sous 24h</li>
      </ul>
      <a href="assopilot-app.html" class="btn-price light">Essai 14 jours gratuit →</a>
    </div>

    <div class="price-card reveal">
      <div class="price-name">Fédération</div>
      <p class="price-desc">Pour les fédérations gérant plusieurs associations.</p>
      <div class="price-amount"><span class="eur">€</span><span class="num">49</span><span class="per">/mois</span></div>
      <p class="price-note">Jusqu'à 10 associations</p>
      <ul class="price-features">
        <li>Tout le plan Pro</li>
        <li>Jusqu'à 10 assos</li>
        <li>Tableau de bord global</li>
        <li>Rapports consolidés</li>
        <li>Utilisateurs multiples</li>
        <li>Support téléphonique</li>
      </ul>
      <a href="#" class="btn-price dark">Nous contacter</a>
    </div>

  </div>
</section>

<!-- TESTIMONIALS -->
<section class="testimonials">
  <div class="section-label">Ils nous font confiance</div>
  <div class="section-title" style="margin-bottom:48px">Ce que disent nos utilisateurs</div>
  <div class="testi-grid">
    <div class="testi-card reveal">
      <div class="stars">★★★★★</div>
      <div class="testi-quote">"</div>
      <p class="testi-text">Avant AssoPilot, notre AG durait 3h à cause de la paperasse. Maintenant on génère tout en 5 minutes. Un gain de temps énorme.</p>
      <div class="testi-author">
        <div class="testi-avatar g">M</div>
        <div><div class="testi-name">Marie-Claire D.</div><div class="testi-role">Présidente, Asso sportive — Lyon</div></div>
      </div>
    </div>
    <div class="testi-card reveal">
      <div class="stars">★★★★★</div>
      <div class="testi-quote">"</div>
      <p class="testi-text">Enfin un outil qui comprend les besoins réels d'une association. Les reçus de cotisation automatiques nous ont sauvé la mise à chaque fin d'année.</p>
      <div class="testi-author">
        <div class="testi-avatar o">T</div>
        <div><div class="testi-name">Thomas R.</div><div class="testi-role">Trésorier, Association culturelle — Nantes</div></div>
      </div>
    </div>
    <div class="testi-card reveal">
      <div class="stars">★★★★☆</div>
      <div class="testi-quote">"</div>
      <p class="testi-text">Simple à prendre en main même pour nos bénévoles qui ne sont pas à l'aise avec l'informatique. L'interface est vraiment intuitive.</p>
      <div class="testi-author">
        <div class="testi-avatar b">S</div>
        <div><div class="testi-name">Sophie L.</div><div class="testi-role">Secrétaire, Asso caritative — Bordeaux</div></div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="faq" id="faq">
  <div class="section-label">Questions fréquentes</div>
  <div class="section-title" style="margin-bottom:40px">On répond à vos doutes</div>
  <div class="faq-list">
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">AssoPilot est-il conforme à la loi 1901 française ? <span class="arrow">▾</span></div>
      <div class="faq-a"><div class="faq-a-inner">Oui, tous les documents générés (PV d'AG, bilans, convocations) respectent les exigences légales françaises pour les associations loi 1901. Nous mettons à jour les modèles à chaque évolution réglementaire.</div></div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Mes données sont-elles sécurisées ? <span class="arrow">▾</span></div>
      <div class="faq-a"><div class="faq-a-inner">Vos données sont hébergées en France, chiffrées en transit et au repos. Nous sommes conformes au RGPD. Vous restez propriétaire de vos données et pouvez les exporter ou supprimer à tout moment.</div></div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Puis-je importer mes données existantes ? <span class="arrow">▾</span></div>
      <div class="faq-a"><div class="faq-a-inner">Oui ! AssoPilot accepte les imports CSV depuis Excel, Google Sheets ou n'importe quel logiciel. Notre assistant d'import guide chaque étape. Pour les grands volumes, notre support vous accompagne.</div></div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Comment fonctionne l'essai gratuit ? <span class="arrow">▾</span></div>
      <div class="faq-a"><div class="faq-a-inner">14 jours d'accès complet au plan Pro, sans carte bancaire. À la fin de l'essai, vous choisissez le plan qui vous convient ou restez sur le plan Gratuit. Aucune surprise, aucun engagement.</div></div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Y a-t-il un engagement de durée ? <span class="arrow">▾</span></div>
      <div class="faq-a"><div class="faq-a-inner">Non. L'abonnement mensuel se résilie à tout moment en 1 clic. L'abonnement annuel est non remboursable mais sans reconduction automatique.</div></div>
    </div>
  </div>
</section>

<!-- CTA FINAL -->
<section class="cta-final">
  <h2>Votre association mérite un outil à sa hauteur.</h2>
  <p>Rejoignez les associations qui gagnent du temps chaque semaine.</p>
  <a href="assopilot-app.html" class="btn-primary">🚀 Commencer gratuitement — sans CB</a>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">AssoPilot<span style="color:var(--warm)">.</span></div>
  <div>© 2025 AssoPilot — Fait avec ♥ pour les associations françaises</div>
  <div style="display:flex;gap:20px">
    <a href="#" style="color:inherit;text-decoration:none">CGU</a>
    <a href="#" style="color:inherit;text-decoration:none">RGPD</a>
    <a href="#" style="color:inherit;text-decoration:none">Contact</a>
  </div>
</footer>

<script>
// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(r => io.observe(r));

// FAQ
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if(!isOpen) item.classList.add('open');
}

// Stagger pain cards
document.querySelectorAll('.pain-card').forEach((c,i) => {
  c.style.transitionDelay = (i*0.08)+'s';
});
</script>
</body>
</html>
