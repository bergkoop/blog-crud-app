// Messages UI is mocked (no backend) — the wireframe scope for this view is presentation only.
const threads = [
  {
    id: "t1",
    name: "studio-log",
    preview: "still deciding if the palette works…",
    unread: true,
    messages: [
      { mine: false, text: "hey, saw your 35mm post" },
      { mine: false, text: "what stock did you use for that one?" },
      { mine: true, text: "portra 400, pushed a stop" },
    ],
  },
  {
    id: "t2",
    name: "pixelfriend",
    preview: "that photoset is incredible",
    unread: false,
    messages: [
      { mine: false, text: "that photoset is incredible, saving it" },
    ],
  },
  {
    id: "t3",
    name: "night-notes",
    preview: "thanks for the reblog!",
    unread: false,
    messages: [{ mine: false, text: "thanks for the reblog!" }],
  },
];

let activeThreadId = threads[0].id;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function renderThreadList() {
  document.getElementById("thread-list").innerHTML = `
    <div class="thread-list-head">
      <input type="text" placeholder="search messages" style="flex:1;height:24px;border:1.5px solid #9a958a;border-radius:12px;padding:0 10px;font-family:'Architects Daughter',cursive;font-size:11px">
      <span class="script" style="font-size:18px">+</span>
    </div>
    ${threads
      .map(
        (t) => `
      <div class="thread-item ${t.id === activeThreadId ? "active" : ""}" data-id="${t.id}">
        <div class="avatar" style="width:30px;height:30px">${escapeHtml(t.name[0])}</div>
        <div class="info">
          <div class="name">${escapeHtml(t.name)}</div>
          <div class="preview">${escapeHtml(t.preview)}</div>
        </div>
        ${t.unread ? `<div class="dot"></div>` : ""}
      </div>`
      )
      .join("")}
  `;
}

function renderThreadView() {
  const thread = threads.find((t) => t.id === activeThreadId);

  document.getElementById("thread-view-head").innerHTML = `
    <div class="avatar" style="width:28px;height:28px">${escapeHtml(thread.name[0])}</div>
    <span style="font-weight:600">${escapeHtml(thread.name)}</span>
    <a href="/blog.html?id=blog-1" style="margin-left:auto;color:#8a8579">view blog</a>
  `;

  document.getElementById("thread-messages").innerHTML = thread.messages
    .map((m) => `<div class="bubble ${m.mine ? "mine" : ""}">${escapeHtml(m.text)}</div>`)
    .join("");

  document.getElementById("thread-messages").scrollTop = 1e9;
}

function wireThreadList() {
  document.getElementById("thread-list").addEventListener("click", (e) => {
    const item = e.target.closest(".thread-item");
    if (!item) return;
    activeThreadId = item.dataset.id;
    threads.find((t) => t.id === activeThreadId).unread = false;
    renderThreadList();
    renderThreadView();
  });
}

function wireSend() {
  const input = document.getElementById("message-input");
  function send() {
    const text = input.value.trim();
    if (!text) return;
    const thread = threads.find((t) => t.id === activeThreadId);
    thread.messages.push({ mine: true, text });
    thread.preview = text;
    input.value = "";
    renderThreadList();
    renderThreadView();
  }
  document.getElementById("send-btn").addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });
}

renderThreadList();
renderThreadView();
wireThreadList();
wireSend();
