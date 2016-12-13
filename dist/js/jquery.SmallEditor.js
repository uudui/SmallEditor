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
        tools: ['bold', 'italic', 'underline', 'strikethrough', 'list-ol', 'list-ul'],
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
        var TOOLBAR_HTML = "<div class='editor-container'><div class='editor-toolbar'>";
        TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='加粗(Ctr + B)' data-command='bold'><i class='fa fa-bold'></i></a></div>";
        TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='斜体(Ctr + I)' data-command='italic'><i class='fa fa-italic'></i></a></div>";
        TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='下划线(Ctr + U)' data-command='underline'><i class='fa fa-underline'></i></a></div>";
        TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='删除线' data-command='strikethrough'><i class='fa fa-strikethrough'></i></a></div>";
        TOOLBAR_HTML += "<div class='separator'></div>";
        TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='引用' data-command='blockquote'><i class='fa fa-quote-left'></i></a></div>";
        TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='有序列表' data-command='insertOrderedList'><i class='fa fa-list-ol'></i></a></div>";
        TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='无序列表' data-command='insertUnorderedList'><i class='fa fa-list-ul'></i></a></div>";
        TOOLBAR_HTML += "</div>";
        EDITOR_HTML += TOOLBAR_HTML;
        EDITOR_HTML += "<div class='editor-body-wrap'><div class='editor-body' contenteditable='true' placeholder='" + options.placeholder + "'>" + element.val() +" </div></div>";

        var _editor = $(EDITOR_HTML);
        element.after(_editor);
        element.hide();
        _editor.find(".editor-body").focus();
        //Toolbar 点击处理
        _editor.on('click', '[data-command]', function (event) {
            event.preventDefault();
            var command = $(this).data("command");
            if (command) {
                _editor.find(".editor-body").focus();
                if (command === 'blockquote') {
                    document.execCommand('formatBlock', false, command);
                }else {
                    document.execCommand(command, false, null);
                }
                _this.detectState();
            }
        });

        //Editor blur 处理
        _editor.on('blur', '.editor-body', function (event) {
            _this.detectState();
        })


        _editor.on('keyup mouseup', '.editor-body', function (event) {
            _this.detectState();
        })

        _editor.on('paste', '.editor-body', function (event) {

        })


        return _editor;
    }

    Editor.prototype.detectState = function () {
        var _this = this, _options = _this.optinos, activeClass = _options.activeClass;
        _this.editor.find("[data-command]").each(function (index, element) {
            var command = $(element).data("command");

            //console.log("==========> has command " + command + "?" + document.queryCommandState(command) )
            if (_this.isStateOn(command)) {
                $(element).addClass(activeClass);
            } else {
                $(this).removeClass(activeClass);
            }
        })
    }

    Editor.prototype.isStateOn = function(commmand) {
        var _this = this;
        if (document.queryCommandState(commmand) === true) {
            return true;
        }else {
            if (_this.commonAncestorContainer()) {
                return $(this.commonAncestorContainer()).closest(commmand).length !== 0;
            }
            return false;
        }
    }

    Editor.prototype.commonAncestorContainer = function() {
        var selection = document.getSelection();
        if (selection.rangeCount !== 0) {
            return selection.getRangeAt(0).commonAncestorContainer;
        }
    }

    Editor.prototype.selectContents = function(contents) {
        var end, range, selection, start;
        selection = window.getSelection();
        range = selection.getRangeAt(0);
        start = contents.first()[0];
        end = contents.last()[0];
        range.setStart(start, 0);
        range.setEnd(end, end.childNodes.length || end.length);
        selection.removeAllRanges();
        return selection.addRange(range);
    };

    //设置编辑器段落分割标签
    Editor.prototype.setDefaultParagraphSeparator = function () {
        document.execCommand('defaultParagraphSeparator', false, 'p');
    }

    Editor.prototype.change = function (editor) {
        this.element.val(editor.find('div.editor-body').html());
    }

    $.fn.smallEditor = function (options) {
        return this.each(function(){
            new Editor(this, options)
        })
    }

}(jQuery);

