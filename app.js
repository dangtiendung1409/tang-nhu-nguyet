// Đổi tên và lời chúc ở đây để cá nhân hóa món quà.
const loveNote = {
  name: "Như Nguyệt",
  letter:
    "Bà ơi, 20/10 vui vẻ nha! Tui có chuẩn bị chút quà nho nhỏ này cho bà nè. Hôm nay là ngày của bà, nên tui gửi một bó hoa với mấy lời chúc thiệt lòng. Mong bà có một ngày nhẹ nhàng, vui vẻ và được quan tâm thiệt nhiều.\n\nChúc Như Nguyệt ăn ngon, ngủ ngon, làm gì cũng suôn sẻ và gặp thiệt nhiều người dễ mến. Mong bà có nhiều thời gian cho mấy điều mình thích, bớt deadline dí và bớt mấy chuyện đau đầu.\n\nBữa nào mệt thì cứ nghỉ một chút nha bà. Có chuyện vui cứ kể tui nghe, cần người ngồi tám thì gọi “ông ơi” là được nè.\n\nQuà nhỏ thôi, chủ yếu là chúc bà một ngày thật xinh, một tâm trạng thiệt tốt và có lý do để cười nhiều hơn. Vậy nha, hôm nay nhớ tự thưởng cho mình món gì ngon đó! 🌷",
};

const $ = (selector) => document.querySelector(selector);
document.documentElement.dataset.inputMethod = "pointer";
document.addEventListener("pointerdown", () => {
  document.documentElement.dataset.inputMethod = "pointer";
}, true);
document.addEventListener("keydown", (event) => {
  if (["Tab", "Enter", " ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key))
    document.documentElement.dataset.inputMethod = "keyboard";
}, true);
const stickerBase = new URL("./image/stickers/", document.currentScript.src);
const giftBase = new URL("./gifts/", document.currentScript.src);
const petStickers = [
  { id: "dog-boop", label: "Bé cún bóp má" },
  { id: "cat-yawn", label: "Bé mèo ngáp" },
  { id: "cat-upside-down", label: "Bé mèo nằm ngửa" },
  { id: "cat-bells", label: "Bé mèo đeo chuông" },
  { id: "cat-cone", label: "Bé mèo đeo loa" },
  { id: "cat-sitting", label: "Bé mèo ngoái nhìn" },
].map((sticker) => ({
  ...sticker,
  src: new URL(`${sticker.id}.webp`, stickerBase).href,
}));
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let toastTimer;
let soundEnabled = false;
let audioContext;

function notify(message) {
  const toast = $("#toast");
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3300);
}

function chime(notes = [523.25, 659.25, 783.99]) {
  if (!soundEnabled) return;
  try {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    audioContext ||= new AudioEngine();
    if (audioContext.state === "suspended")
      audioContext.resume().catch(() => {});
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const volume = audioContext.createGain();
      const start = audioContext.currentTime + index * 0.1;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      volume.gain.setValueAtTime(0, start);
      volume.gain.linearRampToValueAtTime(0.055, start + 0.015);
      volume.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      oscillator.connect(volume);
      volume.connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.4);
      oscillator.onended = () => {
        oscillator.disconnect();
        volume.disconnect();
      };
    });
  } catch {
    /* Âm thanh chỉ là phần thêm, trò chơi vẫn tiếp tục. */
  }
}

function celebrate(amount = 35, container = $("#celebration")) {
  if (reducedMotion) return;
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = ["♡", "✿", "✦", "♥", "·"][i % 5];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.color = ["#d65a82", "#af8fb5", "#7d9978", "#dfa75e"][i % 4];
    piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    piece.style.setProperty("--spin", `${Math.random() * 720 - 360}deg`);
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    container.append(piece);
    piece.addEventListener("animationend", () => piece.remove(), {
      once: true,
    });
  }
}

// Các hạt chỉ dùng transform/opacity và tự dọn khi kết thúc.
function scatterGiftPetals(x, y, container, amount = 32) {
  if (reducedMotion || !container) return;
  while (container.children.length > 90) container.firstElementChild.remove();
  const ring = document.createElement("span");
  ring.className = "gift-glow-ring";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  container.append(ring);
  ring.addEventListener("animationend", () => ring.remove(), { once: true });
  for (let i = 0; i < amount; i++) {
    const angle = (Math.PI * 2 * i) / amount + Math.random() * 0.3;
    const distance = 65 + Math.random() * Math.min(window.innerWidth * 0.5, 250);
    const particle = document.createElement("span");
    particle.className = i % 3 === 0 ? "gift-burst-spark" : "gift-burst-petal";
    if (i % 3 === 0) particle.textContent = i % 2 ? "✧" : "✿";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--petal-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--petal-y", `${Math.sin(angle) * distance - 70}px`);
    particle.style.setProperty("--petal-turn", `${Math.random() * 540 - 270}deg`);
    particle.style.setProperty("--petal-color", ["#d68ca5", "#e8b6c5", "#ceb7d7", "#e3bb8f"][i % 4]);
    particle.style.animationDelay = `${Math.random() * 0.12}s`;
    container.append(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }
}

// Nhạc nền tự phát; nếu trình duyệt chặn thì thử lại ở lần chạm đầu tiên.
const music = $("#background-music");
const musicStorageKey = "20-10-cu-chill-thoi";
let musicPlayRequest;
music.volume = 0.32;

try {
  const saved = JSON.parse(sessionStorage.getItem(musicStorageKey) || "null");
  if (Number.isFinite(saved?.time) && saved.time >= 0) {
    const restorePosition = () => {
      if (Number.isFinite(music.duration) && music.duration > 0) {
        music.currentTime = saved.time % music.duration;
      }
    };
    if (music.readyState >= 1) restorePosition();
    else
      music.addEventListener("loadedmetadata", restorePosition, { once: true });
  }
} catch {
  /* Không cần lưu trữ để nghe nhạc hoặc chơi. */
}

function startBackgroundMusic() {
  if (document.hidden || !music.paused || musicPlayRequest) return;
  musicPlayRequest = music
    .play()
    .catch(() => {
      /* Trình duyệt cần một cử chỉ; các sự kiện bên dưới sẽ thử lại. */
    })
    .finally(() => {
      musicPlayRequest = undefined;
    });
}

function rememberBackgroundMusic() {
  try {
    sessionStorage.setItem(
      musicStorageKey,
      JSON.stringify({ time: music.currentTime }),
    );
  } catch {
    /* Trình duyệt riêng tư có thể không cho lưu. */
  }
}

music.addEventListener("playing", () => {
  soundEnabled = true;
});
music.addEventListener("pause", () => {
  soundEnabled = false;
});
music.addEventListener("error", () => {
  soundEnabled = false;
});
for (const event of ["pointerdown", "click", "keydown", "touchend"]) {
  document.addEventListener(event, startBackgroundMusic, { passive: true });
}
window.addEventListener("pagehide", () => {
  rememberBackgroundMusic();
  music.pause();
});
window.addEventListener("pageshow", startBackgroundMusic);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    rememberBackgroundMusic();
    music.pause();
  } else startBackgroundMusic();
});
startBackgroundMusic();

// Khu vườn mở đầu: những nét chạm nở hoa rồi được gói thành bó quà.
function setupGiftOpening() {
  const opening = $("#gift-opening");
  if (!opening) return;
  const gather = $("#unwrap-gift");
  const storageKey = "20-10-nhu-nguyet-garden-opening-v1";
  let revealTimer;
  let dismissTimer;
  let gathering = false;
  let pageEffectsStarted = false;
  let hasDrawn = false;
  const garden = new window.GiftGarden($("#garden-canvas"), {
    reducedMotion,
    recipient: loveNote.name,
    onDraw: () => {
      if (hasDrawn) return;
      hasDrawn = true;
      opening.classList.add("garden-touched");
      opening.querySelector(".garden-paper-label").textContent = "Đúng rồi! Hoa nở theo tay bà đó ✿";
      $("#opening-hint").textContent = "Bà trồng thêm hoa, hoặc bấm Gói hoa khi ưng nha.";
    },
  });

  function revealPageEffects() {
    if (pageEffectsStarted || reducedMotion || !("IntersectionObserver" in window)) return;
    pageEffectsStarted = true;
    const notes = document.querySelectorAll(".wish-note");
    let remaining = notes.length;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("gift-note-visible");
        observer.unobserve(entry.target);
        if (--remaining === 0) observer.disconnect();
      });
    }, { threshold: 0.15 });
    notes.forEach((note) => {
      note.classList.add("gift-note-ready");
      observer.observe(note);
    });
    if (!remaining) observer.disconnect();
  }

  function finishOpening(instant = false) {
    if (!opening.open) return;
    clearTimeout(revealTimer);
    clearTimeout(dismissTimer);
    try { sessionStorage.setItem(storageKey, "true"); } catch { /* Không cần lưu trữ để nhận quà. */ }
    const close = () => {
      garden.stop();
      opening.close();
      document.documentElement.classList.remove("gift-opening-active");
      document.body.classList.add("gift-revealed");
      revealPageEffects();
      const next = $(".occasion-copy h1") || $(".welcome-copy h1");
      next?.focus({ preventScroll: true });
    };
    if (instant || reducedMotion) close();
    else {
      opening.classList.add("is-leaving");
      dismissTimer = setTimeout(close, 550);
    }
  }

  function showOpening() {
    if (document.querySelector("dialog[open]")) return;
    clearTimeout(revealTimer);
    clearTimeout(dismissTimer);
    gathering = false;
    hasDrawn = false;
    gather.disabled = false;
    gather.innerHTML = 'Gói hoa gửi bà <span aria-hidden="true">↗</span>';
    opening.classList.remove("is-gathering", "is-leaving", "garden-touched");
    $("#opening-title").textContent = `${loveNote.name} ơi,`;
    $("#opening-message").textContent = "Tui trồng một chút niềm vui cho bà nè.";
    $("#opening-hint").textContent = "Bà thử chạm vào vườn hoa phía trên nha ↑";
    opening.querySelector(".garden-paper-label").textContent = "Chạm hoặc kéo tay ở đây để hoa nở";
    document.body.classList.remove("gift-revealed");
    window.scrollTo({ top: 0, behavior: "instant" });
    document.documentElement.classList.add("gift-opening-active");
    opening.showModal();
    garden.start();
    $("#opening-title").focus({ preventScroll: true });
  }

  gather.addEventListener("click", () => {
    if (gathering) return;
    gathering = true;
    gather.disabled = true;
    gather.textContent = "Bó hoa này là của bà ✿";
    startBackgroundMusic();
    opening.classList.add("is-gathering");
    $("#opening-title").textContent = "20/10 vui vẻ nha!";
    $("#opening-message").textContent = `Mấy điều dễ thương vừa nở, tui gói lại gửi ${loveNote.name}.`;
    $("#opening-hint").textContent = "Một bó hoa từ những nét chạm của bà, chỉ có một thôi.";
    opening.querySelector(".garden-paper-label").textContent = "những bông hoa của riêng bà";
    garden.gather();
    chime([523, 659, 784]);
    if (reducedMotion) finishOpening(true);
    else revealTimer = setTimeout(() => finishOpening(), 2900);
  });
  $("#skip-opening").addEventListener("click", () => finishOpening(true));
  opening.addEventListener("cancel", (event) => {
    event.preventDefault();
    finishOpening(true);
  });
  opening.addEventListener("close", () => {
    if (opening.open) return;
    clearTimeout(revealTimer);
    clearTimeout(dismissTimer);
    garden.stop();
    document.documentElement.classList.remove("gift-opening-active");
  });
  window.addEventListener("pagehide", () => garden.stop());
  document.querySelectorAll("[data-replay-opening]").forEach((button) => button.addEventListener("click", showOpening));
  let seen = false;
  try { seen = sessionStorage.getItem(storageKey) === "true"; } catch { /* File cục bộ vẫn mở được khu vườn. */ }
  if (!seen) showOpening();
  else revealPageEffects();
}
setupGiftOpening();

if (document.body.dataset.page === "welcome") {
  $("#welcome-recipient").textContent =
    `CHỈ DÀNH RIÊNG CHO ${loveNote.name.toLocaleUpperCase("vi")}`;
  let secretIndex = 0;
  $("#secret-sticker").addEventListener("click", () => {
    const secrets = [
      "Bật mí nè: quà này có 100% thành phần bày trò cho bà vui ✿",
      "Bà vừa nhặt được một cái high-five bí mật nè 🖐️",
      "Đúng rồi, bà đang đọc đó. Tui nói bà xinh á!",
    ];
    notify(secrets[secretIndex++ % secrets.length]);
    celebrate(15);
  });
}

if (document.body.dataset.page === "journey") {
  const stageInfo = [
    {
      category: "20/10 · GHÉP MỘT NỤ CƯỜI",
      title: "Chúc bà ngày nào cũng có chuyện để cười.",
      description:
        "Ghép ảnh bé mèo cùng tui nha. Chạm hai mảnh bất kỳ để đổi chỗ, đủ 9 mảnh là xong nè.",
      tip: "Nhìn ảnh mẫu rồi chạm hai mảnh để đổi. Không tính giờ đâu bà ✿",
    },
    {
      category: "20/10 · GOM CHÚT NIỀM VUI",
      title: "Chúc bà gặp thiệt nhiều điều dễ thương.",
      description:
        "Lật 6 cặp sticker, gom chút niềm vui cho ngày của bà. Mấy bé quen mặt của bà đó!",
      tip: "Bí hả bà? Tui giấu một nút gợi ý ngay đây nè.",
    },
    {
      category: "20/10 · GẮP MỘT LỜI CHÚC",
      title: "Một bé gửi lời chúc, một thiệp gửi bà.",
      description:
        "Chọn cột rồi gắp một bé để mở thiệp 20/10 nha. Bà thích thì chơi thêm, mỗi bé còn mang một lời chúc riêng nè.",
      tip: "Gắp một bé là có thiệp. Mấy bé còn lại ở đây chờ bà chơi thêm nha ✿",
    },
  ];
  const completed = new Set();
  let currentStage = 0;
  let stageTimers = [];
  const area = $("#game-area");
  const dialog = $("#letter-dialog");
  let letterTimer;
  let letterFinished = false;
  let hasOpenedLetter = false;
  let gamesInitialized = false;
  const extraGames = $("#extra-games");
  let letterReturnTarget;
  $("#letter-title").textContent = `Gửi ${loveNote.name},`;
  $("#game-progress").setAttribute("aria-live", "polite");

  function later(action, delay) {
    const timer = setTimeout(action, delay);
    stageTimers.push(timer);
    return timer;
  }

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function updateMap() {
    document.querySelectorAll(".station").forEach((button, index) => {
      const isCurrent = index === currentStage;
      button.classList.toggle("active", isCurrent);
      button.classList.toggle("done", completed.has(index));
      button.disabled = false;
      button.querySelector(".station-check").textContent = completed.has(index)
        ? "✓"
        : "";
      if (isCurrent) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }

  function showCompletion() {
    const firstCompletion = !completed.has(currentStage);
    completed.add(currentStage);
    updateMap();
    const messages = [
      [
        "Một nụ cười nhỏ gửi bà nè!",
        "Tui chúc bà 20/10 thật vui, có chuyện gì cũng tìm được một lý do để cười nha.",
      ],
      [
        "Thêm một chút may mắn cho bà nè!",
        "Gom đủ niềm vui rồi. Chúc Như Nguyệt luôn gặp người dễ mến và những điều thiệt tốt nha!",
      ],
    ];
    $("#completion-title").textContent = messages[currentStage][0];
    $("#completion-description").textContent = messages[currentStage][1];
    $("#next-station").textContent = "Chơi trò khác →";
    $("#completion").hidden = false;
    $("#skip-station").hidden = true;
    if (firstCompletion) {
      celebrate();
      chime();
    }
  }

  function renderStage(index, focus = false) {
    stageTimers.forEach(clearTimeout);
    stageTimers = [];
    cancelClaw();
    currentStage = index;
    area.replaceChildren();
    $("#completion").hidden = true;
    $("#skip-station").hidden = false;
    area.hidden = index === 2;
    $("#final-note").hidden = index !== 2;
    const info = stageInfo[index];
    $("#game-category").textContent = info.category;
    $("#game-title").textContent = info.title;
    $("#game-description").textContent = info.description;
    $("#game-tip").textContent = info.tip;
    updateMap();
    if (index === 0) renderPuzzle();
    if (index === 1) renderMemory();
    if (index === 2) {
      if (!clawOrder.length) resetClaw();
      else updateClaw();
    }
    if (focus) {
      $("#game-title").focus({ preventScroll: true });
      $(".game-card").scrollIntoView({
        block: "start",
        behavior: reducedMotion ? "instant" : "smooth",
      });
    }
  }

  function renderPuzzle() {
    const photo = new URL("../puzzle-cat.webp", stickerBase).href;
    let pieces;
    let selected = null;
    let moves = 0;
    let hints = 2;
    let solved = false;
    const layout = document.createElement("div");
    layout.className = "puzzle-layout";
    layout.innerHTML = `
      <div class="puzzle-board" role="group" aria-label="Ghép ảnh bé mèo: 9 mảnh, chạm hai mảnh để đổi chỗ"></div>
      <div class="puzzle-guide">
        <figure class="puzzle-reference"><img src="${photo}" alt="Ảnh mẫu: bé mèo đeo chuông ngồi trên bậc thềm"><figcaption>ảnh gốc của bà nè ✿</figcaption></figure>
        <p class="puzzle-note handwritten">Ủa, ai xáo hình Cacao vậy?<br>Bà ghép lại giùm bé nha!</p>
        <div class="puzzle-tools"><button class="puzzle-help" type="button"></button><button class="text-button puzzle-shuffle" type="button">↻ Xáo lại hình</button></div>
        <span class="puzzle-moves" role="status"></span>
      </div>`;
    area.append(layout);
    const board = layout.querySelector(".puzzle-board");
    const help = layout.querySelector(".puzzle-help");
    const moveLabel = layout.querySelector(".puzzle-moves");
    const tiles = Array.from({ length: 9 }, (_, slot) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "puzzle-tile";
      const image = document.createElement("img");
      image.src = photo;
      image.alt = "";
      image.draggable = false;
      tile.append(image);
      tile.addEventListener("click", () => selectPiece(slot));
      board.append(tile);
      return tile;
    });

    function update() {
      const correct = pieces.filter((piece, slot) => piece === slot).length;
      tiles.forEach((tile, slot) => {
        const piece = pieces[slot];
        const isSelected = selected === slot;
        const isCorrect = piece === slot;
        tile.querySelector("img").style.left = `${-(piece % 3) * 100}%`;
        tile.querySelector("img").style.top =
          `${-Math.floor(piece / 3) * 100}%`;
        tile.classList.toggle("selected", isSelected);
        tile.classList.toggle("correct", isCorrect);
        tile.setAttribute("aria-pressed", String(isSelected));
        tile.setAttribute(
          "aria-label",
          `Mảnh ${piece + 1}, ô ${slot + 1}${isCorrect ? ", đúng vị trí" : ""}${isSelected ? ", đang chọn" : ""}`,
        );
        tile.disabled = solved;
      });
      board.classList.toggle("solved", solved);
      layout.querySelector(".puzzle-note").innerHTML = solved
        ? "Ghép xong hình Cacao rồi nè!<br>Cảm ơn bà nha ✿"
        : "Ủa, ai xáo hình Cacao vậy?<br>Bà ghép lại giùm bé nha!";
      $("#game-progress").textContent = `${correct} / 9 mảnh đúng`;
      moveLabel.textContent = `${moves} lượt đổi · ${correct === 9 ? "Xịn ghê bà ơi!" : "Viền xanh là đúng chỗ nè"}`;
      help.textContent = `✧ Tui giúp 1 mảnh (${hints})`;
      help.disabled = solved || hints === 0;
    }

    function checkWin() {
      solved = pieces.every((piece, slot) => piece === slot);
      selected = null;
      update();
      if (solved) {
        $("#game-tip").textContent =
          "Ghép xong rồi! Bà qua trạm sticker xem mấy bé tiếp nha ✿";
        showCompletion();
        $("#next-station").focus({ preventScroll: true });
      }
    }

    function selectPiece(slot) {
      if (solved) return;
      if (selected === slot) {
        selected = null;
        update();
        return;
      }
      if (selected === null) {
        selected = slot;
        update();
        chime([520]);
        return;
      }
      [pieces[selected], pieces[slot]] = [pieces[slot], pieces[selected]];
      moves++;
      chime([600, 740]);
      checkWin();
      if (!solved) tiles[slot].focus({ preventScroll: true });
    }

    function mix() {
      do {
        pieces = shuffle(Array.from({ length: 9 }, (_, index) => index));
      } while (pieces.filter((piece, slot) => piece === slot).length > 2);
      selected = null;
      moves = 0;
      hints = 2;
      solved = false;
      $("#completion").hidden = true;
      $("#skip-station").hidden = false;
      $("#game-tip").textContent = stageInfo[0].tip;
      update();
    }

    help.addEventListener("click", () => {
      if (solved || hints === 0) return;
      const target = pieces.findIndex((piece, slot) => piece !== slot);
      const source = pieces.indexOf(target);
      [pieces[target], pieces[source]] = [pieces[source], pieces[target]];
      hints--;
      moves++;
      chime([660, 880]);
      notify("Tui đặt giúp một mảnh rồi. Bà nhìn viền xanh nha ✿");
      checkWin();
    });
    layout.querySelector(".puzzle-shuffle").addEventListener("click", () => {
      mix();
      notify("Xáo lại nè bà. Ghép từ từ cũng được nha!");
    });
    mix();
  }

  function renderMemory() {
    const deck = shuffle([...petStickers, ...petStickers]);
    const matches = new Set();
    let revealed = [];
    let busy = false;
    let moves = 0;
    let hints = 2;
    const board = document.createElement("div");
    board.className = "memory-board";
    board.setAttribute("role", "group");
    board.setAttribute(
      "aria-label",
      "12 thẻ sticker thú cưng, tìm 6 cặp giống nhau",
    );
    // Nạp trước sticker để hình xuất hiện ngay khi lật thẻ hoặc dùng gợi ý.
    petStickers.forEach((sticker) => {
      const image = new Image();
      image.src = sticker.src;
    });
    const cards = deck.map((sticker, index) => {
      const card = document.createElement("button");
      card.className = "memory-card";
      card.addEventListener("click", () => flip(index));
      board.append(card);
      return card;
    });
    const actions = document.createElement("div");
    actions.className = "memory-actions";
    const moveLabel = document.createElement("span");
    const hint = document.createElement("button");
    hint.type = "button";
    actions.append(moveLabel, hint);
    area.append(board, actions);

    function updateCards(peek = false) {
      cards.forEach((card, index) => {
        const matched = matches.has(index);
        const visible = peek || matched || revealed.includes(index);
        card.classList.toggle("revealed", visible);
        card.classList.toggle("matched", matched);
        const sticker = deck[index];
        card.replaceChildren();
        if (visible) {
          const image = document.createElement("img");
          image.className = "memory-sticker";
          image.src = sticker.src;
          image.alt = sticker.label;
          image.draggable = false;
          card.append(image);
        } else {
          const back = document.createElement("span");
          back.className = "card-back";
          back.textContent = "♡";
          back.setAttribute("aria-hidden", "true");
          card.append(back);
        }
        card.setAttribute(
          "aria-label",
          visible
            ? `${sticker.label}${matched ? ", đã tìm thấy cặp" : ""}`
            : `Thẻ úp ${index + 1}`,
        );
        card.disabled = busy || matched || revealed.includes(index);
      });
      hint.textContent = `✧ Nhìn lén 2 giây (${hints})`;
      hint.disabled =
        busy || hints === 0 || matches.size === deck.length || revealed.length > 0;
      moveLabel.textContent = `${moves} lượt lật`;
      $("#game-progress").textContent = `${matches.size / 2} / ${deck.length / 2} cặp thẻ`;
    }

    function flip(index) {
      if (busy || matches.has(index) || revealed.includes(index)) return;
      revealed.push(index);
      chime([480]);
      if (revealed.length === 2) {
        moves++;
        const [first, second] = revealed;
        if (deck[first] === deck[second]) {
          matches.add(first);
          matches.add(second);
          revealed = [];
          chime([660, 880]);
          if (matches.size === deck.length) {
            showCompletion();
            $("#next-station").focus({ preventScroll: true });
          }
        } else {
          busy = true;
          later(() => {
            busy = false;
            revealed = [];
            updateCards();
          }, 950);
        }
      }
      updateCards();
    }

    hint.addEventListener("click", () => {
      if (busy || hints === 0 || revealed.length > 0) return;
      hints--;
      busy = true;
      updateCards(true);
      notify("Tui cho bà nhìn lén nè. Nhớ vị trí nha! ✧");
      later(() => {
        busy = false;
        updateCards();
        hint.focus({ preventScroll: true });
      }, 2000);
    });
    updateCards();
  }

  // Mỗi sticker đi kèm một lời nhắn; đủ sáu lượt là nhận đủ cả bộ.
  const moodPrizes = [
    {
      title: "Bình tĩnh sống nha bà",
      message:
        "Việc nào khó quá thì uống miếng nước đã. Tui với bé cún này tin là bà xử đẹp được hết!",
    },
    {
      title: "Phiếu nghỉ xả hơi",
      message:
        "Hợp lệ cho một buổi nằm dài không thấy có lỗi. Deadline để xíu, mình ngáp một cái trước nha bà.",
    },
    {
      title: "Lật ngược chuyện xui",
      message:
        "Ngày nào hơi ngược đời thì mình đổi góc nhìn. Biết đâu chuyện vui đang trốn ngay cạnh đó nè.",
    },
    {
      title: "Hôm nay bà hơi bị xịn",
      message:
        "Không cần dịp đặc biệt mới được tự hào về mình. Làm tới đây rồi là bà giỏi hơn bà nghĩ đó!",
    },
    {
      title: "Bật chế độ bảo vệ mood",
      message:
        "Mấy chuyện làm bà tụt mood xin mời đứng ngoài cái loa này. Bên trong chỉ nhận đồ ngon với lời dễ nghe thôi!",
    },
    {
      title: "Một ngày toàn chuyện vui",
      message:
        "Chúc bà mở mắt gặp tin tốt, ra đường gặp đèn xanh, gọi món có ngay món mình thích. Vậy là đủ đã rồi ha!",
    },
  ].map((prize, index) => ({ ...prize, sticker: petStickers[index] }));
  let clawOrder = [];
  const caughtPrizes = new Set();
  let clawColumn = 1;
  let clawBusy = false;
  let clawTimers = [];
  let clawRun = 0;
  const clawWindow = $("#claw-window");
  const clawDrop = $("#claw-drop");
  const clawHeld = $("#claw-held");

  function scrollRewardTo(element, center = false) {
    const item = element.getBoundingClientRect();
    const position = window.scrollY + item.top;
    let top;
    if (center) top = position - (window.innerHeight - item.height) / 2;
    else if (item.bottom > window.innerHeight - 20)
      top = position + item.height - window.innerHeight + 20;
    else if (item.top < 20) top = position - 20;
    else return;
    window.scrollTo({ top, behavior: reducedMotion ? "instant" : "smooth" });
  }

  function columnPrizes(column) {
    return clawOrder
      .map((prize, position) => ({ prize, position }))
      .filter(
        ({ prize, position }) =>
          position % 3 === column && !caughtPrizes.has(prize),
      );
  }

  function updateClaw() {
    clawWindow.style.setProperty("--claw-x", `${[18, 50, 82][clawColumn]}%`);
    $("#claw-count").textContent = `${caughtPrizes.size} / 6 bé`;
    if (currentStage === 2)
      $("#game-progress").textContent = `${caughtPrizes.size} / 6 bé đã gắp`;
    $("#collection-count").textContent =
      caughtPrizes.size === 6
        ? "Đủ hội rồi nè ✿"
        : `Còn ${6 - caughtPrizes.size} bé đang chờ`;
    $("#arcade-complete").hidden = caughtPrizes.size === 0;
    $("#grab-more").textContent =
      caughtPrizes.size === 6 ? "Đọc lại thiệp ✿" : "Gắp thêm một bé ↗";
    const laneContainer = $("#claw-lanes");
    laneContainer.replaceChildren();
    for (let column = 0; column < 3; column++) {
      const lane = document.createElement("button");
      lane.type = "button";
      lane.className = "claw-lane";
      lane.setAttribute(
        "aria-label",
        `Chọn cột ${column + 1}, còn ${columnPrizes(column).length} bé`,
      );
      lane.setAttribute("aria-pressed", String(clawColumn === column));
      lane.disabled = clawBusy || caughtPrizes.size === 6;
      [column, column + 3].forEach((position) => {
        const prize = clawOrder[position];
        const slot = document.createElement("span");
        slot.className = "claw-toy";
        slot.dataset.prize = String(prize);
        if (caughtPrizes.has(prize)) {
          slot.classList.add("empty");
          slot.textContent = "✧";
        } else {
          const image = document.createElement("img");
          image.src = moodPrizes[prize].sticker.src;
          image.alt = moodPrizes[prize].sticker.label;
          image.draggable = false;
          slot.append(image);
        }
        lane.append(slot);
      });
      lane.addEventListener("click", () => {
        clawColumn = column;
        updateClaw();
        $("#claw-lanes").children[column].focus({ preventScroll: true });
      });
      laneContainer.append(lane);
    }
    clawDrop.disabled = clawBusy || columnPrizes(clawColumn).length === 0;
    clawDrop.textContent = clawBusy
      ? "Đang gắp nè…"
      : caughtPrizes.size === 6
        ? "Đủ cả hội rồi! ✿"
        : "Gắp một bé! ↓";
    $("#claw-left").disabled =
      clawBusy || clawColumn === 0 || caughtPrizes.size === 6;
    $("#claw-right").disabled =
      clawBusy || clawColumn === 2 || caughtPrizes.size === 6;
    const collection = $("#collection-slots");
    collection.replaceChildren();
    moodPrizes.forEach((prize, index) => {
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "collection-pet";
      slot.disabled = !caughtPrizes.has(index) || clawBusy;
      if (caughtPrizes.has(index)) {
        const image = document.createElement("img");
        image.src = prize.sticker.src;
        image.alt = prize.sticker.label;
        slot.append(image);
        slot.setAttribute("aria-label", `Đọc lại quà: ${prize.title}`);
        slot.addEventListener("click", () => revealPrize(index, false));
      } else {
        slot.textContent = "?";
        slot.setAttribute("aria-label", `Quà bí mật ${index + 1}, chưa gắp`);
      }
      collection.append(slot);
    });
  }

  function cancelClaw() {
    const wasBusy = clawBusy;
    clawRun++;
    clawTimers.forEach(clearTimeout);
    clawTimers = [];
    clawBusy = false;
    clawWindow.style.setProperty("--cable", "30px");
    clawHeld.hidden = true;
    $("#finale-confetti").replaceChildren();
    if (clawOrder.length) updateClaw();
    if (wasBusy)
      $("#claw-status").textContent =
        "Máy đang chờ bà nè. Chọn cột rồi gắp tiếp nha.";
  }

  function resetClaw() {
    cancelClaw();
    caughtPrizes.clear();
    completed.delete(2);
    updateMap();
    clawOrder = shuffle([0, 1, 2, 3, 4, 5]);
    clawColumn = 1;
    $("#prize-ticket").hidden = true;
    $("#prize-placeholder").hidden = false;
    $("#claw-status").textContent =
      "Chạm cột để chọn, hoặc dùng hai nút mũi tên nha.";
    updateClaw();
  }

  function revealPrize(index, focus = true) {
    const prize = moodPrizes[index];
    $("#prize-placeholder").hidden = true;
    $("#prize-ticket").hidden = false;
    $("#prize-image").src = prize.sticker.src;
    $("#prize-image").alt = prize.sticker.label;
    $("#prize-title").textContent = prize.title;
    $("#prize-message").textContent = prize.message;
    $("#save-sticker").href = new URL(
      `stickers/${prize.sticker.id}.png`,
      giftBase,
    ).href;
    $("#save-sticker").download = `sticker-${prize.sticker.id}-nhu-nguyet.png`;
    if (focus) $("#prize-title").focus({ preventScroll: true });
    scrollRewardTo($("#prize-ticket"));
  }

  function grabPrize() {
    const target = columnPrizes(clawColumn)[0];
    if (clawBusy || !target) return;
    const { prize } = target;
    const run = ++clawRun;
    clawBusy = true;
    updateClaw();
    $("#claw-status").textContent = "Từ từ nha… tui đang gắp một bé cho bà!";
    function at(delay, action) {
      clawTimers.push(
        setTimeout(() => {
          if (run === clawRun && extraGames.open && currentStage === 2 && !$("#final-note").hidden)
            action();
        }, delay),
      );
    }
    function deliver() {
      const firstCatch = caughtPrizes.size === 0;
      caughtPrizes.add(prize);
      clawBusy = false;
      clawHeld.hidden = true;
      clawWindow.style.setProperty("--cable", "30px");
      if (columnPrizes(clawColumn).length === 0 && caughtPrizes.size < 6) {
        clawColumn = [0, 1, 2].find(
          (column) => columnPrizes(column).length > 0,
        );
      }
      updateClaw();
      revealPrize(prize);
      if (firstCatch) {
        completed.add(2);
        updateMap();
      }
      $("#claw-status").textContent =
        caughtPrizes.size === 6
          ? "Đủ hội rồi! Chúc bà 20/10 vui thiệt vui nha. Cả bộ sticker là của bà nè!"
          : "Một bé, một lời chúc 20/10 tới bà nè. Thiệp tui viết cũng ở ngay dưới nha!";
      celebrate(caughtPrizes.size === 6 ? 65 : 25, $("#finale-confetti"));
      chime([523, 659, 784, 1047]);
      if (firstCatch && !hasOpenedLetter) openLetter();
    }
    if (reducedMotion) {
      deliver();
      return;
    }
    const toy = clawWindow.querySelector(`[data-prize="${prize}"]`);
    const toyBounds = toy.getBoundingClientRect();
    const windowBounds = clawWindow.getBoundingClientRect();
    const cableDepth = Math.max(30, toyBounds.top - windowBounds.top + toyBounds.height * 0.5 - 60);
    clawWindow.style.setProperty("--cable", `${cableDepth}px`);
    chime([440, 520]);
    at(700, () => {
      clawWindow
        .querySelector(`[data-prize="${prize}"]`)
        .classList.add("lifting");
      clawHeld.src = moodPrizes[prize].sticker.src;
      clawHeld.hidden = false;
      clawWindow.style.setProperty("--cable", "30px");
    });
    at(1400, () => {
      clawWindow.style.setProperty("--claw-x", "88%");
      $("#claw-status").textContent = "Có quà rồi, mang về túi bà đây…";
    });
    at(2100, deliver);
  }

  $("#claw-drop").addEventListener("click", grabPrize);
  $("#claw-left").addEventListener("click", () => {
    if (!clawBusy && clawColumn > 0) {
      clawColumn--;
      updateClaw();
    }
  });
  $("#claw-right").addEventListener("click", () => {
    if (!clawBusy && clawColumn < 2) {
      clawColumn++;
      updateClaw();
    }
  });
  $("#reset-claw").addEventListener("click", resetClaw);
  $("#grab-more").addEventListener("click", () => {
    if (caughtPrizes.size === 6) {
      openLetter();
      return;
    }
    scrollRewardTo($(".claw-machine"));
    clawDrop.focus({ preventScroll: true });
  });

  function finishLetter() {
    clearTimeout(letterTimer);
    letterFinished = true;
    $("#letter-text").textContent = loveNote.letter;
    $("#read-all").hidden = true;
    $("#letter-sign").hidden = false;
  }

  function openLetter() {
    if (dialog.open) return;
    hasOpenedLetter = true;
    $("#open-letter").textContent = "Đọc lại thiệp tui gửi ✿";
    letterReturnTarget = currentStage === 2 && caughtPrizes.size > 0
      ? $("#open-letter") : $("#read-greeting");
    clearTimeout(letterTimer);
    dialog.showModal();
    dialog.scrollTop = 0;
    if (letterFinished || reducedMotion) finishLetter();
    else {
      $("#letter-text").textContent = "";
      $("#read-all").hidden = false;
      $("#letter-sign").hidden = true;
      const characters = Array.from(loveNote.letter);
      let position = 0;
      function type() {
        if (!dialog.open) return;
        position = Math.min(position + 2, characters.length);
        $("#letter-text").textContent = characters.slice(0, position).join("");
        if (position < characters.length) letterTimer = setTimeout(type, 30);
        else finishLetter();
      }
      type();
    }
    celebrate(45, $("#letter-confetti"));
  }

  $("#read-greeting").addEventListener("click", openLetter);
  $("#open-letter").addEventListener("click", openLetter);
  $("#read-all").addEventListener("click", finishLetter);
  $("#close-letter").addEventListener("click", () => dialog.close());
  $("#finish-letter").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    clearTimeout(letterTimer);
    $("#letter-confetti").replaceChildren();
    if (letterReturnTarget && !letterReturnTarget.closest("[hidden]")) {
      letterReturnTarget.focus({ preventScroll: true });
      scrollRewardTo(letterReturnTarget);
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  document
    .querySelectorAll(".station")
    .forEach((button, index) =>
      button.addEventListener("click", () => renderStage(index, true)),
    );
  $("#skip-station").addEventListener("click", () => renderStage((currentStage + 1) % 3, true));
  $("#next-station").addEventListener("click", () => renderStage((currentStage + 1) % 3, true));
  $("#restart").addEventListener("click", () => {
    completed.clear();
    resetClaw();
    renderStage(0, true);
    notify("Chơi thêm chút cùng mấy bé nha bà. Chúc bà một ngày 20/10 thiệt vui ✿");
  });
  $("#back-to-memory").addEventListener("click", () => renderStage(1, true));
  extraGames.addEventListener("toggle", () => {
    if (extraGames.open && !gamesInitialized) {
      renderStage(0);
      gamesInitialized = true;
    } else if (!extraGames.open) cancelClaw();
  });
  $("#back-to-gift").addEventListener("click", () => {
    extraGames.open = false;
    $("#read-greeting").focus({ preventScroll: true });
    $(".occasion-card").scrollIntoView({ block: "start", behavior: reducedMotion ? "instant" : "smooth" });
  });
  if (window.location.hash === "#letter") {
    const opening = $("#gift-opening");
    if (opening.open) opening.addEventListener("close", openLetter, { once: true });
    else openLetter();
  }
  const flowerWishes = [
    "Bà nhận hoa rồi nha! Chúc Như Nguyệt 20/10 được cưng chiều một chút ✿",
    "Thêm một bông lấy hên: mong mấy điều bà đang chờ sớm thành tin vui!",
    "Hoa này không cần tưới đâu, bà nhớ uống nước với chăm mình là được nè ✿",
  ];
  let flowerIndex = 0;
  $("#receive-flowers").addEventListener("click", () => {
    $("#flower-reply").textContent = flowerWishes[flowerIndex++ % flowerWishes.length];
    $("#receive-flowers").classList.add("flowers-received");
    const bouquet = $("#receive-flowers").getBoundingClientRect();
    scatterGiftPetals(bouquet.left + bouquet.width / 2, bouquet.top + bouquet.height * 0.4, $("#celebration"), 28);
    celebrate(12);
    chime([523, 659, 784]);
  });
}
