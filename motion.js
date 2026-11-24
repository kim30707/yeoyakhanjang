/* 예약한장 motion.js 2026-11-25 — 시안: Gemini 4 Argon (Antigravity agy), 조정: Claude (자주 묻는 질문 순서 등장 추가). */
"use strict";
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  // 1. Ensure decorative scroll progress bar exists
  let progressBar = document.querySelector(".scroll-progress");
  if (!progressBar && document.body) {
    progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";
    progressBar.setAttribute("aria-hidden", "true");
    document.body.prepend(progressBar);
  }

  // 2. Auto-bind reveal hooks & stagger indices (matches out/hooks.md)
  const singleTargets = [
    ".section-head",
    ".handoff-intro",
    ".guide-preview",
    ".remote-support > h2",
    ".inquiry-grid > div:first-child",
    ".form-card",
    ".international"
  ];
  singleTargets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
    });
  });

  const staggerGroups = [
    [".service-grid", ".studio-service"],
    ["#store .section", ".program"],
    [".examples", ".case-card"],
    [".portfolio-grid", ".portfolio-tile"],
    [".design-grid", ".design-card"],
    [".process", "li"],
    [".remote-grid", "article"],
    [".faq-list", ".faq-item"]
  ];
  staggerGroups.forEach(([groupSel, itemSel]) => {
    document.querySelectorAll(groupSel).forEach((group) => {
      group.querySelectorAll(itemSel).forEach((item, index) => {
        if (!item.hasAttribute("data-reveal")) item.setAttribute("data-reveal", "");
        if (!item.style.getPropertyValue("--stagger")) {
          item.style.setProperty("--stagger", String(index));
        }
      });
    });
  });

  const processList = document.querySelector("#process .process");
  const processSteps = processList ? Array.from(processList.querySelectorAll("li")) : [];
  const statement = document.querySelector(".statement");

  // 3. Reduced motion guard: put everything in final state immediately
  if (reduceMotion.matches) {
    root.classList.remove("motion-ready");
    root.style.setProperty("--process-progress", "1");
    processSteps.forEach((li) => li.classList.add("is-active"));
    if (statement) statement.classList.add("is-inview");
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-inview"));
    return;
  }

  root.classList.add("motion-ready");

  // 4. IntersectionObserver for staggered section reveals & statement words
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealItems.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add("is-inview");
      } else {
        revealObserver.observe(el);
      }
    });

    if (statement) {
      const stmtObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-inview");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      stmtObserver.observe(statement);
    }

    // Active nav link indicator
    const navLinks = new Map();
    document.querySelectorAll('.studio-nav a[href^="#"]').forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (section) navLinks.set(section, link);
    });
    if (navLinks.size > 0) {
      const navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const link = navLinks.get(entry.target);
            if (link) link.classList.toggle("is-active", entry.isIntersecting);
          });
        },
        { rootMargin: "-28% 0px -58% 0px", threshold: 0 }
      );
      navLinks.forEach((_, section) => navObserver.observe(section));
    }
  } else {
    revealItems.forEach((el) => el.classList.add("is-inview"));
    if (statement) statement.classList.add("is-inview");
  }

  // 5. Scroll progress bar, sticky header state, and process step line draw
  let rafId = 0;
  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const updateScrollState = () => {
    rafId = 0;
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
    const progress = clamp(scrollY / maxScroll, 0, 1);

    root.style.setProperty("--scroll-progress", progress.toFixed(4));
    root.classList.toggle("is-scrolled", scrollY > 16);

    if (processList) {
      const rect = processList.getBoundingClientRect();
      const viewH = window.innerHeight;
      const start = viewH * 0.82;
      const end = viewH * 0.32;
      const ratio = clamp((start - rect.top) / Math.max(1, start - end), 0, 1);
      processList.style.setProperty("--process-progress", ratio.toFixed(3));
      const thresholds = [0.08, 0.36, 0.64, 0.88];
      processSteps.forEach((step, idx) => {
        step.classList.toggle("is-active", ratio >= (thresholds[idx] ?? 0.5));
      });
    }
  };

  const onScroll = () => {
    if (!rafId) rafId = window.requestAnimationFrame(updateScrollState);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateScrollState();

  // 6. Subtle magnetic transform on primary buttons (transform only)
  if (finePointer.matches) {
    const magneticButtons = document.querySelectorAll(
      ".studio-hero .button.accent, .studio-top .header-button, .button.dark"
    );
    magneticButtons.forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = ((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 5;
        const dy = ((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 4;
        btn.style.setProperty("--mx", `${dx.toFixed(2)}px`);
        btn.style.setProperty("--my", `${dy.toFixed(2)}px`);
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.setProperty("--mx", "0px");
        btn.style.setProperty("--my", "0px");
      });
    });
  }
})();
