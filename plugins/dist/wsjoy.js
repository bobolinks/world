var Jt = Object.defineProperty;
var Gt = (e, t, n) => t in e ? Jt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var $ = (e, t, n) => (Gt(e, typeof t != "symbol" ? t + "" : t, n), n);
var Se = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Fe = {}, G = {};
Object.defineProperty(G, "__esModule", { value: !0 });
let Ie;
function $e() {
  if (Ie === void 0)
    throw new Error("No runtime abstraction layer installed");
  return Ie;
}
(function(e) {
  function t(n) {
    if (n === void 0)
      throw new Error("No runtime abstraction layer provided");
    Ie = n;
  }
  e.install = t;
})($e || ($e = {}));
G.default = $e;
var L = {};
Object.defineProperty(L, "__esModule", { value: !0 });
L.stringArray = L.array = L.func = L.error = L.number = L.string = L.boolean = void 0;
function Ht(e) {
  return e === !0 || e === !1;
}
L.boolean = Ht;
function mt(e) {
  return typeof e == "string" || e instanceof String;
}
L.string = mt;
function Xt(e) {
  return typeof e == "number" || e instanceof Number;
}
L.number = Xt;
function Vt(e) {
  return e instanceof Error;
}
L.error = Vt;
function Qt(e) {
  return typeof e == "function";
}
L.func = Qt;
function pt(e) {
  return Array.isArray(e);
}
L.array = pt;
function Yt(e) {
  return pt(e) && e.every((t) => mt(t));
}
L.stringArray = Yt;
var ie = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.Emitter = e.Event = void 0;
  const t = G;
  (function(u) {
    const o = { dispose() {
    } };
    u.None = function() {
      return o;
    };
  })(e.Event || (e.Event = {}));
  class n {
    add(o, i = null, l) {
      this._callbacks || (this._callbacks = [], this._contexts = []), this._callbacks.push(o), this._contexts.push(i), Array.isArray(l) && l.push({ dispose: () => this.remove(o, i) });
    }
    remove(o, i = null) {
      if (!this._callbacks)
        return;
      let l = !1;
      for (let c = 0, a = this._callbacks.length; c < a; c++)
        if (this._callbacks[c] === o)
          if (this._contexts[c] === i) {
            this._callbacks.splice(c, 1), this._contexts.splice(c, 1);
            return;
          } else
            l = !0;
      if (l)
        throw new Error("When adding a listener with a context, you should remove it with the same context");
    }
    invoke(...o) {
      if (!this._callbacks)
        return [];
      const i = [], l = this._callbacks.slice(0), c = this._contexts.slice(0);
      for (let a = 0, h = l.length; a < h; a++)
        try {
          i.push(l[a].apply(c[a], o));
        } catch (g) {
          (0, t.default)().console.error(g);
        }
      return i;
    }
    isEmpty() {
      return !this._callbacks || this._callbacks.length === 0;
    }
    dispose() {
      this._callbacks = void 0, this._contexts = void 0;
    }
  }
  class s {
    constructor(o) {
      this._options = o;
    }
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event() {
      return this._event || (this._event = (o, i, l) => {
        this._callbacks || (this._callbacks = new n()), this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty() && this._options.onFirstListenerAdd(this), this._callbacks.add(o, i);
        const c = {
          dispose: () => {
            this._callbacks && (this._callbacks.remove(o, i), c.dispose = s._noop, this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty() && this._options.onLastListenerRemove(this));
          }
        };
        return Array.isArray(l) && l.push(c), c;
      }), this._event;
    }
    /**
     * To be kept private to fire an event to
     * subscribers
     */
    fire(o) {
      this._callbacks && this._callbacks.invoke.call(this._callbacks, o);
    }
    dispose() {
      this._callbacks && (this._callbacks.dispose(), this._callbacks = void 0);
    }
  }
  e.Emitter = s, s._noop = function() {
  };
})(ie);
var pe = {};
Object.defineProperty(pe, "__esModule", { value: !0 });
pe.Semaphore = void 0;
const Kt = G;
class Zt {
  constructor(t = 1) {
    if (t <= 0)
      throw new Error("Capacity must be greater than 0");
    this._capacity = t, this._active = 0, this._waiting = [];
  }
  lock(t) {
    return new Promise((n, s) => {
      this._waiting.push({ thunk: t, resolve: n, reject: s }), this.runNext();
    });
  }
  get active() {
    return this._active;
  }
  runNext() {
    this._waiting.length === 0 || this._active === this._capacity || (0, Kt.default)().timer.setImmediate(() => this.doRunNext());
  }
  doRunNext() {
    if (this._waiting.length === 0 || this._active === this._capacity)
      return;
    const t = this._waiting.shift();
    if (this._active++, this._active > this._capacity)
      throw new Error("To many thunks active");
    try {
      const n = t.thunk();
      n instanceof Promise ? n.then((s) => {
        this._active--, t.resolve(s), this.runNext();
      }, (s) => {
        this._active--, t.reject(s), this.runNext();
      }) : (this._active--, t.resolve(n), this.runNext());
    } catch (n) {
      this._active--, t.reject(n), this.runNext();
    }
  }
}
pe.Semaphore = Zt;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ReadableStreamMessageReader = e.AbstractMessageReader = e.MessageReader = void 0;
  const t = G, n = L, s = ie, u = pe;
  (function(c) {
    function a(h) {
      let g = h;
      return g && n.func(g.listen) && n.func(g.dispose) && n.func(g.onError) && n.func(g.onClose) && n.func(g.onPartialMessage);
    }
    c.is = a;
  })(e.MessageReader || (e.MessageReader = {}));
  class o {
    constructor() {
      this.errorEmitter = new s.Emitter(), this.closeEmitter = new s.Emitter(), this.partialMessageEmitter = new s.Emitter();
    }
    dispose() {
      this.errorEmitter.dispose(), this.closeEmitter.dispose();
    }
    get onError() {
      return this.errorEmitter.event;
    }
    fireError(a) {
      this.errorEmitter.fire(this.asError(a));
    }
    get onClose() {
      return this.closeEmitter.event;
    }
    fireClose() {
      this.closeEmitter.fire(void 0);
    }
    get onPartialMessage() {
      return this.partialMessageEmitter.event;
    }
    firePartialMessage(a) {
      this.partialMessageEmitter.fire(a);
    }
    asError(a) {
      return a instanceof Error ? a : new Error(`Reader received error. Reason: ${n.string(a.message) ? a.message : "unknown"}`);
    }
  }
  e.AbstractMessageReader = o;
  var i;
  (function(c) {
    function a(h) {
      let g, b;
      const w = /* @__PURE__ */ new Map();
      let C;
      const W = /* @__PURE__ */ new Map();
      if (h === void 0 || typeof h == "string")
        g = h ?? "utf-8";
      else {
        if (g = h.charset ?? "utf-8", h.contentDecoder !== void 0 && (b = h.contentDecoder, w.set(b.name, b)), h.contentDecoders !== void 0)
          for (const q of h.contentDecoders)
            w.set(q.name, q);
        if (h.contentTypeDecoder !== void 0 && (C = h.contentTypeDecoder, W.set(C.name, C)), h.contentTypeDecoders !== void 0)
          for (const q of h.contentTypeDecoders)
            W.set(q.name, q);
      }
      return C === void 0 && (C = (0, t.default)().applicationJson.decoder, W.set(C.name, C)), { charset: g, contentDecoder: b, contentDecoders: w, contentTypeDecoder: C, contentTypeDecoders: W };
    }
    c.fromOptions = a;
  })(i || (i = {}));
  class l extends o {
    constructor(a, h) {
      super(), this.readable = a, this.options = i.fromOptions(h), this.buffer = (0, t.default)().messageBuffer.create(this.options.charset), this._partialMessageTimeout = 1e4, this.nextMessageLength = -1, this.messageToken = 0, this.readSemaphore = new u.Semaphore(1);
    }
    set partialMessageTimeout(a) {
      this._partialMessageTimeout = a;
    }
    get partialMessageTimeout() {
      return this._partialMessageTimeout;
    }
    listen(a) {
      this.nextMessageLength = -1, this.messageToken = 0, this.partialMessageTimer = void 0, this.callback = a;
      const h = this.readable.onData((g) => {
        this.onData(g);
      });
      return this.readable.onError((g) => this.fireError(g)), this.readable.onClose(() => this.fireClose()), h;
    }
    onData(a) {
      for (this.buffer.append(a); ; ) {
        if (this.nextMessageLength === -1) {
          const g = this.buffer.tryReadHeaders(!0);
          if (!g)
            return;
          const b = g.get("content-length");
          if (!b) {
            this.fireError(new Error("Header must provide a Content-Length property."));
            return;
          }
          const w = parseInt(b);
          if (isNaN(w)) {
            this.fireError(new Error("Content-Length value must be a number."));
            return;
          }
          this.nextMessageLength = w;
        }
        const h = this.buffer.tryReadBody(this.nextMessageLength);
        if (h === void 0) {
          this.setPartialMessageTimer();
          return;
        }
        this.clearPartialMessageTimer(), this.nextMessageLength = -1, this.readSemaphore.lock(async () => {
          const g = this.options.contentDecoder !== void 0 ? await this.options.contentDecoder.decode(h) : h, b = await this.options.contentTypeDecoder.decode(g, this.options);
          this.callback(b);
        }).catch((g) => {
          this.fireError(g);
        });
      }
    }
    clearPartialMessageTimer() {
      this.partialMessageTimer && (this.partialMessageTimer.dispose(), this.partialMessageTimer = void 0);
    }
    setPartialMessageTimer() {
      this.clearPartialMessageTimer(), !(this._partialMessageTimeout <= 0) && (this.partialMessageTimer = (0, t.default)().timer.setTimeout((a, h) => {
        this.partialMessageTimer = void 0, a === this.messageToken && (this.firePartialMessage({ messageToken: a, waitingTime: h }), this.setPartialMessageTimer());
      }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout));
    }
  }
  e.ReadableStreamMessageReader = l;
})(Fe);
class xt extends Fe.AbstractMessageReader {
  constructor(n) {
    super();
    $(this, "socket");
    $(this, "state", "initial");
    $(this, "callback");
    $(this, "events", []);
    this.socket = n, this.socket.onMessage((s) => this.readMessage(s)), this.socket.onError((s) => this.fireError(s)), this.socket.onClose((s, u) => {
      if (s !== 1e3) {
        const o = {
          name: "" + s,
          message: `Error during socket reconnect: code = ${s}, reason = ${u}`
        };
        this.fireError(o);
      }
      this.fireClose();
    });
  }
  listen(n) {
    if (this.state === "initial")
      for (this.state = "listening", this.callback = n; this.events.length !== 0; ) {
        const s = this.events.pop();
        s.message ? this.readMessage(s.message) : s.error ? this.fireError(s.error) : this.fireClose();
      }
    return {
      dispose: () => {
        this.callback === n && (this.callback = void 0);
      }
    };
  }
  readMessage(n) {
    if (this.state === "initial")
      this.events.splice(0, 0, { message: n });
    else if (this.state === "listening")
      try {
        const s = JSON.parse(n);
        this.callback(s);
      } catch (s) {
        const u = {
          name: "400",
          message: `Error during message parsing, reason = ${typeof s == "object" ? s.message : "unknown"}`
        };
        this.fireError(u);
      }
  }
  fireError(n) {
    this.state === "initial" ? this.events.splice(0, 0, { error: n }) : this.state === "listening" && super.fireError(n);
  }
  fireClose() {
    this.state === "initial" ? this.events.splice(0, 0, {}) : this.state === "listening" && super.fireClose(), this.state = "closed";
  }
}
var ze = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.WriteableStreamMessageWriter = e.AbstractMessageWriter = e.MessageWriter = void 0;
  const t = G, n = L, s = pe, u = ie, o = "Content-Length: ", i = `\r
`;
  (function(h) {
    function g(b) {
      let w = b;
      return w && n.func(w.dispose) && n.func(w.onClose) && n.func(w.onError) && n.func(w.write);
    }
    h.is = g;
  })(e.MessageWriter || (e.MessageWriter = {}));
  class l {
    constructor() {
      this.errorEmitter = new u.Emitter(), this.closeEmitter = new u.Emitter();
    }
    dispose() {
      this.errorEmitter.dispose(), this.closeEmitter.dispose();
    }
    get onError() {
      return this.errorEmitter.event;
    }
    fireError(g, b, w) {
      this.errorEmitter.fire([this.asError(g), b, w]);
    }
    get onClose() {
      return this.closeEmitter.event;
    }
    fireClose() {
      this.closeEmitter.fire(void 0);
    }
    asError(g) {
      return g instanceof Error ? g : new Error(`Writer received error. Reason: ${n.string(g.message) ? g.message : "unknown"}`);
    }
  }
  e.AbstractMessageWriter = l;
  var c;
  (function(h) {
    function g(b) {
      return b === void 0 || typeof b == "string" ? { charset: b ?? "utf-8", contentTypeEncoder: (0, t.default)().applicationJson.encoder } : { charset: b.charset ?? "utf-8", contentEncoder: b.contentEncoder, contentTypeEncoder: b.contentTypeEncoder ?? (0, t.default)().applicationJson.encoder };
    }
    h.fromOptions = g;
  })(c || (c = {}));
  class a extends l {
    constructor(g, b) {
      super(), this.writable = g, this.options = c.fromOptions(b), this.errorCount = 0, this.writeSemaphore = new s.Semaphore(1), this.writable.onError((w) => this.fireError(w)), this.writable.onClose(() => this.fireClose());
    }
    async write(g) {
      return this.writeSemaphore.lock(async () => this.options.contentTypeEncoder.encode(g, this.options).then((w) => this.options.contentEncoder !== void 0 ? this.options.contentEncoder.encode(w) : w).then((w) => {
        const C = [];
        return C.push(o, w.byteLength.toString(), i), C.push(i), this.doWrite(g, C, w);
      }, (w) => {
        throw this.fireError(w), w;
      }));
    }
    async doWrite(g, b, w) {
      try {
        return await this.writable.write(b.join(""), "ascii"), this.writable.write(w);
      } catch (C) {
        return this.handleError(C, g), Promise.reject(C);
      }
    }
    handleError(g, b) {
      this.errorCount++, this.fireError(g, b, this.errorCount);
    }
    end() {
      this.writable.end();
    }
  }
  e.WriteableStreamMessageWriter = a;
})(ze);
class en extends ze.AbstractMessageWriter {
  constructor(n) {
    super();
    $(this, "socket");
    $(this, "errorCount", 0);
    this.socket = n;
  }
  end() {
  }
  async write(n) {
    try {
      const s = JSON.stringify(n);
      this.socket.send(s);
    } catch (s) {
      this.errorCount++, this.fireError(s, n, this.errorCount);
    }
  }
}
var gt = {}, Je = {}, Me = {}, Le = {}, st;
function bt() {
  return st || (st = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.Message = e.NotificationType9 = e.NotificationType8 = e.NotificationType7 = e.NotificationType6 = e.NotificationType5 = e.NotificationType4 = e.NotificationType3 = e.NotificationType2 = e.NotificationType1 = e.NotificationType0 = e.NotificationType = e.RequestType9 = e.RequestType8 = e.RequestType7 = e.RequestType6 = e.RequestType5 = e.RequestType4 = e.RequestType3 = e.RequestType2 = e.RequestType1 = e.RequestType = e.RequestType0 = e.AbstractMessageSignature = e.ParameterStructures = e.ResponseError = e.ErrorCodes = void 0;
    const t = L;
    var n;
    (function(m) {
      m.ParseError = -32700, m.InvalidRequest = -32600, m.MethodNotFound = -32601, m.InvalidParams = -32602, m.InternalError = -32603, m.jsonrpcReservedErrorRangeStart = -32099, m.serverErrorStart = -32099, m.MessageWriteError = -32099, m.MessageReadError = -32098, m.PendingResponseRejected = -32097, m.ConnectionInactive = -32096, m.ServerNotInitialized = -32002, m.UnknownErrorCode = -32001, m.jsonrpcReservedErrorRangeEnd = -32e3, m.serverErrorEnd = -32e3;
    })(n = e.ErrorCodes || (e.ErrorCodes = {}));
    class s extends Error {
      constructor(f, _, O) {
        super(_), this.code = t.number(f) ? f : n.UnknownErrorCode, this.data = O, Object.setPrototypeOf(this, s.prototype);
      }
      toJson() {
        const f = {
          code: this.code,
          message: this.message
        };
        return this.data !== void 0 && (f.data = this.data), f;
      }
    }
    e.ResponseError = s;
    class u {
      constructor(f) {
        this.kind = f;
      }
      static is(f) {
        return f === u.auto || f === u.byName || f === u.byPosition;
      }
      toString() {
        return this.kind;
      }
    }
    e.ParameterStructures = u, u.auto = new u("auto"), u.byPosition = new u("byPosition"), u.byName = new u("byName");
    class o {
      constructor(f, _) {
        this.method = f, this.numberOfParams = _;
      }
      get parameterStructures() {
        return u.auto;
      }
    }
    e.AbstractMessageSignature = o;
    class i extends o {
      constructor(f) {
        super(f, 0);
      }
    }
    e.RequestType0 = i;
    class l extends o {
      constructor(f, _ = u.auto) {
        super(f, 1), this._parameterStructures = _;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    }
    e.RequestType = l;
    class c extends o {
      constructor(f, _ = u.auto) {
        super(f, 1), this._parameterStructures = _;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    }
    e.RequestType1 = c;
    class a extends o {
      constructor(f) {
        super(f, 2);
      }
    }
    e.RequestType2 = a;
    class h extends o {
      constructor(f) {
        super(f, 3);
      }
    }
    e.RequestType3 = h;
    class g extends o {
      constructor(f) {
        super(f, 4);
      }
    }
    e.RequestType4 = g;
    class b extends o {
      constructor(f) {
        super(f, 5);
      }
    }
    e.RequestType5 = b;
    class w extends o {
      constructor(f) {
        super(f, 6);
      }
    }
    e.RequestType6 = w;
    class C extends o {
      constructor(f) {
        super(f, 7);
      }
    }
    e.RequestType7 = C;
    class W extends o {
      constructor(f) {
        super(f, 8);
      }
    }
    e.RequestType8 = W;
    class q extends o {
      constructor(f) {
        super(f, 9);
      }
    }
    e.RequestType9 = q;
    class U extends o {
      constructor(f, _ = u.auto) {
        super(f, 1), this._parameterStructures = _;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    }
    e.NotificationType = U;
    class ge extends o {
      constructor(f) {
        super(f, 0);
      }
    }
    e.NotificationType0 = ge;
    class se extends o {
      constructor(f, _ = u.auto) {
        super(f, 1), this._parameterStructures = _;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    }
    e.NotificationType1 = se;
    class be extends o {
      constructor(f) {
        super(f, 2);
      }
    }
    e.NotificationType2 = be;
    class oe extends o {
      constructor(f) {
        super(f, 3);
      }
    }
    e.NotificationType3 = oe;
    class ae extends o {
      constructor(f) {
        super(f, 4);
      }
    }
    e.NotificationType4 = ae;
    class ce extends o {
      constructor(f) {
        super(f, 5);
      }
    }
    e.NotificationType5 = ce;
    class ue extends o {
      constructor(f) {
        super(f, 6);
      }
    }
    e.NotificationType6 = ue;
    class B extends o {
      constructor(f) {
        super(f, 7);
      }
    }
    e.NotificationType7 = B;
    class Ce extends o {
      constructor(f) {
        super(f, 8);
      }
    }
    e.NotificationType8 = Ce;
    class y extends o {
      constructor(f) {
        super(f, 9);
      }
    }
    e.NotificationType9 = y, function(m) {
      function f(H) {
        const D = H;
        return D && t.string(D.method) && (t.string(D.id) || t.number(D.id));
      }
      m.isRequest = f;
      function _(H) {
        const D = H;
        return D && t.string(D.method) && H.id === void 0;
      }
      m.isNotification = _;
      function O(H) {
        const D = H;
        return D && (D.result !== void 0 || !!D.error) && (t.string(D.id) || t.number(D.id) || D.id === null);
      }
      m.isResponse = O;
    }(e.Message || (e.Message = {}));
  }(Le)), Le;
}
var je = {}, ot;
function _t() {
  return ot || (ot = 1, function(e) {
    var t;
    Object.defineProperty(e, "__esModule", { value: !0 }), e.LRUCache = e.LinkedMap = e.Touch = void 0;
    var n;
    (function(o) {
      o.None = 0, o.First = 1, o.AsOld = o.First, o.Last = 2, o.AsNew = o.Last;
    })(n = e.Touch || (e.Touch = {}));
    class s {
      constructor() {
        this[t] = "LinkedMap", this._map = /* @__PURE__ */ new Map(), this._head = void 0, this._tail = void 0, this._size = 0, this._state = 0;
      }
      clear() {
        this._map.clear(), this._head = void 0, this._tail = void 0, this._size = 0, this._state++;
      }
      isEmpty() {
        return !this._head && !this._tail;
      }
      get size() {
        return this._size;
      }
      get first() {
        var i;
        return (i = this._head) == null ? void 0 : i.value;
      }
      get last() {
        var i;
        return (i = this._tail) == null ? void 0 : i.value;
      }
      has(i) {
        return this._map.has(i);
      }
      get(i, l = n.None) {
        const c = this._map.get(i);
        if (c)
          return l !== n.None && this.touch(c, l), c.value;
      }
      set(i, l, c = n.None) {
        let a = this._map.get(i);
        if (a)
          a.value = l, c !== n.None && this.touch(a, c);
        else {
          switch (a = { key: i, value: l, next: void 0, previous: void 0 }, c) {
            case n.None:
              this.addItemLast(a);
              break;
            case n.First:
              this.addItemFirst(a);
              break;
            case n.Last:
              this.addItemLast(a);
              break;
            default:
              this.addItemLast(a);
              break;
          }
          this._map.set(i, a), this._size++;
        }
        return this;
      }
      delete(i) {
        return !!this.remove(i);
      }
      remove(i) {
        const l = this._map.get(i);
        if (l)
          return this._map.delete(i), this.removeItem(l), this._size--, l.value;
      }
      shift() {
        if (!this._head && !this._tail)
          return;
        if (!this._head || !this._tail)
          throw new Error("Invalid list");
        const i = this._head;
        return this._map.delete(i.key), this.removeItem(i), this._size--, i.value;
      }
      forEach(i, l) {
        const c = this._state;
        let a = this._head;
        for (; a; ) {
          if (l ? i.bind(l)(a.value, a.key, this) : i(a.value, a.key, this), this._state !== c)
            throw new Error("LinkedMap got modified during iteration.");
          a = a.next;
        }
      }
      keys() {
        const i = this._state;
        let l = this._head;
        const c = {
          [Symbol.iterator]: () => c,
          next: () => {
            if (this._state !== i)
              throw new Error("LinkedMap got modified during iteration.");
            if (l) {
              const a = { value: l.key, done: !1 };
              return l = l.next, a;
            } else
              return { value: void 0, done: !0 };
          }
        };
        return c;
      }
      values() {
        const i = this._state;
        let l = this._head;
        const c = {
          [Symbol.iterator]: () => c,
          next: () => {
            if (this._state !== i)
              throw new Error("LinkedMap got modified during iteration.");
            if (l) {
              const a = { value: l.value, done: !1 };
              return l = l.next, a;
            } else
              return { value: void 0, done: !0 };
          }
        };
        return c;
      }
      entries() {
        const i = this._state;
        let l = this._head;
        const c = {
          [Symbol.iterator]: () => c,
          next: () => {
            if (this._state !== i)
              throw new Error("LinkedMap got modified during iteration.");
            if (l) {
              const a = { value: [l.key, l.value], done: !1 };
              return l = l.next, a;
            } else
              return { value: void 0, done: !0 };
          }
        };
        return c;
      }
      [(t = Symbol.toStringTag, Symbol.iterator)]() {
        return this.entries();
      }
      trimOld(i) {
        if (i >= this.size)
          return;
        if (i === 0) {
          this.clear();
          return;
        }
        let l = this._head, c = this.size;
        for (; l && c > i; )
          this._map.delete(l.key), l = l.next, c--;
        this._head = l, this._size = c, l && (l.previous = void 0), this._state++;
      }
      addItemFirst(i) {
        if (!this._head && !this._tail)
          this._tail = i;
        else if (this._head)
          i.next = this._head, this._head.previous = i;
        else
          throw new Error("Invalid list");
        this._head = i, this._state++;
      }
      addItemLast(i) {
        if (!this._head && !this._tail)
          this._head = i;
        else if (this._tail)
          i.previous = this._tail, this._tail.next = i;
        else
          throw new Error("Invalid list");
        this._tail = i, this._state++;
      }
      removeItem(i) {
        if (i === this._head && i === this._tail)
          this._head = void 0, this._tail = void 0;
        else if (i === this._head) {
          if (!i.next)
            throw new Error("Invalid list");
          i.next.previous = void 0, this._head = i.next;
        } else if (i === this._tail) {
          if (!i.previous)
            throw new Error("Invalid list");
          i.previous.next = void 0, this._tail = i.previous;
        } else {
          const l = i.next, c = i.previous;
          if (!l || !c)
            throw new Error("Invalid list");
          l.previous = c, c.next = l;
        }
        i.next = void 0, i.previous = void 0, this._state++;
      }
      touch(i, l) {
        if (!this._head || !this._tail)
          throw new Error("Invalid list");
        if (!(l !== n.First && l !== n.Last)) {
          if (l === n.First) {
            if (i === this._head)
              return;
            const c = i.next, a = i.previous;
            i === this._tail ? (a.next = void 0, this._tail = a) : (c.previous = a, a.next = c), i.previous = void 0, i.next = this._head, this._head.previous = i, this._head = i, this._state++;
          } else if (l === n.Last) {
            if (i === this._tail)
              return;
            const c = i.next, a = i.previous;
            i === this._head ? (c.previous = void 0, this._head = c) : (c.previous = a, a.next = c), i.next = void 0, i.previous = this._tail, this._tail.next = i, this._tail = i, this._state++;
          }
        }
      }
      toJSON() {
        const i = [];
        return this.forEach((l, c) => {
          i.push([c, l]);
        }), i;
      }
      fromJSON(i) {
        this.clear();
        for (const [l, c] of i)
          this.set(l, c);
      }
    }
    e.LinkedMap = s;
    class u extends s {
      constructor(i, l = 1) {
        super(), this._limit = i, this._ratio = Math.min(Math.max(0, l), 1);
      }
      get limit() {
        return this._limit;
      }
      set limit(i) {
        this._limit = i, this.checkTrim();
      }
      get ratio() {
        return this._ratio;
      }
      set ratio(i) {
        this._ratio = Math.min(Math.max(0, i), 1), this.checkTrim();
      }
      get(i, l = n.AsNew) {
        return super.get(i, l);
      }
      peek(i) {
        return super.get(i, n.None);
      }
      set(i, l) {
        return super.set(i, l, n.Last), this.checkTrim(), this;
      }
      checkTrim() {
        this.size > this._limit && this.trimOld(Math.round(this._limit * this._ratio));
      }
    }
    e.LRUCache = u;
  }(je)), je;
}
var Ae = {}, at;
function tn() {
  return at || (at = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.Disposable = void 0, function(t) {
      function n(s) {
        return {
          dispose: s
        };
      }
      t.create = n;
    }(e.Disposable || (e.Disposable = {}));
  }(Ae)), Ae;
}
var De = {}, ct;
function Ge() {
  return ct || (ct = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CancellationTokenSource = e.CancellationToken = void 0;
    const t = G, n = L, s = ie;
    var u;
    (function(c) {
      c.None = Object.freeze({
        isCancellationRequested: !1,
        onCancellationRequested: s.Event.None
      }), c.Cancelled = Object.freeze({
        isCancellationRequested: !0,
        onCancellationRequested: s.Event.None
      });
      function a(h) {
        const g = h;
        return g && (g === c.None || g === c.Cancelled || n.boolean(g.isCancellationRequested) && !!g.onCancellationRequested);
      }
      c.is = a;
    })(u = e.CancellationToken || (e.CancellationToken = {}));
    const o = Object.freeze(function(c, a) {
      const h = (0, t.default)().timer.setTimeout(c.bind(a), 0);
      return { dispose() {
        h.dispose();
      } };
    });
    class i {
      constructor() {
        this._isCancelled = !1;
      }
      cancel() {
        this._isCancelled || (this._isCancelled = !0, this._emitter && (this._emitter.fire(void 0), this.dispose()));
      }
      get isCancellationRequested() {
        return this._isCancelled;
      }
      get onCancellationRequested() {
        return this._isCancelled ? o : (this._emitter || (this._emitter = new s.Emitter()), this._emitter.event);
      }
      dispose() {
        this._emitter && (this._emitter.dispose(), this._emitter = void 0);
      }
    }
    class l {
      get token() {
        return this._token || (this._token = new i()), this._token;
      }
      cancel() {
        this._token ? this._token.cancel() : this._token = u.Cancelled;
      }
      dispose() {
        this._token ? this._token instanceof i && this._token.dispose() : this._token = u.None;
      }
    }
    e.CancellationTokenSource = l;
  }(De)), De;
}
var x = {}, ut;
function nn() {
  if (ut)
    return x;
  ut = 1, Object.defineProperty(x, "__esModule", { value: !0 }), x.SharedArrayReceiverStrategy = x.SharedArraySenderStrategy = void 0;
  const e = Ge();
  var t;
  (function(i) {
    i.Continue = 0, i.Cancelled = 1;
  })(t || (t = {}));
  class n {
    constructor() {
      this.buffers = /* @__PURE__ */ new Map();
    }
    enableCancellation(l) {
      if (l.id === null)
        return;
      const c = new SharedArrayBuffer(4), a = new Int32Array(c, 0, 1);
      a[0] = t.Continue, this.buffers.set(l.id, c), l.$cancellationData = c;
    }
    async sendCancellation(l, c) {
      const a = this.buffers.get(c);
      if (a === void 0)
        return;
      const h = new Int32Array(a, 0, 1);
      Atomics.store(h, 0, t.Cancelled);
    }
    cleanup(l) {
      this.buffers.delete(l);
    }
    dispose() {
      this.buffers.clear();
    }
  }
  x.SharedArraySenderStrategy = n;
  class s {
    constructor(l) {
      this.data = new Int32Array(l, 0, 1);
    }
    get isCancellationRequested() {
      return Atomics.load(this.data, 0) === t.Cancelled;
    }
    get onCancellationRequested() {
      throw new Error("Cancellation over SharedArrayBuffer doesn't support cancellation events");
    }
  }
  class u {
    constructor(l) {
      this.token = new s(l);
    }
    cancel() {
    }
    dispose() {
    }
  }
  class o {
    constructor() {
      this.kind = "request";
    }
    createCancellationTokenSource(l) {
      const c = l.$cancellationData;
      return c === void 0 ? new e.CancellationTokenSource() : new u(c);
    }
  }
  return x.SharedArrayReceiverStrategy = o, x;
}
var me = {}, lt;
function rn() {
  if (lt)
    return me;
  lt = 1, Object.defineProperty(me, "__esModule", { value: !0 }), me.AbstractMessageBuffer = void 0;
  const e = 13, t = 10, n = `\r
`;
  class s {
    constructor(o = "utf-8") {
      this._encoding = o, this._chunks = [], this._totalLength = 0;
    }
    get encoding() {
      return this._encoding;
    }
    append(o) {
      const i = typeof o == "string" ? this.fromString(o, this._encoding) : o;
      this._chunks.push(i), this._totalLength += i.byteLength;
    }
    tryReadHeaders(o = !1) {
      if (this._chunks.length === 0)
        return;
      let i = 0, l = 0, c = 0, a = 0;
      e:
        for (; l < this._chunks.length; ) {
          const w = this._chunks[l];
          for (c = 0; c < w.length; ) {
            switch (w[c]) {
              case e:
                switch (i) {
                  case 0:
                    i = 1;
                    break;
                  case 2:
                    i = 3;
                    break;
                  default:
                    i = 0;
                }
                break;
              case t:
                switch (i) {
                  case 1:
                    i = 2;
                    break;
                  case 3:
                    i = 4, c++;
                    break e;
                  default:
                    i = 0;
                }
                break;
              default:
                i = 0;
            }
            c++;
          }
          a += w.byteLength, l++;
        }
      if (i !== 4)
        return;
      const h = this._read(a + c), g = /* @__PURE__ */ new Map(), b = this.toString(h, "ascii").split(n);
      if (b.length < 2)
        return g;
      for (let w = 0; w < b.length - 2; w++) {
        const C = b[w], W = C.indexOf(":");
        if (W === -1)
          throw new Error("Message header must separate key and value using :");
        const q = C.substr(0, W), U = C.substr(W + 1).trim();
        g.set(o ? q.toLowerCase() : q, U);
      }
      return g;
    }
    tryReadBody(o) {
      if (!(this._totalLength < o))
        return this._read(o);
    }
    get numberOfBytes() {
      return this._totalLength;
    }
    _read(o) {
      if (o === 0)
        return this.emptyBuffer();
      if (o > this._totalLength)
        throw new Error("Cannot read so many bytes!");
      if (this._chunks[0].byteLength === o) {
        const a = this._chunks[0];
        return this._chunks.shift(), this._totalLength -= o, this.asNative(a);
      }
      if (this._chunks[0].byteLength > o) {
        const a = this._chunks[0], h = this.asNative(a, o);
        return this._chunks[0] = a.slice(o), this._totalLength -= o, h;
      }
      const i = this.allocNative(o);
      let l = 0, c = 0;
      for (; o > 0; ) {
        const a = this._chunks[c];
        if (a.byteLength > o) {
          const h = a.slice(0, o);
          i.set(h, l), l += o, this._chunks[c] = a.slice(o), this._totalLength -= o, o -= o;
        } else
          i.set(a, l), l += a.byteLength, this._chunks.shift(), this._totalLength -= a.byteLength, o -= a.byteLength;
      }
      return i;
    }
  }
  return me.AbstractMessageBuffer = s, me;
}
var qe = {}, dt;
function sn() {
  return dt || (dt = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.createMessageConnection = e.ConnectionOptions = e.MessageStrategy = e.CancellationStrategy = e.CancellationSenderStrategy = e.CancellationReceiverStrategy = e.RequestCancellationReceiverStrategy = e.IdCancellationReceiverStrategy = e.ConnectionStrategy = e.ConnectionError = e.ConnectionErrors = e.LogTraceNotification = e.SetTraceNotification = e.TraceFormat = e.TraceValues = e.Trace = e.NullLogger = e.ProgressType = e.ProgressToken = void 0;
    const t = G, n = L, s = bt(), u = _t(), o = ie, i = Ge();
    var l;
    (function(y) {
      y.type = new s.NotificationType("$/cancelRequest");
    })(l || (l = {}));
    var c;
    (function(y) {
      function m(f) {
        return typeof f == "string" || typeof f == "number";
      }
      y.is = m;
    })(c = e.ProgressToken || (e.ProgressToken = {}));
    var a;
    (function(y) {
      y.type = new s.NotificationType("$/progress");
    })(a || (a = {}));
    class h {
      constructor() {
      }
    }
    e.ProgressType = h;
    var g;
    (function(y) {
      function m(f) {
        return n.func(f);
      }
      y.is = m;
    })(g || (g = {})), e.NullLogger = Object.freeze({
      error: () => {
      },
      warn: () => {
      },
      info: () => {
      },
      log: () => {
      }
    });
    var b;
    (function(y) {
      y[y.Off = 0] = "Off", y[y.Messages = 1] = "Messages", y[y.Compact = 2] = "Compact", y[y.Verbose = 3] = "Verbose";
    })(b = e.Trace || (e.Trace = {})), function(y) {
      y.Off = "off", y.Messages = "messages", y.Compact = "compact", y.Verbose = "verbose";
    }(e.TraceValues || (e.TraceValues = {})), function(y) {
      function m(_) {
        if (!n.string(_))
          return y.Off;
        switch (_ = _.toLowerCase(), _) {
          case "off":
            return y.Off;
          case "messages":
            return y.Messages;
          case "compact":
            return y.Compact;
          case "verbose":
            return y.Verbose;
          default:
            return y.Off;
        }
      }
      y.fromString = m;
      function f(_) {
        switch (_) {
          case y.Off:
            return "off";
          case y.Messages:
            return "messages";
          case y.Compact:
            return "compact";
          case y.Verbose:
            return "verbose";
          default:
            return "off";
        }
      }
      y.toString = f;
    }(b = e.Trace || (e.Trace = {}));
    var w;
    (function(y) {
      y.Text = "text", y.JSON = "json";
    })(w = e.TraceFormat || (e.TraceFormat = {})), function(y) {
      function m(f) {
        return n.string(f) ? (f = f.toLowerCase(), f === "json" ? y.JSON : y.Text) : y.Text;
      }
      y.fromString = m;
    }(w = e.TraceFormat || (e.TraceFormat = {}));
    var C;
    (function(y) {
      y.type = new s.NotificationType("$/setTrace");
    })(C = e.SetTraceNotification || (e.SetTraceNotification = {}));
    var W;
    (function(y) {
      y.type = new s.NotificationType("$/logTrace");
    })(W = e.LogTraceNotification || (e.LogTraceNotification = {}));
    var q;
    (function(y) {
      y[y.Closed = 1] = "Closed", y[y.Disposed = 2] = "Disposed", y[y.AlreadyListening = 3] = "AlreadyListening";
    })(q = e.ConnectionErrors || (e.ConnectionErrors = {}));
    class U extends Error {
      constructor(m, f) {
        super(f), this.code = m, Object.setPrototypeOf(this, U.prototype);
      }
    }
    e.ConnectionError = U;
    var ge;
    (function(y) {
      function m(f) {
        const _ = f;
        return _ && n.func(_.cancelUndispatched);
      }
      y.is = m;
    })(ge = e.ConnectionStrategy || (e.ConnectionStrategy = {}));
    var se;
    (function(y) {
      function m(f) {
        const _ = f;
        return _ && (_.kind === void 0 || _.kind === "id") && n.func(_.createCancellationTokenSource) && (_.dispose === void 0 || n.func(_.dispose));
      }
      y.is = m;
    })(se = e.IdCancellationReceiverStrategy || (e.IdCancellationReceiverStrategy = {}));
    var be;
    (function(y) {
      function m(f) {
        const _ = f;
        return _ && _.kind === "request" && n.func(_.createCancellationTokenSource) && (_.dispose === void 0 || n.func(_.dispose));
      }
      y.is = m;
    })(be = e.RequestCancellationReceiverStrategy || (e.RequestCancellationReceiverStrategy = {}));
    var oe;
    (function(y) {
      y.Message = Object.freeze({
        createCancellationTokenSource(f) {
          return new i.CancellationTokenSource();
        }
      });
      function m(f) {
        return se.is(f) || be.is(f);
      }
      y.is = m;
    })(oe = e.CancellationReceiverStrategy || (e.CancellationReceiverStrategy = {}));
    var ae;
    (function(y) {
      y.Message = Object.freeze({
        sendCancellation(f, _) {
          return f.sendNotification(l.type, { id: _ });
        },
        cleanup(f) {
        }
      });
      function m(f) {
        const _ = f;
        return _ && n.func(_.sendCancellation) && n.func(_.cleanup);
      }
      y.is = m;
    })(ae = e.CancellationSenderStrategy || (e.CancellationSenderStrategy = {}));
    var ce;
    (function(y) {
      y.Message = Object.freeze({
        receiver: oe.Message,
        sender: ae.Message
      });
      function m(f) {
        const _ = f;
        return _ && oe.is(_.receiver) && ae.is(_.sender);
      }
      y.is = m;
    })(ce = e.CancellationStrategy || (e.CancellationStrategy = {}));
    var ue;
    (function(y) {
      function m(f) {
        const _ = f;
        return _ && n.func(_.handleMessage);
      }
      y.is = m;
    })(ue = e.MessageStrategy || (e.MessageStrategy = {})), function(y) {
      function m(f) {
        const _ = f;
        return _ && (ce.is(_.cancellationStrategy) || ge.is(_.connectionStrategy) || ue.is(_.messageStrategy));
      }
      y.is = m;
    }(e.ConnectionOptions || (e.ConnectionOptions = {}));
    var B;
    (function(y) {
      y[y.New = 1] = "New", y[y.Listening = 2] = "Listening", y[y.Closed = 3] = "Closed", y[y.Disposed = 4] = "Disposed";
    })(B || (B = {}));
    function Ce(y, m, f, _) {
      const O = f !== void 0 ? f : e.NullLogger;
      let H = 0, D = 0, St = 0;
      const le = "2.0";
      let de;
      const _e = /* @__PURE__ */ new Map();
      let fe;
      const ve = /* @__PURE__ */ new Map(), we = /* @__PURE__ */ new Map();
      let ke, Y = new u.LinkedMap(), K = /* @__PURE__ */ new Map(), Te = /* @__PURE__ */ new Set(), J = /* @__PURE__ */ new Map(), k = b.Off, Z = w.Text, j, X = B.New;
      const Ne = new o.Emitter(), He = new o.Emitter(), Xe = new o.Emitter(), Ve = new o.Emitter(), Qe = new o.Emitter(), V = _ && _.cancellationStrategy ? _.cancellationStrategy : ce.Message;
      function Ye(r) {
        if (r === null)
          throw new Error("Can't send requests with id null since the response can't be correlated.");
        return "req-" + r.toString();
      }
      function Rt(r) {
        return r === null ? "res-unknown-" + (++St).toString() : "res-" + r.toString();
      }
      function Ct() {
        return "not-" + (++D).toString();
      }
      function kt(r, d) {
        s.Message.isRequest(d) ? r.set(Ye(d.id), d) : s.Message.isResponse(d) ? r.set(Rt(d.id), d) : r.set(Ct(), d);
      }
      function Nt(r) {
      }
      function Ke() {
        return X === B.Listening;
      }
      function Ze() {
        return X === B.Closed;
      }
      function te() {
        return X === B.Disposed;
      }
      function xe() {
        (X === B.New || X === B.Listening) && (X = B.Closed, He.fire(void 0));
      }
      function Ot(r) {
        Ne.fire([r, void 0, void 0]);
      }
      function Pt(r) {
        Ne.fire(r);
      }
      y.onClose(xe), y.onError(Ot), m.onClose(xe), m.onError(Pt);
      function et() {
        ke || Y.size === 0 || (ke = (0, t.default)().timer.setImmediate(() => {
          ke = void 0, Mt();
        }));
      }
      function tt(r) {
        s.Message.isRequest(r) ? jt(r) : s.Message.isNotification(r) ? Dt(r) : s.Message.isResponse(r) ? At(r) : qt(r);
      }
      function Mt() {
        if (Y.size === 0)
          return;
        const r = Y.shift();
        try {
          const d = _ == null ? void 0 : _.messageStrategy;
          ue.is(d) ? d.handleMessage(r, tt) : tt(r);
        } finally {
          et();
        }
      }
      const Lt = (r) => {
        try {
          if (s.Message.isNotification(r) && r.method === l.type.method) {
            const d = r.params.id, p = Ye(d), v = Y.get(p);
            if (s.Message.isRequest(v)) {
              const S = _ == null ? void 0 : _.connectionStrategy, R = S && S.cancelUndispatched ? S.cancelUndispatched(v, Nt) : void 0;
              if (R && (R.error !== void 0 || R.result !== void 0)) {
                Y.delete(p), J.delete(d), R.id = v.id, Ee(R, r.method, Date.now()), m.write(R).catch(() => O.error("Sending response for canceled message failed."));
                return;
              }
            }
            const N = J.get(d);
            if (N !== void 0) {
              N.cancel(), Oe(r);
              return;
            } else
              Te.add(d);
          }
          kt(Y, r);
        } finally {
          et();
        }
      };
      function jt(r) {
        if (te())
          return;
        function d(T, P, E) {
          const A = {
            jsonrpc: le,
            id: r.id
          };
          T instanceof s.ResponseError ? A.error = T.toJson() : A.result = T === void 0 ? null : T, Ee(A, P, E), m.write(A).catch(() => O.error("Sending response failed."));
        }
        function p(T, P, E) {
          const A = {
            jsonrpc: le,
            id: r.id,
            error: T.toJson()
          };
          Ee(A, P, E), m.write(A).catch(() => O.error("Sending response failed."));
        }
        function v(T, P, E) {
          T === void 0 && (T = null);
          const A = {
            jsonrpc: le,
            id: r.id,
            result: T
          };
          Ee(A, P, E), m.write(A).catch(() => O.error("Sending response failed."));
        }
        Wt(r);
        const N = _e.get(r.method);
        let S, R;
        N && (S = N.type, R = N.handler);
        const M = Date.now();
        if (R || de) {
          const T = r.id ?? String(Date.now()), P = se.is(V.receiver) ? V.receiver.createCancellationTokenSource(T) : V.receiver.createCancellationTokenSource(r);
          r.id !== null && Te.has(r.id) && P.cancel(), r.id !== null && J.set(T, P);
          try {
            let E;
            if (R)
              if (r.params === void 0) {
                if (S !== void 0 && S.numberOfParams !== 0) {
                  p(new s.ResponseError(s.ErrorCodes.InvalidParams, `Request ${r.method} defines ${S.numberOfParams} params but received none.`), r.method, M);
                  return;
                }
                E = R(P.token);
              } else if (Array.isArray(r.params)) {
                if (S !== void 0 && S.parameterStructures === s.ParameterStructures.byName) {
                  p(new s.ResponseError(s.ErrorCodes.InvalidParams, `Request ${r.method} defines parameters by name but received parameters by position`), r.method, M);
                  return;
                }
                E = R(...r.params, P.token);
              } else {
                if (S !== void 0 && S.parameterStructures === s.ParameterStructures.byPosition) {
                  p(new s.ResponseError(s.ErrorCodes.InvalidParams, `Request ${r.method} defines parameters by position but received parameters by name`), r.method, M);
                  return;
                }
                E = R(r.params, P.token);
              }
            else
              de && (E = de(r.method, r.params, P.token));
            const A = E;
            E ? A.then ? A.then((I) => {
              J.delete(T), d(I, r.method, M);
            }, (I) => {
              J.delete(T), I instanceof s.ResponseError ? p(I, r.method, M) : I && n.string(I.message) ? p(new s.ResponseError(s.ErrorCodes.InternalError, `Request ${r.method} failed with message: ${I.message}`), r.method, M) : p(new s.ResponseError(s.ErrorCodes.InternalError, `Request ${r.method} failed unexpectedly without providing any details.`), r.method, M);
            }) : (J.delete(T), d(E, r.method, M)) : (J.delete(T), v(E, r.method, M));
          } catch (E) {
            J.delete(T), E instanceof s.ResponseError ? d(E, r.method, M) : E && n.string(E.message) ? p(new s.ResponseError(s.ErrorCodes.InternalError, `Request ${r.method} failed with message: ${E.message}`), r.method, M) : p(new s.ResponseError(s.ErrorCodes.InternalError, `Request ${r.method} failed unexpectedly without providing any details.`), r.method, M);
          }
        } else
          p(new s.ResponseError(s.ErrorCodes.MethodNotFound, `Unhandled method ${r.method}`), r.method, M);
      }
      function At(r) {
        if (!te())
          if (r.id === null)
            r.error ? O.error(`Received response message without id: Error is: 
${JSON.stringify(r.error, void 0, 4)}`) : O.error("Received response message without id. No further error information provided.");
          else {
            const d = r.id, p = K.get(d);
            if (Bt(r, p), p !== void 0) {
              K.delete(d);
              try {
                if (r.error) {
                  const v = r.error;
                  p.reject(new s.ResponseError(v.code, v.message, v.data));
                } else if (r.result !== void 0)
                  p.resolve(r.result);
                else
                  throw new Error("Should never happen.");
              } catch (v) {
                v.message ? O.error(`Response handler '${p.method}' failed with message: ${v.message}`) : O.error(`Response handler '${p.method}' failed unexpectedly.`);
              }
            }
          }
      }
      function Dt(r) {
        if (te())
          return;
        let d, p;
        if (r.method === l.type.method) {
          const v = r.params.id;
          Te.delete(v), Oe(r);
          return;
        } else {
          const v = ve.get(r.method);
          v && (p = v.handler, d = v.type);
        }
        if (p || fe)
          try {
            if (Oe(r), p)
              if (r.params === void 0)
                d !== void 0 && d.numberOfParams !== 0 && d.parameterStructures !== s.ParameterStructures.byName && O.error(`Notification ${r.method} defines ${d.numberOfParams} params but received none.`), p();
              else if (Array.isArray(r.params)) {
                const v = r.params;
                r.method === a.type.method && v.length === 2 && c.is(v[0]) ? p({ token: v[0], value: v[1] }) : (d !== void 0 && (d.parameterStructures === s.ParameterStructures.byName && O.error(`Notification ${r.method} defines parameters by name but received parameters by position`), d.numberOfParams !== r.params.length && O.error(`Notification ${r.method} defines ${d.numberOfParams} params but received ${v.length} arguments`)), p(...v));
              } else
                d !== void 0 && d.parameterStructures === s.ParameterStructures.byPosition && O.error(`Notification ${r.method} defines parameters by position but received parameters by name`), p(r.params);
            else
              fe && fe(r.method, r.params);
          } catch (v) {
            v.message ? O.error(`Notification handler '${r.method}' failed with message: ${v.message}`) : O.error(`Notification handler '${r.method}' failed unexpectedly.`);
          }
        else
          Xe.fire(r);
      }
      function qt(r) {
        if (!r) {
          O.error("Received empty message.");
          return;
        }
        O.error(`Received message which is neither a response nor a notification message:
${JSON.stringify(r, null, 4)}`);
        const d = r;
        if (n.string(d.id) || n.number(d.id)) {
          const p = d.id, v = K.get(p);
          v && v.reject(new Error("The received response has neither a result nor an error property."));
        }
      }
      function Q(r) {
        if (r != null)
          switch (k) {
            case b.Verbose:
              return JSON.stringify(r, null, 4);
            case b.Compact:
              return JSON.stringify(r);
            default:
              return;
          }
      }
      function It(r) {
        if (!(k === b.Off || !j))
          if (Z === w.Text) {
            let d;
            (k === b.Verbose || k === b.Compact) && r.params && (d = `Params: ${Q(r.params)}

`), j.log(`Sending request '${r.method} - (${r.id})'.`, d);
          } else
            ne("send-request", r);
      }
      function $t(r) {
        if (!(k === b.Off || !j))
          if (Z === w.Text) {
            let d;
            (k === b.Verbose || k === b.Compact) && (r.params ? d = `Params: ${Q(r.params)}

` : d = `No parameters provided.

`), j.log(`Sending notification '${r.method}'.`, d);
          } else
            ne("send-notification", r);
      }
      function Ee(r, d, p) {
        if (!(k === b.Off || !j))
          if (Z === w.Text) {
            let v;
            (k === b.Verbose || k === b.Compact) && (r.error && r.error.data ? v = `Error data: ${Q(r.error.data)}

` : r.result ? v = `Result: ${Q(r.result)}

` : r.error === void 0 && (v = `No result returned.

`)), j.log(`Sending response '${d} - (${r.id})'. Processing request took ${Date.now() - p}ms`, v);
          } else
            ne("send-response", r);
      }
      function Wt(r) {
        if (!(k === b.Off || !j))
          if (Z === w.Text) {
            let d;
            (k === b.Verbose || k === b.Compact) && r.params && (d = `Params: ${Q(r.params)}

`), j.log(`Received request '${r.method} - (${r.id})'.`, d);
          } else
            ne("receive-request", r);
      }
      function Oe(r) {
        if (!(k === b.Off || !j || r.method === W.type.method))
          if (Z === w.Text) {
            let d;
            (k === b.Verbose || k === b.Compact) && (r.params ? d = `Params: ${Q(r.params)}

` : d = `No parameters provided.

`), j.log(`Received notification '${r.method}'.`, d);
          } else
            ne("receive-notification", r);
      }
      function Bt(r, d) {
        if (!(k === b.Off || !j))
          if (Z === w.Text) {
            let p;
            if ((k === b.Verbose || k === b.Compact) && (r.error && r.error.data ? p = `Error data: ${Q(r.error.data)}

` : r.result ? p = `Result: ${Q(r.result)}

` : r.error === void 0 && (p = `No result returned.

`)), d) {
              const v = r.error ? ` Request failed: ${r.error.message} (${r.error.code}).` : "";
              j.log(`Received response '${d.method} - (${r.id})' in ${Date.now() - d.timerStart}ms.${v}`, p);
            } else
              j.log(`Received response ${r.id} without active response promise.`, p);
          } else
            ne("receive-response", r);
      }
      function ne(r, d) {
        if (!j || k === b.Off)
          return;
        const p = {
          isLSPMessage: !0,
          type: r,
          message: d,
          timestamp: Date.now()
        };
        j.log(p);
      }
      function he() {
        if (Ze())
          throw new U(q.Closed, "Connection is closed.");
        if (te())
          throw new U(q.Disposed, "Connection is disposed.");
      }
      function Ut() {
        if (Ke())
          throw new U(q.AlreadyListening, "Connection is already listening");
      }
      function Ft() {
        if (!Ke())
          throw new Error("Call listen() first.");
      }
      function ye(r) {
        return r === void 0 ? null : r;
      }
      function nt(r) {
        if (r !== null)
          return r;
      }
      function rt(r) {
        return r != null && !Array.isArray(r) && typeof r == "object";
      }
      function Pe(r, d) {
        switch (r) {
          case s.ParameterStructures.auto:
            return rt(d) ? nt(d) : [ye(d)];
          case s.ParameterStructures.byName:
            if (!rt(d))
              throw new Error("Received parameters by name but param is not an object literal.");
            return nt(d);
          case s.ParameterStructures.byPosition:
            return [ye(d)];
          default:
            throw new Error(`Unknown parameter structure ${r.toString()}`);
        }
      }
      function it(r, d) {
        let p;
        const v = r.numberOfParams;
        switch (v) {
          case 0:
            p = void 0;
            break;
          case 1:
            p = Pe(r.parameterStructures, d[0]);
            break;
          default:
            p = [];
            for (let N = 0; N < d.length && N < v; N++)
              p.push(ye(d[N]));
            if (d.length < v)
              for (let N = d.length; N < v; N++)
                p.push(null);
            break;
        }
        return p;
      }
      const re = {
        sendNotification: (r, ...d) => {
          he();
          let p, v;
          if (n.string(r)) {
            p = r;
            const S = d[0];
            let R = 0, M = s.ParameterStructures.auto;
            s.ParameterStructures.is(S) && (R = 1, M = S);
            let T = d.length;
            const P = T - R;
            switch (P) {
              case 0:
                v = void 0;
                break;
              case 1:
                v = Pe(M, d[R]);
                break;
              default:
                if (M === s.ParameterStructures.byName)
                  throw new Error(`Received ${P} parameters for 'by Name' notification parameter structure.`);
                v = d.slice(R, T).map((E) => ye(E));
                break;
            }
          } else {
            const S = d;
            p = r.method, v = it(r, S);
          }
          const N = {
            jsonrpc: le,
            method: p,
            params: v
          };
          return $t(N), m.write(N).catch((S) => {
            throw O.error("Sending notification failed."), S;
          });
        },
        onNotification: (r, d) => {
          he();
          let p;
          return n.func(r) ? fe = r : d && (n.string(r) ? (p = r, ve.set(r, { type: void 0, handler: d })) : (p = r.method, ve.set(r.method, { type: r, handler: d }))), {
            dispose: () => {
              p !== void 0 ? ve.delete(p) : fe = void 0;
            }
          };
        },
        onProgress: (r, d, p) => {
          if (we.has(d))
            throw new Error(`Progress handler for token ${d} already registered`);
          return we.set(d, p), {
            dispose: () => {
              we.delete(d);
            }
          };
        },
        sendProgress: (r, d, p) => re.sendNotification(a.type, { token: d, value: p }),
        onUnhandledProgress: Ve.event,
        sendRequest: (r, ...d) => {
          he(), Ft();
          let p, v, N;
          if (n.string(r)) {
            p = r;
            const T = d[0], P = d[d.length - 1];
            let E = 0, A = s.ParameterStructures.auto;
            s.ParameterStructures.is(T) && (E = 1, A = T);
            let I = d.length;
            i.CancellationToken.is(P) && (I = I - 1, N = P);
            const F = I - E;
            switch (F) {
              case 0:
                v = void 0;
                break;
              case 1:
                v = Pe(A, d[E]);
                break;
              default:
                if (A === s.ParameterStructures.byName)
                  throw new Error(`Received ${F} parameters for 'by Name' request parameter structure.`);
                v = d.slice(E, I).map((zt) => ye(zt));
                break;
            }
          } else {
            const T = d;
            p = r.method, v = it(r, T);
            const P = r.numberOfParams;
            N = i.CancellationToken.is(T[P]) ? T[P] : void 0;
          }
          const S = H++;
          let R;
          N && (R = N.onCancellationRequested(() => {
            const T = V.sender.sendCancellation(re, S);
            return T === void 0 ? (O.log(`Received no promise from cancellation strategy when cancelling id ${S}`), Promise.resolve()) : T.catch(() => {
              O.log(`Sending cancellation messages for id ${S} failed`);
            });
          }));
          const M = {
            jsonrpc: le,
            id: S,
            method: p,
            params: v
          };
          return It(M), typeof V.sender.enableCancellation == "function" && V.sender.enableCancellation(M), new Promise(async (T, P) => {
            const E = (F) => {
              T(F), V.sender.cleanup(S), R == null || R.dispose();
            }, A = (F) => {
              P(F), V.sender.cleanup(S), R == null || R.dispose();
            }, I = { method: p, timerStart: Date.now(), resolve: E, reject: A };
            try {
              await m.write(M), K.set(S, I);
            } catch (F) {
              throw O.error("Sending request failed."), I.reject(new s.ResponseError(s.ErrorCodes.MessageWriteError, F.message ? F.message : "Unknown reason")), F;
            }
          });
        },
        onRequest: (r, d) => {
          he();
          let p = null;
          return g.is(r) ? (p = void 0, de = r) : n.string(r) ? (p = null, d !== void 0 && (p = r, _e.set(r, { handler: d, type: void 0 }))) : d !== void 0 && (p = r.method, _e.set(r.method, { type: r, handler: d })), {
            dispose: () => {
              p !== null && (p !== void 0 ? _e.delete(p) : de = void 0);
            }
          };
        },
        hasPendingResponse: () => K.size > 0,
        trace: async (r, d, p) => {
          let v = !1, N = w.Text;
          p !== void 0 && (n.boolean(p) ? v = p : (v = p.sendNotification || !1, N = p.traceFormat || w.Text)), k = r, Z = N, k === b.Off ? j = void 0 : j = d, v && !Ze() && !te() && await re.sendNotification(C.type, { value: b.toString(r) });
        },
        onError: Ne.event,
        onClose: He.event,
        onUnhandledNotification: Xe.event,
        onDispose: Qe.event,
        end: () => {
          m.end();
        },
        dispose: () => {
          if (te())
            return;
          X = B.Disposed, Qe.fire(void 0);
          const r = new s.ResponseError(s.ErrorCodes.PendingResponseRejected, "Pending response rejected since connection got disposed");
          for (const d of K.values())
            d.reject(r);
          K = /* @__PURE__ */ new Map(), J = /* @__PURE__ */ new Map(), Te = /* @__PURE__ */ new Set(), Y = new u.LinkedMap(), n.func(m.dispose) && m.dispose(), n.func(y.dispose) && y.dispose();
        },
        listen: () => {
          he(), Ut(), X = B.Listening, y.listen(Lt);
        },
        inspect: () => {
          (0, t.default)().console.log("inspect");
        }
      };
      return re.onNotification(W.type, (r) => {
        if (k === b.Off || !j)
          return;
        const d = k === b.Verbose || k === b.Compact;
        j.log(r.message, d ? r.verbose : void 0);
      }), re.onNotification(a.type, (r) => {
        const d = we.get(r.token);
        d ? d(r.value) : Ve.fire(r);
      }), re;
    }
    e.createMessageConnection = Ce;
  }(qe)), qe;
}
var ft;
function We() {
  return ft || (ft = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ProgressType = e.ProgressToken = e.createMessageConnection = e.NullLogger = e.ConnectionOptions = e.ConnectionStrategy = e.AbstractMessageBuffer = e.WriteableStreamMessageWriter = e.AbstractMessageWriter = e.MessageWriter = e.ReadableStreamMessageReader = e.AbstractMessageReader = e.MessageReader = e.SharedArrayReceiverStrategy = e.SharedArraySenderStrategy = e.CancellationToken = e.CancellationTokenSource = e.Emitter = e.Event = e.Disposable = e.LRUCache = e.Touch = e.LinkedMap = e.ParameterStructures = e.NotificationType9 = e.NotificationType8 = e.NotificationType7 = e.NotificationType6 = e.NotificationType5 = e.NotificationType4 = e.NotificationType3 = e.NotificationType2 = e.NotificationType1 = e.NotificationType0 = e.NotificationType = e.ErrorCodes = e.ResponseError = e.RequestType9 = e.RequestType8 = e.RequestType7 = e.RequestType6 = e.RequestType5 = e.RequestType4 = e.RequestType3 = e.RequestType2 = e.RequestType1 = e.RequestType0 = e.RequestType = e.Message = e.RAL = void 0, e.MessageStrategy = e.CancellationStrategy = e.CancellationSenderStrategy = e.CancellationReceiverStrategy = e.ConnectionError = e.ConnectionErrors = e.LogTraceNotification = e.SetTraceNotification = e.TraceFormat = e.TraceValues = e.Trace = void 0;
    const t = bt();
    Object.defineProperty(e, "Message", { enumerable: !0, get: function() {
      return t.Message;
    } }), Object.defineProperty(e, "RequestType", { enumerable: !0, get: function() {
      return t.RequestType;
    } }), Object.defineProperty(e, "RequestType0", { enumerable: !0, get: function() {
      return t.RequestType0;
    } }), Object.defineProperty(e, "RequestType1", { enumerable: !0, get: function() {
      return t.RequestType1;
    } }), Object.defineProperty(e, "RequestType2", { enumerable: !0, get: function() {
      return t.RequestType2;
    } }), Object.defineProperty(e, "RequestType3", { enumerable: !0, get: function() {
      return t.RequestType3;
    } }), Object.defineProperty(e, "RequestType4", { enumerable: !0, get: function() {
      return t.RequestType4;
    } }), Object.defineProperty(e, "RequestType5", { enumerable: !0, get: function() {
      return t.RequestType5;
    } }), Object.defineProperty(e, "RequestType6", { enumerable: !0, get: function() {
      return t.RequestType6;
    } }), Object.defineProperty(e, "RequestType7", { enumerable: !0, get: function() {
      return t.RequestType7;
    } }), Object.defineProperty(e, "RequestType8", { enumerable: !0, get: function() {
      return t.RequestType8;
    } }), Object.defineProperty(e, "RequestType9", { enumerable: !0, get: function() {
      return t.RequestType9;
    } }), Object.defineProperty(e, "ResponseError", { enumerable: !0, get: function() {
      return t.ResponseError;
    } }), Object.defineProperty(e, "ErrorCodes", { enumerable: !0, get: function() {
      return t.ErrorCodes;
    } }), Object.defineProperty(e, "NotificationType", { enumerable: !0, get: function() {
      return t.NotificationType;
    } }), Object.defineProperty(e, "NotificationType0", { enumerable: !0, get: function() {
      return t.NotificationType0;
    } }), Object.defineProperty(e, "NotificationType1", { enumerable: !0, get: function() {
      return t.NotificationType1;
    } }), Object.defineProperty(e, "NotificationType2", { enumerable: !0, get: function() {
      return t.NotificationType2;
    } }), Object.defineProperty(e, "NotificationType3", { enumerable: !0, get: function() {
      return t.NotificationType3;
    } }), Object.defineProperty(e, "NotificationType4", { enumerable: !0, get: function() {
      return t.NotificationType4;
    } }), Object.defineProperty(e, "NotificationType5", { enumerable: !0, get: function() {
      return t.NotificationType5;
    } }), Object.defineProperty(e, "NotificationType6", { enumerable: !0, get: function() {
      return t.NotificationType6;
    } }), Object.defineProperty(e, "NotificationType7", { enumerable: !0, get: function() {
      return t.NotificationType7;
    } }), Object.defineProperty(e, "NotificationType8", { enumerable: !0, get: function() {
      return t.NotificationType8;
    } }), Object.defineProperty(e, "NotificationType9", { enumerable: !0, get: function() {
      return t.NotificationType9;
    } }), Object.defineProperty(e, "ParameterStructures", { enumerable: !0, get: function() {
      return t.ParameterStructures;
    } });
    const n = _t();
    Object.defineProperty(e, "LinkedMap", { enumerable: !0, get: function() {
      return n.LinkedMap;
    } }), Object.defineProperty(e, "LRUCache", { enumerable: !0, get: function() {
      return n.LRUCache;
    } }), Object.defineProperty(e, "Touch", { enumerable: !0, get: function() {
      return n.Touch;
    } });
    const s = tn();
    Object.defineProperty(e, "Disposable", { enumerable: !0, get: function() {
      return s.Disposable;
    } });
    const u = ie;
    Object.defineProperty(e, "Event", { enumerable: !0, get: function() {
      return u.Event;
    } }), Object.defineProperty(e, "Emitter", { enumerable: !0, get: function() {
      return u.Emitter;
    } });
    const o = Ge();
    Object.defineProperty(e, "CancellationTokenSource", { enumerable: !0, get: function() {
      return o.CancellationTokenSource;
    } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return o.CancellationToken;
    } });
    const i = nn();
    Object.defineProperty(e, "SharedArraySenderStrategy", { enumerable: !0, get: function() {
      return i.SharedArraySenderStrategy;
    } }), Object.defineProperty(e, "SharedArrayReceiverStrategy", { enumerable: !0, get: function() {
      return i.SharedArrayReceiverStrategy;
    } });
    const l = Fe;
    Object.defineProperty(e, "MessageReader", { enumerable: !0, get: function() {
      return l.MessageReader;
    } }), Object.defineProperty(e, "AbstractMessageReader", { enumerable: !0, get: function() {
      return l.AbstractMessageReader;
    } }), Object.defineProperty(e, "ReadableStreamMessageReader", { enumerable: !0, get: function() {
      return l.ReadableStreamMessageReader;
    } });
    const c = ze;
    Object.defineProperty(e, "MessageWriter", { enumerable: !0, get: function() {
      return c.MessageWriter;
    } }), Object.defineProperty(e, "AbstractMessageWriter", { enumerable: !0, get: function() {
      return c.AbstractMessageWriter;
    } }), Object.defineProperty(e, "WriteableStreamMessageWriter", { enumerable: !0, get: function() {
      return c.WriteableStreamMessageWriter;
    } });
    const a = rn();
    Object.defineProperty(e, "AbstractMessageBuffer", { enumerable: !0, get: function() {
      return a.AbstractMessageBuffer;
    } });
    const h = sn();
    Object.defineProperty(e, "ConnectionStrategy", { enumerable: !0, get: function() {
      return h.ConnectionStrategy;
    } }), Object.defineProperty(e, "ConnectionOptions", { enumerable: !0, get: function() {
      return h.ConnectionOptions;
    } }), Object.defineProperty(e, "NullLogger", { enumerable: !0, get: function() {
      return h.NullLogger;
    } }), Object.defineProperty(e, "createMessageConnection", { enumerable: !0, get: function() {
      return h.createMessageConnection;
    } }), Object.defineProperty(e, "ProgressToken", { enumerable: !0, get: function() {
      return h.ProgressToken;
    } }), Object.defineProperty(e, "ProgressType", { enumerable: !0, get: function() {
      return h.ProgressType;
    } }), Object.defineProperty(e, "Trace", { enumerable: !0, get: function() {
      return h.Trace;
    } }), Object.defineProperty(e, "TraceValues", { enumerable: !0, get: function() {
      return h.TraceValues;
    } }), Object.defineProperty(e, "TraceFormat", { enumerable: !0, get: function() {
      return h.TraceFormat;
    } }), Object.defineProperty(e, "SetTraceNotification", { enumerable: !0, get: function() {
      return h.SetTraceNotification;
    } }), Object.defineProperty(e, "LogTraceNotification", { enumerable: !0, get: function() {
      return h.LogTraceNotification;
    } }), Object.defineProperty(e, "ConnectionErrors", { enumerable: !0, get: function() {
      return h.ConnectionErrors;
    } }), Object.defineProperty(e, "ConnectionError", { enumerable: !0, get: function() {
      return h.ConnectionError;
    } }), Object.defineProperty(e, "CancellationReceiverStrategy", { enumerable: !0, get: function() {
      return h.CancellationReceiverStrategy;
    } }), Object.defineProperty(e, "CancellationSenderStrategy", { enumerable: !0, get: function() {
      return h.CancellationSenderStrategy;
    } }), Object.defineProperty(e, "CancellationStrategy", { enumerable: !0, get: function() {
      return h.CancellationStrategy;
    } }), Object.defineProperty(e, "MessageStrategy", { enumerable: !0, get: function() {
      return h.MessageStrategy;
    } });
    const g = G;
    e.RAL = g.default;
  }(Me)), Me;
}
Object.defineProperty(Je, "__esModule", { value: !0 });
const z = We();
class Re extends z.AbstractMessageBuffer {
  constructor(t = "utf-8") {
    super(t), this.asciiDecoder = new TextDecoder("ascii");
  }
  emptyBuffer() {
    return Re.emptyBuffer;
  }
  fromString(t, n) {
    return new TextEncoder().encode(t);
  }
  toString(t, n) {
    return n === "ascii" ? this.asciiDecoder.decode(t) : new TextDecoder(n).decode(t);
  }
  asNative(t, n) {
    return n === void 0 ? t : t.slice(0, n);
  }
  allocNative(t) {
    return new Uint8Array(t);
  }
}
Re.emptyBuffer = new Uint8Array(0);
class on {
  constructor(t) {
    this.socket = t, this._onData = new z.Emitter(), this._messageListener = (n) => {
      n.data.arrayBuffer().then((u) => {
        this._onData.fire(new Uint8Array(u));
      }, () => {
        (0, z.RAL)().console.error("Converting blob to array buffer failed.");
      });
    }, this.socket.addEventListener("message", this._messageListener);
  }
  onClose(t) {
    return this.socket.addEventListener("close", t), z.Disposable.create(() => this.socket.removeEventListener("close", t));
  }
  onError(t) {
    return this.socket.addEventListener("error", t), z.Disposable.create(() => this.socket.removeEventListener("error", t));
  }
  onEnd(t) {
    return this.socket.addEventListener("end", t), z.Disposable.create(() => this.socket.removeEventListener("end", t));
  }
  onData(t) {
    return this._onData.event(t);
  }
}
class an {
  constructor(t) {
    this.socket = t;
  }
  onClose(t) {
    return this.socket.addEventListener("close", t), z.Disposable.create(() => this.socket.removeEventListener("close", t));
  }
  onError(t) {
    return this.socket.addEventListener("error", t), z.Disposable.create(() => this.socket.removeEventListener("error", t));
  }
  onEnd(t) {
    return this.socket.addEventListener("end", t), z.Disposable.create(() => this.socket.removeEventListener("end", t));
  }
  write(t, n) {
    if (typeof t == "string") {
      if (n !== void 0 && n !== "utf-8")
        throw new Error(`In a Browser environments only utf-8 text encoding is supported. But got encoding: ${n}`);
      this.socket.send(t);
    } else
      this.socket.send(t);
    return Promise.resolve();
  }
  end() {
    this.socket.close();
  }
}
const cn = new TextEncoder(), vt = Object.freeze({
  messageBuffer: Object.freeze({
    create: (e) => new Re(e)
  }),
  applicationJson: Object.freeze({
    encoder: Object.freeze({
      name: "application/json",
      encode: (e, t) => {
        if (t.charset !== "utf-8")
          throw new Error(`In a Browser environments only utf-8 text encoding is supported. But got encoding: ${t.charset}`);
        return Promise.resolve(cn.encode(JSON.stringify(e, void 0, 0)));
      }
    }),
    decoder: Object.freeze({
      name: "application/json",
      decode: (e, t) => {
        if (!(e instanceof Uint8Array))
          throw new Error("In a Browser environments only Uint8Arrays are supported.");
        return Promise.resolve(JSON.parse(new TextDecoder(t.charset).decode(e)));
      }
    })
  }),
  stream: Object.freeze({
    asReadableStream: (e) => new on(e),
    asWritableStream: (e) => new an(e)
  }),
  console,
  timer: Object.freeze({
    setTimeout(e, t, ...n) {
      const s = setTimeout(e, t, ...n);
      return { dispose: () => clearTimeout(s) };
    },
    setImmediate(e, ...t) {
      const n = setTimeout(e, 0, ...t);
      return { dispose: () => clearTimeout(n) };
    },
    setInterval(e, t, ...n) {
      const s = setInterval(e, t, ...n);
      return { dispose: () => clearInterval(s) };
    }
  })
});
function Be() {
  return vt;
}
(function(e) {
  function t() {
    z.RAL.install(vt);
  }
  e.install = t;
})(Be || (Be = {}));
Je.default = Be;
(function(e) {
  var t = Se && Se.__createBinding || (Object.create ? function(c, a, h, g) {
    g === void 0 && (g = h);
    var b = Object.getOwnPropertyDescriptor(a, h);
    (!b || ("get" in b ? !a.__esModule : b.writable || b.configurable)) && (b = { enumerable: !0, get: function() {
      return a[h];
    } }), Object.defineProperty(c, g, b);
  } : function(c, a, h, g) {
    g === void 0 && (g = h), c[g] = a[h];
  }), n = Se && Se.__exportStar || function(c, a) {
    for (var h in c)
      h !== "default" && !Object.prototype.hasOwnProperty.call(a, h) && t(a, c, h);
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.createMessageConnection = e.BrowserMessageWriter = e.BrowserMessageReader = void 0, Je.default.install();
  const u = We();
  n(We(), e);
  class o extends u.AbstractMessageReader {
    constructor(a) {
      super(), this._onData = new u.Emitter(), this._messageListener = (h) => {
        this._onData.fire(h.data);
      }, a.addEventListener("error", (h) => this.fireError(h)), a.onmessage = this._messageListener;
    }
    listen(a) {
      return this._onData.event(a);
    }
  }
  e.BrowserMessageReader = o;
  class i extends u.AbstractMessageWriter {
    constructor(a) {
      super(), this.port = a, this.errorCount = 0, a.addEventListener("error", (h) => this.fireError(h));
    }
    write(a) {
      try {
        return this.port.postMessage(a), Promise.resolve();
      } catch (h) {
        return this.handleError(h, a), Promise.reject(h);
      }
    }
    handleError(a, h) {
      this.errorCount++, this.fireError(a, h, this.errorCount);
    }
    end() {
    }
  }
  e.BrowserMessageWriter = i;
  function l(c, a, h, g) {
    return h === void 0 && (h = u.NullLogger), u.ConnectionStrategy.is(g) && (g = { connectionStrategy: g }), (0, u.createMessageConnection)(c, a, h, g);
  }
  e.createMessageConnection = l;
})(gt);
function un(e, t) {
  const n = new xt(e), s = new en(e), u = gt.createMessageConnection(n, s, t);
  return u.onClose(() => u.dispose()), u;
}
class ln {
  error(t) {
    console.error(t);
  }
  warn(t) {
    console.warn(t);
  }
  info(t) {
    console.info(t);
  }
  log(t) {
    console.log(t);
  }
  debug(t) {
    console.debug(t);
  }
}
function dn(e) {
  const { webSocket: t, onConnection: n } = e, s = e.logger || new ln();
  t.onopen = () => {
    const u = fn(t), o = un(u, s);
    n(o);
  };
}
function fn(e) {
  return {
    send: (t) => e.send(t),
    onMessage: (t) => {
      e.onmessage = (n) => t(n.data);
    },
    onError: (t) => {
      e.onerror = (n) => {
        "message" in n && t(n.message);
      };
    },
    onClose: (t) => {
      e.onclose = (n) => t(n.code, n.reason);
    },
    dispose: () => e.close()
  };
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Ue = function(e, t) {
  return Ue = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, s) {
    n.__proto__ = s;
  } || function(n, s) {
    for (var u in s)
      s.hasOwnProperty(u) && (n[u] = s[u]);
  }, Ue(e, t);
};
function wt(e, t) {
  Ue(e, t);
  function n() {
    this.constructor = e;
  }
  e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
function hn(e) {
  var t = typeof Symbol == "function" && e[Symbol.iterator], n = 0;
  return t ? t.call(e) : {
    next: function() {
      return e && n >= e.length && (e = void 0), { value: e && e[n++], done: !e };
    }
  };
}
function yn(e, t) {
  var n = typeof Symbol == "function" && e[Symbol.iterator];
  if (!n)
    return e;
  var s = n.call(e), u, o = [], i;
  try {
    for (; (t === void 0 || t-- > 0) && !(u = s.next()).done; )
      o.push(u.value);
  } catch (l) {
    i = { error: l };
  } finally {
    try {
      u && !u.done && (n = s.return) && n.call(s);
    } finally {
      if (i)
        throw i.error;
    }
  }
  return o;
}
function mn() {
  for (var e = [], t = 0; t < arguments.length; t++)
    e = e.concat(yn(arguments[t]));
  return e;
}
var Tt = (
  /** @class */
  function() {
    function e(t, n) {
      this.target = n, this.type = t;
    }
    return e;
  }()
), pn = (
  /** @class */
  function(e) {
    wt(t, e);
    function t(n, s) {
      var u = e.call(this, "error", s) || this;
      return u.message = n.message, u.error = n, u;
    }
    return t;
  }(Tt)
), gn = (
  /** @class */
  function(e) {
    wt(t, e);
    function t(n, s, u) {
      n === void 0 && (n = 1e3), s === void 0 && (s = "");
      var o = e.call(this, "close", u) || this;
      return o.wasClean = !0, o.code = n, o.reason = s, o;
    }
    return t;
  }(Tt)
);
/*!
 * Reconnecting WebSocket
 * by Pedro Ladaria <pedro.ladaria@gmail.com>
 * https://github.com/pladaria/reconnecting-websocket
 * License MIT
 */
var bn = function() {
  if (typeof WebSocket < "u")
    return WebSocket;
}, _n = function(e) {
  return typeof e < "u" && !!e && e.CLOSING === 2;
}, ee = {
  maxReconnectionDelay: 1e4,
  minReconnectionDelay: 1e3 + Math.random() * 4e3,
  minUptime: 5e3,
  reconnectionDelayGrowFactor: 1.3,
  connectionTimeout: 4e3,
  maxRetries: 1 / 0,
  maxEnqueuedMessages: 1 / 0,
  startClosed: !1,
  debug: !1
}, vn = (
  /** @class */
  function() {
    function e(t, n, s) {
      var u = this;
      s === void 0 && (s = {}), this._listeners = {
        error: [],
        message: [],
        open: [],
        close: []
      }, this._retryCount = -1, this._shouldReconnect = !0, this._connectLock = !1, this._binaryType = "blob", this._closeCalled = !1, this._messageQueue = [], this.onclose = null, this.onerror = null, this.onmessage = null, this.onopen = null, this._handleOpen = function(o) {
        u._debug("open event");
        var i = u._options.minUptime, l = i === void 0 ? ee.minUptime : i;
        clearTimeout(u._connectTimeout), u._uptimeTimeout = setTimeout(function() {
          return u._acceptOpen();
        }, l), u._ws.binaryType = u._binaryType, u._messageQueue.forEach(function(c) {
          return u._ws.send(c);
        }), u._messageQueue = [], u.onopen && u.onopen(o), u._listeners.open.forEach(function(c) {
          return u._callEventListener(o, c);
        });
      }, this._handleMessage = function(o) {
        u._debug("message event"), u.onmessage && u.onmessage(o), u._listeners.message.forEach(function(i) {
          return u._callEventListener(o, i);
        });
      }, this._handleError = function(o) {
        u._debug("error event", o.message), u._disconnect(void 0, o.message === "TIMEOUT" ? "timeout" : void 0), u.onerror && u.onerror(o), u._debug("exec error listeners"), u._listeners.error.forEach(function(i) {
          return u._callEventListener(o, i);
        }), u._connect();
      }, this._handleClose = function(o) {
        u._debug("close event"), u._clearTimeouts(), u._shouldReconnect && u._connect(), u.onclose && u.onclose(o), u._listeners.close.forEach(function(i) {
          return u._callEventListener(o, i);
        });
      }, this._url = t, this._protocols = n, this._options = s, this._options.startClosed && (this._shouldReconnect = !1), this._connect();
    }
    return Object.defineProperty(e, "CONNECTING", {
      get: function() {
        return 0;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e, "OPEN", {
      get: function() {
        return 1;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e, "CLOSING", {
      get: function() {
        return 2;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e, "CLOSED", {
      get: function() {
        return 3;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "CONNECTING", {
      get: function() {
        return e.CONNECTING;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "OPEN", {
      get: function() {
        return e.OPEN;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "CLOSING", {
      get: function() {
        return e.CLOSING;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "CLOSED", {
      get: function() {
        return e.CLOSED;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "binaryType", {
      get: function() {
        return this._ws ? this._ws.binaryType : this._binaryType;
      },
      set: function(t) {
        this._binaryType = t, this._ws && (this._ws.binaryType = t);
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "retryCount", {
      /**
       * Returns the number or connection retries
       */
      get: function() {
        return Math.max(this._retryCount, 0);
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "bufferedAmount", {
      /**
       * The number of bytes of data that have been queued using calls to send() but not yet
       * transmitted to the network. This value resets to zero once all queued data has been sent.
       * This value does not reset to zero when the connection is closed; if you keep calling send(),
       * this will continue to climb. Read only
       */
      get: function() {
        var t = this._messageQueue.reduce(function(n, s) {
          return typeof s == "string" ? n += s.length : s instanceof Blob ? n += s.size : n += s.byteLength, n;
        }, 0);
        return t + (this._ws ? this._ws.bufferedAmount : 0);
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "extensions", {
      /**
       * The extensions selected by the server. This is currently only the empty string or a list of
       * extensions as negotiated by the connection
       */
      get: function() {
        return this._ws ? this._ws.extensions : "";
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "protocol", {
      /**
       * A string indicating the name of the sub-protocol the server selected;
       * this will be one of the strings specified in the protocols parameter when creating the
       * WebSocket object
       */
      get: function() {
        return this._ws ? this._ws.protocol : "";
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "readyState", {
      /**
       * The current state of the connection; this is one of the Ready state constants
       */
      get: function() {
        return this._ws ? this._ws.readyState : this._options.startClosed ? e.CLOSED : e.CONNECTING;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(e.prototype, "url", {
      /**
       * The URL as resolved by the constructor
       */
      get: function() {
        return this._ws ? this._ws.url : "";
      },
      enumerable: !0,
      configurable: !0
    }), e.prototype.close = function(t, n) {
      if (t === void 0 && (t = 1e3), this._closeCalled = !0, this._shouldReconnect = !1, this._clearTimeouts(), !this._ws) {
        this._debug("close enqueued: no ws instance");
        return;
      }
      if (this._ws.readyState === this.CLOSED) {
        this._debug("close: already closed");
        return;
      }
      this._ws.close(t, n);
    }, e.prototype.reconnect = function(t, n) {
      this._shouldReconnect = !0, this._closeCalled = !1, this._retryCount = -1, !this._ws || this._ws.readyState === this.CLOSED ? this._connect() : (this._disconnect(t, n), this._connect());
    }, e.prototype.send = function(t) {
      if (this._ws && this._ws.readyState === this.OPEN)
        this._debug("send", t), this._ws.send(t);
      else {
        var n = this._options.maxEnqueuedMessages, s = n === void 0 ? ee.maxEnqueuedMessages : n;
        this._messageQueue.length < s && (this._debug("enqueue", t), this._messageQueue.push(t));
      }
    }, e.prototype.addEventListener = function(t, n) {
      this._listeners[t] && this._listeners[t].push(n);
    }, e.prototype.dispatchEvent = function(t) {
      var n, s, u = this._listeners[t.type];
      if (u)
        try {
          for (var o = hn(u), i = o.next(); !i.done; i = o.next()) {
            var l = i.value;
            this._callEventListener(t, l);
          }
        } catch (c) {
          n = { error: c };
        } finally {
          try {
            i && !i.done && (s = o.return) && s.call(o);
          } finally {
            if (n)
              throw n.error;
          }
        }
      return !0;
    }, e.prototype.removeEventListener = function(t, n) {
      this._listeners[t] && (this._listeners[t] = this._listeners[t].filter(function(s) {
        return s !== n;
      }));
    }, e.prototype._debug = function() {
      for (var t = [], n = 0; n < arguments.length; n++)
        t[n] = arguments[n];
      this._options.debug && console.log.apply(console, mn(["RWS>"], t));
    }, e.prototype._getNextDelay = function() {
      var t = this._options, n = t.reconnectionDelayGrowFactor, s = n === void 0 ? ee.reconnectionDelayGrowFactor : n, u = t.minReconnectionDelay, o = u === void 0 ? ee.minReconnectionDelay : u, i = t.maxReconnectionDelay, l = i === void 0 ? ee.maxReconnectionDelay : i, c = 0;
      return this._retryCount > 0 && (c = o * Math.pow(s, this._retryCount - 1), c > l && (c = l)), this._debug("next delay", c), c;
    }, e.prototype._wait = function() {
      var t = this;
      return new Promise(function(n) {
        setTimeout(n, t._getNextDelay());
      });
    }, e.prototype._getNextUrl = function(t) {
      if (typeof t == "string")
        return Promise.resolve(t);
      if (typeof t == "function") {
        var n = t();
        if (typeof n == "string")
          return Promise.resolve(n);
        if (n.then)
          return n;
      }
      throw Error("Invalid URL");
    }, e.prototype._connect = function() {
      var t = this;
      if (!(this._connectLock || !this._shouldReconnect)) {
        this._connectLock = !0;
        var n = this._options, s = n.maxRetries, u = s === void 0 ? ee.maxRetries : s, o = n.connectionTimeout, i = o === void 0 ? ee.connectionTimeout : o, l = n.WebSocket, c = l === void 0 ? bn() : l;
        if (this._retryCount >= u) {
          this._debug("max retries reached", this._retryCount, ">=", u);
          return;
        }
        if (this._retryCount++, this._debug("connect", this._retryCount), this._removeListeners(), !_n(c))
          throw Error("No valid WebSocket class provided");
        this._wait().then(function() {
          return t._getNextUrl(t._url);
        }).then(function(a) {
          t._closeCalled || (t._debug("connect", { url: a, protocols: t._protocols }), t._ws = t._protocols ? new c(a, t._protocols) : new c(a), t._ws.binaryType = t._binaryType, t._connectLock = !1, t._addListeners(), t._connectTimeout = setTimeout(function() {
            return t._handleTimeout();
          }, i));
        });
      }
    }, e.prototype._handleTimeout = function() {
      this._debug("timeout event"), this._handleError(new pn(Error("TIMEOUT"), this));
    }, e.prototype._disconnect = function(t, n) {
      if (t === void 0 && (t = 1e3), this._clearTimeouts(), !!this._ws) {
        this._removeListeners();
        try {
          this._ws.close(t, n), this._handleClose(new gn(t, n, this));
        } catch {
        }
      }
    }, e.prototype._acceptOpen = function() {
      this._debug("accept open"), this._retryCount = 0;
    }, e.prototype._callEventListener = function(t, n) {
      "handleEvent" in n ? n.handleEvent(t) : n(t);
    }, e.prototype._removeListeners = function() {
      this._ws && (this._debug("removeListeners"), this._ws.removeEventListener("open", this._handleOpen), this._ws.removeEventListener("close", this._handleClose), this._ws.removeEventListener("message", this._handleMessage), this._ws.removeEventListener("error", this._handleError));
    }, e.prototype._addListeners = function() {
      this._ws && (this._debug("addListeners"), this._ws.addEventListener("open", this._handleOpen), this._ws.addEventListener("close", this._handleClose), this._ws.addEventListener("message", this._handleMessage), this._ws.addEventListener("error", this._handleError));
    }, e.prototype._clearTimeouts = function() {
      clearTimeout(this._connectTimeout), clearTimeout(this._uptimeTimeout);
    }, e;
  }()
);
const { U3JS: Et } = window, ht = new class extends Et.EventDispatcher {
  constructor() {
    super();
    $(this, "connection");
    $(this, "onKeyDown");
    this.onKeyDown = (t) => {
      if (["A", "B", "X", "Y"].includes(t.key.toUpperCase())) {
        const n = t.key.toUpperCase();
        this.dispatchEvent({ type: "wsjoy", name: "BUTTON", value: 1, index: 0, action: n });
      } else
        t.key === "ArrowRight" ? this.dispatchEvent({ type: "wsjoy", name: "AXIS", value: 1, index: 0, action: "AXIS-X" }) : t.key === "ArrowLeft" ? this.dispatchEvent({ type: "wsjoy", name: "AXIS", value: -1, index: 0, action: "AXIS-X" }) : t.key === "ArrowUp" ? this.dispatchEvent({ type: "wsjoy", name: "AXIS", value: -1, index: 0, action: "AXIS-Y" }) : t.key === "ArrowDown" ? this.dispatchEvent({ type: "wsjoy", name: "AXIS", value: 1, index: 0, action: "AXIS-Y" }) : t.key === "Enter" && this.dispatchEvent({ type: "wsjoy", name: "BUTTON", value: 1, index: 0, action: "START" });
    }, window.addEventListener("keydown", this.onKeyDown);
  }
  async start() {
    const t = await this.createWebSocket();
    dn({
      webSocket: t,
      onConnection: ((n) => {
        this.connection = n, n.listen(), n.onNotification((s, ...u) => {
          const o = u[0];
          o.type = o.type.toUpperCase(), o.name = o.name.toUpperCase(), this.dispatchEvent(o);
        }), n.onClose(() => {
          this.connection = void 0;
        }), console.log("rpc connected!");
      }).bind(this)
    });
  }
  dispose() {
    this.onKeyDown && (window.removeEventListener("keydown", this.onKeyDown), this.onKeyDown = void 0);
  }
  createUrl() {
    return `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/wsjoy`;
  }
  async createWebSocket() {
    const t = {
      maxReconnectionDelay: 1e4,
      minReconnectionDelay: 1e3,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 1e4,
      maxRetries: 1 / 0,
      debug: !1
    }, n = new vn(this.createUrl(), [], t);
    return n.binaryType = "arraybuffer", n;
  }
}();
class yt extends Et.ScriptBlockNode {
  constructor(n, s) {
    super(n, s);
    $(this, "isWsJoyEventNode", !0);
    $(this, "button", "A");
    $(this, "_listenerBorn");
    $(this, "_listenerDead");
    $(this, "_isActived", !1);
    $(this, "_eventForwarding");
    this._eventForwarding = (o) => {
      this.exec(o);
    }, this._listenerBorn = () => {
      this._isActived = !0;
    }, this._listenerDead = () => {
      this._isActived = !1;
    }, ht.addEventListener("wsjoy", this._eventForwarding);
    const u = [];
    this.object && typeof this.object == "object" && (this.object.addEventListener("onBorn", this._listenerBorn), this.object.addEventListener("onDead", this._listenerDead), u.push("_listener", "_listenerBorn", "_listenerDead"));
    for (const o of u)
      Object.defineProperty(this, o, {
        writable: !1
      });
  }
  get object() {
    return super.object;
  }
  set object(n) {
    super.object = n;
    const s = [];
    this.object && typeof this.object == "object" && (this.object.addEventListener("onBorn", this._listenerBorn), this.object.addEventListener("onDead", this._listenerDead), s.push("_listener", "_listenerBorn", "_listenerDead"));
    for (const u of s)
      Object.defineProperty(this, u, {
        writable: !1
      });
  }
  async exec(n) {
    const s = n;
    if (this._isActived && s.action === this.button)
      return super.exec(n);
  }
  serialize(n) {
    super.serialize(n), n.event = this.button;
  }
  deserialize(n) {
    super.deserialize(n), this.button = n.event;
  }
  dispose() {
    super.dispose(), this._eventForwarding && (ht.removeEventListener("wsjoy", this._eventForwarding), this._eventForwarding = void 0), this.object && typeof this.object == "object" && (this.object.removeEventListener("onBorn", this._listenerBorn), this.object.removeEventListener("onDead", this._listenerDead));
  }
}
function Tn(e, t, n, s) {
  n("WsJoyEventNode", yt, {
    button: '"A" | "B" | "X" | "Y" | "LEFT-1" | "RIGHT-1" | "SELECT" | "START" | "MODE" | "JOY-X-L" | "JOY-Y-L" | "LEFT-2" | "JOY-X-R" | "JOY-Y-R" | "RIGHT-2" | "AXIS-X" | "AXIS-Y"'
  }, "ScriptBlockNode", {
    eventOnWsJoy: { clsName: "WsJoyEventNode", func: () => new yt("eventOnWsJoy"), group: "Scripts.On WsJoy Event", icon: "device-gamepad-2" }
  });
}
export {
  Tn as pluginInstall
};
