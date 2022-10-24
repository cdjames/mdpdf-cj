module.exports = function autoPageBreaks () { 
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
            regex: /^\s*(#+)\s*(.*)$/gim,
            replace: function(match, p1, p2, offset, string, groups) { 
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
