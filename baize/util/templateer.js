(function(){
    let every = function(array, func) {
        return array.reduce((out,elem) => {
            return out && func(elem);
        },true);
    }
    let paramRegex = new RegExp("^[a-zA-Z_$]([0-9a-zA-Z_$])*$");
    let paramValidator = JSpec.everyIs(JSpec.patternMatches(paramRegex));
    let processTpl = function($tpl,$args) {
        try {
            return eval('`'+$tpl+'`');
        } catch (e) {
            console.log({ e, $tpl, $args });
            throw e
        }
    }
    let processNode = function($xml, $args, $out) {
        let elements = Array.from($xml);
        let tag = elements.shift();
        let attrs = {};
        if ((typeof elements[0]) === 'object' && !Array.isArray(elements[0])) {
            attrs = elements.shift();
        }
        switch(tag) {
            case "$if":
                let { $test } = attrs;
                if (processTpl($test,$args)) {
                    elements.forEach((elem) => {
                        processNode(elem,$args,$out);
                    });
                }
                break;
            case "$for":
                let { $each, $as } = attrs;
                let each = $args[$each];
                let scopeAs = $args[$as];
                each.forEach((value) => {
                    $args[$as] = value;
                    elements.forEach((elem) => {
                        processNode(elem,$args,$out);
                    });
                });
                delete $args[$as];
                if (scopeAs) {
                    $args[$as] = scopeAs;
                }
                break;
            default:
                let out = [];
                out.push(tag);
                let outAttrs = Object.entries(attrs).reduce((acc,[name,val]) => {
                    let outVal = val;
                    if ((typeof outVal) === 'string') {
                        outVal = processTpl(outVal,$args)
                    }
                    acc[name] = outVal;
                    return acc;
                }, {});
                out.push(outAttrs);
                elements.reduce((acc,elem) => {
                    if ((typeof elem) === 'string') {
                        acc.push(processTpl(elem,$args));
                    } else if (Array.isArray(elem)) {
                        processNode(elem,$args,acc);
                    } else {
                        acc.push(elem);
                    }
                    return acc;
                },out);
                $out.push(out);
        }
    };
    window.JsXTemplate = function({ $params, $xml }) {
        let paramErr = paramValidator($params);
        let xmlErr = jHiccup.schema($xml);
        if (paramErr || xmlErr) {
            throw { paramErr, xmlErr };
        }
        this.press = function() {
            let argArray = Array.from(arguments);
            let $args = $params.reduce((out,param,index) => {
                out[param] = argArray[index];
                return out;
            }, {});
            let $out = [];
            processNode($xml,$args,$out);
            return $out;
        }
    }
})();