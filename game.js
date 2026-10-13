(() => {
  "use strict";

  const canvas = document.querySelector("#arena");
  const context = canvas.getContext("2d");
  const playerHealthBar = document.querySelector("#player-health");
  const cpuHealthBar = document.querySelector("#cpu-health");
  const message = document.querySelector("#round-message");
  const messageTitle = document.querySelector("#message-title");
  const messageDetail = document.querySelector("#message-detail");
  const keys = new Set();
  const width = canvas.width;
  const height = canvas.height;
  const floor = 438;
  const gravity = 0.68;
  let roundOver = false;
  let hasStarted = false;
  let frame = 0;

  const createFighter = (options) => ({
    ...options,
    y: floor,
    velocityX: 0,
    velocityY: 0,
    health: 100,
    attackTimer: 0,
    attackCooldown: 0,
    attackHit: false,
    hurtTimer: 0,
    facing: options.facing,
    onGround: true,
  });

  const player = createFighter({
    x: 290,
    facing: 1,
    body: "#25a8b0",
    light: "#75e0d3",
    dark: "#15556c",
    accent: "#ffcf71",
    skin: "#eab78d",
    name: "ASTRA",
  });

  const cpu = createFighter({
    x: 670,
    facing: -1,
    body: "#bd5d45",
    light: "#f6a966",
    dark: "#663a4c",
    accent: "#f0d079",
    skin: "#b77a61",
    name: "BRONT",
  });

  const roundedRect = (ctx, x, y, w, h, radius) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  };

  function drawBackground() {
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#293951");
    sky.addColorStop(0.55, "#7d7785");
    sky.addColorStop(1, "#edaa75");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    const sun = context.createRadialGradient(695, 145, 10, 695, 145, 130);
    sun.addColorStop(0, "rgb(255 222 160 / 78%)");
    sun.addColorStop(1, "rgb(255 222 160 / 0%)");
    context.fillStyle = sun;
    context.fillRect(535, 0, 320, 280);
    context.fillStyle = "#f3cf9b";
    context.beginPath();
    context.arc(695, 145, 48, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#4b5267";
    const skyline = [
      [0, 242, 85, 196], [75, 205, 106, 233], [172, 256, 75, 182],
      [245, 221, 119, 217], [352, 264, 82, 174], [424, 190, 110, 248],
      [525, 240, 80, 198], [595, 214, 120, 224], [704, 249, 84, 189],
      [780, 192, 100, 246], [870, 231, 90, 207],
    ];
    skyline.forEach(([x, y, w, h], index) => {
      context.fillStyle = index % 2 ? "#434c63" : "#51586d";
      context.fillRect(x, y, w, h);
      context.fillStyle = "rgb(250 206 146 / 22%)";
      for (let wx = x + 12; wx < x + w - 8; wx += 22) {
        for (let wy = y + 16; wy < floor - 24; wy += 28) {
          if ((wx + wy + index * 13) % 3 !== 0) context.fillRect(wx, wy, 7, 9);
        }
      }
    });

    context.fillStyle = "#222c3e";
    context.fillRect(0, floor, width, height - floor);
    context.fillStyle = "#414b5c";
    context.fillRect(0, floor, width, 7);
    context.strokeStyle = "rgb(202 211 218 / 12%)";
    context.lineWidth = 1;
    for (let x = -160; x <= width + 160; x += 80) {
      context.beginPath();
      context.moveTo(width / 2 + (x - width / 2) * 0.15, floor + 7);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = floor + 38; y < height; y += 34) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    context.fillStyle = "rgb(247 203 140 / 15%)";
    context.fillRect(0, floor - 4, width, 4);
  }

  function drawFighter(fighter) {
    const { x, y, facing, body, light, dark, accent, skin } = fighter;
    const moving = Math.abs(fighter.velocityX) > 0.2 && fighter.onGround;
    const bob = moving ? Math.sin(frame * 0.22) * 3 : 0;
    const attacking = fighter.attackTimer > 0;
    const hitFlash = fighter.hurtTimer > 0 && Math.floor(frame / 3) % 2 === 0;

    context.save();
    context.translate(x, y);
    context.scale(facing, 1);

    context.fillStyle = "rgb(8 12 20 / 34%)";
    context.beginPath();
    context.ellipse(0, 0, fighter.onGround ? 34 : 23, 7, 0, 0, Math.PI * 2);
    context.fill();

    const legSwing = moving ? Math.sin(frame * 0.22) * 10 : 0;
    context.fillStyle = dark;
    context.save();
    context.translate(-10, -34 + bob);
    context.rotate((moving ? -legSwing : 0) * Math.PI / 180);
    roundedRect(context, -8, -12, 15, 35, 6);
    context.fillStyle = accent;
    roundedRect(context, -8, 12, 16, 5, 2);
    context.fillStyle = "#18202e";
    roundedRect(context, -10, 18, 23, 8, 4);
    context.restore();

    context.fillStyle = dark;
    context.save();
    context.translate(10, -34 + bob);
    context.rotate((moving ? legSwing : 0) * Math.PI / 180);
    roundedRect(context, -7, -12, 15, 35, 6);
    context.fillStyle = accent;
    roundedRect(context, -7, 12, 15, 5, 2);
    context.fillStyle = "#18202e";
    roundedRect(context, -3, 18, 22, 8, 4);
    context.restore();

    context.fillStyle = hitFlash ? "#fff7d8" : body;
    context.beginPath();
    context.moveTo(-19, -76 + bob);
    context.lineTo(17, -76 + bob);
    context.lineTo(22, -39 + bob);
    context.lineTo(0, -31 + bob);
    context.lineTo(-22, -39 + bob);
    context.closePath();
    context.fill();
    context.fillStyle = light;
    context.beginPath();
    context.moveTo(-16, -72 + bob);
    context.lineTo(-4, -68 + bob);
    context.lineTo(-1, -40 + bob);
    context.lineTo(-16, -43 + bob);
    context.closePath();
    context.fill();
    context.fillStyle = accent;
    context.fillRect(-19, -43 + bob, 38, 6);
    context.fillStyle = dark;
    roundedRect(context, -22, -82 + bob, 44, 12, 5);

    context.fillStyle = dark;
    context.beginPath();
    context.moveTo(-20, -72 + bob);
    context.lineTo(-32, -52 + bob);
    context.lineTo(-24, -37 + bob);
    context.lineTo(-15, -44 + bob);
    context.lineTo(-13, -62 + bob);
    context.closePath();
    context.fill();

    const armExtension = attacking ? Math.max(0, 30 - fighter.attackTimer * 2.7) : 0;
    context.fillStyle = hitFlash ? "#fff7d8" : body;
    context.save();
    context.translate(15, -69 + bob);
    context.rotate(attacking ? -0.16 : moving ? Math.sin(frame * 0.22) * 0.08 : 0.04);
    roundedRect(context, -1, -3, 17 + armExtension, 12, 6);
    context.fillStyle = accent;
    context.beginPath();
    context.arc(17 + armExtension, 3, 7, 0, Math.PI * 2);
    context.fill();
    context.restore();

    context.fillStyle = skin;
    context.beginPath();
    context.arc(0, -91 + bob, 14, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = dark;
    context.beginPath();
    context.moveTo(-14, -93 + bob);
    context.quadraticCurveTo(-9, -111 + bob, 8, -105 + bob);
    context.lineTo(15, -96 + bob);
    context.lineTo(4, -97 + bob);
    context.lineTo(-3, -90 + bob);
    context.lineTo(-14, -89 + bob);
    context.closePath();
    context.fill();
    context.fillStyle = "#1b2532";
    context.fillRect(3, -94 + bob, 7, 2);
    context.fillStyle = light;
    context.beginPath();
    context.moveTo(-8, -87 + bob);
    context.lineTo(-20, -80 + bob);
    context.lineTo(-15, -74 + bob);
    context.lineTo(-3, -82 + bob);
    context.closePath();
    context.fill();

    if (attacking && fighter.attackTimer > 5 && fighter.attackTimer < 13) {
      context.strokeStyle = `rgb(255 230 164 / ${Math.min(0.8, fighter.attackTimer / 15)})`;
      context.lineWidth = 5;
      context.beginPath();
      context.arc(22, -67 + bob, 31, -0.9, 0.65);
      context.stroke();
    }
    context.restore();

    context.fillStyle = "rgb(14 20 30 / 72%)";
    context.font = "700 12px 'DM Sans', sans-serif";
    context.textAlign = "center";
    context.fillText(fighter.name, x, y - (fighter.onGround ? 130 : 145));
  }

  function updateHealth() {
    playerHealthBar.style.width = `${Math.max(0, player.health)}%`;
    cpuHealthBar.style.width = `${Math.max(0, cpu.health)}%`;
    playerHealthBar.parentElement.setAttribute("aria-label", `Astra health: ${Math.ceil(player.health)} percent`);
    cpuHealthBar.parentElement.setAttribute("aria-label", `Bront health: ${Math.ceil(cpu.health)} percent`);
  }

  function beginRound() {
    if (hasStarted || roundOver) return;
    hasStarted = true;
    message.classList.add("is-hidden");
  }

  function attack(fighter) {
    if (roundOver || fighter.attackCooldown > 0 || fighter.attackTimer > 0) return;
    beginRound();
    fighter.attackTimer = 16;
    fighter.attackCooldown = 32;
    fighter.attackHit = false;
  }

  function landHit(attacker, defender) {
    if (attacker.attackHit || attacker.attackTimer !== 8) return;
    attacker.attackHit = true;
    const distance = Math.abs(attacker.x - defender.x);
    if (distance > 96 || Math.abs(attacker.y - defender.y) > 76) return;

    defender.health = Math.max(0, defender.health - 11);
    defender.hurtTimer = 12;
    defender.velocityX = attacker.facing * 7;
    if (defender.onGround) defender.velocityY = -3.2;
    updateHealth();

    if (defender.health <= 0) finishRound(attacker);
  }

  function finishRound(winner) {
    roundOver = true;
    messageTitle.textContent = `${winner.name} WINS`;
    messageDetail.textContent = "Press restart to duel again";
    message.classList.remove("is-hidden");
  }

  function resetRound() {
    Object.assign(player, {
      x: 290, y: floor, velocityX: 0, velocityY: 0, health: 100,
      attackTimer: 0, attackCooldown: 0, attackHit: false, hurtTimer: 0,
      facing: 1, onGround: true,
    });
    Object.assign(cpu, {
      x: 670, y: floor, velocityX: 0, velocityY: 0, health: 100,
      attackTimer: 0, attackCooldown: 0, attackHit: false, hurtTimer: 0,
      facing: -1, onGround: true,
    });
    roundOver = false;
    hasStarted = false;
    keys.clear();
    updateHealth();
    messageTitle.textContent = "READY?";
    messageDetail.textContent = "Press any move to begin";
    message.classList.remove("is-hidden");
  }

  function updateFighterPhysics(fighter) {
    fighter.x += fighter.velocityX;
    fighter.velocityX *= fighter.onGround ? 0.72 : 0.96;
    fighter.velocityY += gravity;
    fighter.y += fighter.velocityY;
    if (fighter.y >= floor) {
      fighter.y = floor;
      fighter.velocityY = 0;
      fighter.onGround = true;
    } else {
      fighter.onGround = false;
    }
    fighter.x = Math.max(46, Math.min(width - 46, fighter.x));
    if (fighter.attackTimer > 0) fighter.attackTimer -= 1;
    if (fighter.attackCooldown > 0) fighter.attackCooldown -= 1;
    if (fighter.hurtTimer > 0) fighter.hurtTimer -= 1;
  }

  function updatePlayer() {
    if (keys.has("a")) {
      player.velocityX = -4.2;
      beginRound();
    } else if (keys.has("d")) {
      player.velocityX = 4.2;
      beginRound();
    }
    if (keys.has("w") && player.onGround) {
      player.velocityY = -13.2;
      player.onGround = false;
      beginRound();
    }
    if (keys.has("f")) attack(player);
  }

  function updateCpu() {
    if (roundOver) return;
    const distance = cpu.x - player.x;
    cpu.facing = distance >= 0 ? -1 : 1;
    if (Math.abs(distance) > 76) {
      cpu.velocityX = distance > 0 ? -2.05 : 2.05;
    } else {
      cpu.velocityX *= 0.65;
      if (cpu.attackCooldown === 0 && frame % 34 === 0) attack(cpu);
    }
  }

  function render() {
    drawBackground();
    drawFighter(player);
    drawFighter(cpu);
    context.fillStyle = "rgb(255 255 255 / 10%)";
    context.fillRect(width / 2 - 1, floor - 22, 2, 14);
  }

  function loop() {
    frame += 1;
    if (!roundOver) {
      updatePlayer();
      updateCpu();
      player.facing = player.x <= cpu.x ? 1 : -1;
      cpu.facing = cpu.x >= player.x ? -1 : 1;
      updateFighterPhysics(player);
      updateFighterPhysics(cpu);
      landHit(player, cpu);
      landHit(cpu, player);
    } else {
      updateFighterPhysics(player);
      updateFighterPhysics(cpu);
    }
    render();
    window.requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["a", "d", "w", "f"].includes(key)) {
      event.preventDefault();
      keys.add(key);
    }
    if (key === "r") resetRound();
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });

  window.addEventListener("blur", () => keys.clear());

  document.querySelectorAll("[data-key]").forEach((button) => {
    const key = button.dataset.key;
    const release = (event) => {
      event.preventDefault();
      keys.delete(key);
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      keys.add(key);
      if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("contextmenu", (event) => event.preventDefault());
  });

  document.querySelector("#reset").addEventListener("click", resetRound);
  updateHealth();
  loop();
})();
