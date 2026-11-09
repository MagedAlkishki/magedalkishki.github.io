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
// way instead of silently doing nothing.
const emailBtn = document.getElementById("email-btn");
const toast = document.getElementById("toast");
let toastTimer = null;

emailBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("maged.alkishki@gmail.com");
    showToast("Email copied to clipboard");
  } catch {
    // Clipboard API can be blocked (e.g. no secure context); the mailto:
    // link still gets a chance to work, so just skip the toast silently.
  }
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}