const userDoB = require('../database/models/UserDoB');

const errHander = (err) => { console.error('ERROR:', err); };

// creates a embed messagetemplate for succeded actions
function messageSuccess(message, body) {
  const client = message.client;
  client.functions.get('FUNC_MessageEmbedMessage')
    .run(client.user, message.channel, body, '', 4296754, false);
}

// creates a embed messagetemplate for failed actions
function messageFail(message, body) {
  const client = message.client;
  client.functions.get('FUNC_MessageEmbedMessage')
    .run(client.user, message.channel, body, '', 16449540, false)
    .then((msg) => msg.delete({ timeout: 10000 }));
}

async function addTag(tag, serverID, managementServerID) {
  if (await userDoB.findOne({ where: { serverID: [serverID, managementServerID], tag } }).catch(errHander)) return false;
  await userDoB.findOrCreate({ where: { serverID, tag } }).catch(errHander);
  return true;
}

module.exports.run = async (client, message, args, config, MessageEmbed, prefix) => {
  // check if user can manage servers
  if (!message.member.hasPermission('MANAGE_GUILD')) return messageFail(message, 'You dwon\'t hawe access to thwis command òwó');
  const [subcmd, tag] = args;
  if (!tag) {
    return messageFail(message,
      `Command usage: 
      \`\`\`${prefix}${module.exports.help.parent} ${subcmd} TAGNAME\`\`\``);
  }
  if (tag.length > 30) {
    return messageFail(message, 'Your tawg is too long. The maximum length is 30 characters.');
  }
  const added = await addTag(tag, message.guild.id, config.managementServerID);
  if (added) {
    // remove NSFW roles
    if (!allow) client.functions.get('FUNC_userRemoveNsfwRoles').run(userID, message.guild, config.setup.roleRequest.roles);
  } else {
    messageFail(message, `\`${userID}\` hasn't been added yet. I'll do that for you! ^^`);
    client.functions.get('CMD_nsfw_add').run(client, message, args, config, MessageEmbed, prefix);
  }
};

module.exports.help = {
  name: 'CMD_nsfw_change',
  parent: 'nsfw',
};
