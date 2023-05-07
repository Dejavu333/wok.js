# wok.js                                   
Minimalist component framework instead of Angular, React, Vue, Solid, Svelte, Lit 


**`npm install -g wok.js`** _installs the package globally_

**`wokproj`** _creates a wok.js project (Win11: Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted)_

**`wok somename`** _creates a new wok_

**`fry`** _starts your wok.js application_

# how to use
In the _woks folder there are your custom reusable components.
In the _build folder the parsed code resides, you can deploy it as you would deploy a vanilla html/css/js project.

![image](https://user-images.githubusercontent.com/89163562/236686733-bb5e3cc8-7829-4abd-928a-b57063d98d2f.png)
![image](https://user-images.githubusercontent.com/89163562/236688732-ff88575b-4a34-4b99-8038-32776552075d.png)


### `<script>` is responsible for behaviour and state
  <details>
  <summary>You can initialize reactive properties using '_'</summary>
  
  ```html
  <script>
      let _x;
      let _y = 10 * _x;
      let _title;
  </script>
  ```
  
  and then modify them dynamically with html
  ![image](https://user-images.githubusercontent.com/89163562/233831801-21ded63d-2370-4958-a8fa-687e9691749a.png)
  
  or with js.
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
  
  ```js
  // on the wok itself
  this.on('click', () => {    // or select('example-wok').on
      console.log("wok was clicked!");
  });

  // on elements inside the wok
  select('h1').on('click', () => {
      console.log('h1 was clicked!');
  });
  ``` 
  </details>
    
    
    
  <details>
  <summary>You can add your woks programically to the DOM as you would do with any other html element.</summary>

  ```js
  const w = createElement('example-wok');   // or document.createElement('example-wok');
  select('body').appendChild(w);            // or document.body.appendChild(w);
  
  select('example-wok').remove();           // or w.remove();
  ``` 
  </details>
  
  
  
  <details>
  <summary>You can define lifecycle events using 'born' or 'death' as arguments.</summary>
  
  ```js
  select('example-wok').on('born', () => {
      console.log('wok was born!');
      _greet();
  });

  select('example-wok').on('death', () => {
      console.log('wok died!');
  });
  ``` 
  </details>



  <details>
  <summary>Syntax (either can be used):</summary>
  
  ```
  .on           --> .addEventListener

  .off          --> .removeEventListener

  select        --> document.querySelector

  selectAll     --> document.querySelectorAll
  
  createElement --> document.createElement
  ```
  </details>  
  
  
  
### `<example-wok>` is responsible for the structure

  <details>
  <summary>You can render reactive props using the interpolation syntax ${_nameOfmyProp}.</summary>
  
  ```html
  <example-wok>
      <lu>
          <li>${_x}</li>
          <li>${_y}</li>
          <li>${_x / _y}</li>
      </lu>
  </example-wok>
```
  </details>

    
    
  <details>
  <summary>You can nest other woks inside your wok</summary>
  
  ```html
  <example-wok>
      <nested-wok title=${_myTitle}></nested-wok>
  </example-wok>
  ```
  </details>
  
    
    
### `<style>` is responsible for the appearance
    
  <details>
  <summary>You can render reactive props using the interpolation syntax ${_nameOfmyProp}</summary>
  
  ```html
  <style>
      example-wok {
          display: block;
          border: solid 2px black;
      }
      h1 {
          color: ${_color};
      };
  </style>
  ```
  </details>

# todo
✔ rebuild the component on save, so we don't have to 'npm run fry' every time, we make a change 

✔ rebuild when save happens in regural html files too (not only in woks) 

✔ find a way to shorten the command which creates a new wok, beacuse 'npm run wok wokname' is too long 

? find a way to achieve highlighting in the css part of the wok, and override linting errors

? find a way to run the app from memory, and only build it when we want to deploy it

? templating language

? >selectors> for wok inner elements

? attrs as parameters in createElement()
