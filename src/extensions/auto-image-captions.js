module.exports = function autoImageCaptions () {
    const imgPattern = RegExp('<img src=.*\/>', 'gi');
    var captionNum = 0;
    return [
        {
            type: "output", 
            regex: imgPattern, // find all img tags
            replace: function(imgTag) {
                const altPattern = RegExp('alt="(.*)"', 'gi');

                /* find 'alt' text */
                var altText = altPattern.exec(imgTag)
                
                if (altText[1] === 'nocaption') {
                    return "<figure align='center'>" + imgTag + "</figure>"
                }

                captionNum++;

                let caption;
                if (altText === null) {
                    caption = ""
                } else {
                    caption = ": " + altText[1] // index 1 is the first capture group
                }

                return "<figure align='center'>" + imgTag + "<figcaption>Figure " + captionNum + caption + "</figcaption></figure>"
            }
        }
    ]
}