import * as store from './store.js';
import * as sidebar from './components/sidebar.js';
import * as taskModal from './components/taskModal.js';
import * as categoryManager from './components/categoryManager.js';
import { mount as mountOverview, unmount as unmountOverview } from './views/overviewView.js';
import { mount as mountMatrix,   unmount as unmountMatrix   } from './views/matrixView.js';
import { mount as mountCalendar, unmount as unmountCalendar } from './views/calendarView.js';
import { mount as mountStats,    unmount as unmountStats    } from './views/statsView.js';

const VIEWS = {
  '#overview': { mount: mountOverview, unmount: unmountOverview },
  '#matrix':   { mount: mountMatrix,   unmount: unmountMatrix   },
  '#calendar': { mount: mountCalendar, unmount: unmountCalendar },
  '#stats':    { mount: mountStats,    unmount: unmountStats    },
};

let currentViewKey = null;

function navigate(hash) {
  const viewKey = VIEWS[hash] ? hash : '#overview';
  if (viewKey === currentViewKey) return;
  if (currentViewKey && VIEWS[currentViewKey]) VIEWS[currentViewKey].unmount();
  currentViewKey = viewKey;
  sidebar.setActiveHash(viewKey);
  const container = document.getElementById('viewContainer');
  container.innerHTML = '';
  VIEWS[viewKey].mount(container);
}

function init() {
  store.init();
  sidebar.init();
  taskModal.init();
  categoryManager.init();

  document.getElementById('addTaskBtn').addEventListener('click', () => taskModal.open());
  document.getElementById('searchInput').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.task-card').forEach(card => {
      const title = card.querySelector('.task-card__title')?.textContent.toLowerCase() || '';
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });

  window.addEventListener('hashchange', () => navigate(location.hash));
  navigate(location.hash || '#overview');
}

init();
