import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const baseUrl = process.env.PARTNERS_TEST_URL || `https://${process.env.REPLIT_DEV_DOMAIN}:5000`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const debugPort = 9231;
const browser = spawn("chromium", [
  "--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=/tmp/partners-check-${Date.now()}`,
  "about:blank",
], { stdio: "ignore" });

async function page(width, reduced) {
  const target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const item = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(item.timer);
      if (message.error) item.reject(new Error(JSON.stringify(message.error)));
      else item.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      errors.push(message.params.args.map((arg) => arg.value || arg.description).join(" "));
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 20000);
    pending.set(requestId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description);
    return result.result.value;
  };
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height: 768, deviceScaleFactor: 1, mobile: width < 768 });
  await send("Emulation.setTouchEmulationEnabled", { enabled: width < 768 });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }] });
  await send("Page.navigate", { url: `${baseUrl}/partners` });
  for (let i = 0; i < 60; i++) {
    if (await evaluate("!!document.querySelector('.agency-page')")) break;
    await sleep(200);
  }
  await sleep(1700);
  return {
    send, evaluate, errors,
    close: async () => { ws.close(); await fetch(`http://127.0.0.1:${debugPort}/json/close/${target.id}`); },
  };
}

const center = "document.querySelector('.agency-sample-card[data-position=\"center\"] .agency-sample-caption')?.textContent";
const scrollTo = (selector) => `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`;

try {
  for (let i = 0; i < 60; i++) {
    try { await fetch(`http://127.0.0.1:${debugPort}/json/version`); break; } catch { await sleep(100); }
  }
  for (const [width, reduced] of [[1366, false], [390, false], [1366, true], [390, true]]) {
    const p = await page(width, reduced);
    const { evaluate: run, send } = p;
    try {
      const layout = await run(`(() => {
        const hero=document.querySelector('.agency-hero'), h1=hero.querySelector('h1'), stack=hero.querySelector('.agency-cv-stack');
        return {h1Count:document.querySelectorAll('h1').length,heroBottom:hero.getBoundingClientRect().bottom,
          stackBottom:Math.max(...[...stack.children].map(n=>n.getBoundingClientRect().bottom)),
          h1Lines:h1.getBoundingClientRect().height/parseFloat(getComputedStyle(h1).lineHeight),
          overflow:document.documentElement.scrollWidth>innerWidth,pins:document.querySelectorAll('.pin-spacer').length,
          title:document.title,placeholders:document.querySelectorAll('.agency-sample-placeholder').length};
      })()`);
      assert.equal(layout.h1Count, 1);
      assert.equal(layout.overflow, false);
      assert.equal(layout.placeholders, 6);
      assert.equal(layout.pins, width >= 1024 && !reduced ? 1 : 0);
      if (width >= 1024) {
        assert.ok(layout.heroBottom <= 769, JSON.stringify(layout));
        assert.ok(layout.stackBottom <= 769, JSON.stringify(layout));
        assert.ok(layout.h1Lines <= 2.1, JSON.stringify(layout));
      }
      const processStart = await run("document.querySelector('.agency-process').getBoundingClientRect().top+scrollY");
      const processHeight = await run("document.querySelector('.agency-process').getBoundingClientRect().height");
      const pathLength = await run("document.querySelector('.agency-process-path path').getTotalLength()");
      const beforeDraw = await run("parseFloat(getComputedStyle(document.querySelector('.agency-process-path path')).strokeDashoffset)");
      await run(`window.scrollTo({top:${processStart + (width >= 1024 ? 600 : 120)},behavior:'instant'})`);
      await sleep(1100);
      const afterDraw = await run("parseFloat(getComputedStyle(document.querySelector('.agency-process-path path')).strokeDashoffset)");
      if (width >= 1024) assert.ok(processHeight <= 769, `Process height: ${processHeight}`);
      if (reduced) assert.equal(afterDraw, 0);
      else assert.ok(afterDraw < beforeDraw && afterDraw < pathLength, `Process line did not draw: ${beforeDraw} -> ${afterDraw}`);
      if (width < 1024) {
        assert.equal(await run("getComputedStyle(document.querySelector('.agency-hero-chip')).animationName"), "none");
        assert.equal(await run("document.querySelector('.agency-process-path path').getAttribute('d')"), "M500 0 L500 310");
        assert.equal(await run("document.querySelector('.agency-cv-stack').style.getPropertyValue('--agency-stack-spread')"), reduced ? "1" : "");
      }
      if (process.argv.includes("--motion-only")) {
        assert.deepEqual(p.errors, []);
        console.log(`PASS ${width}px ${reduced ? "reduced motion" : "normal motion"}: hero layout, process sizing/path animation and mobile motion limits`);
        continue;
      }
      assert.equal(await run("document.querySelector('[data-cta=\"partners-proposal-download\"]').getAttribute('aria-disabled')"), "true");
      const ctas = await run("Object.fromEntries([...document.querySelectorAll('.agency-page a[data-cta]')].filter(a=>a.href.includes('wa.me')).map(a=>[a.dataset.cta,new URL(a.href).searchParams.get('text')]))");
      assert.equal(ctas["partners-hero-call"], "Hi, I'm from [agency name]. I'd like to discuss a CV partnership.");
      assert.equal(ctas["partners-final-call"], ctas["partners-hero-call"]);
      assert.equal(ctas["partners-trial"], "Hi, I'd like to start a paid trial with one candidate.");

      await run(scrollTo(".agency-proof"));
      await sleep(reduced ? 50 : 1600);
      assert.deepEqual(await run("[...document.querySelectorAll('[data-count]')].map(n=>n.textContent)"), ["20+", "1,800+", "3+ years", "762,499"]);

      await run(scrollTo(".agency-carousel"));
      await sleep(200);
      await run("[...document.querySelectorAll('[role=tab]')].find(n=>n.textContent==='Europass').click()");
      await sleep(80);
      assert.equal(await run(center), "Europass CVEmergency Medicine");
      await run("[...document.querySelectorAll('[role=tab]')].find(n=>n.textContent==='Designed CVs').click()");
      await sleep(80);
      const firstDesigned = await run(center);
      await run("document.querySelector('[aria-label=\"Next sample\"]').click()");
      await sleep(80);
      assert.notEqual(await run(center), firstDesigned);
      await run("[...document.querySelectorAll('[role=tab]')].find(n=>n.textContent==='All').click()");
      await sleep(80);
      if (reduced) {
        const before = await run(center);
        await sleep(4200);
        assert.equal(await run(center), before, "Reduced motion must disable autoplay");
        assert.equal(await run("getComputedStyle(document.querySelector('.agency-cv-stack')).transform"), "none");
      } else if (width >= 1024) {
        const before = await run(center);
        await sleep(4200);
        assert.notEqual(await run(center), before, "Carousel must auto-advance");
        const bounds = await run("(()=>{const r=document.querySelector('.agency-carousel-window').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
        await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...bounds });
        await sleep(80);
        const hovered = await run(center);
        await sleep(4200);
        assert.equal(await run(center), hovered, "Hover must pause autoplay");
      } else {
        const bounds = await run("(()=>{const r=document.querySelector('.agency-carousel-window').getBoundingClientRect();return {x:r.x+r.width*0.75,y:r.y+r.height/2}})()");
        const before = await run(center);
        await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...bounds, id: 1 }] });
        await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: bounds.x - 150, y: bounds.y, id: 1 }] });
        await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await sleep(200);
        assert.notEqual(await run(center), before, "Swipe must advance the carousel");
      }

      await run(scrollTo(".agency-faq-list"));
      await run("document.querySelectorAll('.agency-faq-question')[1].click()");
      await sleep(80);
      assert.equal(await run("document.querySelectorAll('.agency-faq-question')[1].getAttribute('aria-expanded')"), "true");
      assert.equal(await run("document.querySelectorAll('.agency-faq-question').length"), 6);

      await run(scrollTo(".agency-form-card"));
      await run("window.__opened=[];window.open=(url)=>{window.__opened.push(url);return {opener:null}};document.querySelector('.agency-form-card').requestSubmit()");
      await sleep(80);
      assert.equal(await run("window.__opened.length"), 0);
      assert.match(await run("document.querySelector('.agency-form-message').textContent"), /valid WhatsApp/);
      await run(`(() => {
        for(const [id,value] of Object.entries({'agency-name':'Example Agency','your-name':'Test Contact','whatsapp-number':'+923001234567','agency-city':'Lahore'})){
          const input=document.getElementById(id);
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);
          input.dispatchEvent(new Event('input',{bubbles:true}));
        }
        const select=document.getElementById('monthly-volume');select.value='11–50';select.dispatchEvent(new Event('change',{bubbles:true}));
      })()`);
      await sleep(100);
      await run("document.querySelector('.agency-form-card').requestSubmit()");
      await sleep(100);
      const handoff = await run("window.__opened[0]");
      assert.ok(handoff, "Valid enquiry should hand off to WhatsApp");
      const decoded = new URL(handoff).searchParams.get("text");
      for (const value of ["Example Agency", "Test Contact", "+923001234567", "Lahore", "11–50"]) assert.ok(decoded.includes(value), decoded);
      assert.equal(await run("document.querySelector('.agency-form-message').textContent"), "Thanks. We'll reply on WhatsApp shortly.");
      assert.deepEqual(p.errors, []);
      console.log(`PASS ${width}px ${reduced ? "reduced motion" : "normal motion"}: layout, counters, tabs, carousel, FAQ, CTA links and enquiry handoff`);
    } finally { await p.close(); }
  }
} finally { browser.kill("SIGTERM"); }
