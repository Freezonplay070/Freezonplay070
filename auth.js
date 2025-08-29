/* Простий Email/Password логін через Firebase (опційно). 
   Якщо config/firebase.json порожній — кнопка входу ховається.
*/
const loginBtn = document.getElementById('loginBtn');
const userBox = document.getElementById('userBox');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const closeAuth = document.getElementById('closeAuth');
const doLogin = document.getElementById('doLogin');
const doSignup = document.getElementById('doSignup');
const authEmail = document.getElementById('authEmail');
const authPass = document.getElementById('authPass');

let fb = { app: null, auth: null };

async function maybeInitFirebase(){
  try{
    const res = await fetch(window.firebaseConfigPath + '?ts=' + Date.now());
    const cfg = await res.json();
    if (!cfg || !cfg.apiKey) {
      loginBtn.classList.add('hidden');
      return;
    }
    // Dynamically load Firebase compat SDKs
    await loadScript('https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.3/firebase-auth-compat.js');
    fb.app = firebase.initializeApp(cfg);
    fb.auth = firebase.auth();
    // Auth state
    fb.auth.onAuthStateChanged(u => {
      if (u){
        loginBtn.classList.add('hidden');
        userBox.classList.remove('hidden');
        userEmail.textContent = u.email || 'Користувач';
        hideModal();
      } else {
        userBox.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        userEmail.textContent = '';
      }
    });
  }catch(e){
    console.warn('Firebase init skipped:', e);
    loginBtn.classList.add('hidden');
  }
}

function loadScript(src){
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

function showModal(){ authModal.classList.add('active'); authModal.setAttribute('aria-hidden','false'); }
function hideModal(){ authModal.classList.remove('active'); authModal.setAttribute('aria-hidden','true'); }

loginBtn?.addEventListener('click', showModal);
closeAuth?.addEventListener('click', hideModal);

doLogin?.addEventListener('click', async () => {
  if (!fb.auth) return;
  await fb.auth.signInWithEmailAndPassword(authEmail.value.trim(), authPass.value.trim());
});
doSignup?.addEventListener('click', async () => {
  if (!fb.auth) return;
  await fb.auth.createUserWithEmailAndPassword(authEmail.value.trim(), authPass.value.trim());
});
logoutBtn?.addEventListener('click', async () => {
  if (!fb.auth) return;
  await fb.auth.signOut();
});

maybeInitFirebase();
