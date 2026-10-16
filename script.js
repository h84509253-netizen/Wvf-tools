(() => {
  const $ = (id) => document.getElementById(id);
  const toast = $('toast');
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }
  $('year').textContent = new Date().getFullYear();

  const titles = {
    prompt: ['TOOL / 01', 'Prompt Builder'],
    names: ['TOOL / 02', 'Name Studio'],
    bio: ['TOOL / 03', 'Bio Maker']
  };
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      const key = tab.dataset.tab;
      Object.keys(titles).forEach(k => $('panel-' + k).hidden = k !== key);
      $('workspace-kicker').textContent = titles[key][0];
      $('workspace-title').textContent = titles[key][1];
    });
  });

  $('make-prompt').addEventListener('click', () => {
    const task = $('p-task').value.trim();
    if (!task) { notify('Сначала напиши, что нужно сделать.'); $('p-task').focus(); return; }
    const role = $('p-role').value;
    const tone = $('p-tone').value;
    const details = $('p-details').value.trim();
    const output = `Роль: ${role}.\n\nЗадача: ${task}\n\nСтиль ответа: ${tone}.\n\nТребования:\n- Дай конкретный, структурированный результат.\n- Если не хватает критически важных данных, сначала задай уточняющие вопросы.\n- Не выдумывай факты; явно отмечай неопределённость.\n- Используй понятный язык и примеры, если они помогают.\n${details ? '\nДополнительный контекст и ограничения:\n' + details + '\n' : ''}\nФормат результата: сначала готовый ответ, затем краткие рекомендации по улучшению при необходимости.`;
    $('prompt-output').textContent = output;
    $('prompt-result').hidden = false;
    $('prompt-result').scrollIntoView({behavior:'smooth', block:'nearest'});
  });
  $('clear-prompt').addEventListener('click', () => {
    $('p-task').value = ''; $('p-details').value = ''; $('prompt-result').hidden = true;
    notify('Поля очищены.');
  });

  const dictionaries = {
    modern: {first:['Nova','Nexa','Vanta','Nexo','Lumo','Avero','Nori','Velto','Mira','Kairo','Zento','Orbi','Vero','Lunex','Avio'], second:['Lab','Flow','Studio','Works','Hub','Base','Point','Craft','Space','Nest','Wave','Forge','Collective','Pixel','Core']},
    tech: {first:['Byte','Cyber','Quantum','Neuro','Pixel','Data','Cloud','Vector','Code','Nexa','Flux','Kernel','Logic','Orbit','Syntax'], second:['Forge','Stack','Lab','Node','Grid','Core','OS','Shift','Engine','Link','Works','Pulse','Hub','System','Base']},
    premium: {first:['Aurex','Vanta','Monarch','Obsidian','Velour','Sterling','Noir','Astra','Crown','Onyx','Sable','Echelon','Luxe','Arden','Veyra'], second:['Studio','Maison','Works','Prime','Collective','Atelier','Edition','Group','Craft','House','Lab','Form','Vision','Society','Design']},
    short: {first:['Zuno','Vexa','Nivo','Zyro','Luma','Kivo','Voro','Mexo','Rivo','Zeno','Mova','Koda','Numa','Vilo','Aven'], second:['io','up','ly','co','lab','go','box','kit','app','ly','hub','one','dev','os','ix']},
    playful: {first:['Pixel','Turbo','Mango','Rocket','Jelly','Cosmo','Buzzy','Doodle','Spark','Panda','Comet','Noodle','Zippy','Lucky','Waffle'], second:['Club','Pop','World','Crew','Party','Quest','Zone','Factory','Rocket','Lab','Land','Box','Squad','Town','Play']}
  };
  const cleanTopic = (s) => s.trim().replace(/[<>]/g,'').slice(0,50);
  $('make-names').addEventListener('click', () => {
    const topic = cleanTopic($('n-topic').value);
    if (!topic) { notify('Укажи тему или нишу проекта.'); $('n-topic').focus(); return; }
    const style = dictionaries[$('n-style').value];
    const count = Number($('n-count').value);
    const topicWord = topic.split(/[\s,]+/)[0];
    const candidates = [
      `${style.first[0]} ${style.second[0]}`, `${style.first[1]} ${style.second[2]}`,
      `${topicWord} ${style.second[3]}`, `${style.first[2]}${style.second[1]}`,
      `${style.first[3]} ${style.second[4]}`, `${topicWord}${style.second[5]}`,
      `${style.first[4]} ${style.second[6]}`, `${style.first[5]}${style.second[7]}`,
      `${style.first[6]} ${style.second[8]}`, `${style.first[7]} ${style.second[9]}`,
      `${topicWord} ${style.second[10]}`, `${style.first[8]} ${style.second[11]}`,
      `${style.first[9]}${style.second[12]}`, `${style.first[10]} ${style.second[13]}`,
      `${style.first[11]} ${style.second[14]}`
    ];
    const shuffled = candidates.sort(() => Math.random() - .5).slice(0, count);
    const output = $('names-output'); output.replaceChildren();
    shuffled.forEach(name => {
      const item = document.createElement('div'); item.className = 'name-item';
      const label = document.createElement('span'); label.textContent = name;
      const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = '⧉'; copy.setAttribute('aria-label', 'Копировать ' + name);
      copy.addEventListener('click', () => copyText(name));
      item.append(label, copy); output.append(item);
    });
    $('names-result').hidden = false;
  });

  const bioTemplates = {
    premium: (name,topic,platform,goal) => `${name} — ${topic}.\n\nСоздаю идеи, превращаю их в проекты и делюсь тем, что работает.\n${goal}.\n\n✦ ${platform} · новые идеи и проекты`,
    friendly: (name,topic,platform,goal) => `Привет! Это ${name} 👋\n\nЗдесь про ${topic.toLowerCase()}, свежие идеи и процесс создания.\n${goal} — присоединяйся!\n\n✉ ${platform}`,
    expert: (name,topic,platform,goal) => `${name} | ${topic}\n\nПрактические заметки, разборы и проекты.\nФокус: ${goal.toLowerCase()}.\n\n${platform} · по делу, без лишнего`,
    minimal: (name,topic,platform,goal) => `${name}\n${topic}\n${goal}\n${platform}`
  };
  $('make-bio').addEventListener('click', () => {
    const name = cleanTopic($('b-name').value);
    const topic = cleanTopic($('b-topic').value);
    if (!name || !topic) { notify('Заполни название и тему профиля.'); (!name ? $('b-name') : $('b-topic')).focus(); return; }
    $('bio-output').textContent = bioTemplates[$('b-style').value](name, topic, $('b-platform').value, $('b-goal').value);
    $('bio-result').hidden = false;
    $('bio-result').scrollIntoView({behavior:'smooth', block:'nearest'});
  });

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0';
        document.body.append(area); area.select(); const ok = document.execCommand('copy'); area.remove();
        if (!ok) throw new Error('copy failed');
      }
      notify('Скопировано в буфер обмена.');
    } catch { notify('Не удалось скопировать автоматически — выдели и скопируй текст вручную.'); }
  }
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', () => {
      const target = $(button.dataset.copy);
      const text = button.dataset.copyMode === 'names'
        ? [...target.querySelectorAll('.name-item span')].map(el => el.textContent).join('\n')
        : target.textContent;
      copyText(text);
    });
  });
})();