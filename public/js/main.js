// GSAP animations
document.addEventListener("DOMContentLoaded", () => {
    // Home Section Animation
    gsap.to("#home .hero-text", {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.5
    });
  
    // Project Cards Animation
    gsap.from(".project-card", {
      opacity: 0,
      y: 100,
      duration: 1,
      stagger: 0.3,
      ease: "power3.out",
      delay: 1.5
    });
  });
  