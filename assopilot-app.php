<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>AssoPilot — Dashboard</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

:root {
  --ink:#0F1117; --ink2:#1E2230; --sage:#2D6A4F; --sage2:#40916C; --sage3:#74C69D;
  --lime:#B7E4C7; --cream:#F8F5F0; --cream2:#EDE8E0; --warm:#E76F51; --warm2:#F4A261;
  --blue:#3A70C4; --blue2:#5B8FE0; --red:#D64045; --yellow:#F4B942;
  --white:#FFFFFF; --text:#2C2C2C; --muted:#7A7A7A; --border:#E8E4DC;
  --sidebar:220px; --r:12px;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--text);display:flex;height:100vh;overflow:hidden;}

/* ── SIDEBAR ── */
.sidebar{
  width:var(--sidebar);flex-shrink:0;
  background:var(--ink);color:var(--white);
  display:flex;flex-direction:column;
  height:100vh;overflow-y:auto;
  z-index:50;
}
.sidebar-logo{
  padding:24px 20px 20px;
  font-family:'Syne',sans-serif;font-weight:800;font-size:20px;
  border-bottom:1px solid rgba(255,255,255,0.07);
  display:flex;align-items:center;gap:8px;
}
.sidebar-logo span{color:var(--sage3);}
.logo-dot{width:7px;height:7px;background:var(--warm);border-radius:50%;}
.sidebar-asso{
  padding:16px 20px;
  border-bottom:1px solid rgba(255,255,255,0.07);
}
.asso-name{font-weight:600;font-size:14px;margin-bottom:3px;}
.asso-badge{
  display:inline-flex;align-items:center;gap:5px;
  font-size:11px;color:var(--sage3);
  background:rgba(116,198,157,0.12);border-radius:20px;padding:3px 9px;
}
.sidebar-nav{flex:1;padding:12px 0;}
.nav-group{margin-bottom:4px;}
.nav-group-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.25);padding:10px 20px 6px;}
.nav-item{
  display:flex;align-items:center;gap:12px;
  padding:10px 20px;cursor:pointer;
  font-size:14px;font-weight:500;color:rgba(255,255,255,0.6);
  transition:all .15s;border-left:3px solid transparent;
  user-select:none;
}
.nav-item:hover{color:var(--white);background:rgba(255,255,255,0.05);}
.nav-item.active{color:var(--white);background:rgba(116,198,157,0.12);border-left-color:var(--sage3);}
.nav-item .icon{font-size:17px;width:20px;text-align:center;}
.nav-item .badge{
  margin-left:auto;background:var(--warm);color:var(--white);
  font-size:11px;font-weight:700;padding:2px 7px;border-radius:20px;
}
.sidebar-bottom{padding:16px 20px;border-top:1px solid rgba(255,255,255,0.07);}
.user-row{display:flex;align-items:center;gap:10px;}
.user-avatar{
  width:34px;height:34px;border-radius:50%;
  background:linear-gradient(135deg,var(--sage2),var(--sage3));
  display:flex;align-items:center;justify-content: center;
  font-weight:700;font-size:14px;flex-shrink:0;
}
.user-name{font-size:13px;font-weight:600;}
.user-plan{font-size:11px;color:rgba(255,255,255,0.4);}

/* ── MAIN ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.topbar{
  height:62px;background:var(--white);border-bottom:1px solid var(--border);
  display:flex;align-items:center;padding:0 28px;gap:16px;flex-shrink:0;
}
.topbar-title{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;flex:1;}
.topbar-actions{display:flex;align-items:center;gap:10px;}
.btn{
  padding:8px 18px;border-radius:50px;font-size:13px;font-weight:600;
  cursor:pointer;border:none;transition:all .15s;display:inline-flex;align-items:center;gap:7px;
  font-family:'DM Sans',sans-serif;
}
.btn-primary{background:var(--ink);color:var(--white);}
.btn-primary:hover{background:var(--sage2);}
.btn-secondary{background:var(--cream);color:var(--text);border:1px solid var(--border);}
.btn-secondary:hover{background:var(--cream2);}
.btn-sage{background:var(--sage2);color:var(--white);}
.btn-sage:hover{background:var(--sage);}
.btn-warm{background:var(--warm);color:var(--white);}
.btn-sm{padding:6px 13px;font-size:12px;}
.btn-icon{padding:8px;width:36px;height:36px;border-radius:8px;background:var(--cream);border:1px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all .15s;}
.btn-icon:hover{background:var(--cream2);}

/* ── CONTENT ── */
.content{flex:1;overflow-y:auto;padding:28px;}
.page{display:none;}
.page.active{display:block;}

/* ── DASHBOARD ── */
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;}
.kpi{
  background:var(--white);border:1px solid var(--border);border-radius:var(--r);
  padding:20px 22px;position:relative;overflow:hidden;
}
.kpi::after{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
}
.kpi.green::after{background:linear-gradient(90deg,var(--sage2),var(--sage3));}
.kpi.warm::after{background:linear-gradient(90deg,var(--warm),var(--warm2));}
.kpi.blue::after{background:linear-gradient(90deg,var(--blue),var(--blue2));}
.kpi.yellow::after{background:linear-gradient(90deg,var(--yellow),#FBBF24);}
.kpi-label{font-size:12px;color:var(--muted);font-weight:500;margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.kpi-num{font-family:'Syne',sans-serif;font-weight:800;font-size:32px;line-height:1;margin-bottom:4px;}
.kpi-sub{font-size:12px;color:var(--muted);}
.kpi-trend{font-size:11px;font-weight:600;padding:2px 7px;border-radius:20px;display:inline-block;margin-top:4px;}
.kpi-trend.up{background:rgba(64,145,108,0.1);color:var(--sage2);}
.kpi-trend.down{background:rgba(214,64,69,0.1);color:var(--red);}

.dash-grid{display:grid;grid-template-columns:1fr 340px;gap:20px;}
@media(max-width:900px){.dash-grid{grid-template-columns:1fr;}}

.card{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:20px;}
.card-title{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;}
.card-title a{font-size:12px;color:var(--sage2);text-decoration:none;font-weight:500;font-family:'DM Sans',sans-serif;}

/* Activity */
.activity-list{display:flex;flex-direction:column;gap:12px;}
.activity-item{display:flex;align-items:flex-start;gap:12px;font-size:13px;}
.activity-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px;}
.activity-text{flex:1;line-height:1.4;}
.activity-time{color:var(--muted);font-size:12px;white-space:nowrap;}

/* Mini chart bar */
.mini-bars{display:flex;align-items:flex-end;gap:4px;height:60px;margin-top:4px;}
.mini-bar{flex:1;border-radius:4px 4px 0 0;transition:all .3s;}
.mini-bar-label{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:4px;}

/* ── ADHÉRENTS ── */
.search-bar{
  display:flex;align-items:center;gap:10px;
  background:var(--white);border:1px solid var(--border);border-radius:50px;
  padding:10px 18px;margin-bottom:16px;
}
.search-bar input{border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:14px;flex:1;background:transparent;}
.filters{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
.filter-btn{
  padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;
  border:1px solid var(--border);background:var(--white);color:var(--muted);transition:all .15s;
}
.filter-btn.active{background:var(--ink);color:var(--white);border-color:var(--ink);}
.table{width:100%;border-collapse:collapse;background:var(--white);border-radius:var(--r);overflow:hidden;border:1px solid var(--border);}
.table th{
  text-align:left;padding:12px 16px;font-size:11px;letter-spacing:1px;
  text-transform:uppercase;color:var(--muted);font-weight:600;
  background:var(--cream);border-bottom:1px solid var(--border);
}
.table td{padding:13px 16px;font-size:13px;border-bottom:1px solid var(--border);}
.table tr:last-child td{border-bottom:none;}
.table tr:hover td{background:var(--cream);}
.avatar-sm{
  width:30px;height:30px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:12px;color:var(--white);flex-shrink:0;
}
.status{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.status.active{background:rgba(64,145,108,0.1);color:var(--sage2);}
.status.late{background:rgba(244,185,66,0.15);color:#B45309;}
.status.inactive{background:rgba(122,122,122,0.1);color:var(--muted);}

/* ── MODAL ── */
.modal-bg{
  display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);
  z-index:200;align-items:center;justify-content:center;padding:20px;
  backdrop-filter:blur(4px);
}
.modal-bg.open{display:flex;}
.modal{
  background:var(--white);border-radius:16px;width:100%;max-width:520px;
  max-height:90vh;overflow-y:auto;
  box-shadow:0 24px 80px rgba(0,0,0,0.2);
  animation:modalIn .25s cubic-bezier(.34,1.56,.64,1);
}
@keyframes modalIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
.modal-header{padding:24px 24px 0;display:flex;justify-content:space-between;align-items:center;}
.modal-title{font-family:'Syne',sans-serif;font-weight:800;font-size:18px;}
.modal-close{background:var(--cream);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;}
.modal-body{padding:20px 24px 24px;}
.form-group{margin-bottom:16px;}
.form-label{font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;display:block;}
.form-input{
  width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;
  font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border .2s;background:var(--white);
}
.form-input:focus{border-color:var(--sage2);}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.form-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;}

/* ── DOCUMENTS ── */
.doc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;}
.doc-card{
  background:var(--white);border:1px solid var(--border);border-radius:var(--r);
  padding:24px;text-align:center;cursor:pointer;transition:all .2s;
}
.doc-card:hover{box-shadow:0 8px 30px rgba(0,0,0,0.08);transform:translateY(-3px);border-color:var(--sage3);}
.doc-icon{font-size:36px;margin-bottom:14px;}
.doc-name{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:6px;}
.doc-desc{font-size:12px;color:var(--muted);line-height:1.5;}
.doc-badge{
  display:inline-block;margin-top:12px;
  font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
  padding:3px 10px;border-radius:20px;
}
.doc-badge.auto{background:rgba(64,145,108,0.1);color:var(--sage2);}
.doc-badge.template{background:rgba(58,112,196,0.1);color:var(--blue);}

/* Document preview */
.doc-preview{
  background:var(--white);border:1px solid var(--border);border-radius:var(--r);
  padding:32px;max-width:680px;margin:0 auto;
  font-size:14px;line-height:1.7;
}
.doc-preview h3{font-family:'Syne',sans-serif;font-weight:800;text-align:center;margin-bottom:8px;font-size:18px;}
.doc-preview .doc-center{text-align:center;color:var(--muted);margin-bottom:24px;font-size:13px;}
.doc-preview .doc-section{margin-bottom:16px;}
.doc-preview .doc-section strong{display:block;font-weight:700;margin-bottom:4px;}
.doc-hr{border:none;border-top:1px solid var(--border);margin:16px 0;}
.doc-preview-actions{display:flex;gap:10px;margin-top:20px;justify-content:flex-end;}

/* ── COMPTABILITÉ ── */
.compta-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px;}
@media(max-width:700px){.compta-grid{grid-template-columns:1fr;}}
.compta-card{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:20px;text-align:center;}
.compta-card .cc-label{font-size:12px;color:var(--muted);margin-bottom:6px;}
.compta-card .cc-num{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;}
.compta-card.positive .cc-num{color:var(--sage2);}
.compta-card.negative .cc-num{color:var(--red);}
.compta-card.neutral .cc-num{color:var(--blue);}

.compta-tabs{display:flex;gap:8px;margin-bottom:16px;}
.compta-tab{
  padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;
  border:1px solid var(--border);background:var(--white);color:var(--muted);transition:all .15s;
}
.compta-tab.active{background:var(--ink);color:var(--white);border-color:var(--ink);}

.trans-list{display:flex;flex-direction:column;gap:2px;}
.trans-item{
  display:flex;align-items:center;gap:14px;padding:13px 16px;
  background:var(--white);border:1px solid var(--border);border-radius:8px;
  transition:all .15s;
}
.trans-item:hover{background:var(--cream);}
.trans-cat{
  width:36px;height:36px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;
}
.trans-info{flex:1;}
.trans-label{font-size:14px;font-weight:500;}
.trans-date{font-size:12px;color:var(--muted);}
.trans-amount{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;}
.trans-amount.income{color:var(--sage2);}
.trans-amount.expense{color:var(--red);}

/* ── ÉVÉNEMENTS ── */
.events-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;}
.event-card{
  background:var(--white);border:1px solid var(--border);border-radius:var(--r);
  overflow:hidden;transition:all .2s;
}
.event-card:hover{box-shadow:0 8px 30px rgba(0,0,0,0.08);transform:translateY(-2px);}
.event-color{height:5px;}
.event-body{padding:20px;}
.event-date{font-size:12px;color:var(--muted);margin-bottom:8px;display:flex;align-items:center;gap:5px;}
.event-name{font-family:'Syne',sans-serif;font-weight:700;font-size:17px;margin-bottom:8px;}
.event-desc{font-size:13px;color:var(--muted);margin-bottom:14px;line-height:1.5;}
.event-stats{display:flex;gap:16px;margin-bottom:16px;}
.event-stat{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:4px;}
.event-stat strong{color:var(--text);font-weight:600;}
.event-footer{display:flex;gap:8px;}
.progress-bar{background:var(--cream2);border-radius:4px;height:6px;margin:8px 0 14px;overflow:hidden;}
.progress-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--sage2),var(--sage3));}

/* ── TOAST ── */
.toast-wrap{position:fixed;bottom:24px;right:24px;z-index:500;display:flex;flex-direction:column;gap:8px;}
.toast-notif{
  background:var(--ink);color:var(--white);padding:12px 18px;
  border-radius:10px;font-size:13px;font-weight:500;
  box-shadow:0 8px 30px rgba(0,0,0,0.2);
  display:flex;align-items:center;gap:10px;
  animation:toastIn .3s cubic-bezier(.34,1.56,.64,1);
  max-width:320px;
}
.toast-notif.success{border-left:3px solid var(--sage3);}
.toast-notif.info{border-left:3px solid var(--blue2);}
@keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

/* ── EMPTY ── */
.empty{text-align:center;padding:60px 20px;color:var(--muted);}
.empty-icon{font-size:48px;margin-bottom:12px;}
.empty h3{font-family:'Syne',sans-serif;font-size:18px;color:var(--text);margin-bottom:6px;}
.empty p{font-size:14px;margin-bottom:20px;}

/* ── MOBILE SIDEBAR ── */
.menu-toggle{display:none;background:none;border:none;font-size:22px;cursor:pointer;padding:4px;}
@media(max-width:768px){
  .sidebar{position:fixed;left:-220px;top:0;bottom:0;transition:left .25s;z-index:100;}
  .sidebar.open{left:0;}
  .menu-toggle{display:flex;}
  .content{padding:16px;}
  .dash-grid{grid-template-columns:1fr;}
  .compta-grid{grid-template-columns:1fr;}
}
</style>
</head>
<body>

<!-- SIDEBAR -->
<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">Asso<span>Pilot</span><span class="logo-dot"></span></div>
  <div class="sidebar-asso">
    <div class="asso-name">Mon Association</div>
    <div class="asso-badge">✓ Plan Gratuit</div>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-group">
      <div class="nav-group-label">Principal</div>
      <div class="nav-item active" onclick="goTo('dashboard')"><span class="icon">🏠</span> Tableau de bord</div>
    </div>
    <div class="nav-group">
      <div class="nav-group-label">Modules</div>
      <div class="nav-item" onclick="goTo('adherents')"><span class="icon">👥</span> Adhérents <span class="badge" id="badge-adh">12</span></div>
      <div class="nav-item" onclick="goTo('documents')"><span class="icon">📄</span> Documents</div>
      <div class="nav-item" onclick="goTo('compta')"><span class="icon">💰</span> Comptabilité</div>
      <div class="nav-item" onclick="goTo('events')"><span class="icon">🗓️</span> Événements</div>
    </div>
    <div class="nav-group">
      <div class="nav-group-label">Compte</div>
      <div class="nav-item" onclick="goTo('settings')"><span class="icon">⚙️</span> Paramètres</div>
      <div class="nav-item" onclick="alert('Fonctionnalité Pro — Passez au plan payant !')"><span class="icon">⭐</span> Passer Pro</div>
    </div>
  </nav>
  <div class="sidebar-bottom">
    <div class="user-row">
      <div class="user-avatar">R</div>
      <div><div class="user-name">Remy</div><div class="user-plan">Plan Gratuit</div></div>
    </div>
  </div>
</aside>

<!-- MAIN -->
<div class="main">
  <div class="topbar">
    <button class="menu-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
    <div class="topbar-title" id="topbar-title">Tableau de bord</div>
    <div class="topbar-actions" id="topbar-actions">
      <button class="btn-icon" title="Notifications">🔔</button>
      <button class="btn btn-primary" onclick="goTo('adherents');openModal('modal-adherent')">+ Adhérent</button>
    </div>
  </div>

  <div class="content">

    <!-- ─ DASHBOARD ─ -->
    <div class="page active" id="page-dashboard">
      <div class="kpi-grid">
        <div class="kpi green">
          <div class="kpi-label">👥 Adhérents actifs</div>
          <div class="kpi-num">12</div>
          <div class="kpi-trend up">+3 ce mois</div>
        </div>
        <div class="kpi warm">
          <div class="kpi-label">⚠️ Cotisations en retard</div>
          <div class="kpi-num">3</div>
          <div class="kpi-sub">Relances à envoyer</div>
        </div>
        <div class="kpi blue">
          <div class="kpi-label">💰 Solde trésorerie</div>
          <div class="kpi-num">2 340€</div>
          <div class="kpi-trend up">+180€ ce mois</div>
        </div>
        <div class="kpi yellow">
          <div class="kpi-label">🗓️ Événements à venir</div>
          <div class="kpi-num">2</div>
          <div class="kpi-sub">Prochains 30 jours</div>
        </div>
      </div>

      <div class="dash-grid">
        <div class="card">
          <div class="card-title">Activité récente <a href="#" onclick="goTo('adherents');return false">Voir tout →</a></div>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-dot" style="background:var(--sage2)"></div>
              <div class="activity-text"><strong>Sophie Martin</strong> a renouvelé sa cotisation (25€)</div>
              <div class="activity-time">Il y a 2h</div>
            </div>
            <div class="activity-item">
              <div class="activity-dot" style="background:var(--blue)"></div>
              <div class="activity-text">Nouvel adhérent : <strong>Paul Durand</strong></div>
              <div class="activity-time">Hier</div>
            </div>
            <div class="activity-item">
              <div class="activity-dot" style="background:var(--warm)"></div>
              <div class="activity-text">Cotisation en retard : <strong>Marc Lebrun</strong> (25€)</div>
              <div class="activity-time">Il y a 3j</div>
            </div>
            <div class="activity-item">
              <div class="activity-dot" style="background:var(--sage2)"></div>
              <div class="activity-text">PV d'AG généré et téléchargé</div>
              <div class="activity-time">Il y a 5j</div>
            </div>
            <div class="activity-item">
              <div class="activity-dot" style="background:var(--yellow)"></div>
              <div class="activity-text">Événement créé : <strong>Réunion mensuelle</strong></div>
              <div class="activity-time">Il y a 1 sem</div>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <div class="card-title">Cotisations 2025</div>
            <div style="font-size:28px;font-family:'Syne',sans-serif;font-weight:800;color:var(--sage2)">300€</div>
            <div style="font-size:12px;color:var(--muted);margin-bottom:12px">sur 375€ attendus (80%)</div>
            <div class="progress-bar"><div class="progress-fill" style="width:80%"></div></div>
            <div class="mini-bars">
              <div class="mini-bar" style="height:35%;background:var(--cream2)"></div>
              <div class="mini-bar" style="height:55%;background:var(--sage3)"></div>
              <div class="mini-bar" style="height:40%;background:var(--cream2)"></div>
              <div class="mini-bar" style="height:70%;background:var(--sage3)"></div>
              <div class="mini-bar" style="height:80%;background:var(--sage2)"></div>
              <div class="mini-bar" style="height:60%;background:var(--sage3)"></div>
            </div>
            <div class="mini-bar-label"><span>Jan</span><span>Mar</span><span>Mai</span><span>Juin</span></div>
          </div>

          <div class="card">
            <div class="card-title">Prochain événement</div>
            <div style="font-size:13px;font-weight:600;margin-bottom:4px">🗓️ Réunion mensuelle</div>
            <div style="font-size:12px;color:var(--muted);margin-bottom:8px">15 juin 2025 · 19h00</div>
            <div style="font-size:12px;color:var(--muted)">👥 <strong>8</strong> inscrits sur 20 places</div>
            <div class="progress-bar" style="margin-top:8px"><div class="progress-fill" style="width:40%"></div></div>
            <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="goTo('events')">Gérer →</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ─ ADHÉRENTS ─ -->
    <div class="page" id="page-adherents">
      <div class="search-bar">
        <span>🔍</span>
        <input type="text" placeholder="Rechercher un adhérent…" oninput="filterAdh(this.value)" id="adh-search">
      </div>
      <div class="filters">
        <button class="filter-btn active" onclick="setAdhFilter('tous',this)">Tous (12)</button>
        <button class="filter-btn" onclick="setAdhFilter('actif',this)">✓ Actifs (9)</button>
        <button class="filter-btn" onclick="setAdhFilter('retard',this)">⚠ En retard (3)</button>
        <button class="filter-btn" onclick="setAdhFilter('inactif',this)">— Inactifs (0)</button>
      </div>
      <div style="overflow-x:auto">
        <table class="table" id="adh-table">
          <thead>
            <tr>
              <th>Membre</th>
              <th>E-mail</th>
              <th>Cotisation</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="adh-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- ─ DOCUMENTS ─ -->
    <div class="page" id="page-documents">
      <div id="doc-list-view">
        <p style="font-size:14px;color:var(--muted);margin-bottom:20px">Générez tous vos documents officiels en 1 clic, pré-remplis avec les données de votre association.</p>
        <div class="doc-grid">
          <div class="doc-card" onclick="showDoc('ag')">
            <div class="doc-icon">📋</div>
            <div class="doc-name">Convocation AG</div>
            <div class="doc-desc">Lettre de convocation avec ordre du jour officiel.</div>
            <span class="doc-badge auto">Auto-rempli</span>
          </div>
          <div class="doc-card" onclick="showDoc('pv')">
            <div class="doc-icon">📝</div>
            <div class="doc-name">PV d'Assemblée Générale</div>
            <div class="doc-desc">Procès-verbal complet conforme loi 1901.</div>
            <span class="doc-badge auto">Auto-rempli</span>
          </div>
          <div class="doc-card" onclick="showDoc('bilan')">
            <div class="doc-icon">📊</div>
            <div class="doc-name">Bilan moral & financier</div>
            <div class="doc-desc">Rapport annuel avec données de trésorerie intégrées.</div>
            <span class="doc-badge auto">Auto-rempli</span>
          </div>
          <div class="doc-card" onclick="showDoc('recu')">
            <div class="doc-icon">🧾</div>
            <div class="doc-name">Reçu de cotisation</div>
            <div class="doc-desc">Reçu fiscal personnalisé par adhérent.</div>
            <span class="doc-badge auto">Auto-rempli</span>
          </div>
          <div class="doc-card" onclick="showDoc('statuts')">
            <div class="doc-icon">📜</div>
            <div class="doc-name">Statuts type</div>
            <div class="doc-desc">Modèle de statuts modifiable pour loi 1901.</div>
            <span class="doc-badge template">Modèle</span>
          </div>
          <div class="doc-card" onclick="showDoc('prefecture')">
            <div class="doc-icon">🏛️</div>
            <div class="doc-name">Déclaration préfecture</div>
            <div class="doc-desc">Formulaire Cerfa 13971*03 pré-rempli.</div>
            <span class="doc-badge template">Modèle</span>
          </div>
        </div>
      </div>
      <div id="doc-preview-view" style="display:none">
        <button class="btn btn-secondary" onclick="document.getElementById('doc-list-view').style.display='';document.getElementById('doc-preview-view').style.display='none'" style="margin-bottom:16px">← Retour aux documents</button>
        <div class="doc-preview" id="doc-preview-content"></div>
      </div>
    </div>

    <!-- ─ COMPTABILITÉ ─ -->
    <div class="page" id="page-compta">
      <div class="compta-grid">
        <div class="compta-card positive">
          <div class="cc-label">💚 Total recettes</div>
          <div class="cc-num">+1 850€</div>
        </div>
        <div class="compta-card negative">
          <div class="cc-label">🔴 Total dépenses</div>
          <div class="cc-num">-510€</div>
        </div>
        <div class="compta-card neutral">
          <div class="cc-label">🔵 Solde actuel</div>
          <div class="cc-num">2 340€</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px">
        <div class="compta-tabs">
          <button class="compta-tab active" onclick="setComptaTab('all',this)">Tout</button>
          <button class="compta-tab" onclick="setComptaTab('income',this)">Recettes</button>
          <button class="compta-tab" onclick="setComptaTab('expense',this)">Dépenses</button>
        </div>
        <button class="btn btn-primary" onclick="openModal('modal-trans')">+ Opération</button>
      </div>
      <div class="trans-list" id="trans-list"></div>
    </div>

    <!-- ─ ÉVÉNEMENTS ─ -->
    <div class="page" id="page-events">
      <div class="events-grid" id="events-grid"></div>
    </div>

    <!-- ─ PARAMÈTRES ─ -->
    <div class="page" id="page-settings">
      <div class="card" style="max-width:580px">
        <div class="card-title">Informations de l'association</div>
        <div class="form-group">
          <label class="form-label">Nom de l'association</label>
          <input class="form-input" value="Mon Association" id="asso-name-input">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">N° RNA / SIRET</label>
            <input class="form-input" placeholder="W123456789" id="asso-rna">
          </div>
          <div class="form-group">
            <label class="form-label">Date de création</label>
            <input class="form-input" type="date" value="2020-01-15" id="asso-date">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Siège social</label>
          <input class="form-input" placeholder="Adresse complète" id="asso-addr">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Président(e)</label>
            <input class="form-input" value="Remy" id="asso-pres">
          </div>
          <div class="form-group">
            <label class="form-label">Trésorier(ière)</label>
            <input class="form-input" placeholder="Nom complet" id="asso-tres">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Montant cotisation annuelle (€)</label>
          <input class="form-input" type="number" value="25" id="asso-cotis">
        </div>
        <button class="btn btn-sage" onclick="saveSettings()">💾 Enregistrer</button>
      </div>
    </div>

  </div><!-- /content -->
</div><!-- /main -->

<!-- ─ MODAL ADHÉRENT ─ -->
<div class="modal-bg" id="modal-adherent">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Nouvel adhérent</div>
      <button class="modal-close" onclick="closeModal('modal-adherent')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Prénom</label><input class="form-input" id="adh-prenom" placeholder="Marie"></div>
        <div class="form-group"><label class="form-label">Nom</label><input class="form-input" id="adh-nom" placeholder="Dupont"></div>
      </div>
      <div class="form-group"><label class="form-label">E-mail</label><input class="form-input" id="adh-email" type="email" placeholder="marie@exemple.fr"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Téléphone</label><input class="form-input" id="adh-tel" placeholder="06 12 34 56 78"></div>
        <div class="form-group"><label class="form-label">Date de naissance</label><input class="form-input" id="adh-naissance" type="date"></div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cotisation payée ?</label>
          <select class="form-input" id="adh-cotis-paid">
            <option value="oui">✓ Payée</option>
            <option value="non">✗ En attente</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Année</label><input class="form-input" id="adh-year" type="number" value="2025"></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal('modal-adherent')">Annuler</button>
        <button class="btn btn-sage" onclick="addAdherent()">✓ Ajouter l'adhérent</button>
      </div>
    </div>
  </div>
</div>

<!-- ─ MODAL TRANSACTION ─ -->
<div class="modal-bg" id="modal-trans">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Nouvelle opération</div>
      <button class="modal-close" onclick="closeModal('modal-trans')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-input" id="trans-type">
          <option value="income">💚 Recette</option>
          <option value="expense">🔴 Dépense</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Libellé</label><input class="form-input" id="trans-label" placeholder="Ex: Cotisation annuelle"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Montant (€)</label><input class="form-input" id="trans-amount" type="number" placeholder="0"></div>
        <div class="form-group"><label class="form-label">Date</label><input class="form-input" id="trans-date" type="date"></div>
      </div>
      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <select class="form-input" id="trans-cat">
          <option>🏷️ Cotisations</option>
          <option>🎉 Événements</option>
          <option>🛠️ Matériel</option>
          <option>🏢 Local / Loyer</option>
          <option>📢 Communication</option>
          <option>🎁 Subvention</option>
          <option>💼 Autre</option>
        </select>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal('modal-trans')">Annuler</button>
        <button class="btn btn-sage" onclick="addTransaction()">✓ Enregistrer</button>
      </div>
    </div>
  </div>
</div>

<!-- ─ MODAL ÉVÉNEMENT ─ -->
<div class="modal-bg" id="modal-event">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Nouvel événement</div>
      <button class="modal-close" onclick="closeModal('modal-event')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group"><label class="form-label">Nom de l'événement</label><input class="form-input" id="ev-name" placeholder="Réunion mensuelle"></div>
      <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="ev-desc" placeholder="Courte description…"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Date</label><input class="form-input" id="ev-date" type="date"></div>
        <div class="form-group"><label class="form-label">Heure</label><input class="form-input" id="ev-time" type="time" value="19:00"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Lieu</label><input class="form-input" id="ev-lieu" placeholder="Salle des fêtes…"></div>
        <div class="form-group"><label class="form-label">Places max</label><input class="form-input" id="ev-places" type="number" placeholder="30"></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal('modal-event')">Annuler</button>
        <button class="btn btn-sage" onclick="addEvent()">✓ Créer l'événement</button>
      </div>
    </div>
  </div>
</div>

<!-- TOASTS -->
<div class="toast-wrap" id="toastWrap"></div>

<script>
// ══════════════════════════════
//  DATA
// ══════════════════════════════
const COLORS = ['#2D6A4F','#E76F51','#3A70C4','#F4B942','#9B30FF','#D64045','#40916C','#F4A261'];

let adherents = [
  {id:1,prenom:'Sophie',nom:'Martin',email:'sophie.martin@gmail.com',tel:'06 11 22 33 44',cotis:'oui',year:2025,status:'actif'},
  {id:2,prenom:'Paul',nom:'Durand',email:'paul.durand@gmail.com',tel:'06 55 66 77 88',cotis:'oui',year:2025,status:'actif'},
  {id:3,prenom:'Marc',nom:'Lebrun',email:'marc.lebrun@yahoo.fr',tel:'07 12 34 56 78',cotis:'non',year:2025,status:'retard'},
  {id:4,prenom:'Claire',nom:'Bernard',email:'claire.b@outlook.fr',tel:'06 98 76 54 32',cotis:'oui',year:2025,status:'actif'},
  {id:5,prenom:'Pierre',nom:'Thomas',email:'pierre.t@gmail.com',tel:'06 44 55 66 77',cotis:'non',year:2025,status:'retard'},
  {id:6,prenom:'Julie',nom:'Petit',email:'julie.petit@gmail.com',tel:'07 22 33 44 55',cotis:'oui',year:2025,status:'actif'},
  {id:7,prenom:'Antoine',nom:'Robert',email:'a.robert@gmail.com',tel:'06 33 44 55 66',cotis:'oui',year:2025,status:'actif'},
  {id:8,prenom:'Emma',nom:'Richard',email:'emma.r@gmail.com',tel:'06 77 88 99 00',cotis:'non',year:2025,status:'retard'},
  {id:9,prenom:'Lucas',nom:'Simon',email:'lucas.simon@gmail.com',tel:'07 44 55 66 77',cotis:'oui',year:2025,status:'actif'},
  {id:10,prenom:'Chloé',nom:'Laurent',email:'chloe.l@gmail.com',tel:'06 55 44 33 22',cotis:'oui',year:2025,status:'actif'},
  {id:11,prenom:'Hugo',nom:'Michel',email:'hugo.m@yahoo.fr',tel:'07 66 77 88 99',cotis:'oui',year:2025,status:'actif'},
  {id:12,prenom:'Léa',nom:'Garcia',email:'lea.garcia@gmail.com',tel:'06 11 22 33 55',cotis:'oui',year:2025,status:'actif'},
];

let transactions = [
  {id:1,type:'income',label:'Cotisation — Sophie Martin',amount:25,date:'2025-06-12',cat:'🏷️ Cotisations'},
  {id:2,type:'income',label:'Cotisation — Paul Durand',amount:25,date:'2025-06-10',cat:'🏷️ Cotisations'},
  {id:3,type:'expense',label:'Location salle réunion',amount:80,date:'2025-06-08',cat:'🏢 Local / Loyer'},
  {id:4,type:'income',label:'Subvention municipale',amount:500,date:'2025-06-01',cat:'🎁 Subvention'},
  {id:5,type:'expense',label:'Matériel de bureau',amount:45,date:'2025-05-28',cat:'🛠️ Matériel'},
  {id:6,type:'income',label:'Cotisations groupe — 8 membres',amount:200,date:'2025-05-20',cat:'🏷️ Cotisations'},
  {id:7,type:'expense',label:'Communication / Flyers',amount:120,date:'2025-05-15',cat:'📢 Communication'},
  {id:8,type:'income',label:'Billetterie soirée annuelle',amount:320,date:'2025-05-10',cat:'🎉 Événements'},
  {id:9,type:'expense',label:'Repas AG 2025',amount:265,date:'2025-04-20',cat:'🎉 Événements'},
  {id:10,type:'income',label:'Don exceptionnel',amount:780,date:'2025-04-15',cat:'🎁 Subvention'},
];

let events = [
  {id:1,name:'Réunion mensuelle',desc:'Réunion ordinaire du bureau et des membres.',date:'2025-06-15',time:'19h00',lieu:'Salle des fêtes',places:20,inscrits:8,color:'#40916C'},
  {id:2,name:'Soirée annuelle 2025',desc:'Grande soirée de fin d\'année avec repas et animation.',date:'2025-07-12',time:'20h00',lieu:'Salle polyvalente',places:60,inscrits:34,color:'#E76F51'},
];

let adhFilter = 'tous';
let comptaFilter = 'all';

// ══════════════════════════════
//  NAVIGATION
// ══════════════════════════════
const PAGE_TITLES = {
  dashboard:'Tableau de bord', adherents:'Adhérents',
  documents:'Documents officiels', compta:'Comptabilité',
  events:'Événements', settings:'Paramètres'
};
const PAGE_ACTIONS = {
  dashboard: `<button class="btn-icon" title="Notifications">🔔</button><button class="btn btn-primary" onclick="goTo('adherents');openModal('modal-adherent')">+ Adhérent</button>`,
  adherents: `<button class="btn btn-secondary" onclick="exportCSV()">↓ Export CSV</button><button class="btn btn-primary" onclick="openModal('modal-adherent')">+ Adhérent</button>`,
  documents: ``,
  compta: `<button class="btn btn-secondary" onclick="exportCompta()">↓ Export</button><button class="btn btn-primary" onclick="openModal('modal-trans')">+ Opération</button>`,
  events: `<button class="btn btn-primary" onclick="openModal('modal-event')">+ Événement</button>`,
  settings: ``
};

function goTo(page) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>{
    if(n.textContent.trim().toLowerCase().startsWith(PAGE_TITLES[page].toLowerCase().slice(0,5)))
      n.classList.add('active');
  });
  document.getElementById('topbar-title').textContent = PAGE_TITLES[page];
  document.getElementById('topbar-actions').innerHTML = PAGE_ACTIONS[page];
  if(page==='adherents') renderAdh();
  if(page==='compta') renderCompta();
  if(page==='events') renderEvents();
  document.getElementById('sidebar').classList.remove('open');
}

// ══════════════════════════════
//  ADHÉRENTS
// ══════════════════════════════
function renderAdh(list) {
  const data = list || filterAdhData();
  const tbody = document.getElementById('adh-tbody');
  if(!data.length){tbody.innerHTML=`<tr><td colspan="5"><div class="empty"><div class="empty-icon">👥</div><h3>Aucun adhérent trouvé</h3></div></td></tr>`;return;}
  tbody.innerHTML = data.map(a=>{
    const init = (a.prenom[0]+a.nom[0]).toUpperCase();
    const col = COLORS[a.id % COLORS.length];
    const sLabel = a.status==='actif'?'Actif':a.status==='retard'?'En retard':'Inactif';
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="avatar-sm" style="background:${col}">${init}</div>
        <div><div style="font-weight:600">${a.prenom} ${a.nom}</div><div style="font-size:11px;color:var(--muted)">${a.tel||''}</div></div>
      </div></td>
      <td style="color:var(--muted)">${a.email}</td>
      <td style="font-weight:600">${a.cotis==='oui'?'<span style="color:var(--sage2)">✓ 25€ payé</span>':'<span style="color:var(--warm)">⚠ En attente</span>'}</td>
      <td><span class="status ${a.status}">${sLabel}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="alert('Fiche de ${a.prenom} ${a.nom}')">👁 Voir</button>
          <button class="btn btn-sm" style="background:rgba(214,64,69,0.1);color:var(--red);border:1px solid rgba(214,64,69,0.2)" onclick="deleteAdh(${a.id})">✕</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterAdhData(){
  return adherents.filter(a=>{
    if(adhFilter==='actif') return a.status==='actif';
    if(adhFilter==='retard') return a.status==='retard';
    if(adhFilter==='inactif') return a.status==='inactif';
    return true;
  });
}
function filterAdh(q){
  const s=q.toLowerCase();
  const res=adherents.filter(a=>(a.prenom+' '+a.nom+a.email).toLowerCase().includes(s));
  renderAdh(res);
}
function setAdhFilter(f,btn){
  adhFilter=f;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderAdh();
}
function addAdherent(){
  const p=document.getElementById('adh-prenom').value.trim();
  const n=document.getElementById('adh-nom').value.trim();
  if(!p||!n){toast('Prénom et nom obligatoires','⚠️');return;}
  const a={
    id: adherents.length+1, prenom:p, nom:n,
    email:document.getElementById('adh-email').value,
    tel:document.getElementById('adh-tel').value,
    cotis:document.getElementById('adh-cotis-paid').value,
    year:parseInt(document.getElementById('adh-year').value),
    status:document.getElementById('adh-cotis-paid').value==='oui'?'actif':'retard'
  };
  adherents.unshift(a);
  document.getElementById('badge-adh').textContent=adherents.length;
  closeModal('modal-adherent');
  renderAdh();
  toast(`${p} ${n} ajouté(e) ✓`,'✅','success');
  ['adh-prenom','adh-nom','adh-email','adh-tel'].forEach(id=>document.getElementById(id).value='');
}
function deleteAdh(id){
  if(!confirm('Supprimer cet adhérent ?')) return;
  adherents=adherents.filter(a=>a.id!==id);
  document.getElementById('badge-adh').textContent=adherents.length;
  renderAdh(); toast('Adhérent supprimé','🗑️');
}
function exportCSV(){
  const rows=[['Prénom','Nom','Email','Téléphone','Cotisation','Statut'],...adherents.map(a=>[a.prenom,a.nom,a.email,a.tel,a.cotis,a.status])];
  const csv=rows.map(r=>r.join(';')).join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='adherents_2025.csv'; a.click();
  toast('Export CSV téléchargé','📥');
}

// ══════════════════════════════
//  DOCUMENTS
// ══════════════════════════════
const assoName = ()=>document.getElementById('asso-name-input')?.value||'Mon Association';
const president = ()=>document.getElementById('asso-pres')?.value||'Le Président';
const today = ()=>new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});

const DOCS = {
  ag: ()=>`<h3>CONVOCATION À L'ASSEMBLÉE GÉNÉRALE</h3>
<p class="doc-center">${assoName()} · ${today()}</p>
<div class="doc-section"><strong>Madame, Monsieur,</strong>
Nous avons l'honneur de vous convoquer à l'Assemblée Générale Ordinaire de l'association <strong>${assoName()}</strong> qui se tiendra le <strong>____ à __h__</strong> à <strong>_________</strong>.</div>
<div class="doc-hr"></div>
<div class="doc-section"><strong>Ordre du jour :</strong>
1. Rapport moral du Président<br>
2. Rapport financier du Trésorier<br>
3. Approbation des comptes de l'exercice écoulé<br>
4. Renouvellement du bureau<br>
5. Vote du budget prévisionnel<br>
6. Questions diverses</div>
<div class="doc-hr"></div>
<div style="text-align:right;margin-top:20px">
  <em>Le Président,</em><br><strong>${president()}</strong>
</div>`,

  pv: ()=>`<h3>PROCÈS-VERBAL D'ASSEMBLÉE GÉNÉRALE</h3>
<p class="doc-center">${assoName()} · Loi du 1er juillet 1901</p>
<div class="doc-section"><strong>Date et lieu :</strong> Le __________ à __________</div>
<div class="doc-section"><strong>Membres présents :</strong> ${adherents.filter(a=>a.status==='actif').map(a=>a.prenom+' '+a.nom).slice(0,5).join(', ')}${adherents.length>5?', et autres membres inscrits…':''}</div>
<div class="doc-section"><strong>Quorum :</strong> ${adherents.filter(a=>a.status==='actif').length} membres présents ou représentés sur ${adherents.length} adhérents à jour de cotisation.</div>
<div class="doc-hr"></div>
<div class="doc-section"><strong>1. Rapport moral</strong><br>Le Président ${president()} présente le bilan de l'année écoulée et les actions menées par l'association.</div>
<div class="doc-section"><strong>2. Rapport financier</strong><br>Le Trésorier présente les comptes : Recettes 1 850€ — Dépenses 510€ — Solde 2 340€.</div>
<div class="doc-section"><strong>Vote :</strong> Les comptes sont approuvés à l'unanimité.</div>
<div class="doc-hr"></div>
<div style="display:flex;justify-content:space-between;margin-top:20px;font-size:13px">
  <div><em>Le Secrétaire</em><br><br>_____________________</div>
  <div style="text-align:right"><em>Le Président</em><br><br>${president()}</div>
</div>`,

  bilan: ()=>`<h3>BILAN MORAL & FINANCIER 2025</h3>
<p class="doc-center">${assoName()}</p>
<div class="doc-section"><strong>I. BILAN MORAL</strong><br>L'association a poursuivi ses activités avec ${adherents.length} adhérents dont ${adherents.filter(a=>a.status==='actif').length} à jour de cotisation. ${events.length} événements ont été organisés au cours de l'exercice.</div>
<div class="doc-section"><strong>II. BILAN FINANCIER</strong></div>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:var(--cream2)"><th style="text-align:left;padding:8px;border:1px solid var(--border)">Recettes</th><th style="text-align:right;padding:8px;border:1px solid var(--border)">Montant</th></tr>
  <tr><td style="padding:8px;border:1px solid var(--border)">Cotisations</td><td style="text-align:right;padding:8px;border:1px solid var(--border)">300€</td></tr>
  <tr><td style="padding:8px;border:1px solid var(--border)">Subventions</td><td style="text-align:right;padding:8px;border:1px solid var(--border)">1 280€</td></tr>
  <tr><td style="padding:8px;border:1px solid var(--border)">Événements</td><td style="text-align:right;padding:8px;border:1px solid var(--border)">320€</td></tr>
  <tr style="font-weight:700;background:var(--cream2)"><td style="padding:8px;border:1px solid var(--border)">TOTAL RECETTES</td><td style="text-align:right;padding:8px;border:1px solid var(--border);color:var(--sage2)">+1 850€</td></tr>
</table>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:8px">
  <tr style="background:var(--cream2)"><th style="text-align:left;padding:8px;border:1px solid var(--border)">Dépenses</th><th style="text-align:right;padding:8px;border:1px solid var(--border)">Montant</th></tr>
  <tr><td style="padding:8px;border:1px solid var(--border)">Location salle</td><td style="text-align:right;padding:8px;border:1px solid var(--border)">80€</td></tr>
  <tr><td style="padding:8px;border:1px solid var(--border)">Communication</td><td style="text-align:right;padding:8px;border:1px solid var(--border)">120€</td></tr>
  <tr><td style="padding:8px;border:1px solid var(--border)">Repas AG + matériel</td><td style="text-align:right;padding:8px;border:1px solid var(--border)">310€</td></tr>
  <tr style="font-weight:700;background:var(--cream2)"><td style="padding:8px;border:1px solid var(--border)">TOTAL DÉPENSES</td><td style="text-align:right;padding:8px;border:1px solid var(--border);color:var(--red)">-510€</td></tr>
</table>
<div style="text-align:right;font-family:'Syne',sans-serif;font-weight:800;font-size:18px;margin-top:12px;color:var(--sage2)">SOLDE NET : +1 340€</div>`,

  recu: ()=>`<h3>REÇU DE COTISATION</h3>
<p class="doc-center">${assoName()} · Exercice 2025</p>
<div class="doc-section"><strong>Reçu le :</strong> ${today()}</div>
<div class="doc-section"><strong>De :</strong> _____________________ (Adhérent n°____)</div>
<div class="doc-section"><strong>La somme de :</strong> <strong style="font-size:18px">25,00 €</strong> (vingt-cinq euros)</div>
<div class="doc-section"><strong>Au titre de :</strong> Cotisation annuelle 2025 — ${assoName()}</div>
<div class="doc-section"><strong>Mode de règlement :</strong> ☐ Espèces &nbsp; ☐ Chèque &nbsp; ☐ Virement &nbsp; ☐ HelloAsso</div>
<div class="doc-hr"></div>
<div style="display:flex;justify-content:space-between;margin-top:20px;font-size:13px">
  <div><em>Signature de l'adhérent</em><br><br>_____________________</div>
  <div style="text-align:right"><em>Le Trésorier</em><br><br>${president()}</div>
</div>`,

  statuts: ()=>`<h3>STATUTS DE L'ASSOCIATION</h3>
<p class="doc-center">Loi du 1er juillet 1901 — Décret du 16 août 1901</p>
<div class="doc-section"><strong>ARTICLE 1 — DÉNOMINATION</strong><br>Il est fondé entre les adhérents aux présents statuts une association régie par la loi du 1er juillet 1901, ayant pour titre : <strong>${assoName()}</strong>.</div>
<div class="doc-section"><strong>ARTICLE 2 — BUT</strong><br>Cette association a pour objet : _______________________________________________</div>
<div class="doc-section"><strong>ARTICLE 3 — SIÈGE SOCIAL</strong><br>Le siège social est fixé à : _______________________________________________</div>
<div class="doc-section"><strong>ARTICLE 4 — DURÉE</strong><br>La durée de l'association est illimitée.</div>
<div class="doc-section"><strong>ARTICLE 5 — COMPOSITION</strong><br>L'association se compose de membres actifs, membres d'honneur et membres bienfaiteurs.</div>
<div class="doc-section"><em>[… Modèle complet — Pro uniquement]</em></div>`,

  prefecture: ()=>`<h3>DÉCLARATION DE CRÉATION D'ASSOCIATION</h3>
<p class="doc-center">Formulaire CERFA 13971*03</p>
<div class="doc-section"><strong>Titre de l'association :</strong> ${assoName()}</div>
<div class="doc-section"><strong>Objet :</strong> _______________________________________________</div>
<div class="doc-section"><strong>Siège social :</strong> _______________________________________________</div>
<div class="doc-section"><strong>Dirigeants :</strong></div>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <tr style="background:var(--cream2)"><th style="padding:8px;border:1px solid var(--border);text-align:left">Fonction</th><th style="padding:8px;border:1px solid var(--border);text-align:left">Nom Prénom</th></tr>
  <tr><td style="padding:8px;border:1px solid var(--border)">Président(e)</td><td style="padding:8px;border:1px solid var(--border)">${president()}</td></tr>
  <tr><td style="padding:8px;border:1px solid var(--border)">Trésorier(ière)</td><td style="padding:8px;border:1px solid var(--border)">_______________</td></tr>
  <tr><td style="padding:8px;border:1px solid var(--border)">Secrétaire</td><td style="padding:8px;border:1px solid var(--border)">_______________</td></tr>
</table>
<div class="doc-section" style="margin-top:12px"><em>Document à déposer à la préfecture ou sous-préfecture de votre département.</em></div>`,
};

function showDoc(type){
  document.getElementById('doc-list-view').style.display='none';
  document.getElementById('doc-preview-view').style.display='';
  const content = DOCS[type] ? DOCS[type]() : '<p>Document non disponible.</p>';
  document.getElementById('doc-preview-content').innerHTML = `
    ${content}
    <div class="doc-preview-actions">
      <button class="btn btn-secondary" onclick="window.print()">🖨️ Imprimer</button>
      <button class="btn btn-sage" onclick="toast('Document téléchargé (PDF)','📥','success')">↓ Télécharger PDF</button>
    </div>`;
}

// ══════════════════════════════
//  COMPTABILITÉ
// ══════════════════════════════
function renderCompta(){
  const list=comptaFilter==='all'?transactions:transactions.filter(t=>t.type===comptaFilter);
  const el=document.getElementById('trans-list');
  if(!list.length){el.innerHTML=`<div class="empty"><div class="empty-icon">💰</div><h3>Aucune opération</h3></div>`;return;}
  el.innerHTML=list.map(t=>{
    const isIncome=t.type==='income';
    const bg=isIncome?'rgba(64,145,108,0.1)':'rgba(214,64,69,0.1)';
    const d=new Date(t.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
    return `<div class="trans-item">
      <div class="trans-cat" style="background:${bg}">${t.cat.split(' ')[0]}</div>
      <div class="trans-info">
        <div class="trans-label">${t.label}</div>
        <div class="trans-date">${d} · ${t.cat}</div>
      </div>
      <div class="trans-amount ${t.type==='income'?'income':'expense'}">${isIncome?'+':'-'}${t.amount}€</div>
      <button class="btn btn-sm" style="background:rgba(214,64,69,0.08);color:var(--red);border:1px solid rgba(214,64,69,0.15);margin-left:8px" onclick="deleteTrans(${t.id})">✕</button>
    </div>`;
  }).join('');
}
function setComptaTab(f,btn){
  comptaFilter=f;
  document.querySelectorAll('.compta-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderCompta();
}
function addTransaction(){
  const l=document.getElementById('trans-label').value.trim();
  const a=parseFloat(document.getElementById('trans-amount').value);
  if(!l||!a){toast('Libellé et montant requis','⚠️');return;}
  const t={
    id:transactions.length+1,
    type:document.getElementById('trans-type').value,
    label:l,amount:a,
    date:document.getElementById('trans-date').value||new Date().toISOString().split('T')[0],
    cat:document.getElementById('trans-cat').value
  };
  transactions.unshift(t);
  closeModal('modal-trans');
  renderCompta();
  toast('Opération enregistrée ✓','✅','success');
  ['trans-label','trans-amount'].forEach(id=>document.getElementById(id).value='');
}
function deleteTrans(id){
  transactions=transactions.filter(t=>t.id!==id);
  renderCompta(); toast('Opération supprimée','🗑️');
}
function exportCompta(){
  const rows=[['Date','Type','Libellé','Montant','Catégorie'],...transactions.map(t=>[t.date,t.type===('income')?'Recette':'Dépense',t.label,(t.type==='income'?'+':'-')+t.amount+'€',t.cat])];
  const csv=rows.map(r=>r.join(';')).join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='comptabilite_2025.csv'; a.click();
  toast('Export téléchargé','📥');
}

// ══════════════════════════════
//  ÉVÉNEMENTS
// ══════════════════════════════
function renderEvents(){
  const grid=document.getElementById('events-grid');
  if(!events.length){
    grid.innerHTML=`<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🗓️</div><h3>Aucun événement</h3><p>Créez votre premier événement.</p><button class="btn btn-primary" onclick="openModal('modal-event')">+ Créer un événement</button></div>`;
    return;
  }
  grid.innerHTML=events.map(e=>{
    const pct=Math.round(e.inscrits/e.places*100);
    const d=new Date(e.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    return `<div class="event-card">
      <div class="event-color" style="background:${e.color}"></div>
      <div class="event-body">
        <div class="event-date">📅 ${d} · ${e.time}</div>
        <div class="event-name">${e.name}</div>
        <div class="event-desc">${e.desc}</div>
        <div class="event-stats">
          <div class="event-stat">📍 <strong>${e.lieu}</strong></div>
          <div class="event-stat">👥 <strong>${e.inscrits}/${e.places}</strong> inscrits</div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${e.color}"></div></div>
        <div class="event-footer">
          <button class="btn btn-secondary btn-sm" onclick="toast('Lien copié : assopilot.fr/event/${e.id}','🔗')">🔗 Partager</button>
          <button class="btn btn-sm" style="background:rgba(214,64,69,0.1);color:var(--red);border:1px solid rgba(214,64,69,0.2)" onclick="deleteEvent(${e.id})">✕ Supprimer</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function addEvent(){
  const n=document.getElementById('ev-name').value.trim();
  const d=document.getElementById('ev-date').value;
  if(!n||!d){toast('Nom et date requis','⚠️');return;}
  events.push({
    id:events.length+1,name:n,
    desc:document.getElementById('ev-desc').value||'',
    date:d, time:document.getElementById('ev-time').value||'18h00',
    lieu:document.getElementById('ev-lieu').value||'À définir',
    places:parseInt(document.getElementById('ev-places').value)||30,
    inscrits:0,
    color:COLORS[events.length%COLORS.length]
  });
  closeModal('modal-event');
  renderEvents();
  toast(`${n} créé ✓`,'✅','success');
  ['ev-name','ev-desc','ev-date','ev-lieu','ev-places'].forEach(id=>document.getElementById(id).value='');
}
function deleteEvent(id){
  if(!confirm('Supprimer cet événement ?'))return;
  events=events.filter(e=>e.id!==id);
  renderEvents(); toast('Événement supprimé','🗑️');
}

// ══════════════════════════════
//  PARAMÈTRES
// ══════════════════════════════
function saveSettings(){
  toast('Informations enregistrées ✓','✅','success');
}

// ══════════════════════════════
//  MODALS
// ══════════════════════════════
function openModal(id){
  document.getElementById(id).classList.add('open');
  // Set default date
  const di=document.querySelector(`#${id} input[type=date]`);
  if(di&&!di.value) di.value=new Date().toISOString().split('T')[0];
}
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-bg').forEach(m=>{
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});
});

// ══════════════════════════════
//  TOASTS
// ══════════════════════════════
function toast(msg, icon='ℹ️', type='info'){
  const wrap=document.getElementById('toastWrap');
  const el=document.createElement('div');
  el.className=`toast-notif ${type}`;
  el.innerHTML=`<span>${icon}</span><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateX(20px)'; el.style.transition='all .3s'; setTimeout(()=>el.remove(),300); },2800);
}

// ══════════════════════════════
//  INIT
// ══════════════════════════════
renderAdh();
</script>
</body>
</html>
