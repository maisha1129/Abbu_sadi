const fs = require("fs");
const request = require("request");

module.exports.config = {
  name: "boxinfo",
  version: "2.2.0",
  hasPermssion: 1,
  credits: "Modified by RX Abdullah",
  description: "Get stylish group info with same image system",
  commandCategory: "Box",
  usages: "groupinfo",
  cooldowns: 2
};

module.exports.run = async function ({ api, event }) {
  const threadInfo = await api.getThreadInfo(event.threadID);
  const members = threadInfo.participantIDs.length;
  const admins = threadInfo.adminIDs.length;
  const emoji = threadInfo.emoji || "❌";
  const groupName = threadInfo.threadName || "Unnamed Group";
  const groupID = threadInfo.threadID;
  const totalMsg = threadInfo.messageCount || 0;
  const approvalMode = threadInfo.approvalMode ? "🟢 Turned ON" : "🔴 Turned OFF";
  const groupImage = threadInfo.imageSrc;

  // Gender Count
  let male = 0, female = 0;
  for (const user of threadInfo.userInfo) {
    if (user.gender === "MALE") male++;
    else if (user.gender === "FEMALE") female++;
  }

  // Admin List
  const adminList = threadInfo.adminIDs.map(admin => {
    const user = threadInfo.userInfo.find(u => u.id === admin.id);
    return user ? `• ${user.name}` : null;
  }).filter(Boolean);

  const msg = `
╭───× 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐟𝐨 ×───╮
│ 🔰𝙎𝘼𝘿𝙄_𝘽𝙊𝙏🔰
│ ───×
│ 𝐍𝐚𝐦𝐞: ${groupName}
│ 𝐆𝐫𝐨𝐮𝐩 𝐢𝐝: ${groupID}
│ 𝐀𝐩𝐩𝐫𝐨𝐯𝐚𝐥: ${approvalMode}
│ 𝐄𝐦𝐨𝐣𝐢: ${emoji}
│ ───×
│ 👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${members}
│ ♂️ 𝐌𝐚𝐥𝐞: ${male}
│ ♀️ 𝐅𝐞𝐦𝐚𝐥𝐞: ${female}
│ ───×
│ 👑 𝐚𝐝𝐦𝐢𝐧𝐬 (${admins}):
│ ${adminList.join("\n│ ")}
│ ───×
│ 💬 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐬𝐬𝐚𝐠𝐞: ${totalMsg} msgs
╰─────────────⧕
`.trim();

  const callback = () => {
    api.sendMessage(
      {
        body: msg,
        attachment: fs.createReadStream(__dirname + "/cache/1.png")
      },
      event.threadID,
      () => fs.unlinkSync(__dirname + "/cache/1.png"),
      event.messageID
    );
  };

  if (groupImage) {
    request(encodeURI(groupImage))
      .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
      .on("close", () => callback());
  } else {
    api.sendMessage(msg, event.threadID, event.messageID);
  }
};
