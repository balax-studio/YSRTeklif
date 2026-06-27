// ── YSR Store - State Management ───────────────────────────────
const YSRStore = {
  _state: {
    items: [],
    mahals: [],
    users: [],
    logs: [],
    surveys: [],
    reports: [],
    currentUser: null
  },
  
  _isSilent: false,

  init() {
    this._state.items = this._wrapArray([], 'items');
    this._state.mahals = this._wrapArray([], 'mahals');
    this._state.users = this._wrapArray([], 'users');
    this._state.logs = this._wrapArray([], 'logs');
    this._state.surveys = this._wrapArray([], 'surveys');
    this._state.reports = this._wrapArray([], 'reports');
  },
  
  _wrapArray(arr, key) {
    return new Proxy(arr, {
      get: (target, prop, receiver) => {
        if (['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(prop)) {
          return (...args) => {
            const result = target[prop].apply(target, args);
            this.triggerUpdate(key);
            return result;
          };
        }
        return Reflect.get(target, prop, receiver);
      },
      set: (target, prop, value, receiver) => {
        const res = Reflect.set(target, prop, value, receiver);
        if (!this._isSilent && (prop === 'length' || !isNaN(Number(prop)))) {
          this.triggerUpdate(key);
        }
        return res;
      }
    });
  },

  get items() { return this._state.items; },
  set items(val) { 
    this._state.items = this._wrapArray(val || [], 'items'); 
    this.triggerUpdate('items'); 
  },

  get mahals() { return this._state.mahals; },
  set mahals(val) { 
    this._state.mahals = this._wrapArray(val || [], 'mahals'); 
    this.triggerUpdate('mahals'); 
  },

  get users() { return this._state.users; },
  set users(val) { 
    this._state.users = this._wrapArray(val || [], 'users'); 
    this.triggerUpdate('users'); 
  },

  get logs() { return this._state.logs; },
  set logs(val) { 
    this._state.logs = this._wrapArray(val || [], 'logs'); 
    this.triggerUpdate('logs'); 
  },

  get surveys() { return this._state.surveys; },
  set surveys(val) { 
    this._state.surveys = this._wrapArray(val || [], 'surveys'); 
    this.triggerUpdate('surveys'); 
  },

  get reports() { return this._state.reports; },
  set reports(val) { 
    this._state.reports = this._wrapArray(val || [], 'reports'); 
    this.triggerUpdate('reports'); 
  },

  get currentUser() { return this._state.currentUser; },
  set currentUser(val) { this._state.currentUser = val; },

  triggerUpdate(type) {
    if (this._isSilent) return;
    
    // Dispatch an event so other components can react
    window.dispatchEvent(new CustomEvent(`ysr:${type}-changed`, { detail: this._state[type] }));
    
    // Debounced rendering functions check
    if (type === 'items' && typeof debouncedRender === 'function') debouncedRender();
    if (type === 'surveys' && typeof debouncedRenderKesif === 'function') debouncedRenderKesif();
    if (type === 'reports' && typeof debouncedRenderReports === 'function') debouncedRenderReports();
  }
};

// Initialize the store
YSRStore.init();

// Expose state as global getters/setters on the window object for 100% backward compatibility
['items', 'mahals', 'users', 'logs', 'surveys', 'reports', 'currentUser'].forEach(key => {
  Object.defineProperty(window, key, {
    get() { return YSRStore[key]; },
    set(val) { YSRStore[key] = val; },
    configurable: true
  });
});
