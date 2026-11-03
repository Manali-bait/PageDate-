// Log in / Sign up tabs, username, show password, friendly error
// 1) KEEP YOUR OWN VALUES HERE (copy these two lines from your old auth.js)

const SUPABASE_URL = 'https://qcaocouojhqevjnrwbkc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6kxJsygn1nq96PwPlUzosA_NedToM-r';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;
const BACK_TO = location.origin + location.pathname; // where email links return to

// 2) Friendly error messages (Supabase's raw messages can be confusing)
function friendly(err) {
  const m = (err.message || '').toLowerCase(), c = err.code || '';
  if (m.includes('invalid login')) return "That email or password doesn't look right. Try again, or use Forgot password.";
  if (m.includes('email not confirmed')) return 'Please verify your email first. Check your inbox and spam folder.';
  if (m.includes('already registered')) return 'An account with this email already exists. Try logging in.';
  if (m.includes('at least') && m.includes('password')) return 'Your password needs at least 8 characters.';
  if (m.includes('valid email') || m.includes('invalid format')) return 'Please enter a valid email address.';
  if (c === 'over_email_send_rate_limit' || m.includes('rate limit')) return 'Too many emails were sent. Please wait a few minutes and try again.';
  if (m.includes('failed to fetch') || m.includes('network')) return "Can't reach the server. Check your internet connection.";
  return 'Something went wrong. Please try again.';
}

// 3) Build the account area and the pop-up
const acct = document.createElement('span');
document.querySelector('header').append(acct);

const dlg = document.createElement('dialog');
dlg.setAttribute('aria-labelledby', 'authTitle');
dlg.innerHTML = `
  <form id="authForm" novalidate>
    <h3 id="authTitle">Welcome to PageDate</h3>
    <p class="sub">Find your mood. Meet your book.</p>
    <div class="authtabs" role="tablist">
      <button type="button" role="tab" id="tabIn" class="authtab">Log in</button>
      <button type="button" role="tab" id="tabUp" class="authtab">Sign up</button>
    </div>
    <div id="uRow"><input id="aUser" placeholder="Username (3-20 letters, numbers, _)" autocomplete="username" maxlength="20"></div>
    <input type="email" id="aEmail" placeholder="Email" autocomplete="email">
    <div class="pwrow">
      <input type="password" id="aPass" placeholder="Password (8+ characters)" autocomplete="current-password">
      <button type="button" class="linkbtn" id="aShow" aria-pressed="false">Show</button>
    </div>
    <p id="aMsg" role="status"></p>
    <button type="submit" class="btn" id="aGo">Log in</button>
    <div class="row"><button type="button" class="linkbtn" id="aForgot">Forgot password?</button>
    <button type="button" class="linkbtn" id="aClose">Close</button></div>
  </form>`;
document.body.append(dlg);
const $a = s => dlg.querySelector(s);
let mode = 'in';

function say(text, isError) {
  const m = $a('#aMsg'); m.textContent = text; m.className = isError ? 'err' : 'ok';
}
function setMode(m) {
  mode = m;
  $a('#tabIn').setAttribute('aria-selected', m === 'in');
  $a('#tabUp').setAttribute('aria-selected', m === 'up');
  $a('#uRow').hidden = m === 'in';
  $a('#aForgot').hidden = m === 'up';
  $a('#aGo').textContent = m === 'in' ? 'Log in' : 'Create my account';
  $a('#aPass').autocomplete = m === 'in' ? 'current-password' : 'new-password';
  say('');
}
$a('#tabIn').onclick = () => setMode('in');
$a('#tabUp').onclick = () => setMode('up');
$a('#aClose').onclick = () => dlg.close();

// Show / hide password
$a('#aShow').onclick = e => {
  const p = $a('#aPass'), show = p.type === 'password';
  p.type = show ? 'text' : 'password';
  e.target.textContent = show ? 'Hide' : 'Show';
  e.target.setAttribute('aria-pressed', show);
};

// 4) Submit (Enter key works too)
$a('#authForm').onsubmit = async e => {
  e.preventDefault();
  const email = $a('#aEmail').value.trim(), password = $a('#aPass').value, username = $a('#aUser').value.trim();
  if (!email) return say('Please enter your email.', true);
  if (!password) return say('Please enter your password.', true);
  const btn = $a('#aGo'); btn.disabled = true;
  try {
    if (mode === 'up') {
      if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) return say('Username must be 3-20 characters: letters, numbers or _ only.', true);
      if (password.length < 8) return say('Your password needs at least 8 characters.', true);
      const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: BACK_TO, data: { username } } });
      if (error) return say(friendly(error), true);
      // Supabase hides "already registered" by returning a user with no identities
      if (data.user && data.user.identities && data.user.identities.length === 0)
        return say('An account with this email already exists. Try logging in.', true);
      say('Almost there! Check your email and click the verification link, then log in.');
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return say(friendly(error), true);
      dlg.close();
    }
  } catch (err) {
    say(friendly(err), true);
  } finally { btn.disabled = false; }
};

$a('#aForgot').onclick = async () => {
  const email = $a('#aEmail').value.trim();
  if (!email) return say('Type your email above first, then click Forgot password.', true);
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: BACK_TO });
  error ? say(friendly(error), true) : say('Done! If that email has an account, a reset link is on its way.');
};

// 5) Header: show username + Log out, or the Log in button
function renderAccount() {
  acct.innerHTML = '';
  if (currentUser) {
    const name = (currentUser.user_metadata && currentUser.user_metadata.username) || currentUser.email;
    const who = document.createElement('small'); who.textContent = 'Hi, ' + name;
    const out = document.createElement('button'); out.className = 'btn'; out.textContent = 'Log out';
    out.onclick = () => sb.auth.signOut();
    acct.append(who, out);
  } else {
    const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'Log in / Sign up';
    b.onclick = () => { setMode('in'); dlg.showModal(); };
    acct.append(b);
  }
}

// 6) React whenever login state changes (app.js listens for 'pd-auth')
sb.auth.onAuthStateChange(async (event, session) => {
  currentUser = session ? session.user : null;
  renderAccount();
  window.dispatchEvent(new Event('pd-auth'));
  if (event === 'PASSWORD_RECOVERY') {
    const pw = prompt('Type your new password (8+ characters):');
    if (pw && pw.length >= 8) {
      const { error } = await sb.auth.updateUser({ password: pw });
      alert(error ? friendly(error) : 'Password updated!');
    }
  }
});
setMode('in');






























