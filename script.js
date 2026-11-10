const ME = "Kijani Grocers",
  MIN = 1500,
  FEE = 0.1,
  RATE = 250,
  MAXREV = 2,
  AUTO = 5,
  URL_P = "kazibridge.example/p/amina-wanjiru";
const fmt = (n) => "KES " + Number(n).toLocaleString("en-KE");
const fee = (p) => Math.round(p.budget * FEE),
  cost = (p) => p.budget + fee(p),
  maxh = (b) => Math.floor(b / RATE),
  find = (id) => S.projects.find((p) => p.id === id);
const dt = (s) =>
  new Date(s + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const $ = (s) => document.querySelector(s),
  g = (i) => {
    const e = document.getElementById(i);
    return e ? e.value : "";
  };
function hsh(s) {
  let a = 0xdeadbeef,
    b = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 2654435761);
    b = Math.imul(b ^ c, 1597334677);
  }
  a =
    Math.imul(a ^ (a >>> 16), 2246822507) ^
    Math.imul(b ^ (b >>> 13), 3266489909);
  b =
    Math.imul(b ^ (b >>> 16), 2246822507) ^
    Math.imul(a ^ (a >>> 13), 3266489909);
  return (4294967296 * (2097151 & b) + (a >>> 0))
    .toString(16)
    .padStart(14, "0");
}
const payload = (e) =>
  [
    e.title,
    e.employer,
    e.skill,
    e.q,
    e.t,
    e.c,
    e.comment,
    e.date,
    e.amount,
  ].join("|");
const rt = (e) =>
  e.auto
    ? "Released automatically after 5 days. No rating given."
    : `Quality ${e.q}/5, timeliness ${e.t}/5, communication ${e.c}/5.${e.comment ? " “" + esc(e.comment) + "”" : ""}`;
const ST = {
  disputed: ["Under review", "a"],
  open: ["Open", ""],
  applied: ["Applied", "a"],
  funded: ["In progress", "g"],
  delivered: ["Awaiting review", "a"],
  done: ["Completed", "g"],
};
const SKILLS = [
  "Social media",
  "Graphic design",
  "Data entry",
  "Basic website",
  "Bookkeeping",
];
const CHECK =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l3 3 5-6"/></svg>';
let S;
function addEntry(e) {
  const prev = S.passport.length
    ? S.passport[S.passport.length - 1].hash
    : "GENESIS";
  e.prev = prev;
  e.hash = hsh(prev + "|" + payload(e));
  S.passport.push(e);
  S.verify = null;
}
function init() {
  S = {
    rec: false,
    role: "student",
    tab: "browse",
    filter: "All",
    next: 4,
    draft: null,
    verify: null,
    toast: "",
    passport: [],
    projects: [
      {
        id: 1,
        title: "Weekly social media posts",
        employer: "Kilimani Beauty Lounge",
        loc: "Kilimani",
        skill: "Social media",
        budget: 3500,
        days: 14,
        desc: "Three Instagram posts a week. Photos supplied.",
        status: "open",
        owner: "other",
        hours: 14,
        rounds: 0,
      },
      {
        id: 2,
        title: "Menu and price list design",
        employer: "Mama Rosa Café",
        loc: "Ngara",
        skill: "Graphic design",
        budget: 2800,
        days: 7,
        desc: "One A4 menu in English and Swahili, print-ready.",
        status: "open",
        owner: "other",
        hours: 10,
        rounds: 0,
      },
      {
        id: 3,
        title: "Stock sheet clean-up",
        employer: ME,
        loc: "Westlands",
        skill: "Data entry",
        budget: 2000,
        days: 5,
        desc: "Tidy a 400-row stock list and add category columns.",
        status: "open",
        owner: "me",
        hours: 6,
        rounds: 0,
      },
    ],
  };
  addEntry({
    title: "Instagram content calendar",
    employer: "Savannah Print Hub",
    skill: "Social media",
    q: 5,
    t: 4,
    c: 5,
    comment: "Clear, on time and easy to work with.",
    date: "2026-10-20",
    amount: 2500,
  });
}
const tags = (p) =>
  `<span class="tag">${esc(p.skill)}</span><span class="tag">Due in ${p.days} days</span><span class="tag">Up to ${p.hours} hrs</span><span class="tag">${MAXREV} revisions</span>`;
function row(p, right, body) {
  return `<div class="item"><div class="split"><div><div class="title">${esc(p.title)}</div><div class="meta">${esc(p.employer)}, ${esc(p.loc)}</div></div><div class="price">${S.role === "employer" ? fmt(cost(p)) + '<br><span class="meta">incl. ' + fmt(fee(p)) + " fee</span>" : fmt(p.budget) + '<br><span class="meta">you receive</span>'}<br>${right}</div></div><p class="desc"><b>Scope:</b> ${esc(p.desc)}</p>${tags(p)}${p.rev ? `<p class="meta">${esc(p.rev)}</p>` : ""}${body || ""}</div>`;
}
const pill = (s) => `<span class="pill ${ST[s][1]}">${ST[s][0]}</span>`;
function browse() {
  const f = S.filter,
    list = S.projects.filter(
      (p) => p.status === "open" && (f === "All" || p.skill === f),
    );
  return `${hero()}<h1>Find projects</h1><p class="lead">Paid micro-projects from small businesses near you. Registration is free.</p>
 <div class="chips">${["All", ...SKILLS].map((s) => `<button class="chip${f === s ? " on" : ""}" data-act="filter" data-v="${s}">${s}</button>`).join("")}</div>
 <div class="panel">${list.length ? list.map((p) => row(p, "", `<button class="btn" data-act="apply" data-id="${p.id}">Apply</button>`)).join("") : `<div class="pad meta">No open projects in this category right now.</div>`}</div>${rules()}`;
}
function mine() {
  const l = S.projects.filter((p) => p.status !== "open");
  const body = (p) =>
    p.status === "applied"
      ? `<p class="meta">Waiting for the employer to respond.</p>`
      : p.status === "funded"
        ? `<label for="w${p.id}">Delivery note or link</label><input id="w${p.id}" placeholder="For example, a link to your shared folder"><button class="btn" data-act="deliver" data-id="${p.id}">Submit work</button>`
        : p.status === "delivered"
          ? `<p class="meta">Submitted. The employer is reviewing your work. Payment releases automatically in ${p.left} days if there is no response.</p><button class="btn alt" data-act="report" data-id="${p.id}">Report a problem</button><button class="btn alt" data-act="skip" data-id="${p.id}">Demo: skip ${AUTO} days</button>`
          : p.status === "disputed"
            ? `<p class="meta">Under platform review. Payment stays in escrow.</p>`
            : `<p class="meta">Paid and added to your Passport.</p>`;
  return `<h1>My projects</h1><p class="lead">Track applications and deliver work.</p><div class="panel">${l.length ? l.map((p) => row(p, pill(p.status), body(p))).join("") : `<div class="pad meta">You have not applied to anything yet. Browse projects to get started.</div>`}</div>`;
}
function passport() {
  if (S.rec) return recruiter();
  const P = S.passport,
    n = P.length,
    R = P.filter((e) => !e.auto),
    avg = R.length
      ? (R.reduce((a, e) => a + e.q + e.t + e.c, 0) / (R.length * 3)).toFixed(1)
      : "0.0",
    sk = [...new Set(P.map((e) => e.skill))];
  const v = S.verify
    ? `<div class="res ${S.verify.ok ? "" : "bad"}" role="status">${esc(S.verify.msg)}</div>`
    : "";
  return `<div class="panel pad"><div class="who"><div class="av">AW</div><div><h1>Amina Wanjiru</h1><div class="meta">BCom, Year 3, University of Nairobi</div><span class="vb">${CHECK}Verified student</span></div></div>
 <div class="link"><span>${URL_P}</span><button class="btn alt" data-act="copy">Copy link</button></div><button class="btn alt" data-act="rec">View as recruiter</button></div>
 <div class="stats"><div class="stat"><b>${n}</b><span>Verified projects</span></div><div class="stat"><b>${avg}/5</b><span>Average rating</span></div><div class="stat"><b>${fmt(P.reduce((a, e) => a + e.amount, 0))}</b><span>Earned</span></div><div class="stat"><b>${sk.length}</b><span>Skills shown</span></div></div>
 <h2 style="margin-bottom:8px">Completed work</h2><div class="panel">${P.map((e) => `<div class="item"><div class="split"><div><div class="title">${esc(e.title)}</div><div class="meta">${esc(e.employer)}, ${dt(e.date)}</div></div><span class="vb">${CHECK}Verified</span></div><p class="desc">${rt(e)}</p><span class="tag">${esc(e.skill)}</span><div class="mono">Record ${e.hash}</div></div>`).join("")}</div>
 <div class="panel pad"><h2>Record check</h2><p class="meta" style="margin:4px 0 0">Each entry is linked to the one before it, so changing an approved entry breaks the chain.</p><button class="btn" data-act="verify">Check records</button><button class="btn alt" data-act="tamper">Demo: edit an entry</button><button class="btn alt" data-act="reset">Reset demo</button>${v}</div>`;
}
function employer() {
  const L = S.projects.filter((p) => p.owner === "me"),
    c = (s) => L.filter((p) => p.status === s).length,
    d = S.draft || { t: "", d: "", s: SKILLS[0], b: 3000, n: 7, h: 8 };
  const paid = S.passport.length
    ? L.filter((p) => p.status === "done").reduce((a, p) => a + cost(p), 0)
    : 0;
  const body = (p) =>
    p.status === "open"
      ? `<p class="meta">Waiting for applicants.</p>`
      : p.status === "applied"
        ? `<p class="meta">Amina Wanjiru, verified student, applied.</p><button class="btn" data-act="fund" data-id="${p.id}">Accept and pay ${fmt(cost(p))} into escrow</button><p class="meta" style="margin:8px 0 0">${fmt(p.budget)} goes to the student in full. ${fmt(fee(p))} is the platform fee.</p>`
        : p.status === "funded"
          ? `<p class="meta">${fmt(cost(p))} is held in escrow until you approve the work.</p>`
          : p.status === "delivered"
            ? `<p class="meta">Delivered: ${esc(p.work)}</p><div class="g3">${[
                ["q", "Quality"],
                ["t", "Timeliness"],
                ["c", "Communication"],
              ]
                .map(
                  ([k, l]) =>
                    `<div><label for="${k}${p.id}">${l}</label><select id="${k}${p.id}">${[5, 4, 3, 2, 1].map((n) => `<option>${n}</option>`).join("")}</select></div>`,
                )
                .join(
                  "",
                )}</div><label for="m${p.id}">Comment</label><input id="m${p.id}" placeholder="What went well?"><button class="btn" data-act="approve" data-id="${p.id}">Approve and release payment</button>${p.rounds < MAXREV ? `<button class="btn alt" data-act="revise" data-id="${p.id}">Request changes (${MAXREV - p.rounds} left)</button>` : ""}<button class="btn alt" data-act="report" data-id="${p.id}">Report a problem</button><p class="meta" style="margin:10px 0 0">${p.rounds >= MAXREV ? "Both revision rounds are used. Approve the work or report a problem. " : ""}If you do not respond, payment releases automatically in ${p.left} days.</p><button class="btn alt" data-act="skip" data-id="${p.id}">Demo: skip ${AUTO} days</button>`
            : p.status === "disputed"
              ? `<p class="meta">Reported. Platform review is under way and ${fmt(cost(p))} stays in escrow.</p>`
              : `<p class="meta">Paid. Added to the student’s Passport.</p>`;
  return `<h1>${ME}</h1><p class="lead">Employer dashboard, Westlands</p>
 <div class="stats"><div class="stat"><b>${c("open")}</b><span>Open</span></div><div class="stat"><b>${c("applied") + c("delivered")}</b><span>Need your action</span></div><div class="stat"><b>${c("funded")}</b><span>In progress</span></div><div class="stat"><b>${fmt(paid)}</b><span>Paid out</span></div></div>
 <div class="panel pad"><h2>Post a project</h2>
 <label for="pt">Title</label><input id="pt" value="${esc(d.t)}" placeholder="For example, Design a flyer">
 <label for="pd">Written scope: what the student will deliver</label><input id="pd" value="${esc(d.d)}">
 <div class="g3"><div><label for="ps">Skill</label><select id="ps">${SKILLS.map((s) => `<option${s === d.s ? " selected" : ""}>${s}</option>`).join("")}</select></div><div><label for="pb">Budget (KES)</label><input id="pb" type="number" value="${d.b}"></div><div><label for="pn">Days</label><input id="pn" type="number" value="${d.n}"></div></div>
 <div class="g3"><div><label for="ph">Estimated hours</label><input id="ph" type="number" value="${d.h}"></div></div><label class="check"><input type="checkbox" id="pc"${d.ok ? " checked" : ""}> This project is paid and includes no unpaid trial work.</label>
 <p class="meta" style="margin:8px 0 0">Minimum ${fmt(MIN)} per project. You pay the budget plus a ${FEE * 100}% platform fee, and the student receives 100% of the budget. Hours are capped so pay stays at or above ${fmt(RATE)} an hour.</p><button class="btn" data-act="post">Post project</button></div>
 <h2 style="margin-bottom:8px">Your projects</h2><div class="panel">${L.map((p) => row(p, pill(p.status), body(p))).join("")}</div>${sme()}`;
}
function release(p, o) {
  addEntry({
    title: p.title,
    employer: p.employer,
    skill: p.skill,
    q: o.q ?? null,
    t: o.t ?? null,
    c: o.c ?? null,
    comment: o.comment || "",
    auto: !!o.auto,
    date: new Date().toISOString().slice(0, 10),
    amount: p.budget,
  });
  p.status = "done";
}
const A = {
  role(id, b) {
    S.role = b.dataset.v;
    S.tab = S.role === "student" ? "browse" : "dash";
  },
  tab(id, b) {
    S.tab = b.dataset.v;
  },
  filter(id, b) {
    S.filter = b.dataset.v;
  },
  apply(id) {
    S.projects.find((p) => p.id === id).status = "applied";
    S.toast = "Application sent.";
  },
  fund(id) {
    const p = find(id);
    p.status = "funded";
    S.toast = `${fmt(cost(p))} is held in escrow (${fmt(p.budget)} for the student plus a ${fmt(fee(p))} fee). The student can start.`;
  },
  deliver(id) {
    const w = g("w" + id).trim();
    if (!w) {
      S.toast = "Add a note or link so the employer can review your work.";
      return;
    }
    const p = S.projects.find((x) => x.id === id);
    p.work = w;
    p.rev = null;
    p.left = AUTO;
    p.status = "delivered";
    S.toast = "Work submitted.";
  },
  revise(id) {
    const p = find(id);
    if (p.rounds >= MAXREV) {
      S.toast =
        "Both revision rounds are used. Approve the work or report a problem.";
      return;
    }
    p.rounds++;
    p.rev =
      `Revision ${p.rounds} of ${MAXREV}: ` +
      (g("m" + id).trim() || "see the brief");
    p.work = null;
    p.status = "funded";
    S.toast = `Changes requested (${p.rounds} of ${MAXREV}). Payment stays in escrow.`;
  },
  approve(id) {
    const p = find(id);
    release(p, {
      q: +g("q" + id),
      t: +g("t" + id),
      c: +g("c" + id),
      comment: g("m" + id).trim(),
    });
    S.toast = `Released ${fmt(p.budget)} to the student in full. The ${fmt(fee(p))} platform fee was paid by the employer. Passport updated.`;
  },
  skip(id) {
    const p = find(id);
    release(p, {
      auto: true,
      comment: "Released automatically after 5 days without a response.",
    });
    S.toast = `No response after ${AUTO} days, so ${fmt(p.budget)} was released to the student automatically. Passport updated.`;
  },
  report(id) {
    find(id).status = "disputed";
    S.toast =
      "Problem reported. Platform review has started and the payment stays in escrow.";
  },
  sme() {
    S.toast =
      "You are on the SME plan waitlist. Pilot price: KES 1,500 a month.";
  },
  post() {
    const t = g("pt").trim(),
      d = g("pd").trim(),
      s = g("ps"),
      b = +g("pb"),
      n = +g("pn") || 7,
      h = +g("ph") || 0,
      ok = !!(document.getElementById("pc") || {}).checked;
    S.draft = { t, d, s, b, n, h, ok };
    if (!t || !d) {
      S.toast = "Add a title and a written scope.";
      return;
    }
    if (!(b >= MIN)) {
      S.toast = "Budget is below the minimum of " + fmt(MIN) + " per project.";
      return;
    }
    if (!(h > 0) || h > maxh(b)) {
      S.toast = `A budget of ${fmt(b)} allows at most ${maxh(b)} hours at ${fmt(RATE)} an hour. Reduce the hours or raise the budget.`;
      return;
    }
    if (!ok) {
      S.toast =
        "Confirm that this project is paid and includes no unpaid trial work.";
      return;
    }
    S.projects.unshift({
      id: S.next++,
      title: t,
      employer: ME,
      loc: "Westlands",
      skill: s,
      budget: b,
      days: n,
      hours: h,
      rounds: 0,
      desc: d,
      status: "open",
      owner: "me",
    });
    S.draft = null;
    S.toast = "Project posted. Switch to Student to apply.";
  },
  verify() {
    let prev = "GENESIS";
    for (let i = 0; i < S.passport.length; i++) {
      const e = S.passport[i];
      if (e.prev !== prev || e.hash !== hsh(prev + "|" + payload(e))) {
        S.verify = {
          ok: false,
          msg:
            "Check failed: “" +
            e.title +
            "” was changed after it was approved.",
        };
        return;
      }
      prev = e.hash;
    }
    S.verify = {
      ok: true,
      msg:
        "All " +
        S.passport.length +
        " records match. Nothing has been changed.",
    };
  },
  tamper() {
    if (S.passport.length) {
      S.passport[0].comment += " (edited)";
      S.verify = null;
      S.toast =
        "First entry edited without updating its record. Now check records.";
    }
  },
  copy() {
    try {
      navigator.clipboard.writeText("https://" + URL_P).catch(() => {});
      S.toast = "Link copied.";
    } catch (e) {
      S.toast = "Copy the link from the box.";
    }
  },
  reset() {
    init();
  },
  rec() {
    S.rec = !S.rec;
  },
  demo() {
    startDemo();
  },
  next() {
    nextDemo();
  },
  exit() {
    DEMO.on = false;
  },
};
function render() {
  $("#seg").innerHTML = [
    ["student", "Student"],
    ["employer", "Employer"],
  ]
    .map(
      ([v, l]) =>
        `<button class="${S.role === v ? "on" : ""}" data-act="role" data-v="${v}">${l}</button>`,
    )
    .join("");
  const T =
    S.role === "student"
      ? [
          ["browse", "Find projects"],
          ["mine", "My projects"],
          ["passport", "Passport"],
        ]
      : [["dash", "Dashboard"]];
  $("#tabs").innerHTML = T.map(
    ([v, l]) =>
      `<button class="${S.tab === v ? "on" : ""}" data-act="tab" data-v="${v}">${l}</button>`,
  ).join("");
  $("#app").innerHTML =
    S.role === "employer"
      ? employer()
      : S.tab === "mine"
        ? mine()
        : S.tab === "passport"
          ? passport()
          : browse();
  demoBar();
  $("#toast").innerHTML = S.toast
    ? `<div class="toast" role="status">${esc(S.toast)}</div>`
    : "";
  clearTimeout(render.t);
  if (S.toast)
    render.t = setTimeout(() => {
      S.toast = "";
      $("#toast").innerHTML = "";
    }, 5000);
}
const SLOW = new Set([
  "apply",
  "fund",
  "deliver",
  "approve",
  "post",
  "revise",
  "verify",
  "report",
]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
document.addEventListener("click", async (ev) => {
  const b = ev.target.closest("[data-act]");
  if (!b || b.disabled) return;
  const act = b.dataset.act;
  if (SLOW.has(act)) {
    b.disabled = true;
    b.classList.add("loading");
    await wait(650);
  }
  S.toast = "";
  A[act](+b.dataset.id, b);
  render();
  if (act === "role" || act === "tab") window.scrollTo({ top: 0 });
});
const DEMO = { on: false, i: 0, pid: 0 };
function setv(id, v) {
  const e = document.getElementById(id);
  if (e) e.value = v;
}
const DSTEPS = [
  [
    "An employer posts a micro-project. The platform enforces a fair minimum rate.",
    () => {
      S.role = "employer";
      S.tab = "dash";
      S.draft = {
        t: "Shelf price labels",
        d: "Design 40 printable shelf labels with prices.",
        s: "Graphic design",
        b: 2400,
        n: 7,
        h: 8,
        ok: true,
      };
      render();
      A.post();
      DEMO.pid = S.projects[0].id;
    },
  ],
  [
    "A verified student finds the project and applies.",
    () => {
      S.role = "student";
      S.tab = "browse";
      A.apply(DEMO.pid);
    },
  ],
  [
    "The employer accepts and pays the budget plus a 10% fee into escrow. The money is held until the work is approved.",
    () => {
      S.role = "employer";
      S.tab = "dash";
      A.fund(DEMO.pid);
    },
  ],
  [
    "The student delivers the work.",
    () => {
      S.role = "student";
      S.tab = "mine";
      render();
      setv("w" + DEMO.pid, "Shared folder: shelf-labels-v1");
      A.deliver(DEMO.pid);
    },
  ],
  [
    "The employer rates the work and approves it. The full budget is released to the student.",
    () => {
      S.role = "employer";
      S.tab = "dash";
      render();
      setv("q" + DEMO.pid, "5");
      setv("t" + DEMO.pid, "5");
      setv("c" + DEMO.pid, "4");
      setv("m" + DEMO.pid, "Labels were ready early and print-ready.");
      A.approve(DEMO.pid);
    },
  ],
  [
    "A verified entry is added to the Passport, and the record check confirms nothing was altered.",
    () => {
      S.role = "student";
      S.tab = "passport";
      S.rec = false;
      A.verify();
    },
  ],
];
function startDemo() {
  init();
  DEMO.on = true;
  DEMO.i = 0;
  DSTEPS[0][1]();
}
function nextDemo() {
  if (DEMO.i >= DSTEPS.length - 1) {
    DEMO.on = false;
    return;
  }
  DEMO.i++;
  DSTEPS[DEMO.i][1]();
}
function demoBar() {
  const d = $("#demo");
  if (!DEMO.on) {
    d.innerHTML = "";
    document.body.classList.remove("demoing");
    return;
  }
  d.innerHTML = `<div class="demo"><div><b>Step ${DEMO.i + 1} of ${DSTEPS.length}</b><div>${DSTEPS[DEMO.i][0]}</div></div><div class="dbtn"><button class="btn alt" data-act="exit">Exit</button><button class="btn" data-act="next">${DEMO.i === DSTEPS.length - 1 ? "Finish" : "Next step"}</button></div></div>`;
  document.body.classList.add("demoing");
}
function rules() {
  return `<div class="panel pad"><h2>How KaziBridge protects students</h2><ul class="rules"><li>Minimum ${fmt(MIN)} per project, with hours capped so pay stays at or above ${fmt(RATE)} an hour.</li><li>The student receives 100% of the budget. The employer pays a ${FEE * 100}% fee on top.</li><li>Payment is held in escrow and released on approval, or automatically ${AUTO} days after delivery.</li><li>Every project has a written scope and a deadline, at most ${MAXREV} rounds of revisions, and no unpaid trial work.</li><li>Problems can be reported within 7 days for platform review.</li></ul></div>`;
}
function sme() {
  return `<div class="panel pad"><div class="split"><div><h2>SME plan <span class="pill">Pilot</span></h2><p class="meta" style="margin:4px 0 0">Verified business badge, unlimited listings and early access to top-rated students.</p></div><div class="price">KES 1,500<br><span class="meta">per month</span></div></div><button class="btn alt" data-act="sme">Join the waitlist</button></div>`;
}
function hero() {
  return `<section class="hero"><h2>Get paid for real work before you graduate.</h2><p>Complete micro-projects for local businesses and build a Passport that employers can verify.</p><ol class="how"><li><b>Apply to a project</b><span>Choose from paid briefs posted by small businesses near you.</span></li><li><b>Deliver and get paid</b><span>The employer pays into escrow first. It is released when your work is approved.</span></li><li><b>Keep a verified record</b><span>Each approved project goes on your Passport, and anyone can check it.</span></li></ol><button class="btn alt" data-act="demo">Watch the walkthrough</button></section>`;
}
function recruiter() {
  const P = S.passport;
  let ok = true,
    prev = "GENESIS";
  P.forEach((e) => {
    if (e.prev !== prev || e.hash !== hsh(prev + "|" + payload(e))) ok = false;
    prev = e.hash;
  });
  return `<p class="meta">Public view, as a recruiter sees it. No login needed.</p><div class="panel pad"><div class="who"><div class="av">AW</div><div><h1>Amina Wanjiru</h1><div class="meta">BCom, Year 3, University of Nairobi</div><span class="vb">${CHECK}Verified student</span></div></div><div class="res ${ok ? "" : "bad"}">${ok ? "Record check passed: " + P.length + " verified projects, none altered." : "Record check failed: some entries were changed after approval."}</div></div>
 <div class="panel">${P.map((e) => `<div class="item"><div class="split"><div><div class="title">${esc(e.title)}</div><div class="meta">${esc(e.employer)}, ${dt(e.date)}</div></div><span class="vb">${CHECK}Verified</span></div><p class="desc">${rt(e)}</p><span class="tag">${esc(e.skill)}</span></div>`).join("")}</div>
 <button class="btn alt" data-act="rec">Back to my Passport</button>`;
}
init();
render();
window.addEventListener("load", () => {
  setTimeout(() => {
    const l = $("#loader");
    l.classList.add("done");
    document.body.classList.remove("loading");
    setTimeout(() => l.remove(), 500);
  }, 900);
});
