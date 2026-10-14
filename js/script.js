// const loginBtn = document.getElementById('loginBtn');
// const pwEl = document.getElementById('pw');
// const loginErr = document.getElementById('loginErr');
// let currentPW = '0000';

// function isPWRight() {
//     const pw = pwEl.value;
//     if (pw != currentPW) {
//         loginErr.textContent = 'Введен неверный пароль';
//         return;
//     }
//     pwEl.value = '';
//     loginErr.textContent = ''
// }

// loginBtn.addEventListener('click', () => {
//     isPWRight();
//     if (loginErr.textContent == '') {
//         document.getElementById('login').classList.add('hidden')
//     }
// })

// const pwSave = document.getElementById('pwSave');
// const oldPwEl = document.getElementById('oldPw');
// const newPwEl = document.getElementById('newPw');
// const pwErr = document.getElementById('pwErr');


// function changePassword() {
//     const oldPw = oldPwEl.value;
//     const newPw = newPwEl.value;

//     if (oldPw !== currentPW) {
//         pwErr.textContent = 'Старый пароль введён неверно';
//         return;
//     }

//     if (newPw === '') {
//         pwErr.textContent = 'Введите новый пароль';
//         return;
//     }

//     if (newPw === currentPW) {
//         pwErr.textContent = 'Новый пароль должен отличаться от старого';
//         return;
//     }

//     currentPW = newPw;
//     pwErr.textContent = '';
//     oldPwEl.value = '';
//     newPwEl.value = '';
// }

// pwSave.addEventListener('click', () => {
//     changePassword()
//     if (pwErr.textContent == '') {
//         document.getElementById('settings').classList.add('hidden')
//     }
// });


// const operationBtns = document.querySelectorAll('.operation-btn');

// operationBtns.forEach(operationBtn => {
//     operationBtn.addEventListener('click', () => {
//         operationBtns.forEach(b => { 
//             b.classList.remove('active') ;
//             b.classList.add('notActive')
//         });
//         operationBtn.classList.add('active');
//         operationBtn.classList.remove('notActive');
//     });
// });

// const statBtns = document.querySelectorAll('.stat-btn');

// statBtns.forEach(operationBtn => {
//     operationBtn.addEventListener('click', () => {
//         statBtns.forEach(b => { 
//             b.classList.remove('active') ;
//             b.classList.add('notActive')
//         });
//         operationBtn.classList.add('active');
//         operationBtn.classList.remove('notActive');
//     });
// });
// const expensesBtns = document.querySelectorAll('.expenses-btn');

// expensesBtns.forEach(operationBtn => {
//     operationBtn.addEventListener('click', () => {
//         expensesBtns.forEach(b => { 
//             b.classList.remove('active') ;
//             b.classList.add('notActive')
//         });
//         operationBtn.classList.add('active');
//         operationBtn.classList.remove('notActive');
//     });
// });


const $ = id => document.getElementById(id);


let data = JSON.parse(localStorage.getItem('wallet')) || {
    pw: '0000',
    cats: ['Еда', 'Транспорт', 'Жилье', 'Развлечения', 'Здоровье'],
    ops: []
};
const save = () => localStorage.setItem('wallet', JSON.stringify(data));

const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

const today = () => new Date().toLocaleDateString('sv-SE');

function mondayOf(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return d.toLocaleDateString('sv-SE');
}

function showScreen(name) {
    ['login', 'app', 'settings'].forEach(id => $(id).classList.add('hidden'));
    $(name).classList.remove('hidden');
}

$('loginBtn').addEventListener('click', () => {
    if ($('pw').value !== data.pw) {
        $('loginErr').textContent = 'Введен неверный пароль';
        return;
    }
    $('pw').value = '';
    $('loginErr').textContent = '';
    sessionStorage.setItem('auth', '1');
    // запоминаем вход, пока открыта вкладка
    showScreen('app');
});

$('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('auth');
    showScreen('login');
});

$('settingsBtn').addEventListener('click', () => {
    $('pwErr').textContent = '';
    showScreen('settings');
});
$('pwCancel').addEventListener('click', () => showScreen('app'));

$('pwSave').addEventListener('click', () => {
    const oldPw = $('oldPw').value;
    const newPw = $('newPw').value;
    if (oldPw !== data.pw) { $('pwErr').textContent = 'Старый пароль введён неверно'; return; }
    if (newPw.length < 4) { $('pwErr').textContent = 'Минимум 4 символа'; return; }
    if (newPw === data.pw) { $('pwErr').textContent = 'Новый пароль должен отличаться от старого'; return; }

    data.pw = newPw;
    save();                       // без этого после перезагрузки вернётся старый пароль
    $('oldPw').value = '';
    $('newPw').value = '';
    $('pwErr').textContent = '';
    showScreen('app');
});

let type = 'exp';          // расход или доход
let period = 'days';       // days | weeks | months
let range = 'today';       // today | week | month | allTime

// Подсвечивает нажатую кнопку и сообщает, какая именно нажата
function setupTabs(selector, onChange) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => { b.classList.remove('active'); b.classList.add('notActive'); });
            btn.classList.add('active');
            btn.classList.remove('notActive');
            onChange(btn.id);
        });
    });
}

setupTabs('.operation-btn', id => {
    type = id === 'expensesAddBtn' ? 'exp' : 'inc';
    $('categoryField').classList.toggle('hidden', type === 'inc'); // у дохода категории нет
});
setupTabs('.stat-btn', id => { period = id; renderStat(); });
setupTabs('.expenses-btn', id => { range = id.replace('expenses-', ''); renderCats(); });

$('amount').addEventListener('input', () => {
    const raw = $('amount').value.replace(/\s/g, '');   // убрали пробелы
    const digits = raw.replace(/\D/g, '');              // оставили только цифры
    $('operationErr').textContent = raw !== digits ? 'В сумме допустимы только цифры' : '';
    $('amount').value = digits ? fmt(Number(digits.slice(0, 12))) : '';
});

function fillCats() {
    $('categorySelector').innerHTML = data.cats.map(c => `<option>${esc(c)}</option>`).join('');
}

$('categoryBtn').addEventListener('click', () => {
    const name = $('categoryInput').value.trim();
    if (!name) { $('categoryErr').textContent = 'Введите название категории'; return; }
    if (data.cats.some(c => c.toLowerCase() === name.toLowerCase())) {
        $('categoryErr').textContent = 'Такая категория уже есть';
        return;
    }
    data.cats.push(name);
    save();
    $('categoryInput').value = '';
    $('categoryErr').textContent = '';
    fillCats();
    $('categorySelector').value = name;   // сразу выбираем новую
});

$('date').value = today();   // по умолчанию сегодняшняя дата

$('operationBtn').addEventListener('click', () => {
    const sum = Number($('amount').value.replace(/\s/g, ''));
    let err = '';
    if (!sum) err = 'Введите сумму больше нуля';
    else if (!$('date').value) err = 'Выберите дату';
    else if (type === 'exp' && !$('categorySelector').value) err = 'Сначала добавьте категорию';

    $('operationErr').textContent = err;
    if (err) return;

    data.ops.push({
        type: type,
        sum: sum,
        cat: type === 'exp' ? $('categorySelector').value : '',
        date: $('date').value
    });
    save();
    $('amount').value = '';
    render();
});

const EMPTY = 'Пока нет данных. Добавьте первую операцию.';

function fitText(el) {
    const len = el.textContent.length;
    el.classList.toggle('long', len > 9);
    el.classList.toggle('longer', len > 12);
}

// Баланс, доходы, расходы и последние операции
function renderTotals() {
    let inc = 0, exp = 0;
    data.ops.forEach(o => { if (o.type === 'inc') inc += o.sum; else exp += o.sum; });
    $('result').textContent = (inc - exp < 0 ? '−' : '') + fmt(Math.abs(inc - exp)) + ' ₽';
    $('earn').textContent = fmt(inc) + ' ₽';
    $('expenses').textContent = fmt(exp) + ' ₽';

    fitText($('result'));
    fitText($('earn'));
    fitText($('expenses'));

    const last = [...data.ops].reverse().slice(0, 8);   // 8 последних, новые сверху
    $('lastOperation').innerHTML = last.length ? last.map(o => `
        <div class="row2">
            <span>${o.type === 'inc' ? 'Доход' : esc(o.cat)} · ${o.date}</span>
            <span class="${o.type === 'inc' ? 'plus' : 'minus'}">${o.type === 'inc' ? '+' : '−'}${fmt(o.sum)} ₽</span>
        </div>`).join('') : 'Операций пока нет.';
}

// Статистика по дням / неделям / месяцам
function groupKey(date) {
    if (period === 'days') return date;
    if (period === 'weeks') return mondayOf(date);
    return date.slice(0, 7);   // "2026-10"
}

function renderStat() {
    const groups = {};
    data.ops.forEach(o => {
        const k = groupKey(o.date);
        if (!groups[k]) groups[k] = { inc: 0, exp: 0 };
        groups[k][o.type] += o.sum;
    });
    const keys = Object.keys(groups).sort().reverse().slice(0, 12);
    $('stat').innerHTML = keys.length ? keys.map(k => `
        <div class="row">
            <b>${period === 'weeks' ? 'Неделя с ' + k : k}</b>
            <span class="plus">+${fmt(groups[k].inc)} ₽</span>
            <span class="minus">−${fmt(groups[k].exp)} ₽</span>
        </div>`).join('') : EMPTY;
}

// Расходы по категориям за выбранный период
function inRange(date) {
    if (range === 'today') return date === today();
    if (range === 'week') return mondayOf(date) === mondayOf(today());
    if (range === 'month') return date.slice(0, 7) === today().slice(0, 7);
    return true;   // allTime
}

function expensesByCat(filter) {
    const m = {};
    data.ops.forEach(o => {
        if (o.type === 'exp' && filter(o.date)) m[o.cat] = (m[o.cat] || 0) + o.sum;
    });
    return m;
}

function renderCats() {
    const m = expensesByCat(inRange);
    const names = Object.keys(m).sort((a, b) => m[b] - m[a]);   // от большей суммы к меньшей
    const total = names.reduce((s, n) => s + m[n], 0);
    $('expenses-category').innerHTML = names.length ? names.map(n => {
        const p = Math.round(m[n] / total * 100);
        return `<div class="row3"><span>${esc(n)}</span><div class="bar"><div style="width:${p}%"></div></div><span>${fmt(m[n])} ₽ · ${p}%</span></div>`;
    }).join('') : EMPTY;
}

// Рекомендации
function renderTips() {
    const tips = [];
    let inc = 0, exp = 0;
    data.ops.forEach(o => { if (o.type === 'inc') inc += o.sum; else exp += o.sum; });

    if (!data.ops.length) tips.push(EMPTY);
    else {
        if (exp > inc) tips.push(`Расходы больше доходов на ${fmt(exp - inc)} ₽. Отложите необязательные покупки.`);
        else if (inc > 0 && exp > inc * 0.8) tips.push('Вы тратите больше 80% доходов. Старайтесь откладывать хотя бы 20%.');

        const m = expensesByCat(d => d.slice(0, 7) === today().slice(0, 7));   // этот месяц
        const names = Object.keys(m).sort((a, b) => m[b] - m[a]);
        if (names.length) {
            const total = names.reduce((s, n) => s + m[n], 0);
            const share = Math.round(m[names[0]] / total * 100);
            if (share >= 40) tips.push(`В этом месяце «${esc(names[0])}» занимает ${share}% расходов. Попробуйте ограничить эту категорию.`);
        }
        if (!tips.length) tips.push('Расходы выглядят сбалансированно. Продолжайте вести учёт.');
    }
    $('recomendation').innerHTML = tips.map(t => `<p>${t}</p>`).join('');
}


function render() {
    renderTotals();
    renderStat();
    renderCats();
    renderTips();
}

fillCats();
render();
showScreen(sessionStorage.getItem('auth') ? 'app' : 'login');