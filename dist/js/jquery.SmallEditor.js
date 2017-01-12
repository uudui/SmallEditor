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

        this.editor = this.buildEditor();
    };

    Editor.VERSION = '0.1.0';

    Editor.DEFAULTS = {
        tools: ['bold', 'italic', 'underline', 'strikethrough', 'blockquote', 'orderedList', 'unorderedList'],
        toolsConfig: {
            bold: {title: '加粗(Ctr + B)', command: 'bold', icon: 'fa fa-bold'},
            italic: {title: '斜体(Ctr + I)', command: 'italic', icon: 'fa fa-italic'},
            underline: {title: '下划线(Ctr + U)', command: 'underline', icon: 'fa fa-underline'},
            strikethrough: {title: '删除线', command: 'strikethrough', icon: 'fa fa-strikethrough'},
            blockquote: {title: '引用', command: 'blockquote', icon: 'fa fa-quote-left'},
            orderedList: {title: '有序列表', command: 'insertOrderedList', icon: 'fa fa-list-ol'},
            unorderedList: {title: '无序列表', command: 'insertUnorderedList', icon: 'fa fa-list-ul'}
        },
        activeClass: 'active',
        placeholder: '请输入内容…',
        allowedTags: ["p", "br", "img", "a", "b", "i", "strike", "u", "h1", "h2", "h3", "h4", "pre", "code", "ol", "ul", "li", "blockquote"],
        unAllowedAttrs: ['style', 'class', 'id', 'name', 'width', 'height', 'title', 'data-*']
    }

    //Editor 初始化
    Editor.prototype.buildEditor = function () {
        var _this = this, _options = _this.optinos, _tools = _options.tools, _toolsConfig = _options.toolsConfig;
        _this.setDefaultParagraphSeparator();

        //TODO 自定义工具栏
        var EDITOR_HTML = "<div class='editor-container'>";
        var TOOLBAR_HTML = "<div class='editor-container' id='editor-container'><div class='editor-toolbar'>";
        for (var i = 0; i < _tools.length; i++) {
            //如果是分割线
            if (_tools[i] === '|') {
                TOOLBAR_HTML += "<div class='separator'></div>";
            } else {
                var currentTool = _toolsConfig[_tools[i]];
                if (typeof currentTool != 'undefined') {
                    TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='" + currentTool.title + "' " +
                        "data-command='" + currentTool.command + "'><i class='" + currentTool.icon + "'></i></a></div>";
                }
            }
        }
        TOOLBAR_HTML += "</div>";
        EDITOR_HTML += TOOLBAR_HTML;
        EDITOR_HTML += "<div class='editor-body-container'><div class='editor-body' contenteditable='true' " +
            "placeholder='" + _options.placeholder + "'>" + _this.element.val().trim() + "</div></div>";

        var _editor = $(EDITOR_HTML);
        this.element.after(_editor);
        this.element.hide();

        _this.contenteditable = _editor.find(".editor-body");
        _this.editor = _editor;

        _this.selectEnd();
        _editor.find(".editor-body").focus();
        _this.detectState();
        //Toolbar 点击处理
        _editor.on('click', 'a[data-command]', function (event) {
            event.preventDefault();
            var command = $(this).data("command");
            _this.focus();
            if (command) {
                if (command === 'blockquote') {
                    //document.execCommand('formatBlock', false, command);
                    _this.blockquote();
                } else {
                    document.execCommand(command, false, null);
                }
                _this.detectState();
            }
            _this.triggerChange();
        });

        //Editor blur 处理
        _editor.on('blur', '.editor-body', function (event) {
            // _this.restoreRange();
            _this.detectState();
            _this.triggerChange();
        })

        _editor.on('keyup mouseup', '.editor-body', function (event) {
            _this.detectState();
            _this.triggerChange();
        })

        _editor.on('keydown', '.editor-body', function (event) {
            var keyCode = event.keyCode;
            if (keyCode === 13) {
                //_this.processbBlockquoteEnter(event);
            }
        })

        // Editor paste 处理
        _editor.on('paste', '.editor-body', function (event) {
            _this.clearPastedHtml();
            _this.triggerChange();
        })

        return _editor;
    }

    Editor.prototype.hasTool = function (tool) {
        var _tools = this.optinos.tools;
        return $.inArray(tool, _tools) > -1;
    }


    Editor.prototype.detectState = function () {
        var _this = this, _options = _this.optinos, activeClass = _options.activeClass;
        _this.editor.find("[data-command]").each(function (index, element) {
            var command = $(element).data("command");
            if (_this.isStateOn(command)) {
                $(element).addClass(activeClass);
            } else {
                $(this).removeClass(activeClass);
            }
        })
    }

    Editor.prototype.isStateOn = function (commmand) {
        var _this = this;
        if (document.queryCommandState(commmand) === true) {
            return true;
        } else {
            if (_this.commonAncestorContainer()) {
                return $(_this.commonAncestorContainer()).closest(commmand).length !== 0;
            }
            return false;
        }
    };

    Editor.prototype.commonAncestorContainer = function () {
        var selection = document.getSelection();
        if (selection.rangeCount !== 0) {
            return selection.getRangeAt(0).commonAncestorContainer;
        }
    };

    Editor.prototype.selectContents = function (contents) {
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

    //清除粘贴的Html标签
    Editor.prototype.clearPastedHtml = function () {
        var _this = this, _contenteditable = _this.contenteditable,
            _options = _this.optinos;
        return setTimeout(function () {
            //将div统一进行替换成p标签
            _contenteditable.find('div').each(function () {
                $(this).replaceWith($('<p>').append($(this).contents()));
            });

            //替换不允许的attrs 和 tags
            _contenteditable.find(':not(' + _options.allowedTags.join() + ')').each(function () {
                var _element = $(this);
                if (_element.contents().length) {
                    _element.replaceWith(_element.contents());
                } else {
                    _element.remove();
                }
            });

            _contenteditable.find('*').each(function () {
                var $element = $(this), i;
                for (i in _options.unAllowedAttrs) {
                    $element.removeAttr(_options.unAllowedAttrs[i]);
                }
            });
        }, 100)
    }


    //设置编辑器段落分割标签
    Editor.prototype.setDefaultParagraphSeparator = function () {
        document.execCommand('defaultParagraphSeparator', false, 'p');
    };

    Editor.prototype.blockquote = function () {
        var _this = this, $blockquote, $contents, range, rangeAncestor, selection;
        selection = window.getSelection();
        range = selection.getRangeAt(0);
        rangeAncestor = range.commonAncestorContainer;
        $blockquote = $(rangeAncestor).closest("blockquote");
        if ($blockquote.length) {
            $contents = $blockquote.contents();
            $blockquote.replaceWith($contents);
            _this.selectContents($contents);
        } else {
            document.execCommand('formatBlock', false, 'blockquote');
            $blockquote = $(rangeAncestor).closest("blockquote");
        }
    };

    Editor.prototype.selectEnd = function () {
        this.contenteditable.focus();
        var selection = document.getSelection();
        selection.selectAllChildren(this.contenteditable[0]);
        return selection.collapseToEnd();
    };

    Editor.prototype.triggerChange = function () {
        this.element.val(this.contenteditable.html());
    };

    Editor.prototype.focus = function () {
        this.contenteditable.focus();
    };


    $.fn.smallEditor = function (options) {
        return this.each(function () {
            return new Editor(this, options)
        })
    }

}(jQuery);

