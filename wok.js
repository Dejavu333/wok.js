//==================================================================================
// Import the modules, init globals
//==================================================================================
const out = console.log;
// // const acorn = require('acorn');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const esprisma = require('esprima');
const escodegen = require('escodegen');
//!notes: templating language will be needed


//==================================================================================
// Globals
//==================================================================================
const G = {
    componentName : "",
    script : "",
    props : [],
    events : [],
    methods : [],
    styleTemplate : "",
    divTemplate : "",
}
const components = [];

//==================================================================================
// Classes
//==================================================================================
class Interpreter {
    set x(p_x) {
        this._x = p_x
    }

    constructor(p_visitor) {
        this.visitor = p_visitor
    }
    interpret(p_astNodes) {
        p_astNodes.forEach(node => {
            // console.log(node, JSON.stringify(node, null, 2))
            this.visitor.visit(node)
        })
    }
}

class Visitor {
    visit(p_node) {
        if (p_node.type === 'VariableDeclaration') {
            this.visitVariableDeclaration(p_node)
        }
        // if (p_node.type === 'VariableDeclarator') {
        //     this.visitVariableDeclarator(p_node)
        // }
        // if (p_node.type === 'BinaryExpression') {
        //     this.visitBinaryExpression(p_node)
        // }
        // if (p_node.type === 'Literal') {
        //     this.visitLiteral(p_node)
        // }
        // if (p_node.type === 'Identifier') {
        //     this.visitIdentifier(p_node)
        // }
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
        if(!prop.includes("_")) return;
        G.props.push(prop);
    }

    visitFunctionDeclaration(p_node) {
        const method = escodegen.generate(p_node);
        G.methods.push(method);
    }
    
    //events
    visitExpressionStatement(p_node) {
        if (p_node.expression.callee.property.name == "addEventListener" || p_node.expression.callee.property.name == "on") {
            // // out(JSON.stringify(p_node, null, 2))
            const event = escodegen.generate(p_node);
            G.events.push(event);
        }
    }
    // visitVariableDeclarator(p_node) {
    //     this.visit(p_node.id)
    //     this.visit(p_node.init)
    // }
    // visitBinaryExpression(p_node) {
    //     this.visit(p_node.left)
    //     this.visit(p_node.right)
    // }
    // visitLiteral(p_node) {
    //     out(p_node.value)
    // }
    // visitIdentifier(p_node) {
    //     out(p_node.name)
    // }
}

// const args = process.argv[2] // pull in the cmd line args
// if (!fs.existsSync(args) || !args.endsWith('-wok.html')) {
//     out('Error: File does not exist or is not a ???-wok.html file')
//     process.exit(1)
// }
// const buffer = fs.readFileSync(args).toString() //node index.js test/t-wok.html


//==================================================================================
// Main
//==================================================================================
const comps = customComponents("./");
deployComponent("./", comps);


//==================================================================================
// Functions
//==================================================================================
function addGettersAndSetters(p_props) {

    let gettersAndSetters = "";

    p_props.forEach(prop => {

        //--------------------------------------------------
        // Extract property name and value
        //--------------------------------------------------
        let propValue = null;
        let propName = null;
        try {
            propValue = prop.split('=')[1].split(';')[0];
            propValue = propValue.replace(/_/g, "this._");
        } catch (error) { console.log(error) }
        
        try {propName = prop.split(' ')[1].split(';')[0];} catch (error) { console.log(error) }

        //--------------------------------------------------
        // Getter
        //--------------------------------------------------
        let getterBody; 
        /* if the property has no default value, then the getter will return the attribute value which can be set by the user in the html tag */
        if(!propValue) getterBody = `return this.getAttribute('${propName}');`;
        /* if the property has default value, then the getter will return the default value (it can be an expression) */
        else if(propValue) getterBody = `
        if(this.getAttribute('${propName}') == null) {this.setAttribute('${propName}', ${propValue});}
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

    });//forEach ends
    return gettersAndSetters;
}

function addComponentBasedEventListeners(p_events) {
    let eventListeners = "";
    p_events.forEach(event => {
        if (!event.includes("-wok")) return;
        const handler = event.split('addEventListener')[1];
        let listener = `this.addEventListener`;
        listener += handler;
    });
    return eventListeners;
}

function addMethods(p_methods) {
    let methodsString = "";
    p_methods.forEach(method => {
        method = method.replace('function', '');
        methodsString += method;
    });
    return methodsString;
}

function deployComponent(p_dirPath, p_components) {

    const files = fs.readdirSync(p_dirPath);
    files.forEach((file) => {
        const filePath = path.join(p_dirPath, file);
        const info = fs.statSync(filePath);

        if (info.isDirectory()) {
            deployComponent(filePath, p_components);
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

function customComponents(p_dirPath) {


    const files = fs.readdirSync(p_dirPath);
    files.forEach((file) => {
        if(file == "node_modules") return;
        const filePath = path.join(p_dirPath, file);
        const info = fs.statSync(filePath);

        if (info.isDirectory()) {
            customComponents(filePath);
        }
        else if (file.endsWith('-wok.html')) {

            //----------------------------------------------
            // Get the script, div, and style parts
            //----------------------------------------------
            const buffer = fs.readFileSync(filePath).toString();
            G.componentName = buffer.match(/<.*-wok/)[0].split('<')[1];
            G.script = buffer.split('<script>')[1].split('</script>')[0];
            G.divTemplate = buffer.match(/<.*-wok>([\s\S]*)<\/.*-wok>/)[1];
            G.styleTemplate = buffer.split('<style>')[1].split('</style>')[0];

            /* puts this. in front of members */
            G.divTemplate = G.divTemplate.replace(/\$\{.*?\}/g, (match) => {
                return match.replace(/_/g, 'this._');
            });
            G.styleTemplate = G.styleTemplate.replace(/\$\{.*?\}/g, (match) => {
                return match.replace(/_/g, 'this._');
            });

            //----------------------------------------------
            // Lexical analysis, Parsing to AST
            //----------------------------------------------
            // // const ast = acorn.parse(G.script).body
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
                    ${addComponentBasedEventListeners(G.events)}
                }

                render() {   
                    this.styleTemplate =\`<style>${G.styleTemplate}</style>\`;
                    this.divTemplate =\`${G.divTemplate}\`;
                    this.shadow.innerHTML = this.styleTemplate + this.divTemplate;
                }

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
                    this.mutationObserver.disconnect();
                }

                ${addMethods(G.methods)}

            }

            customElements.define('${G.componentName}', ${className});`;

            out(customComponent);
            components.push(customComponent);
        }//else if
    });//files.forEach
    return components;
}//customComponents function
