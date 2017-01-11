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
        tools: ['bold', 'italic', 'underline', 'strikethrough', 'blockquote', 'list-ol', 'list-ul'],
        activeClass: 'active',
        placeholder: '请输入内容…',
        allowedTags: ["p", "br", "img", "a", "b", "i", "strike", "u", "h1", "h2", "h3", "h4", "pre", "code", "ol", "ul", "li", "blockquote"],
        unAllowedAttrs: ['style', 'class', 'id', 'name', 'width', 'height', 'title', 'data-*']
    }

    //Editor 初始化
    Editor.prototype.buildEditor = function () {
        var _this = this, _options = _this.optinos;
        _this.setDefaultParagraphSeparator();
        //var tools = options.tools;
        //TODO 自定义工具栏
        var EDITOR_HTML = "<div class='editor-container'>";
        var TOOLBAR_HTML = "<div class='editor-container' id='editor-container'><div class='editor-toolbar'>";
        if (_this.hasTool("bold")) {
            TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='加粗(Ctr + B)' data-command='bold'><i class='fa fa-bold'></i></a></div>";
        }
        if (_this.hasTool("italic")) {
            TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='斜体(Ctr + I)' data-command='italic'><i class='fa fa-italic'></i></a></div>";
        }
        if (_this.hasTool("underline")) {
            TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='下划线(Ctr + U)' data-command='underline'><i class='fa fa-underline'></i></a></div>";
        }
        if (_this.hasTool("strikethrough")) {
            TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='删除线' data-command='strikethrough'><i class='fa fa-strikethrough'></i></a></div>";
        }
        TOOLBAR_HTML += "<div class='separator'></div>";
        if (_this.hasTool("blockquote")) {
            TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='引用' data-command='blockquote'><i class='fa fa-quote-left'></i></a></div>";
        }
        if (_this.hasTool("list-ol")) {
            TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='有序列表' data-command='insertOrderedList'><i class='fa fa-list-ol'></i></a></div>";
        }
        if (_this.hasTool("list-ul")) {
            TOOLBAR_HTML += "<div class='editor-btn'><a href='#' title='无序列表' data-command='insertUnorderedList'><i class='fa fa-list-ul'></i></a></div>";
        }
        TOOLBAR_HTML += "</div>";
        EDITOR_HTML += TOOLBAR_HTML;
        EDITOR_HTML += "<div class='editor-body-container'><div class='editor-body' contenteditable='true' placeholder='" + _options.placeholder + "'>" + _this.element.val().trim() + "</div></div>";

        var _editor = $(EDITOR_HTML);
        this.element.after(_editor);
        this.element.hide();

        _this.contenteditable = _editor.find(".editor-body");
        _this.editor =_editor;

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
                    document.execCommand('formatBlock', false, command);
                    //_this.blockquote();
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

        _editor.on('keydown', '.editor-body', function(event) {
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

    Editor.prototype.hasTool = function(tool) {
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

            _contenteditable.find('*').each(function() {
                var $element = $(this), i;
                for (i in _options.unAllowedAttrs) {
                    console.log("===========>" + _options.unAllowedAttrs[i]);
                    $element.removeAttr(_options.unAllowedAttrs[i]);
                }
            });
        }, 100)
    }


    //设置编辑器段落分割标签
    Editor.prototype.setDefaultParagraphSeparator = function () {
        document.execCommand('defaultParagraphSeparator', false, 'p');
    };

    Editor.prototype.blockquote = function() {
        var _this = this, $blockquote, $contents, end, range, rangeAncestor, selection, start;
        selection = window.getSelection();
        range = selection.getRangeAt(0);
        rangeAncestor = range.commonAncestorContainer;
        $blockquote = $(rangeAncestor).closest("blockquote");
        if ($blockquote.length) {
            $contents = $blockquote.contents();
            $blockquote.replaceWith($contents);
            _this.selectContents($contents);
        } else {
            console.log("==============startContainer:" + range.startContainer);
            console.log("==============endContainer:" + range.endContainer);
            start = $(range.startContainer).closest("p, h1, h2, h3, h4")[0];
            end = $(range.endContainer).closest("p, h1, h2, h3, h4")[0];
            range.setStartBefore(start);
            range.setEndAfter(end);
            $blockquote = $("<blockquote>");
            $blockquote.html(range.extractContents()).find("blockquote").each(function() {
                return $(this).replaceWith($(this).html());
            });
            range.insertNode($blockquote[0]);
            selection.selectAllChildren($blockquote[0]);
        }
    };

    Editor.prototype.processbBlockquoteEnter = function(event) {
        var _this = this, $blockquote, $closestNode, $contents, end, range, rangeAncestor, selection, start;
        selection = window.getSelection();
        range = selection.getRangeAt(0);
        rangeAncestor = range.commonAncestorContainer;
        $blockquote = $(rangeAncestor).closest("blockquote");
        $closestNode = $(rangeAncestor).closest("p");
        if ($blockquote.length && !$closestNode.next().length && _this.isEmptyNode($closestNode)) {
            event.preventDefault();
            $blockquote.after($closestNode);
            _this.selectContents($closestNode.contents());
            _this.contenteditable.focus();
        }
    };

    //判断是否为空节点
    Editor.prototype.isEmptyNode = function(node) {
        var $node = $(node);
        return $node.is(':empty') || (!$node.text() && !$node.find(':not(b, i, br, u, strike, ul ol li)').length);
    };



    Editor.prototype.selectEnd = function () {
        this.contenteditable.focus();
        var selection = document.getSelection();
        selection.selectAllChildren(this.contenteditable[0]);
        return selection.collapseToEnd();
    };

    Editor.prototype.storeRange = function () {
        var range, selection = document.getSelection();
        range = selection.getRangeAt(0);
        return this.storedRange = {
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset
        };
    };

    Editor.prototype.restoreRange = function () {
        var range, selection = document.getSelection();
        range = document.createRange();
        if (this.storedRange) {
            range.setStart(this.storedRange.startContainer, this.storedRange.startOffset);
            range.setEnd(this.storedRange.endContainer, this.storedRange.endOffset);
            selection.removeAllRanges();
            return selection.addRange(range);
        } else {
            return this.selectEnd();
        }
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

