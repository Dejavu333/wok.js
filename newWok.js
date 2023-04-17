const fs = require('fs');
const args = process.argv.slice(2);
const targetDirectory = args[0];
const filename = args[1];

if (!filename || filename === "undefined") {
  console.log('\x1b[31m','Error:','\x1b[37m','No filename was specified');
  process.exit(1);
}

// if there is an uppercase letter in the filename logs error and exits
if (/[A-Z]/.test(filename)) {
  console.log('\x1b[31m','Error:','\x1b[37m','Woknames cannot contain uppercase letters');
  process.exit(1);
}

// if the file with that name alrady exists logs error and exits
if(fs.existsSync(`${targetDirectory}/${filename}-wok.html`)){
  console.log('\x1b[31m','Error:','\x1b[37m','A wok with that name already exists');
  process.exit(1);
}

// wok template
const wok = 
`<script>
//----------------------------
//properties

//----------------------------
//functions

//----------------------------
//events

</script>


<${filename}-wok>

</${filename}-wok>


<style>

</style>`;

fs.writeFileSync(`${targetDirectory}/${filename}-wok.html`, wok, 'utf8');