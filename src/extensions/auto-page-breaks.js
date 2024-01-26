module.exports = function autoPageBreaks () { 
    var inCodeBlock = false;
    const codeBlockToken = "```"

    return [
        {
            /** 
             * search for all header tags and assemble lines of table of contents
             * @param match - the full match
             * @param p1 - the first regex match group (will be the # symbols)
             * @param p2 - the second regex match group (will be the # text)
             * other params not used
             * 
             * regex:
             *  ^\s*(#+) - the beginning of the line, 0 or more spaces, then any group of 1 or more #s
             *  \s*(.*)$ - 0 or more spaces followed by the rest of the line
             * */ 
            type: 'lang',
            regex: /^\s*(#+)\s*(.*)$|^\s*(```).*$/gim,
            replace: function(match, p1, p2, p3, offset, string, groups) { 
                // look for opening or closing of code block (to avoid # comments)
                if (p3 == codeBlockToken) {
                    inCodeBlock = (inCodeBlock == true) ? false : true;
                    return match;
                } else if (inCodeBlock) {
                    // if we're currently inside a code block, ignore # matches
                    return match;
                }

                let pageBreak = '<div class="page-break"></div>';
                const findSpecialChars = RegExp('[^a-zA-Z0-9 ]', 'gi');
                let numHashes = parseInt(p1.length);
                var resultString = "";
                switch (numHashes) {
                    case 1:
                        resultString = pageBreak + "\n" + match;
                        break;
                    
                    default:
                        resultString = match;
                        break;
                }
                return resultString;
            }
        },
    ]
}
