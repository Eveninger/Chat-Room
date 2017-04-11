/**
 * Created by Nighter on 2017/4/11.
 *
 * cr.shell.js
 * Shell module for Chat Room
 */

cr.shell = (function () {
    var configMap = {
        main_html: '<header class="cr-shell-head">\
        <div class="cr-shell-head-logo">Logo</div>\
        <div class="cr-shell-head-account">Account</div>\
        <div class="cr-shell-head-search">Search</div>\
        </header>\
        <div class="cr-shell-main">\
        <div class="cr-shell-main-nav">Nav</div>\
        <div class="cr-shell-main-content">Content</div>\
        </div>\
        <footer class="cr-shell-foot">\
        Foot\
        </footer>\
        <div class="cr-shell-chat">Chat</div>\
        <div class="cr-shell-modal">Modal</div>',

        chat_extend_time: 250,
        chat_retract_time: 300,
        chat_extend_height: 450,
        chat_retract_height: 15,
        chat_extend_title: 'Click to retract',
        chat_retract_title: 'Click to extend'

    };

    var stateMap = {
        $container: null,
        is_chat_retracted: true
    };

    //---------------------------BEGIN DOM METHOD-----------------------------
    var jqueryMap = {};
    var setJquery, toggleChat, onClickChat, initModule;

    setJqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container,
            $chat: $container.find('.cr-shell-chat')
        };
    };

    /**
     *
     * @param {Boolean} do_extend  true: 伸展 false: 收缩
     * @param {Function} [callback] 动画结束的回调
     * @return {Boolean} true: 动画结束 false: 动画未结束
     */
    toggleChat = function (do_extend, callback) {
        var chat_height = jqueryMap.$chat.height();
        var is_open = chat_height === configMap.chat_extend_height;
        var is_closed = chat_height === configMap.chat_retract_height;
        var is_sliding = !is_open && !is_closed;

        if (is_sliding) {
            return false;
        }

        if (do_extend) {
            jqueryMap.$chat.animate(
                {height: configMap.chat_extend_height},
                configMap.chat_extend_time,
                function () {
                    jqueryMap.$chat.attr('title', configMap.chat_retract_title);
                    stateMap.is_chat_retracted = false;
                    if (callback) {
                        callback(jqueryMap.$chat);
                    }
                }
            );
            return true;
        }

        jqueryMap.$chat.animate(
            {height: configMap.chat_retract_height},
            configMap.chat_retract_time,
            function () {
                jqueryMap.$chat.attr('title', configMap.chat_extend_title);
                stateMap.is_chat_retracted = true;
                if (callback) {
                    callback(jqueryMap.$chat);
                }

            }
        );
        return true;
    };

    onClickChat = function (event) {
        toggleChat(stateMap.is_chat_retracted);
        return false;
    };
    //---------------------------BEGIN DOM METHOD-----------------------------

    initModule = function ($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        stateMap.is_chat_retracted = true;
        jqueryMap.$chat
            .attr('title', configMap.chat_extend_title)
            .click(onClickChat);
    };

    return {
        initModule: initModule
    };

}());
