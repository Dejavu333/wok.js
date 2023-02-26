const fs = require('fs');
const args = process.argv.slice(2);
const filename = args[0];

if (!filename) {
  console.log('Error: No filename specified');
  process.exit(1);
}

const bell = `
<script>

/* behaviour, state */

</script>

<${filename}-bel>

<!-- structure -->

</${filename}-bel>

<style>

/* appearance */

</style>
`;

fs.writeFileSync(`${filename}-bell.html`, bell, 'utf8');
