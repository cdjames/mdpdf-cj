module.exports = function autoTableOfContents () { 
    var matches = [];
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
                let numHashes = parseInt(p1.length)
                matches.push("\t".repeat(numHashes-1) + "- [" + p2 + "](#" +  p2.replaceAll(" ", "-").toLowerCase() + ")");
                return match;
            }
        },
        {
            /** 
             * Replace <!-- toc --> in the document with the table of contents
             * */ 
            type: "lang", 
            filter: function(text, converter, options) {
                const headerPattern = RegExp('<!-- toc -->', 'gi');

                let toc = matches.join("\n");

                let title = "## Table of Contents\n"
                
                /* find headers text */
                return text.replace(headerPattern, title + toc)                    
            }
        }
    ]
}
