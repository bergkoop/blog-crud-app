const MY_BLOG_ID = "blog-1";
let selectedType = "text";

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

async function loadSidebar() {
  const blogs = await fetch("/api/blogs").then((r) => r.json());
  const myBlog = blogs.find((b) => b.id === MY_BLOG_ID);
  const otherBlogs = blogs.filter((b) => b.id !== MY_BLOG_ID);

  document.getElementById("my-stats").innerHTML =
    `<span>${myBlog.followers} followers</span><span>${myBlog.following} following</span>`;

  document.getElementById("your-blogs-list").innerHTML = `
    <div class="blog-summary" style="margin-top:6px">
      <div class="avatar" style="width:22px;height:22px;border-radius:4px">y</div>
      <a href="/blog.html?id=${myBlog.id}" class="name">${escapeHtml(myBlog.name)}</a>
    </div>`;

  document.getElementById("tags-list").innerHTML = myBlog.tags
    .map((t) => `<span class="tag-pill">#${escapeHtml(t)}</span>`)
    .join("");

  document.getElementById("other-blogs-list").innerHTML = otherBlogs
    .map(
      (b) => `
    <div class="blog-summary" style="margin-top:8px">
      <div class="avatar" style="width:24px;height:24px">${escapeHtml(b.name[0])}</div>
      <a href="/blog.html?id=${b.id}" class="name" style="font-size:12px">${escapeHtml(b.name)}</a>
    </div>`
    )
    .join("");

  const allTags = [...new Set(blogs.flatMap((b) => b.tags))];
  document.getElementById("trending-tags").innerHTML = allTags
    .slice(0, 5)
    .map((t) => `<span class="tag-pill">#${escapeHtml(t)}</span>`)
    .join("");
}

function renderPost(post, blogsById) {
  const blog = blogsById[post.blogId];
  const canDelete = post.blogId === MY_BLOG_ID;
  return `
  <div class="post" data-id="${post.id}">
    <div class="post-head">
      <div class="avatar" style="width:26px;height:26px">${escapeHtml(blog?.name[0] || "?")}</div>
      <a href="/blog.html?id=${post.blogId}" class="blog-link">${escapeHtml(blog?.name || "unknown")}</a>
      <span>· ${timeAgo(post.createdAt)}</span>
    </div>
    <div class="post-body">
      ${post.title ? `<p class="title">${escapeHtml(post.title)}</p>` : ""}
      ${post.body ? `<p class="text">${escapeHtml(post.body)}</p>` : ""}
      ${post.type === "photo" || post.type === "photoset" ? `<div class="post-photo">${escapeHtml(post.type)}</div>` : ""}
    </div>
    ${post.tags.length ? `<div class="post-tags">${post.tags.map((t) => "#" + escapeHtml(t)).join(" ")}</div>` : ""}
    <div class="post-foot">
      <span class="notes">${post.notes} notes</span>
      <div class="actions">
        <button class="like" data-action="like">♥ like</button>
        ${canDelete ? `<button class="delete" data-action="delete">delete</button>` : ""}
      </div>
    </div>
  </div>`;
}

async function loadFeed() {
  const [posts, blogs] = await Promise.all([
    fetch("/api/posts").then((r) => r.json()),
    fetch("/api/blogs").then((r) => r.json()),
  ]);
  const blogsById = Object.fromEntries(blogs.map((b) => [b.id, b]));
  const feed = document.getElementById("feed");

  if (!posts.length) {
    feed.innerHTML = `<div class="empty-state">nothing here yet — post something above</div>`;
    return;
  }

  feed.innerHTML = posts.map((p) => renderPost(p, blogsById)).join("");
}

function wireComposer() {
  const form = document.getElementById("composer");
  const typeButtons = form.querySelectorAll(".types button");

  typeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      typeButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedType = btn.dataset.type;
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("composer-title").value.trim();
    const body = document.getElementById("composer-body").value.trim();
    const tags = document
      .getElementById("composer-tags")
      .value.split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!title && !body) return;

    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId: MY_BLOG_ID, type: selectedType, title, body, tags }),
    });

    form.reset();
    typeButtons.forEach((b) => b.classList.remove("selected"));
    typeButtons[0].classList.add("selected");
    selectedType = "text";

    await loadFeed();
  });
}

function wireFeedActions() {
  document.getElementById("feed").addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const postEl = btn.closest(".post");
    const id = postEl.dataset.id;

    if (btn.dataset.action === "delete") {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      await loadFeed();
    }

    if (btn.dataset.action === "like") {
      btn.classList.toggle("liked");
    }
  });
}

loadSidebar();
loadFeed();
wireComposer();
wireFeedActions();
