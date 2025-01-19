(function(){
    let tagNameRegex = new RegExp("^[$a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?(:[a-zA-Z]([a-zA-Z0-9-]*[a-zA-Z0-9])?)?$");
    let xmlValidator = JSpec.makeRecursive((callRecursive) => {
        return JSpec.seqOf(
            ["tag",JSpec.patternMatches(tagNameRegex)],
            ["attrs","?",JSpec.mapOf({
                eachKey:JSpec.patternMatches(tagNameRegex),
                eachValue:JSpec.isPrimitive
            })],
            ["children","*",JSpec.oneOf({
                "primitive":JSpec.isPrimitive,
                "node":callRecursive()
            })]);
    });
    let destructure = function($xml) {
        $xml = Array.from($xml);
        let tagName = $xml[0];
        let firstChild = 1;
        let attrs = {};
        if ((typeof $xml[1]) == "object" && !Array.isArray($xml[1])) {
            firstChild++;
            attrs = $xml[1];
        }
        let children = Array.from($xml.slice(firstChild));
        return { tagName, attrs, children };
    }
    let xmlToString = function($xml) {
        let { tagName, attrs, children } = destructure($xml);
        let attrText = Object.entries(attrs).map(([k,v]) => {
            return ` ${k}="${v}"`;
        }).join("");
        let mapChildren = (child) => {
            return ((typeof child) === 'string') ? child : xmlToString(child);
        };
        let out = `<${tagName}${attrText}>${children.map(mapChildren).join("")}</${tagName}>`;
        //console.log(out);
        return out;
    }
    window.jHiccup = function($xml) {
        this.toString = function() {
            return xmlToString($xml);
        }
    }
    jHiccup.schema = xmlValidator;
})();