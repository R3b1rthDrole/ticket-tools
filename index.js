const discord = require('discord.js');
const client = new discord.Client();

const config = require('./config.json'); 

var userTickets = new Map();

client.login(process.env.TOKEN);

client.on('ready', () => {
    console.log(client.user.username + " est en ligne.");
});

client.on('message', message => {
    if(message.author.bot) {
        if(message.embeds.length === 1 && message.embeds[0].description.startsWith('Pour')) {
            message.react('📩')
            .then(msgReaction => console.log('message de création de tickets envoyé.'))
            .catch(err => console.log(err));
        }
        if(message.embeds.length === 1 && message.embeds[0].title === 'Ticket de support') {
            message.react('🔒')
            .then(msgReaction => console.log('Réaction de supression du ticket.'))
            .catch(err => console.log(err));
        }
    };
    if(message.content.toLowerCase() === '?sendmsg') {
        message.delete();
        const embed = new discord.RichEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL)
        .setDescription('Pour créer ta candidature, réagis avec 📩 !')
        .setColor('#0091ff')
        .setFooter('Support Poulet Braiser - By Vulkane#1548')
        message.channel.send(embed);
    }
    if(message.content.toLowerCase() === '?createticket' && message.channel.id === '685230485965635616') {
        message.delete();
        /*
        if(userTickets.has(message.author.id) || message.guild.channels.some(channel => channel.name.toLowerCase() === message.author.username + '-ticket')) {
            message.author.send("Tu possèdes déjà un ticket!");
        } 
        else {
            let guild = message.guild;
            let parent = message.channel.parentID
            guild.createChannel(`${message.author.username}-ticket`, {
                type: 'text',
                parent: parent,
                permissionOverwrites: [
                    {
                        allow: 'VIEW_CHANNEL',
                        id: message.author.id
                    },
                    {
                        deny: 'VIEW_CHANNEL',
                        id: guild.id
                    },
                    {
                        allow: 'VIEW_CHANNEL',
                        id: '685236255130517524'
                    }
                ]
            }).then(ch => {
                userTickets.set(message.author.id, ch.id);
            }).catch(err => console.log(err));
        }
        */
    }
    else if(message.content.toLowerCase() === '?closeticket') { // Closing the ticket.
        /*
        if(userTickets.has(message.author.id)) { // Check if the user has a ticket by checking if the map has their ID as a key.
            if(message.channel.id === userTickets.get(message.author.id)) {
                message.channel.delete('suppression du ticket..') // Delete the ticket.
                .then(channel => {
                    console.log("Channel supprimé : " + channel.name);
                    userTickets.delete(message.author.id);
                })
                .catch(err => console.log(err));
            }
        }
        if(message.guild.channels.some(channel => channel.name.toLowerCase() === message.author.username + '-ticket')) {
            message.guild.channels.forEach(channel => {
                if(channel.name.toLowerCase() === message.author.username + '-ticket') {
                    channel.delete().then(ch => console.log('Channel supprimé : ' + ch.id))
                    .catch(err => console.log(err));
                }
            });
        } */
    }
});

client.on('raw', payload => {
    if(payload.t === 'MESSAGE_REACTION_ADD') {
        if(payload.d.emoji.name != '📩'){
            return;
        }
        if(payload.d.message_id !== '685301428004061207'){
            let channel = client.channels.get(payload.d.channel_id)
            if (channel.messages.has(payload.d.message_id)) {
                return;
            }
            else {
                channel.fetchMessage(payload.d.message_id)
                .then(msg => {
                    let reaction = msg.reactions.get('📩');
                    let user = client.users.get(payload.d.user_id);
                    client.emit('messageReactionAdd', reaction, user);
                })
                .catch(err => console.log(err));
            }
        }
    }
})

client.on('messageReactionAdd', (reaction, user) =>{

    if(reaction.emoji.name === '📩'){
        console.log(user.id === client.user.id);
        let guild = reaction.message.guild;
        if(userTickets.has(user.id) || reaction.message.guild.channels.some(channel => channel.name.toLowerCase() === user.username + '-ticket')) {
            user.send("Tu possèdes déjà un ticket!");
            console.log(user.username + " a essayé de créer un deuxième ticket.")
        } 
        else {
            let guild = reaction.message.guild;
            let parent = reaction.message.channel.parentID
            guild.createChannel(`${user.username}-ticket`, {
                type: 'text',
                parent: parent,
                permissionOverwrites: [
                    {
                        allow: 'VIEW_CHANNEL',
                        id: user.id
                    },
                    {
                        deny: 'VIEW_CHANNEL',
                        id: guild.id
                    },
                    {
                        allow: 'VIEW_CHANNEL',
                        id: '685236255130517524'
                    }
                ]
            }).then(ch => {
                userTickets.set(user.id, ch.id);
                ch.send("|| <@"+user.id+"> || ")
                let embed = new discord.RichEmbed()
                .setTitle('Ticket de support')
                .setDescription('Merci d\'avoir créé un ticket, nous lirons ta candidature dès que possible et nous te répondrons dans les plus bref délais !\nRéagis avec 🔒 pour fermer ce ticket.')
                .setColor('#0091ff')
                .setFooter('Support Poulet Braiser - By Vulkane#1548')
                ch.send(embed);
            }).catch(err => console.log(err));
            console.log(user.username + " a créé le ticket : " + user.username + "-ticket" )
        }
    }
    else if(reaction.emoji.name === '🔒' && reaction.me) {
        if(userTickets.has(user.id)) {
            if(reaction.message.channel.id === userTickets.get(user.id)) {
                let embed = new discord.RichEmbed()
                .setDescription("Le ticket sera fermé dans 5 seconds.")
                reaction.message.channel.send(embed);
                setTimeout(() => {
                    reaction.message.channel.delete('ticket fermé')
                    
                    .then(channel => {
                        userTickets.delete(user.id);
                        console.log("Supprimé : " + channel.name);
                    })
                    .catch(err => console.log(err));
                }, 5000);
            }
        }

        else if(reaction.message.guild.channels.some(channel => channel.name.toLowerCase() === user.username + '-ticket')) {
            let embed = new discord.RichEmbed()
            .setDescription("Le ticket sera fermé dans 5 secondes.");
            reaction.message.channel.send(embed);
            setTimeout(() => {
                reaction.message.guild.channels.forEach(channel => {
                    if(channel.name.toLowerCase() === user.username + '-ticket') {
                        channel.delete().then(ch => console.log('Ticket supprimé : ' + ch.id))
                    }
                });
            }, 5000);
        }
    }
});
