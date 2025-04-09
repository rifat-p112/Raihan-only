const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    aliases:["use", "cmdl"],
    version: "1.18",
    author: "HaSaN", 
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage",
    },
    longDescription: {
      en: "View command usage and list all commands or commands by category",
    },
    category: "info",
    guide: {
      en: "{pn} / help cmdName\n{pn} -c <categoryName>",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `╔══════════════╗\n🔹 𝗠𝗔𝗞𝗜𝗠𝗔 🤍✨🔹\n╚══════════════╝\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭────────────⭓\n│『 ${category.toUpperCase()} 』`;

          const names = categories[category].commands.sort();
          names.forEach((item) => {
            msg += `\n│𖤍 ${item}`;
          });

          msg += `\n╰────────⭓`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n𝗖𝘂𝗿𝗿𝗲𝗻𝘁𝗹𝘆, 𝘁𝗵𝗲 𝗯𝗼𝘁 𝗵𝗮𝘀 ${totalCommands} 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝘁𝗵𝗮𝘁 𝗰𝗮𝗻 𝗯𝗲 𝘂𝘀𝗲𝗱\n`;
      msg += `\n𝗧𝘆𝗽𝗲 ${prefix}𝗵𝗲𝗹𝗽 𝗰𝗺𝗱𝗡𝗮𝗺𝗲 𝘁𝗼 𝘃𝗶𝗲𝘄 𝘁𝗵𝗲 𝗱𝗲𝘁𝗮𝗶𝗹𝘀 𝗼𝗳 𝘁𝗵𝗮𝘁 𝗰𝗼𝗺𝗺𝗮𝗻𝗱\n`;
      msg += `\n✨𝑩𝑶𝑻 𝑵𝑨𝑴𝑬: 𝗠𝗔𝗞𝗜𝗠𝗔 🤍✨`;
      
      msg += `\n 					`;
      
      msg += `\n`;

      await message.reply({
        body: msg,
      });
    } else if (args[0] === "-c") {
      if (!args[1]) {
        await message.reply("Please specify a category name.");
        return;
      }

      const categoryName = args[1].toLowerCase();
      const filteredCommands = Array.from(commands.values()).filter(
        (cmd) => cmd.config.category?.toLowerCase() === categoryName
      );

      if (filteredCommands.length === 0) {
        await message.reply(`No commands found in the category "${categoryName}".`);
        return;
      }

      let msg = `╔══════════════╗\n༒︎ ${categoryName.toUpperCase()} COMMANDS ༒︎\n╚══════════════╝\n`;

      filteredCommands.forEach((cmd) => {
        msg += `\n☠︎︎ ${cmd.config.name} `;
      });

      await message.reply(msg);
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription
          ? configCommand.longDescription.en || "No description"
          : "No description";

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭── 𝑵𝑨𝑴𝑬 ────⭓\n` +
          `│ ${configCommand.name}\n` +
          `├── 𝑰𝑵𝑭𝑶\n` +
          `│ 𝐷𝑒𝑠𝑐𝑟𝑖𝑝𝑡𝑖𝑜𝑛: ${longDescription}\n` +
          `│ 𝑂𝑡ℎ𝑒𝑟 𝑁𝑎𝑚𝑒: ${configCommand.aliases ? configCommand.aliases.join(", ") : "Do not have"}\n` +
          `│ 𝑉𝑒𝑟𝑠𝑖𝑜𝑛: ${configCommand.version || "1.0"}\n` +
          `│ 𝑅𝑜𝑙𝑒: ${roleText}\n` +
          `│ 𝑇𝑖𝑚𝑒 𝑃𝑒𝑟 𝐶𝑜𝑚𝑚𝑎𝑛𝑑: ${configCommand.countDown || 1}s\n` +
          `│ 𝐴𝑢𝑡ℎ𝑜𝑟: ${author}\n` +
          `├── 𝑼𝑺𝑨𝑮𝑬\n` +
          `│ ${usage}\n` +
          `├── 𝑵𝑶𝑻𝑬𝑺\n` +
          `│ 𝑇ℎ𝑒 𝑐𝑜𝑛𝑡𝑒𝑛𝑡 𝑖𝑛𝑠𝑖𝑑𝑒 ♡︎ 𝐇𝐀𝐒𝐀𝐍 ♡︎ 𝑐𝑎𝑛 𝑏𝑒 𝑐ℎ𝑎𝑛𝑔𝑒𝑑\n` +
          `│ ♕︎ 𝐎𝐖𝐍𝐄𝐑 ♕︎:☠︎︎ 𝙃𝘼𝙎𝘼𝙉 ☠︎︎\n` +
          `╰━━━━━━━❖`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
		  }
	      
