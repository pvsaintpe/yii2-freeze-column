/**
 * Freeze Yii GridView widget.
 *
 * This is the JavaScript widget used by the \pvsaintpe\grid\GridView widget.
 *
 * @author Pavel Veselov <pvsaintpe@icloud.com>
 * @version 1.0
 */
(function ($) {
    $.fn.freezeGridView = function (method, settings) {
        if (methods[method] && settings) {
            return methods[method].apply(this, [settings]);
        } else if (!method && settings) {
            return methods.init.apply(this, arguments);
        }

        $.error('Method ' + method + ' does not exist in jQuery.freezeGridView');
        return false;
    };

    $(document).on('pjax:success', function(event) {
        jQuery(settings.container).freezeGridView('init', settings);
    });

    $(window).resize(function() {
        jQuery(settings.container).freezeGridView('initRightColumnsFreeze', settings);
    });

    /**
     * @type {{freezeLeftColumns: undefined, freezeRightColumns: undefined, container: undefined}}
     */
    var defaults = {};

    /**
     * Настройки
     * @type {{}}
     */
    var settings = {};

    /**
     * @type {{startScroll: string, endScroll: string}}
     */
    var gridEvents = {
        /**
         * Это событие будет срабатывать после начала скролла, но до расчета параметров смещения
         */
        startScroll: 'startScroll',

        /**
         * Это событие сработает по завершении расчетов смещения и скроллинга.
         */
        endScroll: 'endScroll'
    };

    /**
     * @type {{}}
     */
    var gridEventHandlers = {};

    /**
     * @type {{init: init, applyScroll: applyScroll, destroy: destroy, data: data}}
     */
    var methods = {
        /**
         * Инициализация
         *
         * @param options
         */
        init: function (options) {
            return this.each(function () {
                var $container = $(this);
                settings = $.extend(true, options, defaults);

                $(settings.container).ready(function() {
                    jQuery(settings.container).freezeGridView('initRightColumnsFreeze', settings);
                });

                var filterEvents = 'scroll.freezeGridView';
                initEventHandler($container, 'scrolling', filterEvents, settings.container, function (event) {
                    methods.applyScroll.apply($container);
                    return false;
                });
            });
        },

        /**
         * При прокрутке скрола
         *
         * @param options
         */
        applyScroll: function (options) {
            var $grid = $(this);
            var id = $grid.attr('id');
            var event = $.Event(gridEvents.startScroll);

            $grid.trigger(event);

            if (event.result === false) {
                return;
            }

            // Фиксируем стобцы слева
            methods.initLeftColumnsFreeze();

            $grid.trigger(gridEvents.endScroll);
        },

        /**
         * Удаляет все обработчики
         *
         * @returns {methods}
         */
        destroy: function () {
            var events = ['.freezeGridView', gridEvents.startScroll, gridEvents.endScroll].join(' ');
            this.off(events);

            var id = $(this).attr('id');
            $.each(gridEventHandlers[id], function (type, data) {
                $(document).off(data.event, data.selector);
            });

            return this;
        },

        /**
         * @returns {*}
         */
        data: function () {
            var id = $(this).attr('id');
        },

        /**
         * Фиксирует столбцы слева и накидывает нужные стили
         * @returns {*}
         */
        initLeftColumnsFreeze: function () {
            var container = $(settings.container);
            // считаем смещение скролбара
            var scrollLeft = Math.round(container.get(0).scrollLeft);

            var left = 0;
            $.each(settings.freezeLeftColumns, function(index, value) {
                $.each($('td[data-col-seq="'+ value +'"] ,th[data-col-seq="'+ value +'"]'), function (index, obj) {
                    $(obj).removeClass('freeze free');

                    if (scrollLeft <= 1) {
                        $(obj).addClass('free');
                    } else {
                        $(obj).addClass('freeze');
                        $(obj).css('left', left);
                    }
                });

                left += parseInt($('th[data-col-seq="' + value + '"]').css('width'));
            });
        },

        /**
         * Фиксирует столбцы справа
         * @returns {*}
         */
        initRightColumnsFreeze: function () {
            var right = 0;
            $.each(settings.freezeRightColumns, function(index, value) {
                $.each($('td[data-col-seq="'+ value +'"] ,th[data-col-seq="'+ value +'"]'), function (index, obj) {
                    $(obj).addClass('freeze');
                    $(obj).css('right', right + 'px');
                });

                right += parseInt($('th[data-col-seq="' + value + '"]').css('width'));
            });
        }
    };

    /**
     * Инициализация событий
     *
     * @param {jQuery} $gridView jQuery element
     * @param {string} type Type
     * @param {string} event Event name
     * @param {string} selector jQuery selector
     * @param {function} callback
     */
    function initEventHandler($gridView, type, event, selector, callback) {
        var id = $gridView.attr('id');

        var prevHandler = gridEventHandlers[id];
        if (prevHandler !== undefined && prevHandler[type] !== undefined) {
            var data = prevHandler[type];
            $(selector).off(data.event, data.selector);
        }
        if (prevHandler === undefined) {
            gridEventHandlers[id] = {};
        }
        $(selector).on(event, callback);
        gridEventHandlers[id][type] = {event: event, selector: selector};
    }
})(window.jQuery);

/**
 * Расчет абсолютной позиции относительно любого элемента
 */
(function($){
    /**
     * @param top
     */
    $.fn.offsetRelative = function(top){
        var $this = $(this);
        var $parent = $this.offsetParent();
        var offset = $this.position();
        if(!top) return offset;
        else if($parent.get(0).tagName == "BODY") return offset;
        else if($(top,$parent).length) return offset;
        else if($parent[0] == $(top)[0]) return offset;
        else {
            var parent_offset = $parent.offsetRelative(top);
            offset.top += parent_offset.top;
            offset.left += parent_offset.left;
            return offset;
        }
    };
    /**
     * @param top
     */
    $.fn.positionRelative = function(top){
        return $(this).offsetRelative(top);
    };
}(jQuery));
