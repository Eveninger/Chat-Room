/**
 * Created by Nighter on 2017/4/11.
 */
var cr = (function () {
    var initModule = function ($container) {
        console.log($container);
        $container.html(
            '<h1 style="display:inline-block; margin: 25px">hello world<\h1>'
        );
    };

    return {
        initModule: initModule
    };
})();