var BOSH_SERVICE = 'http://localhost:5280/http-bind/';
var connection = null;
var codefriend = null;

function log(msg) {
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}

function addMessage(simplejid, msg) {
    var html = '<div>' + msg + '</div>';
    codefriend.addMessage(html, simplejid);
}
function onConnect(status) {
    if (status == Strophe.Status.CONNECTING) {
        log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
        log('Strophe failed to connect.');
        $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
        log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
        log('Strophe is disconnected.');
        $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
        log('Strophe is connected.');
        log('ECHOBOT: Send a message to ' + connection.jid +
            ' to talk to me.');

        connection.addHandler(onMessage, null, 'message', null, null, null);
        connection.addHandler(onRoster, null, 'iq', null, null, null);
//        var iq = $iq({type: 'get'}).c('query',{xmlns: 'jabber:iq:roster'});
//        connection.send(iq.tree());
        connection.send($pres().tree());

        codefriend.addFriend(new myFriend('admin@local'));
        codefriend.updateUI();
    }
    $('#message-alert').popover({
        html: true, title: 'You have new messages.  <a href="javascript:closeNewTopic()">X</a>',
        content: '<p id="message-preview"></p><a href="javascript:openNewTopic()">Click to view.</a>',
        placement: 'top',
        delay: { show: 5000, hide: 5000 }
    });
}

function onMessage(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    var username = getUserName(from);
    var simplejid = getSimpleJid(from);

    if (type == "chat" && elems.length > 0) {
        var body = elems[0];

        log('ECHOBOT: I got a message from ' + from + ': ' +
            Strophe.getText(body));
        addMessage(simplejid, username + ': ' + Strophe.getText(body));

//	var reply = $msg({to: from, from: to, type: 'chat'})
//            .cnode(Strophe.copyElement(body));
//	connection.send(reply.tree());
//
//	log('ECHOBOT: I sent ' + from + ': ' + Strophe.getText(body));
    }


    // we must return true to keep the handler alive.
    // returning false would remove it after it finishes.
    return true;
}

function sendMsg() {
    var msg = $('#message_text').val();
    if (msg === '')
        return null;
    var reply = $msg({to: codefriend.getNowFriendJid(), type: 'chat'})
        .cnode(Strophe.xmlElement('body', '', msg));
    connection.send(reply.tree());
    addMessage(null, 'me: ' + msg);
    $('#message_text').val('');
};

function sendGroupMsg() {
    var msg = $('#group_message_text').val();
    if (msg === '')
        return null;
    var group = codefriend.getNowGroup();
    for (var i = 0; i < group.users.length; i++) {
        var reply = $msg({to: group.users[i], type: 'chat'})
            .cnode(Strophe.xmlElement('body', '', '[' + group.name + ']' + msg));
        connection.send(reply.tree());
    }
    var html = '<div>me: ' + msg + '</div>';
    codefriend.addGroupMessage(html);
    $('#group_message_text').val('');
}

/*
 * 花名册处理回调方法
 */
function onRoster(iq) {
    roster = '';
    $(iq).find('item').each(function () {
        codefriend.addFriend(new myFriend($(this).attr('jid')));
//        var jid = "'"+$(this).attr('jid')+"'";
//        roster+=jid;
        //roster += '<a href="javascript:void(0);" id="'+$(this).attr('jid')+'" name="'+$(this).attr('jid')+'" onclick="click_name_setValue('+jid+')"><li id="'+jid_to_id($(this).attr('jid'))+'">'+$(this).attr('name')+'</li>';
    });
    //alert(codefriend.toFriendsHtml());
    //$("#rosList").html(roster);

    codefriend.updateUI();
    return true;
}

$(document).ready(function () {
    connection = new Strophe.Connection(BOSH_SERVICE);

    // Uncomment the following lines to spy on the wire traffic.
    //connection.rawInput = function (data) { log('RECV: ' + data); };
    //connection.rawOutput = function (data) { log('SEND: ' + data); };

    // Uncomment the following line to see all the debug output.
    //Strophe.log = function (level, msg) { log('LOG: ' + msg); };
    $('#connect').bind('click',function(){
        var button =$('#connect').get(0);
        if(button.value=='connect'){
            button.value = 'disconnect';
            connection.connect($('#jid').get(0).value,
            $('#pass').get(0).value,
            onConnect);
        }
        else{
            button.value = 'connect';
            connetion.disconnect();
        }
    /*connection.connect('zhouyang@zy.local',
        '12345678',
        onConnect);*/
    });
    $('#username').text(connection.authzid);
});


function showUserInfo() {
    closeAll();
    $('#user_info_block').css('display', '');
}

function showUserTopic(i) {
    closeAll();
    codefriend.openFriend(i);
    $('#user_topic_block').css('display', '');
}

function showGroupTopic(i) {
    closeAll();
    codefriend.openGroup(i);
    $('#group_topic_block').css('display', '');
}

function closeAll() {
    closeUserInfo();
    closeUserTopic();
    closeGroupTopic();
}

function closeUserInfo() {
    $('#user_info_block').css('display', 'none');
}

function closeUserTopic() {
    $('#user_topic_block').css('display', 'none');
    codefriend.nowfriend = -1;
}

function closeGroupTopic() {
    $('#group_topic_block').css('display', 'none');
    codefriend.nowgroup = -1;
}

function closeNewTopic() {
    $('#message-alert').popover('hide');
}

function openNewTopic() {
    $('#message-alert').popover('hide');
    closeAll();
    codefriend.openLastFriend();
    $('#user_topic_block').css('display', '');
}


var navbar_style = 0;
function changeNavBarStyle() {
    if (navbar_style == 0) {
        $('#friends-navbar').css('right', '0px');
        $('#navbar-icon').removeClass('icon-chevron-left');
        $('#navbar-icon').addClass('icon-chevron-right');
        navbar_style = 1;
    }
    else {
        $('#friends-navbar').css('right', '-340px');
        $('#navbar-icon').removeClass('icon-chevron-right');
        $('#navbar-icon').addClass('icon-chevron-left');
        navbar_style = 0;
    }

}
