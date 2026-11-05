const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { execSync } = require("child_process");

// ================= সেটিংস =================
const MIN_FREE_MB = 500;   // ডিস্কে এর কম খালি থাকলে সবচেয়ে পুরনো (পিন না করা) মেমোরি অটো মুছে জায়গা বানাবে
const AUTO_CLEAN = false;  // false = অটো মুছবে না, জায়গা শেষ হলে শুধু নতুন ফাইল সেভ বন্ধ করবে
const MAX_FILE_MB = 0;     // একটা ফাইলের সর্বোচ্চ সাইজ (0 = কোনো লিমিট নেই)
const SEND_CHUNK = 5;      // get করার সময় একসাথে কয়টা ফাইল পাঠাবে
// ==========================================

const ROOT = path.join(__dirname, "cache", "memory");
const EXT = { photo: "jpg", video: "mp4", audio: "mp3", animated_image: "gif", sticker: "png" };
const ICON = { photo: "🖼", video: "🎬", audio: "🎵", animated_image: "🎞", sticker: "🏷", file: "📎" };

const udir = uid => path.join(ROOT, String(uid));
const ufile = uid => path.join(udir(uid), "data.json");

function loadUser(uid) {
	fs.ensureDirSync(udir(uid));
	try { const d = fs.readJsonSync(ufile(uid)); if (d && d.items) return d; } catch (e) {}
	return { next: 1, items: [] };
}
function saveUser(uid, box) { fs.ensureDirSync(udir(uid)); fs.writeJsonSync(ufile(uid), box); }
function allUsers() {
	fs.ensureDirSync(ROOT);
	return fs.readdirSync(ROOT).filter(n => fs.existsSync(path.join(ROOT, n, "data.json")));
}

// পুরনো v1 (memory.json) থেকে অটো মাইগ্রেট
(function migrate() {
	try {
		const old = path.join(ROOT, "memory.json");
		if (!fs.existsSync(old)) return;
		const db = fs.readJsonSync(old);
		for (const uid of Object.keys(db)) {
			fs.ensureDirSync(udir(uid));
			for (const m of db[uid].items || [])
				for (const f of m.files || []) {
					const src = path.join(ROOT, f.file);
					if (fs.existsSync(src)) fs.moveSync(src, path.join(udir(uid), f.file), { overwrite: true });
				}
			saveUser(uid, db[uid]);
		}
		fs.moveSync(old, old + ".migrated", { overwrite: true });
	} catch (e) {}
})();

function freeBytes() {
	try { fs.ensureDirSync(ROOT); const s = fs.statfsSync(ROOT); return s.bavail * s.bsize; } catch (e) {}
	try {
		const o = execSync(`df -k "${ROOT}" | tail -1`).toString().trim().split(/\s+/);
		return parseInt(o[3]) * 1024;
	} catch (e) { return Infinity; }
}
function sizeOfItem(uid, m) {
	let s = 0;
	for (const f of m.files || []) { try { s += fs.statSync(path.join(udir(uid), f.file)).size; } catch (e) {} }
	return s;
}
const mb = b => (b / 1048576).toFixed(b > 1e8 ? 0 : 1) + " MB";
const fmtTime = t => new Date(t).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", hour12: true });
const getExt = a => (a.filename && a.filename.includes(".")) ? a.filename.split(".").pop().slice(0, 5) : (EXT[a.type] || "bin");

// জায়গা কম হলে সবচেয়ে পুরনো (পিন না করা) মেমোরি মুছে দেয়
function ensureSpace() {
	const need = MIN_FREE_MB * 1048576;
	if (freeBytes() >= need) return { ok: true, freed: 0 };
	if (!AUTO_CLEAN) return { ok: false, freed: 0 };
	let pool = [];
	for (const uid of allUsers()) {
		const box = loadUser(uid);
		for (const m of box.items) if (!m.pinned && m.files.length) pool.push({ uid, id: m.id, time: m.time });
	}
	pool.sort((a, b) => a.time - b.time);
	let freed = 0;
	for (const p of pool) {
		if (freeBytes() >= need) break;
		const box = loadUser(p.uid);
		const i = box.items.findIndex(x => x.id === p.id);
		if (i < 0) continue;
		freed += sizeOfItem(p.uid, box.items[i]);
		for (const f of box.items[i].files) fs.removeSync(path.join(udir(p.uid), f.file));
		box.items.splice(i, 1);
		saveUser(p.uid, box);
	}
	return { ok: freeBytes() >= need, freed };
}

// ফাইল সরাসরি ডিস্কে স্ট্রিম করে (RAM ভরে না, বড় ভিডিওও চলবে)
async function download(url, dest) {
	const res = await axios.get(url, { responseType: "stream", timeout: 0, maxContentLength: Infinity, maxBodyLength: Infinity });
	if (MAX_FILE_MB > 0) {
		const len = parseInt(res.headers["content-length"] || 0);
		if (len > MAX_FILE_MB * 1048576) { res.data.destroy(); throw new Error("too big"); }
	}
	await new Promise((ok, no) => {
		const w = fs.createWriteStream(dest);
		res.data.pipe(w);
		w.on("finish", ok); w.on("error", no); res.data.on("error", no);
	});
}

module.exports = {
	config: {
		name: "memory",
		aliases: ["mem", "save", "vault"],
		version: "2.0",
		author: "Zihad",
		countDown: 3,
		role: 0,
		shortDescription: { en: "Unlimited-style memory: text, photos, videos, audio, files" },
		longDescription: { en: "Big personal memory box with auto space management. Save any text, photo, video, audio or file." },
		category: "utility",
		guide: {
			en: "{pn} save <text> (or reply to anything)\n{pn} list [page]\n{pn} get <id>\n{pn} search <word>\n{pn} pin/unpin <id>\n{pn} info\n{pn} del <id>\n{pn} clear"
		}
	},

	onStart: async function ({ message, event, args }) {
		const uid = String(event.senderID);
		const box = loadUser(uid);
		const sub = (args[0] || "").toLowerCase();

		// ---------- SAVE ----------
		if (["save", "add", "s"].includes(sub) || (!sub && (event.messageReply || (event.attachments || []).length))) {
			let note = args.slice(sub ? 1 : 0).join(" ").trim();
			const reply = event.messageReply;
			let atts = [];
			if (reply) { if (!note) note = reply.body || ""; atts = atts.concat(reply.attachments || []); }
			atts = atts.concat((event.attachments || []).filter(a => a.url));

			if (!note && !atts.length)
				return message.reply("❌ কিছু সেভ করতে লেখা দাও, অথবা কোনো মেসেজ/ছবি/ভিডিও/অডিওতে রিপ্লাই করে লেখো:\nmemory save");

			const sp = ensureSpace();
			if (!sp.ok && atts.length) return message.reply("❌ সার্ভারে জায়গা নেই। পুরনো মেমোরি ডিলিট করো (memory del <id>) অথবা সার্ভারের ডিস্ক বাড়াও।");

			const id = box.next++;
			fs.ensureDirSync(udir(uid));
			const files = [];
			let failed = 0;
			for (let i = 0; i < atts.length; i++) {
				const a = atts[i];
				if (!a.url) continue;
				const name = `${id}_${i}.${getExt(a)}`;
				try {
					await download(a.url, path.join(udir(uid), name));
					files.push({ type: a.type || "file", file: name });
				} catch (e) { fs.removeSync(path.join(udir(uid), name)); failed++; }
			}
			if (!note && !files.length) {
				box.next--;
				return message.reply("❌ ফাইল ডাউনলোড করা যায়নি, আবার চেষ্টা করো।");
			}
			box.items.push({ id, text: note, files, time: Date.now(), pinned: false });
			saveUser(uid, box);
			const size = sizeOfItem(uid, { files });
			let out = `✅ মেমোরি সেভ হয়েছে!\n🆔 ID: ${id}`;
			if (files.length) out += `\n📎 ${files.length}টি ফাইল (${mb(size)})`;
			if (failed) out += `\n⚠ ${failed}টি ফাইল সেভ হয়নি`;
			if (sp.freed) out += `\n♻ জায়গা বানাতে ${mb(sp.freed)} পুরনো মেমোরি অটো মুছেছে`;
			out += `\n\nদেখতে: memory get ${id}`;
			return message.reply(out);
		}

		// ---------- LIST ----------
		if (["list", "all", "l"].includes(sub) || !sub) {
			if (!box.items.length) return message.reply("📭 তোমার মেমোরি খালি।\nসেভ করতে: memory save <লেখা> অথবা ছবি/ভিডিওতে রিপ্লাই দিয়ে memory save");
			const per = 10, pages = Math.ceil(box.items.length / per);
			const p = Math.min(Math.max(parseInt(args[1]) || 1, 1), pages);
			const list = box.items.slice().reverse().slice((p - 1) * per, p * per);
			let out = `🧠 তোমার মেমোরি (${box.items.length}টি) — পেজ ${p}/${pages}\n`;
			for (const m of list) {
				const icons = m.files.map(f => ICON[f.type] || "📎").join("");
				const t = (m.text || "").replace(/\n/g, " ").slice(0, 40);
				out += `\n#${m.id} ${m.pinned ? "📌" : ""}${icons} ${t}${(m.text || "").length > 40 ? "…" : ""}`;
			}
			out += "\n\nদেখতে: memory get <id>";
			return message.reply(out);
		}

		// ---------- GET ----------
		if (["get", "show", "view", "g"].includes(sub)) {
			const id = parseInt(args[1]);
			const m = box.items.find(x => x.id === id);
			if (!m) return message.reply("❌ এই ID পাওয়া যায়নি। memory list দিয়ে দেখো।");
			const body = `🧠 মেমোরি #${m.id}${m.pinned ? " 📌" : ""}\n🕒 ${fmtTime(m.time)}${m.text ? `\n\n${m.text}` : ""}`;
			const paths = m.files.map(f => path.join(udir(uid), f.file)).filter(f => fs.existsSync(f));
			if (!paths.length) return message.reply(body);
			for (let i = 0; i < paths.length; i += SEND_CHUNK) {
				const chunk = paths.slice(i, i + SEND_CHUNK).map(f => fs.createReadStream(f));
				await message.reply({ body: i === 0 ? body : `📎 ${i / SEND_CHUNK + 1}তম অংশ`, attachment: chunk });
			}
			return;
		}

		// ---------- SEARCH ----------
		if (["search", "find", "f"].includes(sub)) {
			const q = args.slice(1).join(" ").toLowerCase();
			if (!q) return message.reply("🔎 কী খুঁজবে? memory search <শব্দ>");
			const res = box.items.filter(m => (m.text || "").toLowerCase().includes(q));
			if (!res.length) return message.reply("❌ কিছু পাওয়া যায়নি।");
			let out = `🔎 ${res.length}টি পাওয়া গেছে:\n`;
			for (const m of res.slice(-15).reverse()) out += `\n#${m.id} ${(m.text || "").replace(/\n/g, " ").slice(0, 40)}`;
			return message.reply(out);
		}

		// ---------- PIN / UNPIN ----------
		if (["pin", "unpin"].includes(sub)) {
			const m = box.items.find(x => x.id === parseInt(args[1]));
			if (!m) return message.reply("❌ এই ID পাওয়া যায়নি।");
			m.pinned = sub === "pin";
			saveUser(uid, box);
			return message.reply(m.pinned ? `📌 #${m.id} পিন হয়েছে — জায়গা কমলেও অটো মুছবে না।` : `📍 #${m.id} আনপিন হয়েছে।`);
		}

		// ---------- INFO ----------
		if (["info", "status", "space", "storage"].includes(sub)) {
			let mine = 0, files = 0;
			for (const m of box.items) { mine += sizeOfItem(uid, m); files += m.files.length; }
			let total = 0, count = 0;
			for (const u of allUsers()) { const b = loadUser(u); count += b.items.length; for (const m of b.items) total += sizeOfItem(u, m); }
			const free = freeBytes();
			return message.reply(
				`📊 মেমোরি স্ট্যাটাস\n\n` +
				`👤 তোমার: ${box.items.length}টি মেমোরি, ${files}টি ফাইল, ${mb(mine)}\n` +
				`🌐 সবার মোট: ${count}টি, ${mb(total)}\n` +
				`💽 সার্ভারে খালি: ${free === Infinity ? "অজানা" : mb(free)}\n` +
				`♻ অটো-ক্লিন: ${AUTO_CLEAN ? `চালু (${MIN_FREE_MB} MB এর কম খালি হলে পুরনো পিন-না-করা মেমোরি মুছবে)` : "বন্ধ"}`
			);
		}

		// ---------- DELETE ----------
		if (["del", "delete", "remove", "rm"].includes(sub)) {
			const i = box.items.findIndex(x => x.id === parseInt(args[1]));
			if (i < 0) return message.reply("❌ এই ID পাওয়া যায়নি।");
			const id = box.items[i].id;
			for (const f of box.items[i].files) fs.removeSync(path.join(udir(uid), f.file));
			box.items.splice(i, 1);
			saveUser(uid, box);
			return message.reply(`🗑 মেমোরি #${id} ডিলিট হয়েছে।`);
		}

		// ---------- CLEAR ----------
		if (sub === "clear") {
			if ((args[1] || "").toLowerCase() !== "confirm")
				return message.reply(`⚠ তোমার সব ${box.items.length}টি মেমোরি মুছে যাবে!\nনিশ্চিত হলে লেখো: memory clear confirm`);
			for (const m of box.items) for (const f of m.files) fs.removeSync(path.join(udir(uid), f.file));
			saveUser(uid, { next: box.next, items: [] });
			return message.reply("🗑 সব মেমোরি মুছে ফেলা হয়েছে।");
		}

		return message.reply("❓ ব্যবহার:\nmemory save <লেখা> (বা রিপ্লাই)\nmemory list\nmemory get <id>\nmemory search <শব্দ>\nmemory pin <id>\nmemory info\nmemory del <id>\nmemory clear");
	}
};
