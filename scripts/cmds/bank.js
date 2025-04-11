const mongoose = require("mongoose");

// MongoDB connection string
const dbURI = "mongodb+srv://sonalitravel87:XuVzWW3Kcta9muU0@cluster1.tyoqc.mongodb.net/bankSystem?retryWrites=true&w=majority&appName=Cluster1";

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("[MongoDB] Connected successfully"))
  .catch((err) => console.error("[MongoDB] Connection error:", err));

// Define the Bank schema
const bankSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  bank: { type: Number, default: 0 },
  lastInterestClaimed: { type: Date, default: Date.now },
  loan: { type: Number, default: 0 },
  loanPayed: { type: Boolean, default: true },
});

// Create a model for the Bank schema
const Bank = mongoose.models.Bank || mongoose.model("Bank", bankSchema);


module.exports = {
  config: {
    name: "bank",
    version: "1.2",
    description: "Deposit or withdraw money from the bank and earn interest",
    guide: {
      en: "{pn}Bank:\nInterest - Balance\n - Withdraw \n- Deposit \n- Transfer \n- Top",
    },
    category: "💰 Economy",
    countDown: 5,
    role: 0,
    author: "Loufi | SiAM | Samuel | Abir",
  },
  onStart: async function ({ args, message, event, api, usersData }) {
    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const userID = event.senderID;

    // Fetch or create user bank data
    let userBankData = await Bank.findOne({ userID });
    if (!userBankData) {
      userBankData = await Bank.create({ userID });
    }

    switch (command) {
      case "deposit":
      case "-d":
        if (isNaN(amount) || amount <= 0) {
          return message.reply("❏ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗮𝗺𝗼𝘂𝗻𝘁 𝘁𝗼 𝗱𝗲𝗽𝗼𝘀𝗶𝘁.");
        }

        const userMoney = await usersData.get(userID, "money");
        if (userMoney < amount) {
          return message.reply("❏ 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗲𝗻𝗼𝘂𝗴𝗵 𝗺𝗼𝗻𝗲𝘆 𝘁𝗼 𝗱𝗲𝗽𝗼𝘀𝗶𝘁.");
        }

        userBankData.bank += amount;
        await userBankData.save();

        await usersData.set(userID, { money: userMoney - amount });
        return message.reply(`❏ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗱𝗲𝗽𝗼𝘀𝗶𝘁𝗲𝗱 $${formatNumberWithFullForm(amount)}.`);

      case "withdraw":
      case "-w":
        if (isNaN(amount) || amount <= 0) {
          return message.reply("❏ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗮𝗺𝗼𝘂𝗻𝘁 𝘁𝗼 𝘄𝗶𝘁𝗵𝗱𝗿𝗮𝘄.");
        }

        if (userBankData.bank < amount) {
          return message.reply("❏ 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗲𝗻𝗼𝘂𝗴𝗵 𝗺𝗼𝗻𝗲𝘆 𝗶𝗻 𝘆𝗼𝘂𝗿 𝗯𝗮𝗻𝗸 𝘁𝗼 𝘄𝗶𝘁𝗵𝗱𝗿𝗮𝘄.");
        }

        userBankData.bank -= amount;
        await userBankData.save();

        const updatedMoney = await usersData.get(userID, "money");
        await usersData.set(userID, { money: updatedMoney + amount });

        return message.reply(`❏ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝘄𝗶𝘁𝗵𝗱𝗿𝗲𝘄 $${formatNumberWithFullForm(amount)}. 𝗬𝗼𝘂𝗿 𝗻𝗲𝘄 𝗯𝗮𝗻𝗸 𝗯𝗮𝗹𝗮𝗻𝗰𝗲 𝗶𝘀 $${formatNumberWithFullForm(userBankData.bank)}.`);

      case "balance":
      case "bal":
        return message.reply(`❏ 𝗬𝗼𝘂 𝗵𝗮𝘃𝗲 $${formatNumberWithFullForm(userBankData.bank)} 𝗶𝗻 𝘁𝗵𝗲 𝗯𝗮𝗻𝗸.`);

      case "interest":
      case "i":
        const interestRate = 0.001; // 0.1% daily interest
        const lastClaimed = userBankData.lastInterestClaimed || Date.now();
        const timeElapsed = (Date.now() - lastClaimed) / (1000 * 60 * 60 * 24); // Days elapsed

        if (timeElapsed < 1) {
          return message.reply("❏ 𝐘𝐨𝐮 𝐜𝐚𝐧 𝐜𝐥𝐚𝐢𝐦 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐨𝐧𝐥𝐲 𝐨𝐧𝐜𝐞 𝐞𝐯𝐞𝐫𝐲 𝟐𝟒 𝐡𝐨𝐮𝐫𝐬.");
        }

        const interest = userBankData.bank * interestRate * timeElapsed;
        userBankData.bank += interest;
        userBankData.lastInterestClaimed = Date.now();
        await userBankData.save();

        return message.reply(`❏ 𝗬𝗼𝘂 𝗲𝗮𝗿𝗻𝗲𝗱 $${formatNumberWithFullForm(interest.toFixed(2))} 𝗶𝗻 𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁. 𝗬𝗼𝘂𝗿 𝗻𝗲𝘄 𝗯𝗮𝗻𝗸 𝗯𝗮𝗹𝗮𝗻𝗰𝗲 𝗶𝘀 $${formatNumberWithFullForm(userBankData.bank)}.`);
 case "transfer":
 case "-t":
            if (isNaN(amount) || amount <= 0) {
              return message.reply("[🏦 𝗕𝗮𝗻𝗸 🏦]\n\n❏𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗮𝗺𝗼𝘂𝗻𝘁 𝘁𝗼 𝘁𝗿𝗮𝗻𝘀𝗳𝗲𝗿 🔁•");
            }
          
            if (!recipientUID || !bankData[recipientUID]) {
              return message.reply("[🏦 𝗕𝗮𝗻𝗸 🏦]\n\n❏𝗥𝗲𝗰𝗶𝗽𝗶𝗲𝗻𝘁 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗲 𝗯𝗮𝗻𝗸 𝗱𝗮𝘁𝗮𝗯𝗮𝘀𝗲. 𝗣𝗹𝗲𝗮𝘀𝗲 𝗰𝗵𝗲𝗰𝗸 𝘁𝗵𝗲 𝗿𝗲𝗰𝗶𝗽𝗶𝗲𝗻𝘁'𝘀 𝗜𝗗 ✖️•");
            }
          
            if (recipientUID === user) {
              return message.reply("[🏦 𝗕𝗮𝗻𝗸 🏦]\n\n❏𝗬𝗼𝘂 𝗰𝗮𝗻𝗻𝗼𝘁 𝘁𝗿𝗮𝗻𝘀𝗳𝗲𝗿 𝗺𝗼𝗻𝗲𝘆 𝘁𝗼 𝘆𝗼𝘂𝗿𝘀𝗲𝗹𝗳 😹•");
            }
  case "top":
     const topUsers = await Bank.find().sort({ bank: -1 }).limit(10);
        const leaderboard = await Promise.all(topUsers.map(async (user, index) => {
          const userName = await usersData.get(user.userID, "name");
          return `${index + 1}. ${userName} - $${formatNumberWithFullForm(user.bank)}`;
        }));

        return message.reply(`❏ 𝐓𝐨𝐩 𝟏𝟎 𝐁𝐚𝐧𝐤 𝐁𝐚𝐥𝐚𝐧𝐜𝐞𝐬 :\n\n${leaderboard.join('\n')}`);

      default:
        return message.reply("❏ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗰𝗼𝗺𝗺𝗮𝗻𝗱. 𝗨𝘀𝗲: 𝗱𝗲𝗽𝗼𝘀𝗶𝘁, 𝘄𝗶𝘁𝗵𝗱𝗿𝗮𝘄, 𝗯𝗮𝗹𝗮𝗻𝗰𝗲, 𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁, 𝘁𝗼𝗽.");
    }
  },
};

function formatNumberWithFullForm(number) {
  const fullForms = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐"];
  let index = 0;

  while (number >= 1000 && index < fullForms.length - 1) {
    number /= 1000;
    index++;
  }

  return `${number.toFixed(1)}${fullForms[index]}`;
}
