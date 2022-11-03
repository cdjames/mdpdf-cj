module.exports = function autoTableOfContents () { 
    var matches = [];
    var anchorPairs = []
    var h1Num = 0;
    var h2Num = 0;
    var h3Num = 0;
    var h4Num = 0;
    var h5Num = 0;
    var h6Num = 0;

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
            /* good for non-numbered TOC */
            // replace: function(match, p1, p2, offset, string, groups) { 
            //     const findSpecialChars = RegExp('[^a-zA-Z0-9 ]', 'gi')
            //     let numHashes = parseInt(p1.length)
            //     let anchor = p2.toLowerCase().replaceAll(findSpecialChars, "").replaceAll(" ", "-")
            //     matches.push("\t".repeat(numHashes-1) + "- [" + p2 + "](#" +  anchor + ")");
            //     return match;
            // }
            replace: function(match, p1, p2, offset, string, groups) { 
                const findSpecialChars = RegExp('[^a-zA-Z0-9 ]', 'gi')
                let numHashes = parseInt(p1.length)
                let numbering = ""
                switch (numHashes) {
                    case 1:
                        h1Num += 1;
                        h2Num = h3Num = h4Num = h5Num = h6Num = 0;
                        numbering = h1Num;
                        break;
                    case 2:
                        h2Num += 1;
                        h3Num = h4Num = h5Num = h6Num = 0;
                        numbering = h1Num + "." + h2Num;
                        break;
                    case 3:
                        h3Num += 1;
                        h4Num = h5Num = h6Num = 0;   
                        numbering = h1Num + "." + h2Num + "." + h3Num;
                        break;
                    case 4:
                        h4Num += 1;
                        h5Num = h6Num = 0;
                        numbering = h1Num + "." + h2Num + "." + h3Num + "." + h4Num
                        break;
                    case 5:
                        h5Num += 1;
                        h6Num = 0;
                        numbering = h1Num + "." + h2Num + "." + h3Num + "." + h4Num + "." + h5Num
                        break;
                    case 6:
                        h6Num += 1;
                        numbering = h1Num + "." + h2Num + "." + h3Num + "." + h4Num + "." + h5Num + "." + h6Num
                        break;
                
                    default:
                        break;
                }
                headingWithNumbering = numbering + " " + p2
                let origAnchor = p2.toLowerCase().replace(findSpecialChars, "").replace(/ /g, "-")
                let anchor = headingWithNumbering.toLowerCase().replace(findSpecialChars, "").replace(/ /g, "-")
                anchorPairs.push({origAnchor: origAnchor, replaceAnchor: anchor})
                matches.push("\t".repeat(numHashes-1) + "- [" + headingWithNumbering + "](#" +  anchor + ")");
                return p1 + "   " + headingWithNumbering;
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
                text = text.replace(headerPattern, title + toc)   
                
                /* find any anchors that need to be changed */
                anchorPairs.forEach(element => {
                    let p = "\\(#"+element.origAnchor+"\\)";
                    let anchorPattern = RegExp(p, 'gi');

                    text = text.replace(anchorPattern, "(#"+element.replaceAnchor+")")
                });

                return text
            }
        }
    ]
}
