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

function renderPost(post, blog) {
  return `
  <div class="post" data-id="${post.id}">
    <div class="post-body">
      ${post.title ? `<p class="title">${escapeHtml(post.title)}</p>` : ""}
      ${post.body ? `<p class="text">${escapeHtml(post.body)}</p>` : ""}
      ${post.type === "photo" || post.type === "photoset" ? `<div class="post-photo">${escapeHtml(post.type)}</div>` : ""}
    </div>
    ${post.tags.length ? `<div class="post-tags">${post.tags.map((t) => "#" + escapeHtml(t)).join(" ")} · ${post.notes} notes</div>` : ""}
  </div>`;
}

async function init() {
  const params = new URLSearchParams(location.search);
  const blogId = params.get("id") || "blog-1";

  const blogRes = await fetch(`/api/blogs/${blogId}`);
  if (!blogRes.ok) {
    document.getElementById("blog-title").textContent = "blog not found";
    return;
  }
  const blog = await blogRes.json();
  const posts = await fetch(`/api/posts?blogId=${blogId}`).then((r) => r.json());

  document.getElementById("blog-title").textContent = blog.name;
  document.getElementById("blog-desc").textContent = blog.description;
  document.getElementById("blog-stats").textContent =
    `${posts.length} posts · ${blog.followers} followers · following ${blog.following}`;
  document.getElementById("blog-about").textContent = blog.description;
  document.getElementById("blog-tags").innerHTML = blog.tags
    .map((t) => `<span class="tag-pill">#${escapeHtml(t)}</span>`)
    .join("");

  const feed = document.getElementById("blog-feed");
  feed.style.display = "flex";
  feed.style.flexDirection = "column";
  feed.style.gap = "16px";
  feed.style.marginTop = "16px";

  feed.innerHTML = posts.length
    ? posts.map((p) => renderPost(p, blog)).join("")
    : `<div class="empty-state">this blog hasn't posted anything yet</div>`;
}

init();
