//==================================================================================
// Import the modules, init globals
//==================================================================================
const out = console.log;
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const esprisma = require('esprima');
const escodegen = require('escodegen');
// todo templating language will be needed


//==================================================================================
// Globals
//==================================================================================
const G = {
    componentName: "",
    script: "",
    props: [],
    events: [],
    bornEvents: [],
    deathEvents: [],
    methods: [],
    styleTemplate: "",
    divTemplate: "",

    BORN_EVENT_LABEL: "born",
    DEATH_EVENT_LABEL: "death",
    EVENT_LISTENER_LABELS: ["addEventListener", "on"],
    //REACTIVE_SIGN
    //BUILD_DIR_PATH
    //SRC_DIR_PATH
    //COMPONENTS_DIR_PATH

    flyWeight : {
        funcHeadAndBodyObj: {funcHead: "", funcBody: ""}
    }
}
const components = [];


//==================================================================================
// Classes
//==================================================================================
class Interpreter {
    // set x(p_x) {
    //     this._x = p_x
    // }

    constructor(p_visitor) {
        this.visitor = p_visitor
    }
    interpret(p_astNodes) {
        p_astNodes.forEach(node => {
            this.visitor.visit(node)
        })
    }
}

class Visitor {
    visit(p_node) {
        if (p_node.type === 'VariableDeclaration') {
            this.visitVariableDeclaration(p_node)
        }
        // // if (p_node.type === 'VariableDeclarator') {
        // //     this.visitVariableDeclarator(p_node)
        // // }
        // // if (p_node.type === 'BinaryExpression') {
        // //     this.visitBinaryExpression(p_node)
        // // }
        // // if (p_node.type === 'Literal') {
        // //     this.visitLiteral(p_node)
        // // }
        // // if (p_node.type === 'Identifier') {
        // //     this.visitIdentifier(p_node)
        // // }
        if (p_node.type === 'FunctionDeclaration') {
            this.visitFunctionDeclaration(p_node)
        }
        if (p_node.type == 'ExpressionStatement') {
            this.visitExpressionStatement(p_node)
        }
    }

    visitVariableDeclaration(p_node) {
        // // p_node.declarations.forEach(declaration => {

        // //     out(p_node.kind)
        // //     out(declaration.id.name)
        // //     out(declaration.init)

        // // })
        const prop = escodegen.generate(p_node);
        if (!prop.includes("_")) return;
        G.props.push(prop);
    }

    visitFunctionDeclaration(p_node) {
        const method = escodegen.generate(p_node);
        G.methods.push(method);
    }

    visitExpressionStatement(p_node) {
        //events
        if (G.EVENT_LISTENER_LABELS.includes(p_node.expression.callee.property.name)) {
            if(G.BORN_EVENT_LABEL === p_node.expression.arguments[0].value) {
                //extract the function
                const func = escodegen.generate(p_node.expression.arguments[1]);
                G.bornEvents.push(func);
            } else if (G.DEATH_EVENT_LABEL === p_node.expression.arguments[0].value) {
                //extract the function
                const func = escodegen.generate(p_node.expression.arguments[1]);
                G.deathEvents.push(func);
            } else {
                const event = escodegen.generate(p_node);
                G.events.push(event);
            }
        }
    }
    // // visitVariableDeclarator(p_node) {
    // //     this.visit(p_node.id)
    // //     this.visit(p_node.init)
    // // }
    // // visitBinaryExpression(p_node) {
    // //     this.visit(p_node.left)
    // //     this.visit(p_node.right)
    // // }
    // // visitLiteral(p_node) {
    // //     out(p_node.value)
    // // }
    // // visitIdentifier(p_node) {
    // //     out(p_node.name)
    // // }
}


//==================================================================================
// Main
//==================================================================================
out("fry is running...");
const args = process.argv.slice(2);
const targetDirPath = args[0];

out("purging previous build...");
purgeDir(targetDirPath+"/_build");

out("copying source files...");
copyFiles(targetDirPath+"/_src", targetDirPath+"/_build");

out("parsing...");
const comps = customComponents(targetDirPath+"/_src");

out("deploying woks...");
deployComponents(comps, targetDirPath+"/_build");


//==================================================================================
// Functions
//==================================================================================
function purgeDir(p_dirPath) {
    if (fs.existsSync(p_dirPath)) {
      fs.readdirSync(p_dirPath).forEach((file, index) => {
        const curPath = path.join(p_dirPath, file);
        if (fs.existsSync(curPath) && fs.lstatSync(curPath).isDirectory()) {
          // Recursively deletes subdirectories
          purgeDir(curPath);
        } else {
          // Deletes file
          fs.unlinkSync(curPath);
        }
      });
    }
}

function addGettersAndSetters(p_props) {

    let gettersAndSetters = "";

    p_props.forEach(prop => {

        //--------------------------------------------------
        // Extract property name and value
        //--------------------------------------------------
        let propValue = null;
        let propName = null;
        try {
            propName = prop.split(' ')[1].split(';')[0];
            propValue = prop.split('=')[1].split(';')[0];
            propValue = propValue.replace(/_/g, "this._");
        } catch (error) { console.log(error) }

        //--------------------------------------------------
        // Getter
        //--------------------------------------------------
        let getterBody;
        /* if the property has no default value, then the getter will return the attribute value which can be set by the user in the html tag */
        if (!propValue) getterBody = `return this.getAttribute('${propName}');`;
        /* if the property has default value, then the getter will return the default value (it can be an expression) */
        else if (propValue) getterBody = 
        `this.setAttribute('${propName}', ${propValue});
        return this.getAttribute('${propName}');`;

        gettersAndSetters += `
        get ${propName}() {
                ${getterBody}
        }`;

        //--------------------------------------------------
        // Setter
        //--------------------------------------------------
        /* if the property is not a constant, then the setter will set the attribute value */
        if (!prop.includes("const")) {

            gettersAndSetters += `
            set ${propName}(value) {
                this.setAttribute('${propName}', value);
            }`;
        }

    });// forEach ends
    return gettersAndSetters;
}

function includesMoreThanOnce(str, substr) {
    return str.indexOf(substr) !== str.lastIndexOf(substr);
}

function stringToNumberDigest(inputStr) {
    const firstChar = inputStr[0];
    const lastChar = inputStr[inputStr.length - 1];
    const middleChars = inputStr.substr(Math.floor(inputStr.length / 2) - 1, 2);

    const firstNum = firstChar.charCodeAt(0);
    const lastNum = lastChar.charCodeAt(0);
    const middleNum1 = middleChars.charCodeAt(0);
    const middleNum2 = middleChars.charCodeAt(1);

    const result = firstNum + lastNum + middleNum1 + middleNum2;
    return result;
}

function addEventListeners(p_events, p_wokName) {
    let eventListeners = "";
    let listener;
    let handler;
    let listenerId;
    p_events.forEach(event => {
        /* splits only at the first occurence of "addEventListener" */
        const eventListenerParts = event.split('.addEventListener',2);
        listener = eventListenerParts[0];
                
        handler = ".addEventListener" + eventListenerParts[1];

        /* if the listener is not the wok itself so select('example-wok').addEventListener(...), then the listener will be "this" */
        if(includesMoreThanOnce(listener, p_wokName)) { listener = "this"; }
 
        extractFuncHeadAndBody(handler, G.flyWeight)
        handler = resolveFuncSyntax(G.flyWeight.funcHeadAndBodyObj, p_wokName);
        listenerId = stringToNumberDigest(G.flyWeight.funcHeadAndBodyObj.funcBody);

        /* if the listener is the wok itself so select('example-wok').addEventListener(...), then the listener will be "this" */
        event = listener + handler;
        const eventListenerWithCondition = `if(${listener} && !${listener}[\`${listenerId}\`]){
            ${listener}[\`${listenerId}\`] = true; // to prevent adding the same event listener more than once
            ${event}
        }`;
        eventListeners += eventListenerWithCondition;
    });
    return eventListeners;
}

function addLifeCycleEvents(p_lifeCycleEvents) {
    let lifeCycleEventsQuery = "";
    if (p_lifeCycleEvents.length > 0) {
      p_lifeCycleEvents.forEach(event => {
        lifeCycleEventsQuery +=`(${event})();` ;
      });
    }
    return lifeCycleEventsQuery;
}

function extractFuncHeadAndBody(p_funcString, p_flyWeight) {
    let funcBodyParts = p_funcString.split('{',2);
    p_flyWeight.funcHeadAndBodyObj.funcHead = funcBodyParts[0];
    p_flyWeight.funcHeadAndBodyObj.funcBody = funcBodyParts[1];
}

function resolveFuncSyntax(p_funcHeadAndBodyObj, p_wokName) {
    p_funcHeadAndBodyObj.funcBody = p_funcHeadAndBodyObj.funcBody.replace(/(?<!\.)_/g,`document.querySelector('${p_wokName}')._`);
    return p_funcHeadAndBodyObj.funcHead + '{' + p_funcHeadAndBodyObj.funcBody;
}

function addMethods(p_methods, p_wokName) {
    let methodsString = "";
    p_methods.forEach(method => {
        method = method.replace('function', '');
        extractFuncHeadAndBody(method, G.flyWeight);
        methodsString += resolveFuncSyntax(G.flyWeight.funcHeadAndBodyObj, p_wokName);
    });
    return methodsString;
}

function copyFiles(p_fromDirectory, p_toDirectory) {

    /* if the path doesn't exist creates it */
    if (!fs.existsSync(p_toDirectory)) {
        fs.mkdirSync(p_toDirectory);
    }

    const files = fs.readdirSync(p_fromDirectory);
    files.forEach((file) => {
        //sad path
        if (file == "_woks") return;

        //happy path
        const fromFilePath = path.join(p_fromDirectory, file);
        const toFilePath = path.join(p_toDirectory, file);

        /* if the file is a file, parse content and copy it */
        if (fs.statSync(fromFilePath).isFile()) {
            if (!file.endsWith('.js') && !file.endsWith('.html')) {
                fs.copyFileSync(fromFilePath, toFilePath);
                return;
            }
            const content = fs.readFileSync(fromFilePath).toString();
            const parsedContent = resolvedSyntax(content, false);
            
            fs.writeFileSync(toFilePath, parsedContent);
        }
        /* if the file is a directory, copy it */
        if (fs.statSync(fromFilePath).isDirectory()) {
            copyFiles(fromFilePath, toFilePath);
        }
    });
}

function deployComponents(p_components,p_toDirPath) {

    const files = fs.readdirSync(p_toDirPath);
    files.forEach((file) => {
        const filePath = path.join(p_toDirPath, file);
        const info = fs.statSync(filePath);

        if (info.isDirectory()) {
            deployComponents(filePath, p_components);
        }
        else if (file.endsWith('.html') && !file.endsWith('-wok.html')) {

            let componentQuery = '';
            for (const component of p_components) {
                componentQuery += component;
            }

            // Load the HTML file with Cheerio
            const html = fs.readFileSync(filePath).toString();
            const $ = cheerio.load(html);

            // Find the script tag with the 'id' attribute set to 'wok'
            const scriptTag = $('script#wok-generated');

            // If the script tag doesn't exist, create a new one and append it to the head section
            if (scriptTag.length === 0) {
                $('head').append(`<script id="wok-generated">${componentQuery}</script>`);
            } else {
                // Replace the contents of the existing script tag with your component query
                scriptTag.text(componentQuery);
            }

            // Write the modified HTML file back to disk
            fs.writeFileSync(filePath, $.html());
        }
    });
}

function resolvedSyntax(p_content, p_isWok, p_wokName) {
    let  replacedContent = p_content;

    // .on -> .addEventListener
    // .off -> .removeEventListener
    replacedContent = replacedContent 
    .replace(/\.on\(/g, '.addEventListener(')
    .replace(/\.off\(/g, '.removeEventListener(')
    .replace(/\.select\(/g, '.querySelector(')
    .replace(/\.selectAll\(/g, '.querySelectorAll(');

    if (!p_isWok) {
        // select -> document.querySelector
        // selectAll -> document.querySelectorAll
        replacedContent = replacedContent
        .replace(/select\(/g, 'document.querySelector(')
        .replace(/selectAll\(/g, 'document.querySelectorAll(');
    } else if (p_isWok) {
        // select -> this.shadowRoot.querySelector
        // selectAll -> this.shadowRoot.querySelectorAll
        replacedContent = replacedContent
         // .replace(/(?<!\.)/g, `document.querySelector('${p_wokName}')._`) //if the _ is not preceded by a dot
        .replace(/select\(/g, `document.querySelector('${p_wokName}').shadow.querySelector(`)
        .replace(/selectAll\(/g, `document.querySelector('${p_wokName}').shadow.querySelectorAll(`);
    }  
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>REPLACED:"+replacedContent);
    return replacedContent;
}



function methodResolvedSyntax(p_method) {

}
function eventResolvedSyntax(p_event) {

}
function propertyResolvedSyntax(p_prop) {

}

function reInitGlobals() {
    G.events = [];
    G.lifeCycleEvents = [];
    G.methods = [];
    G.props = [];
}

function customComponents(p_fromDirPath) {
    const files = fs.readdirSync(p_fromDirPath);
    files.forEach((file) => {
        if (file == "node_modules") return;
        const filePath = path.join(p_fromDirPath, file);
        const info = fs.statSync(filePath);

        if (info.isDirectory()) {
            customComponents(filePath);
        }

        if (file.endsWith('-wok.html')) {
            reInitGlobals();
            //----------------------------------------------
            // Get the script, div, and style parts
            //----------------------------------------------
            let buffer = fs.readFileSync(filePath).toString();
            G.componentName = buffer.match(/<.*-wok/)[0].split('<')[1];
            buffer = resolvedSyntax(buffer, true, G.componentName);
            G.script = buffer.split('<script>')[1].split('</script>')[0];
            G.divTemplate = buffer.match(/<.*-wok>([\s\S]*)<\/.*-wok>/)[1];
            G.styleTemplate = buffer.split('<style>')[1].split('</style>')[0];

            /* puts this._ in front of members */
            G.divTemplate = G.divTemplate.replace(/\$\{.*?\}/g, (match) => {
                return match.replace(/_/g, 'this._');
            });
            G.styleTemplate = G.styleTemplate.replace(/\$\{.*?\}/g, (match) => {
                return match.replace(/_/g, 'this._');
            });

            //----------------------------------------------
            // Lexical analysis, Parsing to AST
            //----------------------------------------------
            const ast = esprisma.parseScript(G.script).body
            out("AST----------------------------------AST")
            out(ast);

            //----------------------------------------------
            // Interpreting the AST
            //----------------------------------------------
            const interpreter = new Interpreter(new Visitor());
            out("start interpreting");

            interpreter.interpret(ast);

            out('props---------------------props');
            G.props.forEach(prop => {
                out(prop)
            });
            out('events---------------------events');
            G.events.forEach(event => {
                out(event)
            });
            out('bornFunc---------------------bornEvents');
            G.bornEvents.forEach(event => {
                out(event)
            });
            out('deathFunc---------------------deathEvents');
            G.deathEvents.forEach(event => {
                out(event)
            });
            out('methods---------------------methods');
            G.methods.forEach(method => {
                out(method)
            });

            //----------------------------------------------
            // Generate the custom components
            //----------------------------------------------
            const className = G.componentName.replace('-', '_');
            const customComponent = `
            class ${className} extends HTMLElement {
                styleTemplate;
                divTemplate;
                shadow;

                ${addGettersAndSetters(G.props)}

                constructor() {
                    super();
                    this.shadow = this.attachShadow({mode: 'open'});
                }

                render() {   
                    console.log("rendering")
                    this.styleTemplate =\`<style>${G.styleTemplate}</style>\`;
                    this.divTemplate =\`${G.divTemplate}\`;

                    let newHTML = this.styleTemplate + this.divTemplate;
                    if (this.shadow.innerHTML!=="") updateInnerHTML(this.shadow, newHTML);
                    else this.shadow.innerHTML = newHTML;

                    function updateInnerHTML(oldDiv, newHTML) {
                    
                        const newDiv = document.createElement('div');
                        newDiv.innerHTML = newHTML;
                    
                        // Loop through each child node of the new div and compare it to the corresponding node in the old HTML
                        for (let i = 0; i < newDiv.childNodes.length; i++) {
                        const newNode = newDiv.childNodes[i];
                        const oldNode = findMatchingNode(oldDiv, newNode);
                    
                        if (!oldNode) {
                            // If the node doesn't exist in the old HTML, add the new node to the end of the old HTML
                            if(typeof newNode.innerHTML === 'undefined') continue;
                            oldDiv.appendChild(newNode);
                        } else if (newNode.nodeName !== '#text' && newNode.outerHTML !== oldNode.outerHTML) {
                            // If the nodes are different, replace the old node with the new node
                            oldNode.parentNode.replaceChild(newNode, oldNode);
                        } else if (newNode.nodeName === '#text' && newNode.textContent !== oldNode.textContent) {
                            // If the text content is different, update the old node's text content
                            oldNode.textContent = newNode.textContent;
                        }
                        }
                    
                        // Return the updated HTML string
                        return oldDiv.innerHTML;
                    }
                  
                    function findMatchingNode(container, node) {
                        // Find a node in the container that matches the given node's tag name and attributes
                        for (let i = 0; i < container.childNodes.length; i++) {
                        const childNode = container.childNodes[i];
                        if (childNode.nodeName === node.nodeName && nodesHaveSameAttributes(childNode, node)) {
                            return childNode;
                        }
                        }
                        return null;
                    }
                  
                    function nodesHaveSameAttributes(node1, node2) {
                        // Compare the attributes of two nodes and return true if they match
                        const attrs1 = node1.attributes;
                        const attrs2 = node2.attributes;
                        if ((!attrs1 && !attrs2) || (attrs1.length !== attrs2.length)) {
                        return false;
                        }
                        for (let i = 0; i < attrs1.length; i++) {
                        const attr1 = attrs1[i];
                        const attr2 = node2.getAttributeNode(attr1.name);
                        if (!attr2 || attr2.value !== attr1.value) {
                            return false;
                        }
                        }
                        return true;
                    }
          
                    /* so that the elements are already in the DOM */
                    setTimeout(() => {
                        ${addEventListeners(G.events, G.componentName)}
                    }, 0);
                    ${addLifeCycleEvents(G.bornEvents)}
                }//render() ends

                /* gets called when an attribute is changed */
                mutationObserverCallback(mutationList, observer) {
                    for (const mutation of mutationList) {
                        if (mutation.type === 'attributes' 
                        && mutation.attributeName.startsWith('_')
                        && mutation.oldValue !== mutation.target.getAttribute(mutation.attributeName)) {
                            this.render();
                        }
                    }
                }

                /* gets called when the element is added to the DOM */
                connectedCallback() {   
                    this.mutationObserver = new MutationObserver(this.mutationObserverCallback.bind(this));
                    this.mutationObserver.observe(this, { attributes: true, attributeOldValue : true });
                    this.render();
                }

                /* gets called when the element is removed from the DOM */
                disconnectedCallback() {
                    ${addLifeCycleEvents(G.deathEvents)}
                    this.mutationObserver.disconnect();
                }

                ${addMethods(G.methods, G.componentName)}

            }

            customElements.define('${G.componentName}', ${className});`;

            out(customComponent);
            components.push(customComponent);
        }// if (file.endsWith('-wok.html'))
    });//files.forEach
    return components;
}//customComponents() ends