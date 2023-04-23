# wok.js                                   
Minimalist component framework instead of Angular, React, Vue, Solid, Svelte, Lit 


**`npm install -g wok.js`** _installs the package globally_

**`wokproj`** _creates a wok.js project (Win11: Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted)_

**`wok somename`** _creates a new wok_

**`fry`** _starts your wok.js application_

# how to use

### `<script>` is responsible for behaviour and state
  
  <details>
  <summary>You can initialize reactive properties using '_'</summary>
  
  ![image](https://user-images.githubusercontent.com/89163562/233832401-f9d6f5d3-b934-4a96-81cb-d3c009c3630e.png)
  
  and then modify them dynamically in the html tag
  ![image](https://user-images.githubusercontent.com/89163562/233831801-21ded63d-2370-4958-a8fa-687e9691749a.png)
  
  or via code.
  ![image](https://user-images.githubusercontent.com/89163562/233832745-658925c1-6e51-4ac4-8372-4ee996a6de43.png) 
  </details>



  <details>
  <summary>You can define methods using '_'</summary> 
  
  ![image](https://user-images.githubusercontent.com/89163562/233833017-4d95976d-a8a3-4722-85ae-da3f0abf6e8d.png)

  and then invoke them using dot notation.
  ![image](https://user-images.githubusercontent.com/89163562/233831666-3edfca1a-57e5-4f4f-9c02-63936cd1eb26.png)
  </details>
  


  <details>
  <summary>You can define event listeners on any element of your wok using '.on' or '.addEventListener'</summary>
  </details>
    
    
    
  <details>
  <summary>You can add your woks programically to the DOM as you would do with any other html element.</summary>

  ``` js
  const w = createElement('example-wok');   //or document.createElement('example-wok');
  select('body').appendChild(w);            //or document.body.appendChild(w);
  
  select('example-wok').remove();           //or w.remove();
  ``` 
  </details>
  
  
  
  <details>
  <summary>You can define lifecycle events using the 'born' or 'death' as arguments.</summary>
  </details>



  <details>
  <summary>Syntax (either can be used):</summary>
  
  ```
  .on       --> .addEventListener

  .off      --> .removeEventListener

  select    --> document.querySelector

  selectAll --> document.querySelectorAll
  ```
  </details>  
  
  
  
### `<example-wok>` is responsible for the structure
  
  <details>
  <summary>You can render your reactive props like this ${_nameOfmyProp}.</summary>
  
  ![image](https://user-images.githubusercontent.com/89163562/233833229-cdde07b1-a764-456f-8840-60e245b1526e.png)
  </details>

    
    
  <details>
  <summary>You can nest other woks inside your wok</summary>
  
  ![image](https://user-images.githubusercontent.com/89163562/233833293-f2ecea32-fe1c-406b-964e-28062ebfb413.png)
  </details>
  
    
    
### `<style>` is responsible for the appearance
    
  <details>
  <summary>You can render the value of your reactive props like ${_nameOfmyProp}</summary>
  </details>

# todo
✔ rebuild the component on save, so we don't have to 'npm run fry' every time, we make a change 

✔ rebuild when save happens in regural html files too (not only in woks) 

✔ find a way to shorten the command which creates a new wok, beacuse 'npm run wok wokname' is too long 

? find a way to achieve highlighting in the css part of the wok, and override linting errors

? find a way to run the app from memory, and only build it when we want to deploy it

? templating language
