(() => {
  const orbit = document.querySelector('#tool-orbit');
  const buttons = [...orbit.querySelectorAll('[data-tool]')];
  const note = document.querySelector('#tool-note');
  const link = document.querySelector('#tool-link');
  const examples = {
    python: ['Python powers the practice workflow in Career Copilot Lab.', 'Career Copilot Lab', 'career_copilot_lab'],
    sql: ['BloodBridge BD uses MySQL to organize donation records and workflow data.', 'BloodBridge BD', 'BloodBridge-BD'],
    php: ['I used PHP while fixing the direct-donation card layout in BloodBridge BD.', 'BloodBridge BD', 'BloodBridge-BD'],
    js: ['JavaScript handles charging bays, game timers, and interactive controls.', 'this portfolio', 'mshlikhon.github.io'],
    git: ['Git tracks changes to this portfolio, including its demos and public releases.', 'this portfolio', 'mshlikhon.github.io']
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    const [description, project, repo] = examples[button.dataset.tool];
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    note.textContent = description;
    link.textContent = `Explore ${project} ↗`;
    link.href = `https://github.com/MSHLIKHON/${repo}`;
  }));
  orbit.hidden = false;
})();
