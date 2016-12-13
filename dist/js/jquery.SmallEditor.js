/* ========================================================================
 * SmallEditor: jquery.SmallEditor.js v0.1.0
 * ========================================================================
 * Copyright 2016 liZhang, Inc.
 * Licensed under MIT
 * ======================================================================== */
+function ($) {
    'use strict';

    var Editor = function (element, options) {
        this.element = $(element);
        this.optinos = $.extend({}, Editor.DEFAULTS, options);
        this.editor = this.buildEditor(this.element, this.optinos);
    };

    Editor.VERSION = '0.1.0';

    Editor.DEFAULTS = {
        tools: ['bold', 'italic', 'list-ol', 'list-ul'],
        activeClass: 'active',
        placeholder: '请输入内容…'
    }

    //Editor 初始化
    Editor.prototype.buildEditor = function (element, options) {
        var _this = this;
        _this.setDefaultParagraphSeparator();
        //var tools = options.tools;
        //TODO 自定义工具栏
        var EDITOR_HTML = "<div class='editor-container'>";
        var TOOLBAR_HTML = "<div class='editor-container'><div class='editor-toolbar'><ul>";
        TOOLBAR_HTML += "<li class='editor-btn'><a href='#' title='加粗(Ctr + B)' data-command='bold'><i class='fa fa-bold'></i></a></li>";
        TOOLBAR_HTML += "<li class='editor-btn'><a href='#' title='斜体(Ctr + I)' data-command='italic'><i class='fa fa-italic'></i></a></li>";
        TOOLBAR_HTML += "<li class='editor-btn'><a href='#' title='下划线(Ctr + U)' data-command='underline'><i class='fa fa-underline'></i></a></li>";
        TOOLBAR_HTML += "<li class='editor-btn'><a href='#' title='删除线' data-command='strikethrough'><i class='fa fa-strikethrough'></i></a></li>";
        //TOOLBAR_HTML += "<li><div class='separator'></div></li>";
        TOOLBAR_HTML += "<li class='editor-btn'><a href='#' title='有序列表' data-command='insertOrderedList'><i class='fa fa-list-ol'></i></a></li>";
        TOOLBAR_HTML += "<li class='editor-btn'><a href='#' title='无序列表' data-command='insertUnorderedList'><i class='fa fa-list-ul'></i></a></li>";
        TOOLBAR_HTML += "</ul></div>";

        EDITOR_HTML += TOOLBAR_HTML;
        EDITOR_HTML += "<div class='editor-body-wrap'><div class='editor-body' contenteditable='true' placeholder='" + options.placeholder + "'></div></div>";

        var _editor = $(EDITOR_HTML);
        element.after(_editor);
        element.hide();

        //Toolbar 点击处理
        _editor.on('click', '[data-command]', function (event) {
            event.preventDefault();
            var command = $(this).data("command");
            if (command) {
                _editor.find(".editor-body").focus();
                document.execCommand(command, false, null);
                _this.detectState();
            }
        });

        //Editor blur 处理
        _editor.on('blur', '.editor-body', function (event) {
            _this.detectState();
        })


        _editor.on('keyup mouseup', '.editor-body', function(event) {
            _this.detectState();
        })

        _editor.on('paste', '.editor-body', function(event) {

        })


        return _editor;
    }

    Editor.prototype.detectState = function () {
        var _this = this, _options = _this.optinos, activeClass = _options.activeClass;
        _this.editor.find("[data-command]").each(function (index, element) {
            var command = $(element).data("command");
            //console.log("==========> has command " + command + "?" + document.queryCommandState(command) )
            if (document.queryCommandState(command) === true) {
                $(element).addClass(activeClass);
            } else {
                $(this).removeClass(activeClass);
            }
        })
    }

    //设置编辑器段落分割标签
    Editor.prototype.setDefaultParagraphSeparator = function () {
        document.execCommand('defaultParagraphSeparator', false, 'p');
    }

    Editor.prototype.change = function (editor) {

    }

    $.fn.smallEditor = function (options) {
        return new Editor(this, options)
    }

}(jQuery);

