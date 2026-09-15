(function(){
  var MAX_RETRIES = 6;
  var SS = { pendingEntry:'raffle_pendingEntry', attempts:'raffle_attempts', view:'raffle_view', admin:'raffle_admin', adminPass:'raffle_adminPass' };

  var state = { entries: [], winners: null };

  var app = document.getElementById('app');
  var view = 'form'; // form | submitting | confirm | retry | gate | admin
  var lastError = '';
  var adminNotice = '';

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function fmtDate(iso){
    try { return new Date(iso).toLocaleString(undefined, {dateStyle:'medium', timeStyle:'short'}); }
    catch(e){ return iso || ''; }
  }

  function trinityLogoHtml(extraClass){
    var c = extraClass ? (' ' + extraClass) : '';
    return '<img class="brand-logo logo-light' + c + '" src="' + LOGO_TRINITY_NAVY + '" alt="Trinity Family Builders">' +
           '<img class="brand-logo logo-dark' + c + '" src="' + LOGO_TRINITY_WHITE + '" alt="Trinity Family Builders">';
  }
  function ehoLogoHtml(){
    return '<img class="eho-logo logo-light" src="' + LOGO_EHO_NAVY + '" alt="Equal Housing Opportunity">' +
           '<img class="eho-logo logo-dark" src="' + LOGO_EHO_WHITE + '" alt="Equal Housing Opportunity">';
  }

  // ---------- rendering ----------

  function render(){
    if (view === 'form') return renderForm();
    if (view === 'submitting') return renderSubmitting();
    if (view === 'confirm') return renderConfirm();
    if (view === 'retry') return renderRetry();
    if (view === 'gate') return renderGate();
    if (view === 'admin') return renderAdmin();
  }

  function renderForm(){
    app.innerHTML =
      '<div class="wrap">' +
        '<div class="hero">' +
          trinityLogoHtml() +
          '<div class="eyebrow">Raffle Entry</div>' +
          '<h1>Enter to Win a Gift Card</h1>' +
          '<p class="prize">Enter for a chance to win a <b>gift card</b>. Winners will be chosen at the end of the event, so stick around to see if you win. If you’re not able to stay, we’ll reach out using the contact info you leave below.</p>' +
        '</div>' +
        '<div class="ticket">' +
          '<div class="ticket-hero"><div class="eyebrow" style="margin-bottom:0">Your entry ticket</div></div>' +
          '<div class="ticket-divider"></div>' +
          '<form id="entry-form" novalidate>' +
            '<div class="ticket-form">' +
              '<div class="row2">' +
                '<div class="field" data-f="firstName"><label for="f-first">First name <span class="req">*</span></label>' +
                  '<input type="text" id="f-first" name="firstName" autocomplete="given-name" required>' +
                  '<div class="err">Please enter your first name.</div></div>' +
                '<div class="field" data-f="lastName"><label for="f-last">Last name <span class="req">*</span></label>' +
                  '<input type="text" id="f-last" name="lastName" autocomplete="family-name" required>' +
                  '<div class="err">Please enter your last name.</div></div>' +
              '</div>' +
              '<div class="field" data-f="email"><label for="f-email">Email <span class="req">*</span></label>' +
                '<input type="email" id="f-email" name="email" autocomplete="email" required>' +
                '<div class="err">Please enter a valid email address.</div></div>' +
              '<div class="field" data-f="phone"><label for="f-phone">Phone <span class="req">*</span></label>' +
                '<input type="tel" id="f-phone" name="phone" autocomplete="tel" required>' +
                '<div class="err">Please enter a valid phone number.</div></div>' +
              '<label class="consent" data-f="consent" for="f-consent">' +
                '<input type="checkbox" id="f-consent" name="consent" required>' +
                '<span class="txt">I consent to receive marketing communications, including email, text messages, and phone calls, from Trinity Family Builders about new home communities, promotions, and events. Message and data rates may apply. I can opt out at any time. <span class="req">*</span></span>' +
              '</label>' +
              '<button type="submit" class="btn btn-primary">Enter the Raffle</button>' +
              '<div class="status-line" id="status-line" aria-live="polite"></div>' +
            '</div>' +
          '</form>' +
        '</div>' +
        '<div class="legal-foot">' +
          ehoLogoHtml() +
          '<p class="legal">No purchase necessary to enter or win. Open to Florida residents 18 years of age or older, except employees of Trinity Family Builders and their immediate family members. Limit one entry per person. Two winners will be selected at random from all eligible entries and notified using the contact information provided. Trinity Family Builders reserves the right to substitute a prize of equal or greater value. Void where prohibited by law.</p>' +
          '<p class="legal">By entering, you agree to Trinity Family Builders using your information to contact you about this raffle and, if you opted in above, for future marketing.</p>' +
        '</div>' +
        '<div class="foot-link"><button type="button" id="staff-link">Admin Login</button></div>' +
      '</div>';

    document.getElementById('entry-form').addEventListener('submit', onSubmit);
    document.getElementById('staff-link').addEventListener('click', function(){ view = 'gate'; render(); });
    if (lastError){
      var sl = document.getElementById('status-line');
      sl.textContent = lastError; sl.classList.add('error');
    }
  }

  function renderSubmitting(){
    app.innerHTML =
      '<div class="wrap">' +
        '<div class="ticket"><div class="confirm">' +
          '<h2>Submitting your entry…</h2>' +
          '<p id="attempt-note">One moment.</p>' +
        '</div></div>' +
      '</div>';
  }

  function renderConfirm(){
    app.innerHTML =
      '<div class="wrap">' +
        '<div class="ticket"><div class="confirm">' +
          trinityLogoHtml('centered-logo') +
          '<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>' +
          '<h2>You’re entered!</h2>' +
          '<p>Thanks for stopping by, good luck. If you win, we’ll reach out using the phone number or email you entered.</p>' +
          '<div class="confirm-cta">' +
            '<p class="confirm-cta-label">While you’re here</p>' +
            '<a class="btn btn-primary" href="https://trinityfamilybuilders.com" target="_blank" rel="noopener">See Our Home Communities</a>' +
          '</div>' +
          '<button type="button" class="btn btn-secondary" id="enter-another" style="margin-top:14px;width:auto;padding:10px 18px">Enter another guest</button>' +
        '</div></div>' +
      '</div>';
    document.getElementById('enter-another').addEventListener('click', function(){
      view = 'form'; lastError=''; render();
    });
  }

  function renderRetry(){
    app.innerHTML =
      '<div class="wrap">' +
        '<div class="ticket"><div class="confirm">' +
          '<h2>Still working on it</h2>' +
          '<p>The raffle list is busy right now. Your entry is saved on this device and hasn’t been lost.</p>' +
          '<button type="button" class="btn btn-primary" id="retry-btn" style="margin-top:16px">Try again</button>' +
          '<button type="button" class="btn btn-secondary" id="discard-btn" style="margin-top:10px">Start over instead</button>' +
        '</div></div>' +
      '</div>';
    document.getElementById('retry-btn').addEventListener('click', function(){
      sessionStorage.setItem(SS.attempts, '0');
      attemptSubmitEntry();
    });
    document.getElementById('discard-btn').addEventListener('click', function(){
      sessionStorage.removeItem(SS.pendingEntry);
      sessionStorage.removeItem(SS.attempts);
      view = 'form'; lastError=''; render();
    });
  }

  function renderGate(){
    app.innerHTML =
      '<div class="wrap">' +
        '<div class="gate">' +
          trinityLogoHtml('centered-logo') +
          '<h2>Event staff access</h2>' +
          '<input type="password" id="gate-pass" placeholder="Passcode" autocomplete="off">' +
          '<button type="button" class="btn btn-primary" id="gate-submit">Unlock</button>' +
          '<div class="gate-error" id="gate-error">That passcode isn’t right.</div>' +
          '<div class="foot-link"><button type="button" id="gate-back">Back to entry form</button></div>' +
        '</div>' +
      '</div>';
    var pass = document.getElementById('gate-pass');
    var submitBtn = document.getElementById('gate-submit');
    function tryUnlock(){
      var p = pass.value;
      submitBtn.disabled = true;
      fetchAdminState(p).then(function(data){
        submitBtn.disabled = false;
        sessionStorage.setItem(SS.admin, '1');
        sessionStorage.setItem(SS.adminPass, p);
        sessionStorage.setItem(SS.view, 'admin');
        state.entries = data.entries; state.winners = data.winners;
        view = 'admin'; render();
      }).catch(function(){
        submitBtn.disabled = false;
        document.getElementById('gate-error').classList.add('show');
      });
    }
    submitBtn.addEventListener('click', tryUnlock);
    pass.addEventListener('keydown', function(e){ if (e.key === 'Enter') tryUnlock(); });
    document.getElementById('gate-back').addEventListener('click', function(){ view='form'; render(); });
    pass.focus();
  }

  function renderAdmin(){
    var consentCount = state.entries.filter(function(e){ return !!e.consent; }).length;
    var winners = null;
    if (state.winners && state.winners.ids){
      winners = state.winners.ids.map(function(id){ return state.entries.filter(function(e){ return e.id===id; })[0]; }).filter(Boolean);
    }

    var rows = state.entries.slice().sort(function(a,b){ return new Date(b.enteredAt) - new Date(a.enteredAt); });
    var winnerIds = (state.winners && state.winners.ids) || [];

    var html = '<div class="wrap wide">' +
      '<div class="admin-bar">' +
        '<div style="display:flex;align-items:center;gap:14px">' + trinityLogoHtml() + '<h1>Raffle dashboard</h1></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
          '<button type="button" class="btn btn-secondary btn-small" id="refresh-btn">Refresh</button>' +
          '<button type="button" class="btn btn-secondary btn-small" id="exit-admin">Exit to entry form</button>' +
        '</div>' +
      '</div>' +
      (adminNotice ? '<div class="confirm-box" style="margin-bottom:20px"><p style="margin:0">' + esc(adminNotice) + '</p></div>' : '') +
      '<div class="stat-row">' +
      (function(){ adminNotice = ''; return ''; })() +
        '<div class="stat"><div class="n">' + state.entries.length + '</div><div class="l">Total entries</div></div>' +
        '<div class="stat"><div class="n">' + consentCount + '</div><div class="l">Marketing opt-ins</div></div>' +
        '<div class="stat"><div class="n">' + (winners ? winners.length : 0) + ' / 2</div><div class="l">Winners drawn</div></div>' +
      '</div>';

    if (winners && winners.length){
      html += '<div class="winners-card"><h3>Winners' + (state.winners.drawnAt ? ' · drawn ' + fmtDate(state.winners.drawnAt) : '') + '</h3>';
      winners.forEach(function(w){
        html += '<div class="winner-row"><span class="name">' + esc(w.firstName) + ' ' + esc(w.lastName) + '</span>' +
          '<span class="contact">' + esc(w.email) + ' · ' + esc(w.phone) + '</span></div>';
      });
      html += '<div id="redraw-area" style="margin-top:14px">' +
        '<button type="button" class="btn btn-secondary btn-small" id="redraw-open">Clear winners &amp; draw again</button>' +
        '</div></div>';
    }

    html += '<div class="panel">' +
      '<h3>Draw</h3>' +
      (winners && winners.length
        ? '<p style="color:var(--muted);font-size:.88rem">Winners have already been drawn. Use “Clear winners &amp; draw again” above to redo the draw.</p>'
        : '<div class="panel-actions"><button type="button" class="btn btn-primary" id="draw-open" ' + (state.entries.length < 2 ? 'disabled' : '') + '>Draw 2 winners</button></div>' +
          (state.entries.length < 2 ? '<p style="color:var(--muted);font-size:.85rem;margin-top:10px">Need at least 2 entries to draw two winners.</p>' : '')
      ) +
      '<div id="draw-confirm-area"></div>' +
    '</div>' +

    '<div class="panel">' +
      '<h3>Export</h3>' +
      '<div class="panel-actions"><button type="button" class="btn btn-secondary" id="export-btn">Download entries as Excel (.xlsx)</button></div>' +
      '<div class="status-line" id="export-status"></div>' +
    '</div>' +

    '<div class="panel">' +
      '<h3>All entries</h3>';

    if (!rows.length){
      html += '<div class="empty">No entries yet.</div>';
    } else {
      html += '<div class="table-wrap"><table><thead><tr>' +
        '<th>First</th><th>Last</th><th>Email</th><th>Phone</th><th>Marketing</th><th>Entered</th><th></th>' +
        '</tr></thead><tbody>';
      rows.forEach(function(e){
        html += '<tr>' +
          '<td>' + esc(e.firstName) + '</td>' +
          '<td>' + esc(e.lastName) + '</td>' +
          '<td>' + esc(e.email) + '</td>' +
          '<td>' + esc(e.phone) + '</td>' +
          '<td>' + (e.consent ? '<span class="badge badge-yes">Yes</span>' : '<span class="badge badge-no">No</span>') + '</td>' +
          '<td>' + fmtDate(e.enteredAt) + '</td>' +
          '<td>' + (winnerIds.indexOf(e.id) > -1 ? '<span class="badge badge-win">Winner</span>' : '') + '</td>' +
        '</tr>';
      });
      html += '</tbody></table></div>';
    }

    html += '</div>' +
      '<div class="panel">' +
        '<h3>Reset for next event</h3>' +
        '<p style="color:var(--muted);font-size:.88rem">Permanently clears every entry and winner from this page. Only do this once this event’s raffle is fully wrapped up.</p>' +
        '<button type="button" class="btn btn-danger btn-small" id="clear-open">Clear all entries…</button>' +
        '<div id="clear-confirm-area"></div>' +
      '</div>' +
    '</div>';

    app.innerHTML = html;

    document.getElementById('refresh-btn').addEventListener('click', function(){
      refreshAdminState();
    });
    document.getElementById('exit-admin').addEventListener('click', function(){
      sessionStorage.setItem(SS.view, 'form');
      view = 'form'; render();
    });
    var drawOpen = document.getElementById('draw-open');
    if (drawOpen) drawOpen.addEventListener('click', function(){
      document.getElementById('draw-confirm-area').innerHTML =
        '<div class="confirm-box"><p>This will randomly pick 2 winners from ' + state.entries.length + ' entries. This can’t be undone without clearing the winners first.</p>' +
        '<button type="button" class="btn btn-primary btn-small" id="draw-go">Confirm draw</button> ' +
        '<button type="button" class="btn btn-secondary btn-small" id="draw-cancel">Cancel</button></div>';
      document.getElementById('draw-go').addEventListener('click', function(){
        sessionStorage.setItem(SS.attempts, '0');
        attemptDraw();
      });
      document.getElementById('draw-cancel').addEventListener('click', function(){
        document.getElementById('draw-confirm-area').innerHTML = '';
      });
    });
    var redrawOpen = document.getElementById('redraw-open');
    if (redrawOpen) redrawOpen.addEventListener('click', function(){
      document.getElementById('redraw-area').innerHTML =
        '<div class="confirm-box"><p>Type REDRAW to clear the current winners and draw again.</p>' +
        '<input type="text" id="redraw-confirm-text" placeholder="REDRAW">' +
        '<button type="button" class="btn btn-danger btn-small" id="redraw-go">Clear &amp; redraw</button></div>';
      document.getElementById('redraw-go').addEventListener('click', function(){
        if (document.getElementById('redraw-confirm-text').value.trim() === 'REDRAW'){
          sessionStorage.setItem(SS.attempts, '0');
          attemptClearWinners();
        }
      });
    });
    var clearOpen = document.getElementById('clear-open');
    if (clearOpen) clearOpen.addEventListener('click', function(){
      document.getElementById('clear-confirm-area').innerHTML =
        '<div class="confirm-box"><p>Type CLEAR to permanently delete all ' + state.entries.length + ' entries and any winners.</p>' +
        '<input type="text" id="clear-confirm-text" placeholder="CLEAR">' +
        '<button type="button" class="btn btn-danger btn-small" id="clear-go">Delete everything</button></div>';
      document.getElementById('clear-go').addEventListener('click', function(){
        if (document.getElementById('clear-confirm-text').value.trim() === 'CLEAR'){
          sessionStorage.setItem(SS.attempts, '0');
          attemptClearAll();
        }
      });
    });
    document.getElementById('export-btn').addEventListener('click', exportExcel);
  }

  // ---------- validation ----------

  function setFieldError(name, show){
    var f = document.querySelector('.field[data-f="' + name + '"], .consent[data-f="' + name + '"]');
    if (f) f.classList.toggle('invalid', show);
  }

  function validate(v){
    var ok = true;
    if (!v.firstName){ setFieldError('firstName', true); ok = false; } else setFieldError('firstName', false);
    if (!v.lastName){ setFieldError('lastName', true); ok = false; } else setFieldError('lastName', false);
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email);
    if (!emailOk){ setFieldError('email', true); ok = false; } else setFieldError('email', false);
    var digits = (v.phone || '').replace(/\D/g, '');
    if (digits.length < 10){ setFieldError('phone', true); ok = false; } else setFieldError('phone', false);
    if (!v.consent){ setFieldError('consent', true); ok = false; } else setFieldError('consent', false);
    return ok;
  }

  function onSubmit(ev){
    ev.preventDefault();
    var f = ev.target.elements;
    var v = {
      firstName: f.firstName.value.trim(),
      lastName: f.lastName.value.trim(),
      email: f.email.value.trim(),
      phone: f.phone.value.trim(),
      consent: f.consent.checked
    };
    if (!validate(v)) return;

    var entry = {
      id: uuid(), firstName: v.firstName, lastName: v.lastName,
      email: v.email, phone: v.phone, consent: v.consent,
      enteredAt: new Date().toISOString()
    };
    sessionStorage.setItem(SS.pendingEntry, JSON.stringify(entry));
    sessionStorage.setItem(SS.attempts, '0');
    view = 'submitting'; render();
    attemptSubmitEntry();
  }

  function uuid(){
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  // ---------- API helpers ----------

  function apiPost(path, body, passcode){
    var headers = {'Content-Type':'application/json'};
    if (passcode) headers['x-admin-passcode'] = passcode;
    return fetch(path, { method:'POST', headers: headers, body: JSON.stringify(body || {}) })
      .then(function(res){
        return res.json().catch(function(){ return {}; }).then(function(data){
          if (!res.ok){
            var err = new Error(data.error || 'request_failed');
            err.code = data.error || (res.status === 401 ? 'unauthorized' : res.status === 409 ? 'duplicate' : 'error');
            err.status = res.status;
            throw err;
          }
          return data;
        });
      });
  }

  function fetchAdminState(passcode){
    return apiPost('/.netlify/functions/get-state', {}, passcode);
  }

  function refreshAdminState(){
    var p = sessionStorage.getItem(SS.adminPass);
    fetchAdminState(p).then(function(data){
      state.entries = data.entries; state.winners = data.winners;
      render();
    }).catch(function(){
      adminNotice = 'Could not refresh right now. Please try again.';
      render();
    });
  }

  // ---------- publish helpers ----------

  function getAttempts(){ return parseInt(sessionStorage.getItem(SS.attempts) || '0', 10); }
  function bumpAttempts(){ sessionStorage.setItem(SS.attempts, String(getAttempts() + 1)); }

  function attemptSubmitEntry(){
    var raw = sessionStorage.getItem(SS.pendingEntry);
    if (!raw) { view = 'form'; render(); return; }
    var entry = JSON.parse(raw);
    view = 'submitting'; render();
    apiPost('/.netlify/functions/submit-entry', entry).then(function(){
      sessionStorage.removeItem(SS.pendingEntry);
      sessionStorage.removeItem(SS.attempts);
      view = 'confirm'; render();
    }).catch(function(err){
      if (err.code === 'duplicate'){
        sessionStorage.removeItem(SS.pendingEntry);
        sessionStorage.removeItem(SS.attempts);
        lastError = 'Looks like this email already entered, one entry per person.';
        view = 'form'; render();
        return;
      }
      bumpAttempts();
      if (getAttempts() < MAX_RETRIES){
        setTimeout(attemptSubmitEntry, 500 + Math.random()*500);
      } else {
        view = 'retry'; render();
      }
    });
  }

  function attemptDraw(){
    var p = sessionStorage.getItem(SS.adminPass);
    apiPost('/.netlify/functions/draw', {}, p).then(function(data){
      state.entries = data.entries; state.winners = data.winners;
      view = 'admin'; render();
    }).catch(function(){
      bumpAttempts();
      if (getAttempts() < MAX_RETRIES){ setTimeout(attemptDraw, 500 + Math.random()*500); }
      else {
        adminNotice = 'The draw could not be saved right now. Please try again in a moment.';
        view = 'admin'; render();
      }
    });
  }

  function attemptClearWinners(){
    var p = sessionStorage.getItem(SS.adminPass);
    apiPost('/.netlify/functions/clear-winners', {}, p).then(function(data){
      state.entries = data.entries; state.winners = data.winners;
      view = 'admin'; render();
    }).catch(function(){
      bumpAttempts();
      if (getAttempts() < MAX_RETRIES){ setTimeout(attemptClearWinners, 500 + Math.random()*500); }
      else {
        adminNotice = 'Could not clear the winners right now. Please try again in a moment.';
        view = 'admin'; render();
      }
    });
  }

  function attemptClearAll(){
    var p = sessionStorage.getItem(SS.adminPass);
    apiPost('/.netlify/functions/clear-all', {}, p).then(function(data){
      state.entries = data.entries; state.winners = data.winners;
      view = 'admin'; render();
    }).catch(function(){
      bumpAttempts();
      if (getAttempts() < MAX_RETRIES){ setTimeout(attemptClearAll, 500 + Math.random()*500); }
      else {
        adminNotice = 'Could not clear entries right now. Please try again in a moment.';
        view = 'admin'; render();
      }
    });
  }

  // ---------- export ----------

  function loadScript(src){
    return new Promise(function(resolve, reject){
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function exportExcel(){
    var statusEl = document.getElementById('export-status');
    statusEl.classList.remove('error');
    statusEl.textContent = 'Preparing file…';
    var ready = (typeof XLSX !== 'undefined') ? Promise.resolve() :
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    ready.then(function(){
      if (typeof XLSX === 'undefined') throw new Error('load-failed');
      var rows = [['First Name','Last Name','Email','Phone','Marketing Consent','Entered At']];
      state.entries.forEach(function(e){
        rows.push([e.firstName, e.lastName, e.email, e.phone, e.consent ? 'Yes' : 'No', fmtDate(e.enteredAt)]);
      });
      var wb = XLSX.utils.book_new();
      var ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Entries');
      if (state.winners && state.winners.ids && state.winners.ids.length){
        var wrows = [['First Name','Last Name','Email','Phone','Drawn At']];
        state.winners.ids.forEach(function(id){
          var w = state.entries.filter(function(e){ return e.id === id; })[0];
          if (w) wrows.push([w.firstName, w.lastName, w.email, w.phone, fmtDate(state.winners.drawnAt)]);
        });
        var ws2 = XLSX.utils.aoa_to_sheet(wrows);
        XLSX.utils.book_append_sheet(wb, ws2, 'Winners');
      }
      var out = XLSX.write(wb, {bookType:'xlsx', type:'array'});
      var blob = new Blob([out], {type:'application/octet-stream'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'trinity-raffle-entries.xlsx';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
    }).then(function(){
      statusEl.textContent = 'Downloaded.';
    }).catch(function(){
      statusEl.classList.add('error');
      statusEl.textContent = 'Could not generate the file. Please try again.';
    });
  }

  // ---------- boot ----------

  function boot(){
    var pendingEntryRaw = sessionStorage.getItem(SS.pendingEntry);

    if (pendingEntryRaw){
      if (getAttempts() < MAX_RETRIES){
        view = 'submitting'; render();
        attemptSubmitEntry();
      } else {
        view = 'retry'; render();
      }
      return;
    }

    var savedView = sessionStorage.getItem(SS.view);
    var savedPass = sessionStorage.getItem(SS.adminPass);
    if (savedView === 'admin' && sessionStorage.getItem(SS.admin) === '1' && savedPass){
      view = 'admin'; render();
      refreshAdminState();
    } else {
      view = 'form';
      render();
    }
  }

  boot();
})();
