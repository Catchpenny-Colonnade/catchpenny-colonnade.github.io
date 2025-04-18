(function(){
    let build = function(pred,errFn) {
        return function(value) {
            if (!pred(value)) {
                return errFn(value);
            }
        }
    };
    let allOf = function() {
        let validatorFunctions = Array.from(arguments);
        return function (value) {
            let errors = validatorFunctions.reduce((out,vfn) => {
                let error = vfn(value);
                if (Array.isArray(error)) {
                    out = out.concat(error);
                } else if ((typeof error) == 'object') {
                    out.push(error);
                }
                return out;
            },[]);
            if (errors.length > 0) {
                return errors;
            }
        }
    };
    let isArray = build(Array.isArray,(value) => {
        return {value:value,isArray:false};
    });
    let everyIs = function(validator) {
        return function(arrayValue) {
            let error = isArray(arrayValue)
            if (error) {
                return error;
            }
            let errors = arrayValue.reduce((out,value,index) => {
                let error = validator(value);
                if (error) {
                    out[index] = error;
                }
                return out;
            },{});
            if (Object.keys(errors).length > 0) {
                return errors;
            }
        }
    }
    let typeIs = function(typeInQuestion) {
        return build((value) => {
            return (typeof value) === typeInQuestion;
        }, (value) => {
            return {value,typeInQuestion};
        });
    };
    let bool = function() {
        return typeIs('boolean');
    };
    let minIs = function(min) {
        return build((value) => {
            return value >= min;
        }, (value) => {
            return {value,min};
        });
    };
    let maxIs = function(max) {
        return build((value) => {
            return value <= max;
        }, (value) => {
            return {value,max};
        });
    };
    let minLengthIs = function(minLength) {
        return build(({length}) => {
            return length >= minLength;
        }, ({length}) => {
            return {length,minLength};
        });
    };
    let maxLengthIs = function(maxLength) {
        return build(({length}) => {
            return length <= maxLength;
        }, ({length}) => {
            return {length,maxLength};
        });
    };
    let isLessThan = function(greater) {
        return build((value) => {
            return value < greater;
        }, (value) => {
            return {value,greater};
        });
    };
    let isGreaterThan = function(lesser) {
        return build((value) => {
            return value > lesser;
        }, (value) => {
            return {value,lesser};
        });
    };
    let lengthIsLessThan = function(greaterLength) {
        return build(({length}) => {
            return length < greaterLength;
        }, ({length}) => {
            return {length,greaterLength};
        });
    };
    let lengthIsGreaterThan = function(lesserLength) {
        return build(({length}) => {
            return length > lesserLength;
        }, ({length}) => {
            return {length,lesserLength};
        });
    };
    let isStep = function(step) {
        return build((value) => {
            return (value % step) === 0;
        }, (value) => {
            return {value,step};
        });
    };
    let lengthStepIs = function(lengthStep) {
        return build(({length}) => {
            return (length % lengthStep) === 0;
        }, ({length}) => {
            return {length,lengthStep};
        });
    };
    let patternMatches = function(pattern){
        return build((value) => {
            return pattern.test(value);
        }, (value) => {
            return {value,pattern};
        });
    };
    let isEnum = function() {
        let enumMap = Array.from(arguments).reduce((out,arg) => {
            out[arg] = true;
            return out;
        },{});
        let enumValues = Object.keys(enumMap);
        return build((value) => {
            return enumMap[value];
        }, (value) => {
            return {value,enumValues};
        });
    };
    let buildFromValidatorMap = function(validatorMap,opts) {
        opts.argMod = opts.argMod || ((args) => args);
        opts.initValidators = opts.initValidators || [];
        return function(args) {
            args = opts.argMod(args);
            let validators = Object.keys(args).reduce((out,key) => {
                let argList = args[key];
                if (!Array.isArray(argList)) {
                    argList = [argList];
                }
                let valFn = validatorMap[key];
                out.push(valFn.apply(null,argList));
                return out;
            },opts.initValidators);
            return allOf.apply(null,validators);
        }
    }
    let intValidators = {
        min:minIs,
        max:maxIs,
        step:isStep,
        lesser:isGreaterThan,
        greater:isLessThan
    };
    let intOf = buildFromValidatorMap(intValidators,{
        initValidators:[typeIs('number')],
        argMod:(args) => {
            args.step = args.step || 1;
            return args;
        }
    });
    let floatValidators = {
        min:minIs,
        max:maxIs,
        lesser:isGreaterThan,
        greater:isLessThan
    };
    let floatOf = buildFromValidatorMap(floatValidators,{
        initValidators:[typeIs('number')]
    });
    let stringValidators = {
        minLength:minLengthIs,
        maxLength:maxLengthIs,
        lesserLength:lengthIsGreaterThan,
        greaterLength:lengthIsLessThan,
        lengthStep:lengthStepIs,
        pattern:patternMatches
    };
    let stringOf = buildFromValidatorMap(stringValidators,{
        initValidators:[typeIs('string')]
    });
    let arrayValidators = {
        minLength:minLengthIs,
        maxLength:maxLengthIs,
        lesserLength:lengthIsGreaterThan,
        greaterLength:lengthIsLessThan,
        lengthStep:lengthStepIs,
        every:everyIs
    }
    let arrayOf = buildFromValidatorMap(arrayValidators,{
        initValidators:[isArray]
    });
    let aspectOf = function(validator,aspectFn) {
        return function(value) {
            return validator(aspectFn(value));
        }
    }
    let eachKeyIs = function(validator) {
        return aspectOf(everyIs(validator),Object.keys);
    };
    let eachValueIs = function(validator) {
        return aspectOf(everyIs(validator),Object.values);
    };
    let mapValidators = {
        eachKey:eachKeyIs,
        eachValue:eachValueIs
    };
    let mapOf = buildFromValidatorMap(mapValidators,{
        initValidators:[typeIs('object')]
    });
    let objectValidators = {
        fields:function(propertyValidators) {
            let properties = Object.keys(propertyValidators);
            return function(value) {
                let fields = Object.keys(value);
                let keys = fields.filter((field) => (properties.indexOf(field) >= 0));
                let errors = keys.reduce((errors,key) => {
                    let error = propertyValidators[key](value[key]);
                    if (error) {
                        errors[key] = error;
                    }
                    return errors;
                },{});
                if (Object.keys(errors).length > 0) {
                    return errors;
                }
            };
        },
        required:function() {
            let required = Array.from(arguments);
            return function(value) {
                let keys = Object.keys(value);
                let missing = required.filter((field) => (keys.indexOf(field) < 0));
                if (missing.length > 0) {
                    return {value,missing,required};
                }
            }
        }
    };
    let objectOf = buildFromValidatorMap(objectValidators,{
        initValidators:[typeIs('object')]
    });
    let cardinalityFlags = {
        "": {
            optional: false,
            multiple: false
        },
        "?": {
            optional: true,
            multiple: false
        },
        "*": {
            optional: true,
            multiple: true
        },
        "+": {
            optional: false,
            multiple: true
        },
    };
    let seqOf = function() {
        let seq = Array.from(arguments).map((arg) => {
            let [label, cardinality, validator] = arg;
            if ('function' == typeof(cardinality)) {
                validator = cardinality;
                cardinality = "";
            }
            let { optional, multiple } = cardinalityFlags[cardinality];
            return { label, optional, multiple, validator };
        });
        let seqValidator = function(array) {
            let seqIndex = 0, arrayIndex = 0, error;
            while(seqIndex < seq.length && arrayIndex < array.length && !error) {
                let spec = seq[seqIndex], elem = array[arrayIndex];
                let tempError = spec.validator(elem);
                if (tempError) {
                    if (spec.optional) {
                        seqIndex++;
                    } else {
                        error = tempError;
                    }
                } else {
                    arrayIndex++;
                    if (!spec.multiple) {
                        seqIndex++;
                    }
                }
            }
            if ( seqIndex === seq.length - 1 && arrayIndex === array.length && seq[seqIndex].multiple && !error) {
                seqIndex++;
            }
            if (error) {
                return {
                    error,
                    arrayIndex,
                    element: array[arrayIndex],
                    seqElement:seq[seqIndex].label
                }
            } else if ( seqIndex < seq.length - 1 ) {
                let missingSpecs = seq.filter((spec,index) => {
                    return !spec.optional && index > seqIndex;
                }).map((spec) => spec.label);
                if ( missingSpecs.length > 0 ) {
                    return { value: array, missingSpecs };
                }
            } else if ( arrayIndex < array.length ) {
                return { value: array, unexpectedCount: array.length - arrayIndex };
            }
        }
        return allOf(isArray, seqValidator);
    }
    let oneOf = function(specs) {
        return function(value) {
            let successful = Object.entries(specs).reduce((out,[k,v]) => {
                let error = v(value);
                if (!error) {
                    out.push(k);
                }
                return out;
            },[]);
            if (successful.length === 0) {
                return { value, options: Object.keys(specs) };
            }
        }
    };
    let isPrimitive = oneOf({
        "number": typeIs("number"),
        "string": typeIs("string"),
        "boolean": typeIs("boolean"),
        "null": typeIs("null")
    });
    let makeRecursive = function(specFn) {
        let recurse = {};
        recurse.validate = specFn(() => {
            return function(value) {
                return recurse.validate(value);
            }
        });
        return recurse.validate;
    }
    window.JSpec = {
        build,allOf,everyIs,typeIs,minIs,maxIs,isGreaterThan,isLessThan,isStep,
        minLengthIs,maxLengthIs,lengthIsGreaterThan,lengthIsLessThan,lengthStepIs,
        patternMatches,isEnum,eachKeyIs,eachValueIs,bool,intOf,floatOf,stringOf,
        arrayOf,mapOf,objectOf,seqOf,oneOf,isPrimitive,makeRecursive
    };
})();