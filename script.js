// 1. Glow that follows the mouse
const glow = document.getElementById("cursor-glow");

window.addEventListener("mousemove", (e) => {
  glow.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
});

// 2. Progress bar that fills as you scroll
const bar = document.getElementById("progress-bar");

window.addEventListener("scroll", () => {
  const scrollTop = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = height > 0 ? (scrollTop / height) * 100 + "%" : "0%";
});

// 3. 3D tilt on the project cards
document.querySelectorAll(".project").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform =
      `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

// 4. "Email me" also copies the address to the clipboard. The mailto: link
// still fires normally if the browser has a default mail app configured,
// but plenty of setups don't have one - this makes the button useful either
// way instead of silently doing nothing. Two buttons (header + bottom CTA
// band) share the same behavior.
const toast = document.getElementById("toast");
let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

["email-btn", "email-btn-2"].forEach((id) => {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("maged.alkishki@gmail.com");
      showToast("Email copied to clipboard");
    } catch {
      // Clipboard API can be blocked (e.g. no secure context); the mailto:
      // link still gets a chance to work, so just skip the toast silently.
    }
  });
});

// 5. Sticky nav: fades in once you've scrolled past the hero, and highlights
// whichever section is currently in view.
const siteNav = document.getElementById("site-nav");
const heroHeader = document.querySelector("header");

if (siteNav && heroHeader) {
  const navObserver = new IntersectionObserver(
    ([entry]) => {
      siteNav.classList.toggle("visible", !entry.isIntersecting);
    },
    { rootMargin: "-60% 0px 0px 0px" }
  );
  navObserver.observe(heroHeader);
}

const navLinks = document.querySelectorAll(".nav-links a[data-nav]");
const navSections = Array.from(navLinks)
  .map((link) => document.getElementById(link.dataset.nav))
  .filter(Boolean);

if (navLinks.length && navSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.dataset.nav === entry.target.id);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  navSections.forEach((section) => sectionObserver.observe(section));
}

// 6. Scroll-reveal: fade/slide elements in the first time they enter view.
const revealTargets = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealTargets.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  // No IntersectionObserver support (or none needed) - just show everything.
  revealTargets.forEach((el) => el.classList.add("visible"));
}

// 7. Project filter pills, built from each card's data-lang attribute so
// adding a new project later only means adding a new <article> - the pill
// list and counts stay correct on their own.
const projectsGrid = document.getElementById("projects-grid");
const filterRow = document.getElementById("filter-row");
const filterStatus = document.getElementById("filter-status");

if (projectsGrid && filterRow) {
  const projectCards = Array.from(projectsGrid.querySelectorAll(".project"));
  const langCounts = new Map();

  projectCards.forEach((card) => {
    (card.dataset.lang || "").split(" ").filter(Boolean).forEach((lang) => {
      langCounts.set(lang, (langCounts.get(lang) || 0) + 1);
    });
  });

  // Keep "All", then languages sorted by how many projects use them
  // (most-used first), tie-broken alphabetically for a stable order.
  const sortedLangs = Array.from(langCounts.keys()).sort((a, b) => {
    const diff = langCounts.get(b) - langCounts.get(a);
    return diff !== 0 ? diff : a.localeCompare(b);
  });

  const allPill = filterRow.querySelector('[data-filter="all"]');
  if (allPill) {
    allPill.innerHTML = `All <span class="count">${projectCards.length}</span>`;
  }

  sortedLangs.forEach((lang) => {
    const pill = document.createElement("button");
    pill.className = "filter-pill";
    pill.dataset.filter = lang;
    pill.innerHTML = `${lang} <span class="count">${langCounts.get(lang)}</span>`;
    filterRow.appendChild(pill);
  });

  function applyFilter(filter) {
    let shown = 0;
    projectCards.forEach((card) => {
      const langs = (card.dataset.lang || "").split(" ");
      const matches = filter === "all" || langs.includes(filter);
      card.classList.toggle("filtered-out", !matches);
      if (matches) shown++;
    });
    if (filterStatus) {
      filterStatus.textContent =
        filter === "all"
          ? `Showing all ${projectCards.length} projects`
          : `Showing ${shown} of ${projectCards.length} projects — ${filter}`;
    }
  }

  filterRow.addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;
    filterRow.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    applyFilter(pill.dataset.filter);
  });

  applyFilter("all");
}

// 8. Hero stat numbers count up once they scroll into view.
const statNums = document.querySelectorAll(".stat-num[data-count]");

if (statNums.length) {
  const countUp = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const statObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            countUp(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach((el) => statObserver.observe(el));
  } else {
    statNums.forEach(countUp);
  }
}

// 9. Back-to-top button, shown once you've scrolled a bit.
const backToTop = document.getElementById("back-to-top");

if (backToTop) {
  window.addEventListener("scroll", () => {
    backToTop.style.display = window.scrollY > 500 ? "inline-flex" : "none";
  });
  backToTop.style.display = "none";
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
