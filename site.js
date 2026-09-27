/* Delia Archer site renderer */

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[ch]));
}

function amazonButton(book, extraClass = "") {
  const ready = book.amazonUrl && book.amazonUrl.trim();
  if (ready) {
    return `<a class="btn btn-primary ${extraClass}" href="${esc(book.amazonUrl)}" target="_blank" rel="noopener">Buy on Amazon <span>↗</span></a>`;
  }
  return `<span class="btn btn-primary is-disabled ${extraClass}" title="Add the Amazon URL in content.js when the book is live">Amazon link coming soon</span>`;
}

function bookCard(book) {
  const details = `book.html?slug=${encodeURIComponent(book.slug)}`;
  return `
    <article class="book-card">
      <a class="book-cover-link" href="${details}">
        <img class="book-cover" src="${esc(book.cover)}" alt="${esc(book.title)} book cover">
      </a>
      <div class="book-card-copy">
        <p class="eyebrow">${esc(book.status)}</p>
        <h3>${esc(book.title)}</h3>
        <p class="book-subtitle">${esc(book.subtitle)}</p>
        <div class="tag-row">
          ${book.tropes.slice(0, 4).map(t => `<span>${esc(t)}</span>`).join("")}
        </div>
        <div class="card-actions">
          <a class="btn btn-secondary" href="${details}">View book</a>
          ${amazonButton(book)}
        </div>
      </div>
    </article>
  `;
}

function renderHeader() {
  const current = document.body.dataset.page || "";
  document.querySelectorAll("[data-nav]").forEach(link => {
    if (link.dataset.nav === current) link.classList.add("active");
  });
  document.querySelectorAll("[data-author]").forEach(el => el.textContent = siteContent.authorName);
}

function renderFooter() {
  document.querySelectorAll("[data-footer-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const social = siteContent.social || {};
  const wrap = document.querySelector("[data-social-links]");
  if (wrap) {
    const links = [
      ["tiktok", "TikTok"],
      ["instagram", "Instagram"],
      ["facebook", "Facebook"]
    ].filter(([key]) => social[key]);

    wrap.innerHTML = links.length
      ? links.map(([key, label]) => `<a href="${esc(social[key])}" target="_blank" rel="noopener">${label}</a>`).join("")
      : "";
  }
}

function renderHome() {
  const latest = [...siteContent.books].find(b => /available/i.test(b.status)) || siteContent.books[0];
  if (!latest) return;

  const cover = document.querySelector("[data-latest-cover]");
  const title = document.querySelector("[data-latest-title]");
  const subtitle = document.querySelector("[data-latest-subtitle]");
  const blurb = document.querySelector("[data-latest-blurb]");
  const btn = document.querySelector("[data-latest-amazon]");
  if (cover) {
    cover.src = latest.cover;
    cover.alt = `${latest.title} book cover`;
  }
  if (title) title.textContent = latest.title;
  if (subtitle) subtitle.textContent = latest.subtitle;
  if (blurb) blurb.textContent = latest.blurb.split("\n")[0];
  if (btn) {
    btn.outerHTML = amazonButton(latest, "");
  }

  const grid = document.querySelector("[data-featured-books]");
  if (grid) grid.innerHTML = siteContent.books.slice(0, 3).map(bookCard).join("");
}

function renderBooks() {
  const grid = document.querySelector("[data-books-grid]");
  if (grid) grid.innerHTML = siteContent.books.map(bookCard).join("");
}

function renderBookDetail() {
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  const book = siteContent.books.find(b => b.slug === slug) || siteContent.books[0];
  if (!book) return;

  document.title = `${book.title} | ${siteContent.authorName}`;

  const set = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  const cover = document.querySelector("[data-book-cover]");
  if (cover) {
    cover.src = book.cover;
    cover.alt = `${book.title} book cover`;
  }
  set("[data-book-status]", book.status);
  set("[data-book-title]", book.title);
  set("[data-book-subtitle]", book.subtitle);
  set("[data-book-series]", book.series ? book.series : "");
  set("[data-book-year]", book.year);
  set("[data-book-quote]", book.coverQuote);

  const genres = document.querySelector("[data-book-genres]");
  if (genres) genres.innerHTML = book.genres.map(g => `<span>${esc(g)}</span>`).join("");

  const tropes = document.querySelector("[data-book-tropes]");
  if (tropes) tropes.innerHTML = book.tropes.map(t => `<span>${esc(t)}</span>`).join("");

  const blurb = document.querySelector("[data-book-blurb]");
  if (blurb) blurb.innerHTML = book.blurb.split("\n\n").map(p => `<p>${esc(p)}</p>`).join("");

  const actions = document.querySelector("[data-book-actions]");
  if (actions) actions.innerHTML = `${amazonButton(book)} <a class="btn btn-secondary" href="books.html">Back to all books</a>`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  if (document.querySelector("[data-latest-cover]")) renderHome();
  if (document.querySelector("[data-books-grid]")) renderBooks();
  if (document.querySelector("[data-book-cover]")) renderBookDetail();
});
