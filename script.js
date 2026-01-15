const EVENT = {
  title: "Aniversário de 1 ano da Aurora — Jardim Encantado",
  description: "Save the Date — Aurora 1 aninho 🌸🦋\nEm breve enviaremos o convite completo com endereço e detalhes.",
  location: "Em breve (endereço no convite oficial)",
  start: { y: 2026, m: 3, d: 7, hh: 15, mm: 0 },
  end:   { y: 2026, m: 3, d: 7, hh: 18, mm: 0 },
  tzid: "America/Sao_Paulo",
};

function pad(n){ return String(n).padStart(2, "0"); }
function formatICSDateLocal({y,m,d,hh,mm}) { return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`; }
function escapeICS(text){
  return String(text).replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
}
function download(filename, content){
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function buildGoogleCalendarLink(){
  const start = formatICSDateLocal(EVENT.start);
  const end = formatICSDateLocal(EVENT.end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT.title,
    details: EVENT.description,
    location: EVENT.location,
    dates: `${start}/${end}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildICS(){
  const dtstamp = new Date().toISOString().replace(/[-:]/g,"").split(".")[0] + "Z";
  const uid = `aurora-1ano-${Date.now()}@save-the-date`;
  const dtstart = formatICSDateLocal(EVENT.start);
  const dtend = formatICSDateLocal(EVENT.end);

  return [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Save the Date Aurora//PT-BR","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${EVENT.tzid}:${dtstart}`,
    `DTEND;TZID=${EVENT.tzid}:${dtend}`,
    `SUMMARY:${escapeICS(EVENT.title)}`,
    `DESCRIPTION:${escapeICS(EVENT.description)}`,
    `LOCATION:${escapeICS(EVENT.location)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

// ✅ Google Forms (já configurado com seus entry.XXXX)
const GOOGLE_FORM_ACTION_URL =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLSeA4i7LuCyT376DQhiU8QAE_yQwWy1RTh1AOl4lykE1k9I7NA/formResponse";

const GOOGLE_FORM_ENTRIES = {
  name: "entry.1471763489",
  guests: "entry.803896320",
  msg: "entry.1078376100"
};

// ✅ Seu WhatsApp
const WHATSAPP_NUMBER = "5521998687264";

const btnGoogleCal = document.getElementById("btnGoogleCal");
const btnICS = document.getElementById("btnICS");
const btnCopy = document.getElementById("btnCopy");
const btnWhatsapp = document.getElementById("btnWhatsapp");

btnGoogleCal.href = buildGoogleCalendarLink();

btnICS.addEventListener("click", () => {
  download("Save-the-Date-Aurora.ics", buildICS());
});

btnCopy.addEventListener("click", async () => {
  try{
    await navigator.clipboard.writeText(window.location.href);
    toast("Link copiado! ✨");
  }catch{
    toast("Não consegui copiar automaticamente. Copie o link do navegador 💛");
  }
});

btnWhatsapp.href = (() => {
  const txt =
`Olá! Confirmo presença no 1 aninho da Aurora 🌸🦋
📅 07/03/2026
🕒 15h
👤 Nome:
👥 Quantidade:`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(txt)}`;
})();

const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("formStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Enviando... 🧚‍♀️";

  const data = {
    name: form.name.value.trim(),
    guests: form.guests.value,
    msg: form.msg.value.trim()
  };

  try{
    const fd = new FormData();
    fd.append(GOOGLE_FORM_ENTRIES.name, data.name);
    fd.append(GOOGLE_FORM_ENTRIES.guests, data.guests);
    fd.append(GOOGLE_FORM_ENTRIES.msg, data.msg);

    await fetch(GOOGLE_FORM_ACTION_URL, {
      method: "POST",
      mode: "no-cors",
      body: fd
    });

    statusEl.textContent = "Presença confirmada! Obrigada 💖🌷";
    form.reset();
  }catch{
    statusEl.textContent = "Ops! Não consegui enviar. Tente pelo WhatsApp 💛";
  }
});

function toast(msg){
  statusEl.textContent = msg;
  setTimeout(() => {
    if(statusEl.textContent === msg) statusEl.textContent = "";
  }, 3500);
}
