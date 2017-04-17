/**
 * Created by Nighter on 2017/4/11.
 *
 * cr.shell.js
 * Shell module for Chat Room
 */

cr.shell = (function () {
    //-------------------- Begin Module Scope Variables --------------------
    //模块配置
    var configMap = {
        //定义给uriAnchor使用的映射，用于验证
        anchor_schema_map: {
            chat: {
                open: true,
                closed: true
            }
        },
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

    //模块状态
    var stateMap = {
        $container: null,
        anchor_map: {}, //保存当前锚值
        is_chat_retracted: true //标记Chat的伸缩状态 true：收缩 false：伸展
    };

    var jqueryMap = {};
    var copyAnchorMap, setJqueryMap, toggleChat,
        changeAnchorPart, onHashChange,
        onClickChat, initModule;
    //--------- End Module Scope Variables --------------------


    //-------------------- Begin Utility Methods --------------------
    copyAnchorMap = function () {
        return $.extend(true, {}, stateMap.anchor_map);
    };
    //-------------------- End Utility Methods --------------------


    //-------------------- Begin Dom Methods --------------------
    setJqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container,
            $chat: $container.find('.cr-shell-chat')
        };
    };

    //应用中改变锚的唯一方法
    changeAnchorPart = function (arg_map) {
        var anchor_map = copyAnchorMap(); //复制当前的锚配置
        var result = true;
        var key_name, key_name_dep;

        //遍历传入的map键值对
        for (key_name in arg_map) {
            if (arg_map.hasOwnProperty(key_name)) {

                //忽略所有的dependent键
                //关于independent和dependent键 参见uriAnchor的使用说明
                if (key_name.indexOf('_') === 0) {
                    continue;
                }

                //更新当前锚配置
                anchor_map[key_name] = arg_map[key_name];

                //检测当前independent是否有对应的dependent key
                key_name_dep = '_' + key_name;
                //如果有则添加
                if (arg_map[key_name_dep]) {
                    anchor_map[key_name_dep] = arg_map[key_name_dep];
                }
                //如果没有则删除
                else {
                    delete anchor_map[key_name_dep];
                    delete anchor_map['_s' + key_name_dep];
                }
            }
        }

        //根据获取的锚配置设置
        try {
            $.uriAnchor.setAnchor(anchor_map);
        } catch (error) {
            //设置失败则还原为上个状态
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            result = false;
        }

        return result;
    };

    /**
     *
     * @param {Boolean} do_extend  true: 伸展 false: 收缩
     * @param {Function} [callback] 动画结束的回调
     * @return {Boolean} true: 执行伸缩动作 false: 伸缩动作正在执行 忽略此次调用
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
                    stateMap.is_chat_retracted = false; //Chat展开了 则is_chat_retracted为false
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
                stateMap.is_chat_retracted = true; //Chat收缩了 则is_chat_retracted为true
                if (callback) {
                    callback(jqueryMap.$chat);
                }

            }
        );
        return true;
    };
    //-------------------- End Dom Methods --------------------


    //-------------------- Begin Event Handlers --------------------
    onClickChat = function (event) {
        //这里stateMap.is_chat_retracted ? 'open' : 'close'对应的状态为什么相反
        //因为当点击Chat后，动画尚未执行完，is_chat_retracted未改变
        if (toggleChat(stateMap.is_chat_retracted)) {
            changeAnchorPart({
                chat: stateMap.is_chat_retracted ? 'open' : 'closed'
            });
        }

        //TODO 我认为正确的写法
        // toggleChat(stateMap.is_chat_retracted, function () {
        //     $.uriAnchor.setAnchor({
        //         chat: stateMap.is_chat_retracted ? 'close' : 'open'
        //     });
        // });
        return false;
    };

    onHashChange = function (event) {
        console.log('onHashChange');
        var anchor_map_prev = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_prev, _s_chat_proposed,
            s_chat_proposed;

        //解析锚点
        try {
            //根据当前url获取对应的锚配置
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        } catch (error) {
            //获取失败则还原
            $.uriAnchor.setAnchor(anchor_map_prev, null, true);
            return false;
        }

        //保存当前的锚配置
        stateMap.anchor_map = anchor_map_proposed;

        _s_chat_prev = anchor_map_prev._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;

        //检测锚中的chat是否改变
        if (!anchor_map_prev || _s_chat_prev !== _s_chat_proposed) {
            s_chat_proposed = anchor_map_proposed.chat;
            switch (s_chat_proposed) {
                case 'open':
                    toggleChat(true);
                    break;
                case 'closed':
                    toggleChat(false);
                    break;
                default:
                    toggleChat(false);
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);

            }
        }

        return false;

    };
    //-------------------- End Event Handlers --------------------


    //-------------------- Begin Public Methods --------------------
    initModule = function ($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        stateMap.is_chat_retracted = true;
        jqueryMap.$chat
            .attr('title', configMap.chat_extend_title)
            .click(onClickChat);

        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schema_map
        });

        $(window)
            .bind('hashchange', onHashChange)
            .trigger('hashchange');
    };

    return {
        initModule: initModule
    };
    //-------------------- End Public Methods --------------------

}());
