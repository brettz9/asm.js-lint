/*globals CodeMirror*/
/*
TODOS:
1. We could allow separate tabs when new pathIDs are obtained via our message listener
*/

(function () {'use strict';

var saveMessage = 'webapp-save',
    excludedMessages = [saveMessage];


function $ (sel) {
    return document.querySelector(sel);
}

window.addEventListener('DOMContentLoaded', function () {
    // Could pass option 'readOnly' if determine from protocol that this is view mode only
    function makeMarker () {
        var marker = document.createElement('div');
        marker.appendChild(document.createTextNode('\u25cf'));
        marker.className = 'CodeMirror-breakpoint';
        return marker;
    }
    CodeMirror.commands.autocomplete = function(cm) {
        CodeMirror.showHint(cm, CodeMirror.hint.javascript);
    };
    var pathID,
        breakpointsClass = 'CodeMirror-breakpoints',
        urlThemePattern = /[?&]theme=(.*?)(?:&|$)/,
        cookieThemePattern = /(?:^|;)\s*theme=([^;]*)(?:;|$)/,
        cm = CodeMirror.fromTextArea($('#javascript'), {
            autofocus: true,
            lineNumbers: true,
            lineWrapping: true,
            matchBrackets: true,
            styleActiveLine: true,
            styleSelectedText: true,
            showTrailingSpace: true,
            tabSize: 4,
            indentUnit: 4,
            // indentWithTabs: true,
            autoCloseBrackets: true,
            highlightSelectionMatches: {showToken: /\w/},
            viewportMargin: Infinity, // Make sure whole doc is rendered so browser text search will work; will badly affect large docs per http://codemirror.net/doc/manual.html#option_viewportMargin
            extraKeys: {
                'Ctrl-Q': function(cm){ cm.foldCode(cm.getCursor()); },
                'Ctrl-Space': 'autocomplete',
                Tab: function (cm) {
                    var spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
                    cm.replaceSelection(spaces, 'end', '+input');
                }
            },
            foldGutter: {
                rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment)
            },
            gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter', 'CodeMirror-linenumbers', breakpointsClass],
            lint: true
        }),
        choice = (document.location.search && document.location.search.match(urlThemePattern)) ||
            (document.cookie && document.cookie.match(cookieThemePattern))
            || '';
    choice = choice && choice[1];

    cm.on('gutterClick', function(cm, n, clickedGutterClass) { // , e
        if (clickedGutterClass !== breakpointsClass) {
            return;
        }
        var info = cm.lineInfo(n),
            gutterMarkers = info.gutterMarkers || {},
            hasBreakpointToRemove = gutterMarkers['CodeMirror-breakpoints'];
        cm.setGutterMarker(n, breakpointsClass, hasBreakpointToRemove ? null : makeMarker());
    });

    window.addEventListener('message', function(e) {
        if (e.origin !== window.location.origin || // PRIVACY AND SECURITY! (for viewing and saving, respectively)
            (!Array.isArray(e.data) || excludedMessages.indexOf(e.data[0]) > -1) // Validate format and avoid our post below
        ) {
            return;
        }
        var messageType = e.data[0];
        switch (messageType) {
            case 'webapp-view':
                // Populate the contents
                pathID = e.data[1];
                cm.setValue(e.data[2]);
                $('#save').disabled = false;
                break;
            case 'webapp-save-end':
                alert('save complete for pathID ' + e.data[1] + '!');
                break;
            default:
                throw 'Unexpected mode';
        }
    }, false);

    $('#save').addEventListener('click', function () {
        if (!pathID) {
            alert('No pathID set by Firefox yet! Remember to invoke this file from an executable or command line and in edit mode.');
            return;
        }
        window.postMessage([saveMessage, pathID, cm.getValue()], window.location.origin);
    });
    
    function themes () {
        var theme = this.options[this.selectedIndex].value,
            cookie = 'theme=' + encodeURIComponent(theme);
        cm.setOption('theme', theme);
        document.cookie = cookie;
        // Todo: We might change the site location (or opportunity to copy-paste the link) to provide a chance to bookmark the theme
    }
    $('#themes').addEventListener('click', themes);
    $('#themes').addEventListener('keypress', themes);

    if (choice) {
        choice = decodeURIComponent(choice);
        $('#themes').value = choice;
        cm.setOption('theme', choice);
    }
    
});

}());
