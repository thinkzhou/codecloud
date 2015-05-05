var NetPad = {
    connection: null,
    collaborator: null,
    NS_NETPAD: 'http://metajack.im/ns/netpad',
    master: null,
    editor_session:null,

    on_disco_info: function (iq) {
        NetPad.connection.sendIQ(
            $iq({to: $(iq).attr('from'),
                 from: $(iq).attr('to'),
                 id: $(iq).attr('id'),
                 type: "result"})
                .c('query', {xmlns: Strophe.NS.DISCO_INFO})
                .c('identity', {category: 'client',
                                type: 'pc'}).up()
                .c('feature', {'var': NetPad.NS_NETPAD}));
        return true;
    },

    on_collaborate: function (presence) {
        var from = $(presence).attr('from');

        if (NetPad.collaborator) {
            // we already have a collaborator
            NetPad.connection.send(
                $pres({to: from, type: 'error'})
                    .c('error', {type: 'wait'})
                    .c('recipient-unavailable', {xmlns: Strophe.NS.STANZAS})
                    .up()
                    .c('already-collaborating', {xmlns: NetPad.NS_NETPAD}));
        } else {
            NetPad.collaborator = from;
            NetPad.start_collaboration(true);
        }
        return true;
    },

    start_collaboration: function () {
        $('#status')
            .text('Collaborating with ' + NetPad.collaborator + '.')
            .attr('class', 'collab');

        $('#input').removeAttr('disabled');

        var buffer = NetPad.editor_session.getValue();//get things that master had inputed
        OpTrans.init([NetPad.connection.jid, NetPad.collaborator],
                     buffer,
                     NetPad.update_pad);

        if (NetPad.master) {
            // set up and send initial collaboration state
            var msg = $msg({to: NetPad.collaborator, type: 'chat'})
                .c('start', {xmlns: NetPad.NS_NETPAD});
            if (buffer) {
                msg.t(buffer);
            }

            NetPad.connection.send(msg);
        } else {

        }
    },

    on_message: function (message) {
        var from = $(message).attr('from');
        if (NetPad.collaborator === from) {
            var collab = $(message)
                .find('*[xmlns="' + NetPad.NS_NETPAD + '"]');
            if (collab.length > 0) {
                if (NetPad.master) {
                    NetPad.process_op(collab);
                } else {
                    var command = collab[0].tagName;
                    if (command === "start") {
                        NetPad.editor_session.setValue(collab.text());
                        NetPad.start_collaboration();
                    } else if (command === "stop") {
                        NetPad.stop_collaboration();
                    } else {
                        NetPad.process_op(collab);
                    }
                }
            } else {
                // add regular message to the chat
                var body = $(message).find('body').text();
                $('#chat').append("<div class='message'>" +
                                  "&lt;<span class='nick'>" +
                                  Strophe.getBareJidFromJid(from) +
                                  "</span>&gt; " +
                                  "<span class='message'>" +
                                  body +
                                  "</span>" +
                                  "</div>");
                NetPad.scroll_chat();
            }
        }

        return true;
    },

    stop_collaboration: function (notify) {
        $('#status')
            .text('Not collaborating.')
            .attr('class', 'no-collab');

        $('#input').attr('disabled', 'disabled');

        if (notify) {
            NetPad.connection.send(
                $msg({to: NetPad.collaborator, type: 'chat'})
                    .c('stop', {xmlns: NetPad.NS_NETPAD}));
        }
    },

    on_unavailable: function (presence) {
        var from = $(presence).attr('from');

        if (from === NetPad.collaborator) {
            NetPad.stop_collaboration();
        }

        return true;
    },

    scroll_chat: function () {
        var chat = $('#chat').get(0);
        chat.scrollTop = chat.scrollHeight;
    },

    update_pad: function (op,chr,buffer, remote) {
        var old_row = NetPad.editor_session.selection.getCursor().row;
        var old_col = NetPad.editor_session.getSession().selection.getCursor().column;
        var old_buffer = NetPad.editor_session.getValue();
        NetPad.editor_session.setValue(buffer);
        NetPad.editor_session.getSession().selection.moveCursorTo(old_row,old_col,false);
        if(!remote){
            if(op==='insert'){
                NetPad.editor_session.getSession().selection.moveCursorRight();
            }
            else if(op==='breakline'){
                old_row=old_row+1;
                old_col=0;
                NetPad.editor_session.getSession().selection.moveCursorTo(old_row,old_col,false);
            }
        }
        NetPad.editor_session.getSession().selection.clearSelection();
    },

    send_op: function (op, pos, chr) {
        var req = OpTrans.do_local(op, pos, chr);

        var op_attrs = {xmlns: NetPad.NS_NETPAD,
                        name: op,
                        pos: pos};
        if (chr) {
            op_attrs['char'] = chr;
        }
        var msg = $msg({to: NetPad.collaborator, type: 'chat'})
            .c('op', op_attrs)
            .c('state');
        var i;
        for (i = 0; i < req[1].length; i++) {
            msg.c('cell').t('' + req[1][i]).up();
        }

        msg.up().c('priority');
        for (i = 0; i < req[3].length; i++) {
            msg.c('cell').t('' + req[3][i]).up();
        }
        NetPad.connection.send(msg);
    },

    process_op: function (op) {
        var name = op.attr('name');
        var pos = parseInt(op.attr('pos'), 10);
        var chr = op.attr('char');
        var pri = [];
        var state = [];
        op.find('state > cell').each(function () {
            state.push(parseInt($(this).text(), 10));
        });

        op.find('priority > cell').each(function () {
            pri.push(parseInt($(this).text(), 10));
        });
        OpTrans.do_remote(NetPad.collaborator,
                          state,
                          name, pos, chr,
                          pri);
    }
};
$(document).ready(function () {
    $('#mainSplitter').jqxSplitter({theme: 'blackberry', width: '100%', height: '100%', panels: [
            { size: '50%', min:'50%',collapsible: false},
            { size: '50%',max:'50'},
        ]
    });
    $('#rightSplitter').jqxSplitter({ height: '100%', orientation: 'horizontal', panels: [{ size: '80%', collapsible: false }, { size: '20%'}] });
    $('#jqxtabs').jqxTabs({ width: '100%', height: '100%' });
    $('#jqxtabs_console').jqxTabs({ width: '100%', height: '100%' });
    var langTools = ace.require("ace/ext/language_tools");
    var editor = ace.edit('editor-container');
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/c_cpp");
    editor.setHighlightActiveLine(true);
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      useElasticTabstops:true,
    });
    var rhymeCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            if (prefix.length === 0) { callback(null, []); return }
            $.getJSON(
                "http://127.0.0.1:8000/cc/data",
                function(wordList) {
                    callback(null, wordList.map(function(ea) {
                        return {name: ea.word, value: ea.word,}
                    }));
                })
        }
    }
    langTools.addCompleter(rhymeCompleter);
    $('#open_editor').click(function(event) {
        var s= $(this).text();
        if(s==='Open Editor'){
            $(this).text('Close Editor');
            $('#mainSplitter').jqxSplitter('expand');
        }
        else{
            $(this).text('Open Editor');
            $('#mainSplitter').jqxSplitter('collapse');
        }
    });
    NetPad.editor_session = editor;
    $('#login').click(function(event) {
        $(document).trigger('connect', {
                jid: $('#local_jid').val(),
                password: $('#local_password').val(),
                collaborator: $('#collaborator_jid').val()
        });
        $('#myModal').modal('hide')
    });
    $('#collaborator_name').change(function(event) {
        collaborator_name=$('#collaborator_name').val();
        $.ajax({
            url: '/cc/ajax/get_jid/',
            type: 'POST',
            dataType: 'json',
            data: {'name': collaborator_name},
        })
        .done(function(data) {
            jid = data['jid'];
            if (jid){
                $('#collaborator_jid').val(jid);
                $('#local_jid').val('zhounima@localhost');
            }
        })
    });
    $('#code_test').click(function(event) {
        $.ajax({
            url: '/cc/ajax/test_code/',
            type: 'POST',
            dataType: 'json',
            data: {
                'code': NetPad.editor_session.getValue(),
                'data_input':$('#input_text').val(),
                'problem_id':'1',
            },
        })
        .done(function(data) {
            build_msg = data['build_msg'];
            run_msg = data['run_msg'];
            output = data['output'];
            $('#output_text').val(output);
            console_msg = build_msg+run_msg;
            $('#console').text(console_msg);
        })
    });
    $('#disconnect').click(function () {
        if (NetPad.collaborator) {
            NetPad.stop_collaboration(true);
        }

        $('#disconnect').attr('disabled', 'disabled');

        NetPad.connection.disconnect();
    });

    $('#input').keypress(function (ev) {
        if (ev.which === 13) {
            ev.preventDefault();

            var body = $(this).val();
            $('#chat').append("<div class='message'>" +
                              "&lt;<span class='nick self'>" +
                              Strophe.getBareJidFromJid(
                                  NetPad.connection.jid) +
                              "</span>&gt; " +
                              "<span class='message'>" +
                              body +
                              "</span>" +
                              "</div>");
            NetPad.connection.send(
                $msg({to: NetPad.collaborator, type: 'chat'})
                    .c('body').t(body));
            $(this).val('');
        }
    });
    editor.container.addEventListener("keyup", function(e){
        if (NetPad.collaborator) {
            row= NetPad.editor_session.getSession().selection.getCursor().row;
            col = NetPad.editor_session.getSession().selection.getCursor().column;
            key_code = e.which;
            var ace_range = ace.require("ace/range").Range,
            mine = new ace_range(0,0,row,col);
            var handled = true;
            idx = NetPad.editor_session.getSession().getTextRange(mine).length;
            if(key_code===8){
                NetPad.send_op('delete', idx);
                e.preventDefault();
            }
            else if (key_code===46){
                NetPad.send_op('delete', idx);
                e.preventDefault();
            }
        }
    }, true);
    editor.container.addEventListener("keypress", function(e){
        row= NetPad.editor_session.getSession().selection.getCursor().row;
        col = NetPad.editor_session.getSession().selection.getCursor().column;
        key_code = e.which;
        var ace_range = ace.require("ace/range").Range,
        mine = new ace_range(0,0,row,col);
        var handled = true;
        idx = NetPad.editor_session.getSession().getTextRange(mine).length;
        if (NetPad.collaborator) {
            if(key_code===13||key_code===10){
                NetPad.send_op('breakline',idx);
                e.preventDefault();
            }
            else if((key_code>=32 && key_code<=127)||
                  key_code>=256){
                NetPad.send_op('insert',idx,String.fromCharCode(key_code));
                e.preventDefault();
            }
        }
    }, true);
    NetPad.editor_session.getSession().on('change', function(e) {
    //bind change event of ace
        if(NetPad.collaborator){
            action = e.data.action;
            start_row = e.data.range.start.row;
            start_col = e.data.range.start.column;
            end_row = e.data.range.end.row;
            end_col = e.data.range.end.column;
        }
    });
});
$(document).bind('connect', function (ev, data) {
    var conn = new Strophe.Connection(
        "http://localhost:5280/http-bind");
    conn.connect(data.jid, data.password, function (status) {
        if (status === Strophe.Status.CONNECTED) {
            $.ajax({
                url: '/cc/ajax/update_jid/',
                type: 'POST',
                dataType: 'json',
                data: {
                    jid: conn.jid,
                    state: true,
                },
            })
            $(document).trigger('connected');
        } else if (status === Strophe.Status.DISCONNECTED) {
            $(document).trigger('disconnected');
        }
    });

    NetPad.connection = conn;
    NetPad.collaborator = data.collaborator || null;
});

$(document).bind('connected', function () {
    $('#disconnect').removeAttr('disabled');

    NetPad.connection.addHandler(NetPad.on_message, null, "message");

    if (NetPad.collaborator) {
        NetPad.master = false;

        $('#status')
            .text('Checking feature support for ' + NetPad.collaborator + '.')
            .attr('class', 'try-collab');

        // check for feature support
        NetPad.connection.sendIQ(
            $iq({to: NetPad.collaborator, type: 'get'})
                .c('query', {xmlns: Strophe.NS.DISCO_INFO}),
            function (iq) {
                var f = $(iq).find(
                    'feature[var="' + NetPad.NS_NETPAD + '"]');
                if (f.length > 0) {
                    $('#status')
                        .text('Establishing session with ' +
                              NetPad.collaborator + '.')
                        .attr('class', 'try-collab');

                    NetPad.connection.send(
                        $pres({to: NetPad.collaborator})
                            .c('collaborate', {xmlns: NetPad.NS_NETPAD}));
                } else {
                    $('#status')
                        .text('Collaboration not supported with ' +
                              NetPad.collaborator + '.')
                        .attr('class', 'no-collab');

                    NetPad.connection.disconnect();
                }
            });
    } else {
        NetPad.master = true;

        // handle incoming discovery and collaboration requestsb
        NetPad.connection.addHandler(NetPad.on_disco_info,
                                     Strophe.NS.DISCO_INFO, "iq", "get");
        NetPad.connection.addHandler(NetPad.on_collaborate,
                                     NetPad.NS_NETPAD, "presence");
        NetPad.connection.addHandler(NetPad.on_unavailable,
                                     null, "presence");
    }
});
$(document).bind('disconnected', function () {
    $.ajax({
        url: '/cc/ajax/update_jid/',
        type: 'POST',
        dataType: 'json',
        data: {
            jid: NetPad.connection.jid,
            state:'false',
        },
    })
    NetPad.connection = null;
});
