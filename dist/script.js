document.addEventListener("DOMContentLoaded", () => {
  // Update year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }

  // Scroll Reveal Observer
  const revealCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  });

  document.querySelectorAll('.reveal, section, .card, .hero-card-inner').forEach((el) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Nav scroll logic
  const nav = document.querySelector(".nav");
  const navContainer = document.querySelector(".nav-container");
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      nav.classList.add("scrolled");
      navContainer.style.padding = "0";
    } else {
      nav.classList.remove("scrolled");
      navContainer.style.padding = "1.5rem 0";
    }
  });

  // Highlight active nav link on scroll
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 150) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").includes(`#${current}`)) {
        link.classList.add("active");
      }
    });
  });

  // Toast Notification System
  const createToastContainer = () => {
    if (!document.getElementById("toast-container")) {
      const container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
    return document.getElementById("toast-container");
  };

  const showToast = (message) => {
    const container = createToastContainer();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <div class="toast-icon">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <div>
        <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">System Notification</div>
        <div style="color: #94a3b8; font-size: 0.8rem;">${message}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 600);
    }, 5000);
  };

  // Live Purchase Simulation
  const names = ["Shadow", "Ghost", "Neo", "Raven", "Cipher", "Vortex", "Zero", "Alpha", "Dagger", "Zenith"];
  const products = ["Armora External", "Armora Premium", "Armora Internal x64", "Armora UID Bypass"];

  const triggerToast = () => {
    if (Math.random() > 0.4) {
      const p = products[Math.floor(Math.random() * products.length)];
      const n = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 99);
      showToast(`User <strong>${n}</strong> activated <strong>${p}</strong>`);
    }
    setTimeout(triggerToast, Math.random() * 15000 + 10000);
  };
  setTimeout(triggerToast, 4000);

  // Advanced 3D Physics
  const cards = document.querySelectorAll(".card, .hero-card-inner");
  cards.forEach(card => {
    let rect;
    card.addEventListener("mouseenter", () => {
      rect = card.getBoundingClientRect();
      card.style.willChange = "transform";
    });

    card.addEventListener("mousemove", (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;
      
      requestAnimationFrame(() => {
        card.style.transform = `perspective(2000px) rotateX(${deltaY * -6}deg) rotateY(${deltaX * 6}deg) translateY(-5px)`;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = ``;
      card.style.willChange = "auto";
    });
  });

  // Ultra-Responsive Custom Cursor
  const cursor = document.createElement('div');
  const cursorDot = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursorDot.className = 'custom-cursor-dot';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let dotX = 0, dotY = 0;
  let scale = 1;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const updateCursor = () => {
    // Smoother & Faster Lerping
    cursorX += (mouseX - cursorX) * 0.3;
    cursorY += (mouseY - cursorY) * 0.3;
    dotX += (mouseX - dotX) * 0.95;
    dotY += (mouseY - dotY) * 0.95;

    // Scale lerping
    let targetScale = 1;
    if (activeHover) targetScale = 2.5;
    scale += (targetScale - scale) * 0.15;

    cursor.style.transform = `translate3d(${cursorX - 12}px, ${cursorY - 12}px, 0) scale(${scale})`;
    cursorDot.style.transform = `translate3d(${dotX - 3}px, ${dotY - 3}px, 0)`;
    
    // Hide cursor when out of bounds
    if (mouseX <= 0 || mouseY <= 0 || mouseX >= window.innerWidth || mouseY >= window.innerHeight) {
      cursor.style.opacity = '0';
      cursorDot.style.opacity = '0';
    } else {
      cursor.style.opacity = '1';
      cursorDot.style.opacity = '1';
    }
    
    requestAnimationFrame(updateCursor);
  };

  let activeHover = false;
  const hoverElements = 'a, button, .card, details, .hero-card-inner, .nav-links a';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverElements)) activeHover = true;
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverElements)) activeHover = false;
  });

  updateCursor();
});
