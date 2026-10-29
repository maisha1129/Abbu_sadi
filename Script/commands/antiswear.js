// antiswear.js v2 — গালি দিলে ওয়ার্নিং, ৩ বার হলে অটো কিক
// ভাষা: বাংলা, Banglish, Hindi/Urdu (Roman + দেবনাগরী), English
// ব্যবহার: {p}antiswear on | off | list | reset | add | remove | max | test | admin | check | words
// বটকে গ্রুপের অ্যাডমিন হতে হবে, নাহলে কিক কাজ করবে না।

const DEFAULT_MAX_WARN = 3;
console.log("[antiswear] v5 loaded");

// ============ ১) পুরো শব্দ মিললে ধরবে ============
const BAD_WORDS = [
  // ---- বাংলা ----
  "মাগি","মাগী","মাগির","মাগীর","মাগিরপো","মাগিরপোলা","মাগির পোলা","মাগির ছেলে","মাগিবাজ","মাগীবাজ",
  "খানকি","খানকী","খাংকি","খাঙ্কি","খানকির","খানকিরপোলা","খানকির পোলা","খানকির ছেলে","খানকির বাচ্চা","খানকিমাগি",
  "চুদি","চুদা","চোদা","চুদে","চোদে","চুদির","চুদিরভাই","চুদির ভাই","চুদমারানি","চুদমারানির","চুদবো","চুদবি","চোদবো","চোদবি",
  "চোদন","চোদনা","চোদনখোর","চোদাচুদি","চুদাচুদি","চুদানি","চুদানির","চুদাইয়া","চোদাইয়া","চুদুনি",
  "বোকাচোদা","বোকাচুদা","বোকাচোদ","মাদারচোদ","মাদারচুদ","বাইনচোদ","বাইঞ্চোদ","বোনচোদ","বেনচোদ","বাপচোদা","মাকে চুদি","মায়েরে চুদি",
  "হারামি","হারামী","হারামজাদা","হারামজাদি","হারামজাদী","হারামখোর","হারামির বাচ্চা","হারামির পোলা","হারামির ছেলে",
  "বেশ্যা","বেশ্যার","বেশ্যাপাড়া","বেশ্যার বাচ্চা","বেশ্যার ছেলে","বেশ্যা মাগি","রান্ডি","রান্ডী","রান্ড","রাণ্ডি",
  "শুয়োর","শুয়োরের","শুয়োরের বাচ্চা","শুয়োরের পোলা","শুওর","সুয়োর","সুয়োরের বাচ্চা",
  "কুত্তা","কুত্তার","কুত্তি","কুত্তী","কুত্তির","কুত্তার বাচ্চা","কুত্তারবাচ্চা","কুকুরের বাচ্চা","কুত্তিমাগি",
  "বেজন্মা","জারজ","জারজের বাচ্চা","বাস্টার্ড","নষ্টা","নষ্টের বাচ্চা","বেহায়া মাগি",
  "বাল","বালের","বালছাল","বালপাকনা","বালে","বাল ছাল","বালের ছেলে",
  "গুদ","গুদে","গুদের","গুদি","গুদমারানি","গুদমারানী","গুদের পানি",
  "পোদ","পোঁদ","পোদে","পোঁদে","পোদের","পোঁদের","পুটকি","পুটকির","পুটকিমারানি","পুটকি মারানি",
  "ধোন","ধন চোষ","ধোনচোষা","লিঙ্গ চোষা","ধোন চুষ","গান্ডু","গাণ্ডু","গান্ডুর","ঘুদ","ঘুদি",
  "মাকিচুদা","মাকিচোদা","আবাল চোদা","আবালচোদা","তোর মা","তোর মারে","তোর মায়েরে","তোর বাপেরে","তোর বাপ","তোর বোন","তোর বোনরে",
  "মাতারি","মাতারির","ভোদা","ভোদার","ভোদাই খাঙ্কি","চুতিয়া","চুতমারানি","চুতের","চুত",
  "থুতু খাইয়া","মুখে মুতি","মুতে দিমু","পাছা মারানি","পাছায় নে","পাছায় ঢুকা",
  "নাঙ মারানি",
  // ---- Banglish ----
  "magi","magir","magirpola","magir pola","magirchele","magir chele","magibaz","magibaj","maggi re","maaagi","mag1",
  "khanki","khankir","khankirpola","khankir pola","khankir chele","khankir baccha","khanky","khankee","khankimagi","khanki magi","khanke",
  "chudi","chudir","chudirbhai","chudir bhai","chudmarani","chudmarani","chudbo","chudbi","chudte","chudi","chudachudi","chuda","chudani","chudanir","chudamarani",
  "chodna","choda","chodbo","chodbi","chodachudi","chodon","chodonkhor","chodan","chodani",
  "bokachoda","bokachuda","bokachod","bokachud","bokacoda","madarchod","madarchud","maderchod","madarchoud","madarchodh","madar chod",
  "bhenchod","behenchod","bhenchud","benchod","bonchod","bainchod","baincho","bapchoda","bap choda","bhen ke","bhosdike","bhosdi","bhosda","bhosdika",
  "haramjada","haramzada","haramjadi","haramzadi","haramir","haramirbaccha","harami","haramkhor","haramikhor","haramir baccha","haramir pola",
  "shuor","shuorer","shuorerbaccha","shuorer baccha","shuorer pola","suor","suorer","suorer baccha","shuar","shuar ka bachha",
  "kuttar baccha","kuttarbaccha","kuttir baccha","kutta","kuttar","kutta magi","kukurer baccha","kukur er baccha",
  "beshsha","beshya","beshyar","beshyar baccha","randi","randir","rondi","randir pola","randir baccha","randi magi",
  "bejonma","bejanma","jarojer","jarojer baccha","bastard","bastaad",
  "bal","baal","bl","blaer","bler","balar","blar","baler","balchal","balpakna","bal er","baler chele","baler pola",
  "guder","gudmarani","gudmarani",
  "pode","poder","putki","putkir","putkimarani","putki marani","putkimarani","puti marani","podmarani","pod marani",
  "dhon chosha","dhon chush","dhonchosa","dhoncosa","gandu","gaandu","gandur","gand marani","gandmarani","gand mara",
  "makichoda","makichuda","abalchoda","abal choda","abalchuda",
  "tor ma","tor mare","tor maye","tor mayre","tor mayere","tor baper","tor bap","tor bon","tor bonre","tor mar","tor mayer","tor mayer bhoda",
  "tor mar bhoda","tor mar gud","tor ma ke chudi","maye chudi","mare chudi","mayere chudi","mayer bhoda","mar bhoda","mar gud",
  "voda","bhoda","bhodar","vodar","bhodai khanki","vodai","chutiya","chutiye","chutia","chutmarani","chutmarani","chut","chuter",
  "nang marani","nangmarani","nangmarani",
  "mutbo","muter","mutbi","mukhe muti","mukhe mutbo","muthe dimu",
  "saala haramzada","sala haramjada","sala harami","sala kutta","sala shuor","sala bokachoda","sala madarchod",
  // ---- Hindi / Urdu (Roman) ----
  "lund","lauda","lavda","lavde","loda","lode","lund ke","lundchoos","lund choos","lundfakir","bhosdiwala","bhosdiwale","bhosdchod","bhosad",
  "chutiya","chutiye","chutiyapa","chut","chutad","chutmarike","chut ke","gaand","gaandfat","gaand mara","gandmara","gandu","gaandu",
  "randi","raand","randwa","randi ka","randi ke","raandi","bhadwa","bhadwe","bhadva","bhadve","bhadwi","bhadwagiri",
  "kamina","kamine","kamini","kaminey","kutiye","kutta","kuttey","kutte ki","kutte ka","kutte ke","kuttiya",
  "harami","haramkhor","haramzada","haramzadi","haramzade","madarchod","madarchodh","maderchod","behenchod","bhenchod","behnchod","bhenchodh","bahenchod","bkl","bsdk","mkc","mc","bc","mcbc","bhosdk",
  "jhatu","jhaatu","jhant","jhaant","jhantu","hijda","hijde","chakka","chakke","launda","launde","lavdi","lavdey",
  "maa ki chut","maa ki aankh","maa chod","maachod","maa ka bhosda","maa ka bhosdaa","teri maa","teri maa ki","teri behen","teri behen ki","teri ma ki",
  "gaandmasti","gandmasti","tmkc","tmkx","bhosri","bhosdi","bhosdike","bhosdika","bhosdiki","bhosadike","bhosadi","bhosadchod","bhonsdi",
  // ---- Hindi (দেবনাগরী) ----
  "मादरचोद","मादरचोदा","बहनचोद","बहनचोदा","भोसड़ीके","भोसड़ी","भोसड़ा","भोसडीके","चूतिया","चुतिया","चूत","चुत","लंड","लौड़ा","लौडा","लौड़े","गांडू","गांड","रंडी","रांड","हरामी","हरामज़ादा","हरामजादा","हरामखोर","कमीना","कमीने","भड़वा","भड़वे","कुत्ता","कुत्ते","कुतिया","कुत्ती","झाटू","साले हरामी","तेरी माँ","तेरी मां","तेरी बहन","मां की चूत","माँ की चूत",
  // ---- English ----
  "fuck","fucked","fucker","fuckers","fuckin","fucking","fuckup","fuckface","fuckhead","fuckwit","motherfucker","motherfuckers","motherfucking","mofo","fck","fuk","fuking","fuker","fuq","fvck","phuck","phuk",
  "bitch","bitches","bitchy","biatch","biotch","b1tch","son of a bitch","sonofabitch",
  "bastard","bastards","asshole","assholes","arsehole","asshat","asswipe","dumbass","jackass","badass dick","fatass","smartass","dipshit","dickhead","dick","dicks","dickface","cock","cocks","cocksucker","cocksuckers","cock sucker","dildo",
  "pussy","pussies","cunt","cunts","twat","twats","slut","sluts","slutty","whore","whores","hooker","skank",
  "shit","shits","shitty","shitting","shithead","shitface","shitbag","bullshit","horseshit","dogshit","chickenshit",
  "wanker","wankers","tosser","prick","pricks","douche","douchebag","douchebags","blowjob","blow job","handjob","hand job","rimjob","cumshot","cumslut","cumming","jizz",
  "nigga","niggas","nigger","niggers","niga","nigg3r","faggot","faggots","fag","fags","dyke","tranny","retard","retarded","spic","chink","gook","kike","wetback","coon","paki","raghead","towelhead",
  "motherless","go fuck yourself","fuck you","fuck off","fuck u","fuk u","fck u","eat shit","suck my dick","suck my cock","kiss my ass",
  "kys","kill yourself","die bitch","rapist","pedo","pedophile","paedo","pornhub","xvideos","xnxx","xhamster","sex video","sex chat","send nudes",
];

// ============ ২) শব্দের শুরু মিললেই ধরবে (অ্যাডভান্সড) ============
// Latin টোকেন repeated-letter collapse করা অবস্থায় মেলানো হয়
const PREFIX_ROOTS = [
  "madarchod","maderchod","madarchud","bhenchod","behenchod","benchod","bhenchud","bonchod","bainchod","bokachod","bokachud",
  "khanki","khankir","khanky","magir","magirp","chudi","chudb","chudm","chudan","chudt","chodn","chodb","chodi","chodar","chodan",
  "haramj","haramz","haramir","shuor","suor","kuttarb","kuttirb","bhosd","bhosr","bhosad","chutiy","chutia","chutm","laund","lavd","gandu","gaandu",
  "fuck","bitch","cunt","motherf","cocksuck","dickhead","asshole","bullshit","jackass","dumbass",
];
const PREFIX_RE_BN = [
  /চুদ/u,               // চুদ… যেকোনো জায়গায়
  /চোদ(?!্দ)/u,         // চোদ… (চোদ্দ = ১৪ বাদ)
  /^খানকি|^খানকী|^খাংকি|^খাঙ্কি/u,
  /^মাদারচোদ|^বোনচোদ|^বাইনচোদ|^বেনচোদ|^বাইঞ্চোদ|^বোকাচোদ/u,
  /^হারামজাদ|^হারামি|^হারামী|^হারামখোর/u,
  /^শুয়োর|^শুওর|^সুয়োর/u,
  /^বেশ্য/u,
  /^রান্ড|^রাণ্ড/u,
  /^গুদম|^গুদি/u,
  /^বালছাল|^বালের|^বালপাক/u,
  /^পুটকি/u,
  /^মাগি|^মাগী/u,
  /^চুতমারানি|^চুতিয়া/u,
  /^মাদারচোদ|^बहनचोद/u,
  /मादरचोद|बहनचोद|भोसड|चूतिया|चुतिया/u,
];

// ============ ৩) ভুলে ধরা এড়াতে — এগুলো কখনো গালি ধরবে না ============
const SAFE_WORDS = new Set([
  "চোদ্দ","চোদ্দটা","চোদ্দশো","চোদ্দ","গুদাম","গুদামে","গুদামঘর","বালক","বালিকা","বালি","বালতি","বাংলা","বালিশ","হারাম","পোদ্দার",
  "maggi","maggie","ball","balls","bally","ballet","balli","kuti","kutir","chudidar","churidar","fukushima","chodhury","chowdhury","choudhury","assam","assist","assistant","class","classic","pass","passport","grass","glass",
  "cockpit","cocktail","peacock","hancock","shitake","shiitake","scunthorpe","analysis","analyst","analog","cumin","document","circumstance",
  "bitcoin","hello","shell","dickens","dickson","sussex","essex","middlesex","penistone","pussycat","raping","grape","drape","therapist",
]);

// ============ ৪) মাস্ক করা গালি (f*ck, b!tch, f**k) ============
const MASK_WORDS = [
  "fuck","fucker","fucking","motherfucker","bitch","shit","cunt","pussy","dick","asshole","bastard","whore","slut",
  "madarchod","bhenchod","behenchod","chutiya","harami","khanki","magi","bokachoda","lund","randi","gandu",
];

// ================== হেল্পার ==================
function clean(text) {
  return String(text || "").toLowerCase().normalize("NFC").replace(/[\u200b-\u200d\u2060\ufeff]/g, "");
}
function leet(t) {
  return t.replace(/@/g, "a").replace(/\$/g, "s").replace(/0/g, "o").replace(/1|!|\|/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/5/g, "s");
}
function prep(text) {
  return leet(clean(text)).replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
const cz = (s) => s.replace(/([a-z])\1+/g, "$1"); // fuuuck -> fuck

function buildSets(list) {
  const single = new Set();
  const phrases = [];
  for (const w of list) {
    const p = prep(w);
    if (!p) continue;
    if (p.includes(" ")) phrases.push(cz(p));
    else single.add(cz(p));
  }
  return { single, phrases };
}
const STATIC = buildSets(BAD_WORDS);
const ROOTS = PREFIX_ROOTS.map((r) => cz(prep(r)));

function checkToken(t, single, raw, allow) {
  if (!t || SAFE_WORDS.has(t) || (raw && SAFE_WORDS.has(raw))) return null;
  if (allow && (allow.has(t) || (raw && allow.has(raw)))) return null;
  if (single.has(t)) return t;
  for (const r of ROOTS) if (t.startsWith(r)) return t;
  for (const re of PREFIX_RE_BN) if (re.test(t)) return t;
  return null;
}

function containsBad(text, extraWords = [], allowWords = []) {
  const allow = new Set(allowWords.map((w) => cz(prep(w))));
  const norm = prep(text);
  if (!norm) return null;

  const extra = extraWords.length ? buildSets(extraWords) : null;
  const single = extra ? new Set([...STATIC.single, ...extra.single]) : STATIC.single;
  const phrases = extra ? [...STATIC.phrases, ...extra.phrases] : STATIC.phrases;

  const rawToks = norm.split(" ");
  const toks = rawToks.map(cz);

  // ১) শব্দ / শব্দের শুরু
  for (let i = 0; i < toks.length; i++) {
    const hit = checkToken(toks[i], single, rawToks[i], allow);
    if (hit) return hit;
  }

  // ২) একাধিক শব্দের গালি
  const padded = " " + toks.join(" ") + " ";
  for (const p of phrases) if (padded.includes(" " + p + " ")) return p;

  // ৩) অক্ষর আলাদা করে লিখলে: f u c k / f.u.c.k / চু দি
  const spaced = clean(text).match(/(?<![\p{L}\p{M}])(?:\p{L}[\s.\-_*]+){3,}\p{L}(?![\p{L}\p{M}])/gu) || [];
  for (const m of spaced) {
    const joined = cz(prep(m.replace(/[^\p{L}\p{M}]/gu, "")));
    for (let i = 0; i <= joined.length - 3; i++) {
      const hit = checkToken(joined.slice(i), single, undefined, allow);
      if (hit) return hit;
    }
  }

  // ৪) মাস্ক করা: f*ck, f**k, b!tch
  for (const raw of clean(text).split(/\s+/)) {
    const t = raw.replace(/^[^\p{L}*#]+|[^\p{L}*#]+$/gu, "");
    if (!/[*#]/.test(t) || !/^[\p{L}*#]+$/u.test(t)) continue;
    if ((t.match(/\p{L}/gu) || []).length < 2 || t.length < 4) continue;
    const re = new RegExp("^" + t.replace(/[*#]/g, "\\p{L}") + "$", "u");
    for (const w of MASK_WORDS) if (re.test(w)) return w;
  }
  return null;
}

// ================== API হেল্পার ==================
function callApi(fn) {
  return new Promise((resolve, reject) => {
    let done = false;
    const cb = (err) => {
      if (done) return;
      done = true;
      err ? reject(err) : resolve();
    };
    try {
      const r = fn(cb);
      if (r && typeof r.then === "function") r.then(() => cb(), cb);
    } catch (e) {
      cb(e);
    }
    setTimeout(() => cb(), 15000);
  });
}

async function getRank(threadsData, threadID, senderID, role) {
  const cfgAdmins = ((global.GoatBot && global.GoatBot.config && global.GoatBot.config.adminBot) || []).map(String);
  const isBotAdmin = cfgAdmins.includes(String(senderID)) || role >= 2;
  let isGroupAdmin = role === 1;
  try {
    const ids = (await threadsData.get(threadID, "adminIDs")) || [];
    if (ids.some((a) => String((a && a.id) || a) === String(senderID))) isGroupAdmin = true;
  } catch (e) {}
  return { isBotAdmin, isGroupAdmin };
}

module.exports = {
  config: {
    name: "antiswear",
    aliases: ["antigali", "noswear"],
    version: "5.0",
    author: "Zihad",
    countDown: 3,
    role: 0, // 0 রাখতে হবে, নাহলে GoatBot সাধারণ মেম্বারের মেসেজে onChat চালায় না
    description: { en: "Warn & auto-kick members who use bad words (Bangla, Banglish, Hindi, English)" },
    category: "box chat",
    guide: {
      en: "{pn} on | off | list | reset (reply/tag) | add <word> | remove <word> | max <number> | allow/unallow <word> | admin on/off | test on/off | check <text> | words",
    },
  },

  onStart: async function ({ message, event, args, threadsData, role }) {
    const { threadID, senderID, messageReply, mentions } = event;
    const sub = (args[0] || "").toLowerCase();
    const data = (await threadsData.get(threadID, "data.antiswear")) || {};
    const rank0 = await getRank(threadsData, threadID, senderID, role);
    if (!rank0.isBotAdmin && !rank0.isGroupAdmin) return message.reply("⛔ এই কমান্ড শুধু গ্রুপ অ্যাডমিনরা ব্যবহার করতে পারবে।");
    const max = data.max || DEFAULT_MAX_WARN;
    const save = () => threadsData.set(threadID, data, "data.antiswear");

    if (sub === "on" || sub === "off") {
      data.enabled = sub === "on";
      await save();
      return message.reply(
        data.enabled ? `✅ Anti-Swear চালু। গালি দিলে ওয়ার্নিং, ${max} বার হলে কিক।` : "❌ Anti-Swear বন্ধ করা হলো।"
      );
    }

    if (sub === "admin") {
      data.punishAdmins = (args[1] || "").toLowerCase() === "on";
      await save();
      return message.reply(
        data.punishAdmins !== false
          ? "✅ গ্রুপ অ্যাডমিনরাও গালি দিলে ওয়ার্নিং/কিক হবে (বট অ্যাডমিন বাদ)। কিক করতে বট আগে তাকে অ্যাডমিন থেকে নামাবে।"
          : "✅ গ্রুপ অ্যাডমিনরা বাদ থাকবে (শুধু সাধারণ মেম্বার কিক হবে)।"
      );
    }

    if (sub === "test") {
      data.test = (args[1] || "").toLowerCase() === "on";
      await save();
      return message.reply(
        data.test
          ? "🧪 টেস্ট মোড চালু: কেউ গালি লিখলে বট জানাবে ধরা পড়েছে কিনা ও প্রেরক কে। কাউকে ওয়ার্নিং/কিক করবে না। শেষে অবশ্যই antiswear test off দিন।"
          : "🧪 টেস্ট মোড বন্ধ।"
      );
    }

    if (sub === "check") {
      const text = args.slice(1).join(" ") || (messageReply && messageReply.body) || "";
      if (!text) return message.reply("লিখুন: antiswear check <লেখা> অথবা কোনো মেসেজে রিপ্লাই দিয়ে check দিন।");
      const hit = containsBad(text, data.extra || [], data.allow || []);
      const rank = await getRank(threadsData, threadID, senderID, role);
      return message.reply(
        `🔎 গালি: ${hit ? "ধরা পড়েছে (" + hit + ")" : "ধরা পড়েনি"}\n` +
          `⚙️ Anti-Swear: ${data.enabled ? "ON" : "OFF"}\n` +
          `👤 আপনি: ${rank.isBotAdmin ? "বট অ্যাডমিন" : rank.isGroupAdmin ? "গ্রুপ অ্যাডমিন" : "সাধারণ মেম্বার"}\n` +
          `🛡️ অ্যাডমিন পানিশ: ${data.punishAdmins !== false ? "ON" : "OFF"} | টেস্ট: ${data.test ? "ON" : "OFF"}`
      );
    }

    if (sub === "list") {
      const warns = (await threadsData.get(threadID, "data.swearWarns")) || {};
      const entries = Object.entries(warns).filter(([, n]) => n > 0);
      if (!entries.length) return message.reply("কারও ওয়ার্নিং নেই।");
      return message.reply("⚠️ ওয়ার্নিং লিস্ট:\n" + entries.map(([uid, n]) => `• ${uid} → ${n}/${max}`).join("\n"));
    }

    if (sub === "reset") {
      const warns = (await threadsData.get(threadID, "data.swearWarns")) || {};
      const targets = messageReply ? [messageReply.senderID] : Object.keys(mentions || {});
      if (!targets.length) return message.reply("যার ওয়ার্নিং রিসেট করবেন তাকে ট্যাগ করুন বা তার মেসেজে রিপ্লাই দিন।");
      for (const uid of targets) delete warns[uid];
      await threadsData.set(threadID, warns, "data.swearWarns");
      return message.reply("✅ ওয়ার্নিং রিসেট হয়েছে।");
    }

    if (sub === "add") {
      const word = args.slice(1).join(" ").trim().toLowerCase();
      if (!word) return message.reply("কোন শব্দ যোগ করবেন লিখুন। যেমন: antiswear add শব্দ");
      data.extra = Array.from(new Set([...(data.extra || []), word]));
      await save();
      return message.reply(`✅ "${word}" লিস্টে যোগ হয়েছে।`);
    }

    if (sub === "remove" || sub === "del") {
      const word = args.slice(1).join(" ").trim().toLowerCase();
      data.extra = (data.extra || []).filter((w) => w !== word);
      await save();
      return message.reply(`✅ "${word}" লিস্ট থেকে সরানো হয়েছে (নিজের যোগ করা শব্দ)।`);
    }

    if (sub === "allow") {
      const word = args.slice(1).join(" ").trim().toLowerCase();
      if (!word) return message.reply("লিখুন: antiswear allow <শব্দ> (এই গ্রুপে ওই শব্দ আর গালি ধরা হবে না)");
      data.allow = Array.from(new Set([...(data.allow || []), word]));
      await save();
      return message.reply(`✅ ${word} এই গ্রুপে এখন থেকে অনুমোদিত।`);
    }

    if (sub === "unallow") {
      const word = args.slice(1).join(" ").trim().toLowerCase();
      data.allow = (data.allow || []).filter((w) => w !== word);
      await save();
      return message.reply(`✅ ${word} আবার নিষিদ্ধ করা হলো।`);
    }

    if (sub === "max") {
      const n = parseInt(args[1]);
      if (!n || n < 1 || n > 20) return message.reply("১ থেকে ২০ এর মধ্যে সংখ্যা দিন। যেমন: antiswear max 3");
      data.max = n;
      await save();
      return message.reply(`✅ এখন থেকে ${n} বার গালি দিলে কিক হবে।`);
    }

    if (sub === "words") {
      return message.reply(
        `📚 মোট গালির শব্দ: ${BAD_WORDS.length}+ (বাংলা, Banglish, Hindi, English)\n➕ আপনার যোগ করা: ${(data.extra || []).length}`
      );
    }

    return message.reply(
      `Anti-Swear: ${data.enabled ? "ON ✅" : "OFF ❌"} | সর্বোচ্চ ওয়ার্নিং: ${max}\n\n` +
        "• antiswear on / off\n• antiswear check <লেখা>\n• antiswear admin on / off\n• antiswear test on / off\n• antiswear list\n• antiswear reset (reply/tag)\n• antiswear add / remove <word>\n• antiswear max <number>\n• antiswear words"
    );
  },

  onChat: async function ({ event, api, message, threadsData, usersData, role }) {
    try {
      const { threadID, senderID, body } = event;
      if (!body || !threadID || !senderID) return;

      const data = await threadsData.get(threadID, "data.antiswear");
      if (!data || !data.enabled) return;

      const botID = String(api.getCurrentUserID());
      if (String(senderID) === botID) return;

      const hit = containsBad(body, data.extra || [], data.allow || []);
      if (!hit) return;

      const { isBotAdmin, isGroupAdmin } = await getRank(threadsData, threadID, senderID, role);
      console.log("[antiswear] hit:", hit, "| sender:", senderID, "| botAdmin:", isBotAdmin, "| groupAdmin:", isGroupAdmin);

      const exempt = isBotAdmin || (isGroupAdmin && data.punishAdmins === false);

      if (data.test) {
        return message.reply(
          "🧪 টেস্ট: গালি ধরা পড়েছে (" + hit + ")\n👤 প্রেরক: " +
            (isBotAdmin ? "বট অ্যাডমিন" : isGroupAdmin ? "গ্রুপ অ্যাডমিন" : "সাধারণ মেম্বার") +
            "\n⚙️ সাধারণ মোডে: " + (exempt ? "বাদ পড়ত (ওয়ার্নিং/কিক হতো না)" : "ওয়ার্নিং/কিক হতো")
        );
      }

      if (exempt) return;

      const max = data.max || DEFAULT_MAX_WARN;
      const warns = (await threadsData.get(threadID, "data.swearWarns")) || {};
      warns[senderID] = (warns[senderID] || 0) + 1;
      const count = warns[senderID];
      await threadsData.set(threadID, warns, "data.swearWarns");

      let name = "Member";
      try {
        name = (await usersData.getName(senderID)) || name;
      } catch (e) {}

      if (count < max) {
        return message.reply({
          body: `⚠️ ${name}, খারাপ ভাষা ব্যবহার করবেন না!\nওয়ার্নিং: ${count}/${max}\n${max} বার হলে গ্রুপ থেকে কিক করা হবে।`,
          mentions: [{ tag: name, id: senderID }],
        });
      }

      // কিক
      try {
        if (isGroupAdmin) await callApi((cb) => api.changeAdminStatus(threadID, senderID, false, cb));
        await callApi((cb) => api.removeUserFromGroup(senderID, threadID, cb));
        delete warns[senderID];
        await threadsData.set(threadID, warns, "data.swearWarns");
        return message.send(`🚫 ${name} ${max} বার গালি দেওয়ায় গ্রুপ থেকে কিক করা হলো।`);
      } catch (e) {
        console.error("[antiswear] kick failed:", e);
        return message.send(
          `🚫 ${name} এর ${max} বার ওয়ার্নিং হয়েছে, কিন্তু কিক করতে পারিনি।\nবটকে গ্রুপের অ্যাডমিন বানান।`
        );
      }
    } catch (err) {
      console.error("[antiswear]", err);
    }
  },
};
