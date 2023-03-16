const fs = require('fs');
const args = process.argv.slice(2);
const filename = args[0];

if (!filename) {
  console.log('Error: No filename specified');
  process.exit(1);
}

// if the file with that name alrady exists logs error and exits
if(fs.existsSync(`./_src/_woks/${filename}-wok.html`)){
  console.log('Error: A wok with that name already exists');
  process.exit(1);
}

// wok template
const wok = 
`<script>
/* behaviour, state */
</script>


<${filename}-wok>
<!-- structure -->
</${filename}-wok>


<style>
/* appearance */
</style>`;

fs.writeFileSync(`./_src/_woks/${filename}-wok.html`, wok, 'utf8');