"use strict";

/* =========================================================
   STUDENT SEASON PASS LP
   script.js
========================================================= */


/* =========================================================
   1. ELEMENTS
========================================================= */

const body = document.body;

const siteHeader = document.getElementById("siteHeader");
const scrollProgressBar = document.getElementById("scrollProgressBar");

const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

const backToTopButton = document.getElementById("backToTop");
const mobileFixedCta = document.getElementById("mobileFixedCta");

const purchaseLinks = document.querySelectorAll(".js-purchase-link");
const revealElements = document.querySelectorAll(".reveal");

const faqItems = document.querySelectorAll(".faq-item");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");

const internalLinks = document.querySelectorAll('a[href^="#"]');


/* =========================================================
   2. SETTINGS
========================================================= */

/*
  実際の販売ページURLが決まったら、
  下記URLを変更してください。

  HTML内に複数ある https://example.com を
  直接書き換えても構いませんが、
  ここで一括管理すると便利です。
*/

const PURCHASE_URL = "https://example.com";


/*
  ヘッダーが白背景へ切り替わる位置
*/

const HEADER_SCROLL_THRESHOLD = 40;


/*
  スマートフォン固定CTAを表示する位置
*/

const MOBILE_CTA_SCROLL_THRESHOLD = 520;


/* =========================================================
   3. PURCHASE URL
========================================================= */

/**
 * 現在ページのUTMパラメータなどを
 * 購入先URLへ引き継ぎます。
 *
 * 例：
 * ?utm_source=instagram&utm_medium=paid_social
 */

function buildPurchaseUrl(baseUrl) {
  try {
    const destinationUrl = new URL(baseUrl, window.location.href);
    const currentParams = new URLSearchParams(window.location.search);

    const trackingParameterNames = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "fbclid",
      "source",
      "campaign"
    ];

    trackingParameterNames.forEach((parameterName) => {
      const parameterValue = currentParams.get(parameterName);

      if (parameterValue) {
        destinationUrl.searchParams.set(
          parameterName,
          parameterValue
        );
      }
    });

    return destinationUrl.toString();
  } catch (error) {
    console.warn(
      "購入URLの生成に失敗しました。",
      error
    );

    return baseUrl;
  }
}


/**
 * すべての購入ボタンへURLを設定
 */

function initializePurchaseLinks() {
  const finalPurchaseUrl = buildPurchaseUrl(PURCHASE_URL);

  purchaseLinks.forEach((link) => {
    link.href = finalPurchaseUrl;

    link.addEventListener("click", () => {
      trackPurchaseClick(link);
    });
  });
}


/**
 * GA4が設置されている場合に
 * 購入ボタンクリックを送信
 */

function trackPurchaseClick(link) {
  const linkText = link.textContent
    ? link.textContent.trim().replace(/\s+/g, " ")
    : "purchase";

  if (typeof window.gtag === "function") {
    window.gtag("event", "purchase_button_click", {
      event_category: "student_season_pass",
      event_label: linkText,
      link_url: link.href
    });
  }


  /*
    Google Tag ManagerのdataLayerがある場合
  */

  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({
    event: "purchase_button_click",
    event_category: "student_season_pass",
    event_label: linkText,
    link_url: link.href
  });
}


/* =========================================================
   4. HEADER
========================================================= */

function updateHeaderState() {
  if (!siteHeader) {
    return;
  }

  if (window.scrollY > HEADER_SCROLL_THRESHOLD) {
    siteHeader.classList.add("is-scrolled");
  } else {
    siteHeader.classList.remove("is-scrolled");
  }
}


/* =========================================================
   5. SCROLL PROGRESS
========================================================= */

function updateScrollProgress() {
  if (!scrollProgressBar) {
    return;
  }

  const documentHeight =
    document.documentElement.scrollHeight -
    window.innerHeight;

  if (documentHeight <= 0) {
    scrollProgressBar.style.width = "0%";
    return;
  }

  const scrollPercentage =
    Math.min(
      Math.max(window.scrollY / documentHeight, 0),
      1
    ) * 100;

  scrollProgressBar.style.width =
    `${scrollPercentage}%`;
}


/* =========================================================
   6. MOBILE FIXED CTA
========================================================= */

function updateMobileFixedCta() {
  if (!mobileFixedCta) {
    return;
  }

  const isMobile =
    window.matchMedia("(max-width: 600px)").matches;

  const shouldShow =
    isMobile &&
    window.scrollY > MOBILE_CTA_SCROLL_THRESHOLD;

  mobileFixedCta.classList.toggle(
    "is-visible",
    shouldShow
  );
}


/* =========================================================
   7. MOBILE MENU
========================================================= */

function openMobileMenu() {
  if (!menuButton || !mobileMenu) {
    return;
  }

  mobileMenu.hidden = false;

  menuButton.classList.add("is-active");
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "メニューを閉じる");

  body.classList.add("menu-open");
}


function closeMobileMenu() {
  if (!menuButton || !mobileMenu) {
    return;
  }

  mobileMenu.hidden = true;

  menuButton.classList.remove("is-active");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "メニューを開く");

  body.classList.remove("menu-open");
}


function toggleMobileMenu() {
  if (!menuButton) {
    return;
  }

  const isOpen =
    menuButton.getAttribute("aria-expanded") === "true";

  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}


function initializeMobileMenu() {
  if (!menuButton || !mobileMenu) {
    return;
  }

  menuButton.addEventListener(
    "click",
    toggleMobileMenu
  );


  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });


  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });


  window.addEventListener("resize", () => {
    const isDesktop =
      window.matchMedia("(min-width: 901px)").matches;

    if (isDesktop) {
      closeMobileMenu();
    }
  });
}


/* =========================================================
   8. SMOOTH SCROLL
========================================================= */

function initializeSmoothScroll() {
  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") {
        return;
      }

      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();

      const headerHeight =
        siteHeader?.offsetHeight || 0;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        16;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    });
  });
}


/* =========================================================
   9. REVEAL ANIMATION
========================================================= */

function initializeRevealAnimation() {
  if (!revealElements.length) {
    return;
  }

  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  if (
    prefersReducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      threshold: 0.13,
      rootMargin: "0px 0px -45px 0px"
    }
  );


  revealElements.forEach((element, index) => {
    /*
      同じエリア内の要素を少しずつ遅延表示
    */

    element.style.transitionDelay =
      `${Math.min(index % 4, 3) * 70}ms`;

    revealObserver.observe(element);
  });
}


/* =========================================================
   10. FAQ
========================================================= */

function closeFaqItem(item) {
  const question = item.querySelector(".faq-question");

  item.classList.remove("is-open");

  if (question) {
    question.setAttribute("aria-expanded", "false");
  }
}


function openFaqItem(item) {
  const question = item.querySelector(".faq-question");

  item.classList.add("is-open");

  if (question) {
    question.setAttribute("aria-expanded", "true");
  }
}


function initializeFaq() {
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    if (!question) {
      return;
    }

    question.addEventListener("click", () => {
      const isOpen =
        question.getAttribute("aria-expanded") === "true";


      /*
        同時に1つだけ開く仕様
      */

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          closeFaqItem(otherItem);
        }
      });


      if (isOpen) {
        closeFaqItem(item);
      } else {
        openFaqItem(item);
      }
    });
  });
}


/* =========================================================
   11. BACK TO TOP
========================================================= */

function initializeBackToTop() {
  if (!backToTopButton) {
    return;
  }

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}


/* =========================================================
   12. PARALLAX
========================================================= */

function initializeHeroParallax() {
  const heroMedia =
    document.querySelector(".hero__media");

  const heroMountainBack =
    document.querySelector(".hero__mountain--back");

  const heroMountainFront =
    document.querySelector(".hero__mountain--front");


  if (
    !heroMedia ||
    !heroMountainBack ||
    !heroMountainFront
  ) {
    return;
  }


  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  if (prefersReducedMotion) {
    return;
  }


  function updateParallax() {
    const scrollY = window.scrollY;

    /*
      Heroから大きく離れた後は処理を抑える
    */

    if (scrollY > window.innerHeight * 1.5) {
      return;
    }

    heroMedia.style.transform =
      `translate3d(0, ${scrollY * 0.08}px, 0)`;

    heroMountainBack.style.transform =
      `translate3d(0, ${scrollY * 0.035}px, 0)`;

    heroMountainFront.style.transform =
      `translate3d(0, ${scrollY * 0.065}px, 0)`;
  }


  window.addEventListener(
    "scroll",
    updateParallax,
    { passive: true }
  );

  updateParallax();
}


/* =========================================================
   13. SCROLL EVENT OPTIMIZATION
========================================================= */

let scrollTicking = false;


function handleScroll() {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;

  window.requestAnimationFrame(() => {
    updateHeaderState();
    updateScrollProgress();
    updateMobileFixedCta();

    scrollTicking = false;
  });
}


/* =========================================================
   14. RESIZE
========================================================= */

let resizeTimer;


function handleResize() {
  window.clearTimeout(resizeTimer);

  resizeTimer = window.setTimeout(() => {
    updateScrollProgress();
    updateMobileFixedCta();
  }, 120);
}


/* =========================================================
   15. EXTERNAL LINK SAFETY
========================================================= */

function initializeExternalLinks() {
  const externalLinks =
    document.querySelectorAll(
      'a[target="_blank"]'
    );

  externalLinks.forEach((link) => {
    const currentRel =
      link.getAttribute("rel") || "";

    const relValues =
      new Set(currentRel.split(/\s+/).filter(Boolean));

    relValues.add("noopener");
    relValues.add("noreferrer");

    link.setAttribute(
      "rel",
      Array.from(relValues).join(" ")
    );
  });
}


/* =========================================================
   16. INITIALIZE
========================================================= */

function initializePage() {
  initializePurchaseLinks();
  initializeMobileMenu();
  initializeSmoothScroll();
  initializeRevealAnimation();
  initializeFaq();
  initializeBackToTop();
  initializeHeroParallax();
  initializeExternalLinks();

  updateHeaderState();
  updateScrollProgress();
  updateMobileFixedCta();

  window.addEventListener(
    "scroll",
    handleScroll,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    handleResize
  );
}


/*
  DOMの読み込み状態に合わせて実行
*/

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializePage
  );
} else {
  initializePage();
}