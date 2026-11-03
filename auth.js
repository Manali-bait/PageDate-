// ============================================
// PageDate - auth.js (Lesson 1: accounts)
// ============================================

// 1) Paste YOUR values from Supabase: Project Settings -> API
//    These two are PUBLIC by design. Row Level Security protects the data.
//    NEVER paste the "service_role" / secret key here.
const SUPABASE_URL = 'https://qcaocouojhqevjnrwbkc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6kxJsygn1nq96PwPlUzosA_NedToM-r';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;

// 2) Build the account area in the header and the login pop-up
const acct = document.createElement('span');
document.querySelector('header').append(acct);

const dlg = document.createElement('dialog');
dlg.innerHTML = `
  <form method="dialog" id="authForm">
    <h3>Welcome to PageDate</h3>
    <input type="email" id="aEmail" placeholder="Email" required autocomplete="email">
    <input type="password" id="aPass" placeholder="Password (8+ characters)" minlength="8" autocomplete="current-password">
    <p id="aMsg" role="status"></p>
    <div class="row">
      <button type="button" class="btn" id="aIn">Log in</button>
      <button type="button" class="btn" id="aUp">Sign up</button>
      <button type="button" class="btn" id="aForgot">Forgot password</button>
      <button type="button" class="btn" id="aClose">Close</button>
    </div>
  </form>`;
document.body.append(dlg);
const $a = s => dlg.querySelector(s);
const say = t => { $a('#aMsg').textContent = t; };

// 3) Buttons
$a('#aClose').onclick = () => dlg.close();

$a('#aUp').onclick = async () => {
  const email = $a('#aEmail').value.trim(), password = $a('#aPass').value;
  if (!email || password.length < 8) return say('Enter an email and a password of 8+ characters.');
  const { error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.href } });
  say(error ? error.message : 'Check your email and click the verification link, then log in.');
};

$a('#aIn').onclick = async () => {
  const email = $a('#aEmail').value.trim(), password = $a('#aPass').value;
  if (!email || !password) return say('Enter your email and password.');
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return say(error.message);
  dlg.close();
};

$a('#aForgot').onclick = async () => {
  const email = $a('#aEmail').value.trim();
  if (!email) return say('Type your email first.');
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href });
  say(error ? error.message : 'Password reset email sent.');
};

// 4) Show Log in / Log out depending on who is signed in
function renderAccount() {
  acct.innerHTML = '';
  if (currentUser) {
    const who = document.createElement('small');
    who.textContent = currentUser.email + ' ';
    const out = document.createElement('button');
    out.className = 'btn'; out.textContent = 'Log out';
    out.onclick = () => sb.auth.signOut();
    acct.append(who, out);
  } else {
    const inn = document.createElement('button');
    inn.className = 'btn'; inn.textContent = 'Log in / Sign up';
    inn.onclick = () => { say(''); dlg.showModal(); };
    acct.append(inn);
  }
}

// 5) Supabase tells us whenever the login state changes
sb.auth.onAuthStateChange(async (event, session) => {
  currentUser = session ? session.user : null;
  renderAccount();
  window.dispatchEvent(new Event('pd-auth')); // Lesson 2 will listen for this
  if (event === 'PASSWORD_RECOVERY') {
    const pw = prompt('Type your new password (8+ characters):');
    if (pw && pw.length >= 8) {
      const { error } = await sb.auth.updateUser({ password: pw });
      alert(error ? error.message : 'Password updated!');
    }
  }
});